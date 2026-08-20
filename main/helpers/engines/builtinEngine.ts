import path from 'path';
import fs from 'fs';
import type { EngineStatus } from '../../../types/engine';
import { getPath, loadWhisperAddon } from '../whisper';
import { logMessage, store } from '../storeManager';
import { formatSrtContent } from '../fileUtils';
import {
  trimSubtitleTrailingSilence,
  energySpeechSegments,
} from '../subtitleTiming';
import {
  tokensToTriples,
  groupTokenCues,
  mergeShortCues,
  enforceMinDisplayDuration,
  getSubtitleCueOptions,
  getMergeShortCueOptions,
  resplitSubtitleCues,
  clampCuesToDominantSegments,
  dropCuesInDeepSilence,
  collapseFakeTokenGaps,
} from '../subtitleSegmentation';
import { getExtraResourcesPath } from '../utils';
import {
  getTaskContext,
  isWhisperAbortError,
  isWhisperCancelledResult,
  TaskCancelledError,
  throwIfTaskCancelled,
} from '../taskContext';
import {
  getWhisperLanguage,
  getVadSettings,
  isReduceRepetitionEnabled,
  getNumericSetting,
} from './transcribeShared';
import { resolveEffectiveSettings } from './outcomePresets';
import {
  getSherpaFunasrRuntime,
} from '../sherpaOnnx/sherpaFunasrRuntime';
import { isSherpaLibInstalled } from '../sherpaOnnx/sherpaLibPaths';
import { resolveBundledVadPath } from '../modelImport';
import {
  prepareBuiltinChunks,
  cleanupCloudChunks,
  type CloudAudioChunk,
} from '../audioProcessor';
import {
  offsetNativeTokens,
  offsetVadSegments,
  offsetSegmentCues,
  chunkedProgressPercent,
  type RawVadSegment,
} from '../builtinAudioChunking';
import type { NativeToken, TokenTriple } from '../subtitleSegmentation';
import { writeWordTimelineSidecar } from '../wordTimelineSidecar';
import { refineWordsFromNativeTokens } from '../subtitleRefine';
import type { TranscribeContext, TranscriptionEngineAdapter } from './types';
import type { VadSettings } from './transcribeShared';

/**
 * 语音段检测：优先独立 Silero VAD（神经网络，精确），不可用时回退能量法。
 * 返回 { start, end }（秒）数组。
 */
async function detectSpeechSegments(
  audioFile: string,
  vad: VadSettings,
): Promise<Array<{ start: number; end: number }>> {
  if (isSherpaLibInstalled()) {
    try {
      const vadModel = resolveBundledVadPath(getExtraResourcesPath());
      if (fs.existsSync(vadModel)) {
        const { result } = getSherpaFunasrRuntime().detectSpeech(
          audioFile,
          vadModel,
          {
            vad_threshold: vad.vadThreshold,
            vad_min_speech_duration_ms: vad.vadMinSpeechDuration,
            vad_min_silence_duration_ms: vad.vadMinSilenceDuration,
            vad_max_speech_duration_s: vad.vadMaxSpeechDuration,
          },
        );
        const { segments } = await result;
        logMessage(
          `Silero VAD: ${segments.length} speech segments`,
          'info',
        );
        return segments;
      }
    } catch (error) {
      logMessage(`Silero VAD failed, fallback to energy: ${error}`, 'warning');
    }
  }
  // 回退：能量法
  logMessage('Silero VAD unavailable, using energy-based speech detection', 'info');
  return energySpeechSegments(audioFile);
}

/**
 * 使用内置 whisper.cpp 库生成字幕。取消经 whisperParams.signal 原生中断。
 */
async function transcribeBuiltin(ctx: TranscribeContext): Promise<string> {
  const { event, file, formData } = ctx;
  event.sender.send('taskFileChange', { ...file, extractSubtitle: 'loading' });

  try {
    const { tempAudioFile, srtFile } = file;
    const { model, sourceLanguage, prompt } = formData as {
      model?: string;
      sourceLanguage?: string;
      prompt?: string;
    };
    const whisperModel = model?.toLowerCase();
    // 逐任务运行时派生（字幕效果档位 → 底层参数，按引擎差异化），不回写全局。
    const settings = resolveEffectiveSettings(
      formData,
      store.get('settings') as Record<string, unknown>,
    );

    // 加载链内部按 gpuMode + 环境自动决策并逐级降级（见 addonLoader）
    const { whisperAsync, backend, variant } =
      await loadWhisperAddon(whisperModel);
    const backendLabels: Record<string, string> = {
      vulkan: 'Vulkan',
      cpu: 'CPU',
      metal: 'Metal',
      coreml: 'CoreML',
      custom: 'Custom',
    };
    const whisperBackend =
      backend === 'cuda' && variant !== null && variant !== 'vulkan'
        ? `CUDA ${variant}`
        : backendLabels[backend] || backend;
    // 把实际后端推给任务卡片（useIpcCommunication 做通用 merge）
    event.sender.send('taskFileChange', {
      ...file,
      extractSubtitle: 'loading',
      whisperBackend,
    });
    const modelPath = `${getPath('modelsPath')}/ggml-${whisperModel}.bin`;

    const signal = ctx.signal ?? getTaskContext()?.signal;

    // CoreML 首次使用该模型：系统要先做 ANE 编译特化（medium/large 可达几十分钟），
    // 期间无进度回调且不可中断，提前告知用户避免误判卡死后强退（强退会遗留残缺缓存）。
    const coremlFirstRun =
      backend === 'coreml' &&
      !!whisperModel &&
      !(store.get('coremlCompiledModels') || []).includes(whisperModel);
    if (coremlFirstRun) {
      logMessage(
        `CoreML first run for model ${whisperModel}: system (ANE) compilation may take minutes to tens of minutes, progress will stay at the start meanwhile`,
        'info',
      );
      event.sender.send('message', 'coremlFirstRunHint');
    }

    // 转写看门狗：首个进度回调到来之前长时间无响应 → 仅提示用户，不自动降级。
    // whisper 的进度回调只在解码循环里触发，模型初始化（含 CoreML 加载/编译）挂起时
    // 永远等不到回调，这正是 issue #381 的卡死位置。
    const WATCHDOG_NO_PROGRESS_MS = 5 * 60 * 1000;
    let watchdogTimer: NodeJS.Timeout | null = null;
    const clearWatchdog = () => {
      if (watchdogTimer) {
        clearTimeout(watchdogTimer);
        watchdogTimer = null;
      }
    };
    const startWatchdog = () => {
      watchdogTimer = setTimeout(() => {
        watchdogTimer = null;
        if (signal?.aborted) return;
        logMessage(
          `transcribe watchdog: no progress callback within ${WATCHDOG_NO_PROGRESS_MS / 60000} min (backend=${backend}, model=${whisperModel})`,
          'warning',
        );
        event.sender.send(
          'message',
          backend === 'coreml'
            ? 'transcribeStallCoremlHint'
            : 'transcribeStallHint',
        );
      }, WATCHDOG_NO_PROGRESS_MS);
    };
    const whisperParams = {
      language: getWhisperLanguage(sourceLanguage),
      model: modelPath,
      fname_inp: tempAudioFile,
      use_gpu: backend !== 'cpu',
      flash_attn: false,
      no_prints: false,
      comma_in_time: false,
      translate: false,
      no_timestamps: false,
      audio_ctx: 0,
      // 原生 segment-aware token 时间轴：token_timestamps=true + max_len=0 让 addon 逐 token
      // 输出 { text, t0, t1, p }（毫秒，已映射回原始时间轴，段间停顿天然以 token gap 体现）。
      // 旧版加速包无 token 输出 → result.tokens 为空，消费段自动回退段级 transcription。
      token_timestamps: true,
      max_len: 0,
      print_progress: true,
      prompt,
      // max_context 由「字幕效果档位」派生（clean 档=0；accurate/balanced=-1；custom 档
      // 回落用户的 maxContext + reduceRepetition 既有语义）。这是 whisper.cpp 打断重复/
      // 幻觉级联的关键杠杆，不再被独立开关静默覆盖（见 outcomePresets / design D4）。
      max_context: isReduceRepetitionEnabled(settings)
        ? 0
        : getNumericSetting(settings.maxContext, -1),
      // whisper 内部 VAD 关闭，由 energy-based 语音段检测替代（更稳定，避免 addon VAD bug）。
      vad: false,
      progress_callback: (progress: number) => {
        clearWatchdog();
        if (signal?.aborted) return;
        event.sender.send(
          'taskProgressChange',
          file,
          'extractSubtitle',
          progress,
        );
      },
      signal,
    };

    logMessage(
      `whisperParams: ${JSON.stringify({ ...whisperParams, signal: whisperParams.signal ? '[AbortSignal]' : undefined }, null, 2)}`,
      'info',
    );
    event.sender.send('taskProgressChange', file, 'extractSubtitle', 0);
    throwIfTaskCancelled();

    // 逐片转写 + 按偏移回拼（token/VAD 段为毫秒、段级回退为秒），输出与单次调用同构，
    // 下游成句管线无感知。任一片取消 → 返回 cancelled 结果，走统一取消清理。
    const transcribeChunked = async (chunkList: CloudAudioChunk[]) => {
      const merged = {
        tokens: [] as NativeToken[],
        vadSegments: [] as RawVadSegment[],
        transcription: [] as TokenTriple[],
      };
      for (let i = 0; i < chunkList.length; i += 1) {
        const chunk = chunkList[i];
        throwIfTaskCancelled();
        logMessage(
          `builtin chunk ${i + 1}/${chunkList.length}: ${chunk.startOffsetSec.toFixed(1)}s -> ${chunk.endOffsetSec.toFixed(1)}s`,
          'info',
        );
        const chunkParams = {
          ...whisperParams,
          fname_inp: chunk.path,
          progress_callback: (progress: number) => {
            clearWatchdog();
            if (signal?.aborted) return;
            event.sender.send(
              'taskProgressChange',
              file,
              'extractSubtitle',
              chunkedProgressPercent(i, chunkList.length, progress),
            );
          },
        };
        startWatchdog();
        let chunkResult;
        try {
          chunkResult = await whisperAsync(chunkParams);
        } finally {
          clearWatchdog();
        }
        if (isWhisperCancelledResult(chunkResult) || signal?.aborted) {
          return { cancelled: true };
        }
        const offsetMs = Math.round(chunk.startOffsetSec * 1000);
        merged.tokens.push(
          ...offsetNativeTokens(chunkResult?.tokens, offsetMs),
        );
        merged.vadSegments.push(
          ...offsetVadSegments(chunkResult?.vadSegments, offsetMs),
        );
        merged.transcription.push(
          ...offsetSegmentCues(
            chunkResult?.transcription,
            chunk.startOffsetSec,
          ),
        );
      }
      return merged;
    };

    // 超长音频（>4h）先按静音对齐切片再转写：addon 在 Electron 主进程内一次性
    // resize 整段 f32 缓冲，约 9.3h 起超过 PartitionAlloc 的 2GiB 单笔分配上限必崩
    // （SIGTRAP @ operator new，与空闲内存无关）；whisper 内部 VAD 还会整段复制音频。
    // 常规时长返回 null → 原单次调用路径，零行为变化。
    const chunks = await prepareBuiltinChunks(tempAudioFile, { signal });

    let result;
    if (chunks) {
      try {
        result = await transcribeChunked(chunks);
      } finally {
        cleanupCloudChunks(chunks, tempAudioFile);
      }
    } else {
      startWatchdog();
      try {
        result = await whisperAsync(whisperParams);
      } finally {
        clearWatchdog();
      }
    }

    if (isWhisperCancelledResult(result) || signal?.aborted) {
      if (file.srtFile && fs.existsSync(file.srtFile)) {
        try {
          fs.unlinkSync(file.srtFile);
        } catch {
          /* ignore partial srt cleanup failure */
        }
      }
      logMessage(`generate subtitle cancelled for ${file.fileName}`, 'warning');
      throw new TaskCancelledError();
    }

    // CoreML 跑通一次即视为编译完成，后续该模型不再弹「首次编译耗时」提示
    if (coremlFirstRun && whisperModel) {
      const compiled: string[] = store.get('coremlCompiledModels') || [];
      if (!compiled.includes(whisperModel)) {
        store.set('coremlCompiledModels', [...compiled, whisperModel]);
      }
    }

    // 细粒度时间轴：消费原生逐 token 输出（result.tokens，t0/t1 毫秒）。
    // whisper 内部 VAD 关闭，统一走 energy-based 语音段检测路径：
    //   tokensToTriples → collapseFakeTokenGaps（消除 whisper 时间戳假间隙）→
    //   groupTokenCues → clampCuesToDominantSegments / dropCuesInDeepSilence →
    //   mergeShortCues → enforceMinDisplayDuration → trimSubtitleTrailingSilence。
    // 能力探测兼容：旧版加速包不输出 result.tokens（数组为空）→ 回退段级 result.transcription。
    const nativeTokens = (result?.tokens ?? []) as Array<{
      text: string;
      t0: number;
      t1: number;
      p?: number;
    }>;
    const cueOptions = getSubtitleCueOptions(
      formData as Record<string, unknown>,
    );
    const mergeOptions = getMergeShortCueOptions(
      formData as Record<string, unknown>,
    );

    // === 诊断日志 ===
    const LOG_MAX = 500;
    const logFileTag = `[${file.fileName ?? path.basename(tempAudioFile)}]`;
    const logTokenSample = (prefix: string) => {
      const sample = nativeTokens.slice(0, LOG_MAX);
      const lines = sample.map((t, i) => {
        const t0s = (t.t0 / 1000).toFixed(3);
        const t1s = (t.t1 / 1000).toFixed(3);
        return `  [${String(i).padStart(3)}] ${t0s}s-${t1s}s  (dur=${(Number(t.t1) - Number(t.t0)).toFixed(0)}ms)  "${t.text}"  p=${(t.p ?? 0).toFixed(3)}`;
      });
      logMessage(`${logFileTag} ${prefix} (${nativeTokens.length} tokens, showing first ${sample.length}):\n${lines.join('\n')}`, 'info');
    };
    logTokenSample('raw nativeTokens from whisper');

    let subtitles;
    // 统一走 Silero VAD（独立）语音段检测，token 级和段级路径共用；不可用时回退能量法
    const vad = getVadSettings(settings);
    const speakSegs = await detectSpeechSegments(tempAudioFile, vad);
    if (nativeTokens.length > 0) {
      const triples = tokensToTriples(nativeTokens);

      // 日志：tokensToTriples 输出
      const triplesSample = triples.slice(0, LOG_MAX);
      logMessage(`${logFileTag} triples (${triples.length}, showing first ${triplesSample.length}):\n` +
        triplesSample.map((t, i) => `  [${String(i).padStart(3)}] ${t[0]} -> ${t[1]}  "${t[2]}"`).join('\n'), 'info');

      // 用 Silero/能量 语音段消除 whisper token 时间戳中的假间隙
      const collapsed = collapseFakeTokenGaps(triples, speakSegs);
      const grouped = groupTokenCues(collapsed, cueOptions);

      logMessage(`${logFileTag} grouped cues (${grouped.length}):\n` +
        grouped.map((t, i) => `  [${String(i).padStart(3)}] ${t[0]} -> ${t[1]}  "${t[2]}"`).join('\n'), 'info');

      const refined = speakSegs.length
        ? dropCuesInDeepSilence(
            mergeShortCues(
              clampCuesToDominantSegments(grouped, speakSegs),
              mergeOptions,
            ),
            speakSegs,
          )
        : mergeShortCues(grouped, mergeOptions);

      logMessage(`${logFileTag} refined cues (${refined.length}):\n` +
        refined.map((t, i) => `  [${String(i).padStart(3)}] ${t[0]} -> ${t[1]}  "${t[2]}"`).join('\n'), 'info');
      // 词级路径不补文本级 resplit：宽度上限已由 groupTokenCues（含硬切回溯）在真实
      // token 时间上保证，叠比例插值只会劣化时间轴（resplit 仅留给下方段级回退）。
      const spaced = enforceMinDisplayDuration(refined);
      subtitles = trimSubtitleTrailingSilence(spaced, tempAudioFile);

      // 日志：最终字幕输出
      logMessage(`${logFileTag} final subtitles (${subtitles.length}):\n` +
        subtitles.map((t, i) => `  [${String(i).padStart(3)}] ${t[0]} -> ${t[1]}  "${t[2]}"`).join('\n'), 'info');
    } else {
      logMessage(
        '内置加速包未返回 token 级时间戳（旧版加速包）：回退段级时间轴，建议更新加速包以启用细粒度字幕',
        'warning',
      );
      const resplit: TokenTriple[] = resplitSubtitleCues(
        (result?.transcription ?? []) as TokenTriple[],
        formData as Record<string, unknown>,
      );
      // 段级路径也走 Silero VAD 过滤：丢弃深静音中的幻觉文本（如 [Video ends]）
      const filtered: TokenTriple[] = speakSegs.length
        ? dropCuesInDeepSilence(resplit, speakSegs)
        : resplit;
      subtitles = trimSubtitleTrailingSilence(filtered, tempAudioFile);
    }
    const formattedSrt = formatSrtContent(subtitles);
    await fs.promises.writeFile(srtFile, formattedSrt);

    // 词级时间轴 sidecar（openspec: add-ai-subtitle-refine D6）：供 AI 语义断句精确
    // 对齐消费。旧加速包无 token 输出时不落盘——精修阶段自动走近似模式。
    file.wordTimelineFile =
      nativeTokens.length > 0
        ? writeWordTimelineSidecar(
            tempAudioFile,
            'builtin',
            refineWordsFromNativeTokens(nativeTokens),
          )
        : undefined;

    event.sender.send('taskFileChange', { ...file, extractSubtitle: 'done' });
    logMessage(`generate subtitle done!`, 'info');

    return srtFile;
  } catch (error) {
    const aborted =
      isWhisperAbortError(error) ||
      Boolean(ctx.signal?.aborted) ||
      Boolean(getTaskContext()?.signal?.aborted);
    if (aborted) {
      if (file.srtFile && fs.existsSync(file.srtFile)) {
        try {
          fs.unlinkSync(file.srtFile);
        } catch {
          /* ignore partial srt cleanup failure */
        }
      }
      logMessage(`generate subtitle cancelled for ${file.fileName}`, 'warning');
      throw new TaskCancelledError();
    }
    logMessage(`generate subtitle error: ${error}`, 'error');
    throw error;
  }
}

export const builtinEngineAdapter: TranscriptionEngineAdapter = {
  id: 'builtin',
  displayName: 'whisper.cpp (builtin)',
  requiresRuntime: false,

  async isAvailable(): Promise<EngineStatus> {
    return { state: 'ready' };
  },

  async transcribe(ctx: TranscribeContext): Promise<string> {
    return transcribeBuiltin(ctx);
  },

  cancelActive(): void {
    // builtin 经 whisperParams.signal 原生中断，无需额外动作。
  },
};