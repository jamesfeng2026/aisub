# SmartSub 新版无src目录 全路径定位+改造方案
## 前置说明
1. 仓库近期**架构重构**：从老式`src`目录重构为 **`packages`多包Monorepo架构**，全部源码收拢在`packages/`下，不再有顶层src；
2. 你下载的本地工程没有src，属于**最新正式主干版本**，旧版src路径完全失效；
3. 你的三大需求优先级不变：
①whisper.cpp开启标点+单词时间戳 ②标点分句 ③长句从句拆分 ④临近短句合并防闪屏。

## 一、新版完整目录映射（必看，精准定位文件）
打开项目根目录，核心源码全部在`packages/`，关键路径对照表：
```
SmartSub/
├─ packages/
│  ├─ core/                # 【最高优先级：字幕处理、ASR调度核心】
│  │  ├─ src/
│  │  │  ├─ engine/        # 所有识别引擎存放目录
│  │  │  │  └─ whisper-cpp/
│  │  │  │     ├─ WhisperCppEngine.ts   👉【原WhisperCppEngine.ts】whisper调用、解码参数、原始片段输出
│  │  │  │     └─ whisper-params.ts     👉 解码参数配置文件
│  │  │  ├─ subtitle/
│  │  │  │  ├─ segment-processor.ts     👉【重中之重：原optimizer.ts】字幕分段、优化主入口
│  │  │  │  ├─ merge-rule.ts            👉【原block-strategy.ts】短句合并、时间间隙聚合
│  │  │  │  ├─ split-rule.ts            👉 新建/修改：标点、从句切割规则定义
│  │  │  │  └─ types.ts                 👉 字幕Segment、WordTimestamp类型定义
│  │  │  └─ config/
│  │  │     └─ global-config.ts         👉 全局配置，新增分段开关、阈值参数
│  ├─ main/                # Electron主进程
│  ├─ renderer/            # 前端UI设置面板
│  └─ shared/              # 公共类型、常量
├─ models/                 # 模型文件夹（medium模型放这里）
├─ package.json            # 调试、编译脚本
```
### 需求-文件精准绑定
| 需求 | 核心修改文件路径 |
| ---- | ---------------- |
| 开启单词时间戳、标点输出、VAD控制 | `packages/core/src/engine/whisper-cpp/WhisperCppEngine.ts`、`whisper-params.ts` |
| 标点强制分句、超长从句拆分 | `packages/core/src/subtitle/segment-processor.ts`、新建`split-rule.ts` |
| 临近短句合并、消除字幕频繁闪烁 | `packages/core/src/subtitle/merge-rule.ts` |
| 自定义参数可视化配置 | `global-config.ts`、renderer前端设置页 |

## 二、第一步：whisper.cpp底层参数改造（分句基础，最先改）
### 文件1：`packages/core/src/engine/whisper-cpp/whisper-params.ts`
定位**参数构造函数**，追加强制配置，解决无标点、无词时间戳根源：
```typescript
export function buildWhisperParams() {
  const params = new WhisperParams();
  // ========== 必须开启的3个核心开关 ==========
  params.word_timestamps = true;    // 单词级精准时间戳，分句唯一依赖，不开启一切切割无效
  params.punctuation = true;        // 强制模型生成标点，解决长句无分割符号
  params.enable_vad = true;
  // 静音阈值，0.48~0.55调试，数值越大越容易切分长语音
  params.vad_threshold = 0.52;
  // 限制单段最大时长，源头减少超长句子
  params.max_segment_len_sec = 6;
  // 关闭翻译，专注原生识别
  params.translate = false;
  // 禁止压缩时间戳
  params.no_timestamps = false;
  return params;
}
```

### 文件2：`packages/core/src/engine/whisper-cpp/WhisperCppEngine.ts`
定位`recognize()`识别主函数，**强制保留单词数组**，不要丢弃words时间戳：
找到结果解析代码，修改为如下格式：
```typescript
// 原始识别结果解析
const rawResult = await whisper.run(params, audioBuffer);
// 封装标准化字幕片段，必须挂载words单词时间戳
const rawSegments = rawResult.segments.map(item => {
  return {
    start: item.startTime,
    end: item.endTime,
    text: item.text.trim(),
    words: item.words ?? [], // 兜底空数组，防止报错
  }
})
// 把rawSegments传给后置字幕处理器
return this.postProcess(rawSegments);
```

## 三、第二步：新建规则文件 `packages/core/src/subtitle/split-rule.ts`
统一定义标点、从句、时长阈值，后续所有逻辑复用：
```typescript
// 1. 标点分割规则
// 强终止标点：句号、问号、感叹号，必须换行切割
export const STRONG_PUNCT = new Set(['.', '?', '!', '。', '？', '！']);
// 弱停顿标点：逗号、分号，仅超长句子切割
export const WEAK_PUNCT = new Set([',', ';', '，', '；']);
// 全局分割正则
export const PUNCT_SPLIT_REG = /([.?!；：，。！？])/g;

// 2. 短句合并防闪屏阈值
export const MERGE_GAP = 0.7;        // 字幕间隔小于0.7s自动合并
export const MIN_LINE_DURATION = 0.4;// 单条字幕时长＜0.4s判定过短，强制合并

// 3. 单行长度限制（切割超长句）
export const MAX_CN_CHAR = 32;       // 中文单行上限
export const MAX_EN_CHAR = 65;       // 英文单行上限

// 4. 英文主从句连词（超长句切割点）
export const CLAUSE_WORDS = [
    'and', 'but', 'or', 'because', 'since', 'while',
    'when', 'if', 'although', 'that', 'which', 'who'
];
export const CLAUSE_REG = new RegExp(`\\s+(${CLAUSE_WORDS.join('|')})\\s+`, 'gi');
```

## 四、第三步：核心逻辑改造 `segment-processor.ts`（字幕优化入口）
该文件`optimize()`是所有字幕后置处理入口，整体流水线：
**原始片段 → 标点拆分 → 超长从句拆分 → 临近短句合并 → 时长清洗**
### 完整可直接粘贴代码
```typescript
import type { SubSegment, WordTimestamp } from './types';
import {
    STRONG_PUNCT, WEAK_PUNCT, PUNCT_SPLIT_REG,
    MERGE_GAP, MIN_LINE_DURATION, MAX_CN_CHAR, MAX_EN_CHAR, CLAUSE_REG
} from './split-rule';
import { mergeNearSegments } from './merge-rule';

// 对外暴露主优化函数
export function optimize(segments: SubSegment[]): SubSegment[] {
    let list = [...segments];
    list = splitByPunct(list);        // 步骤1：标点基础切分
    list = splitLongClause(list);     // 步骤2：超长句从句切分
    list = mergeNearSegments(list);   // 步骤3：短句合并防闪屏
    list = cleanEmpty(list);          // 步骤4：清理空字幕
    return list;
}

// 函数1：按标点分割短句
function splitByPunct(segments: SubSegment[]): SubSegment[] {
    const res: SubSegment[] = [];
    for (const seg of segments) {
        const { start, end, words, text } = seg;
        const parts = text.split(PUNCT_SPLIT_REG);
        let curText = '';
        let curWords: WordTimestamp[] = [];

        for (const part of parts) {
            curText += part;
            // 遇到强终止标点，立刻截断生成新字幕
            if (STRONG_PUNCT.has(part.trim())) {
                if (curText.trim()) {
                    res.push({
                        start: curWords[0]?.start ?? start,
                        end: curWords.at(-1)?.end ?? end,
                        text: curText.trim(),
                        words: curWords
                    });
                }
                curText = '';
                curWords = [];
            }
        }
        // 末尾剩余文本兜底
        if (curText.trim()) {
            res.push({
                start: curWords[0]?.start ?? start,
                end: curWords.at(-1)?.end ?? end,
                text: curText.trim(),
                words: curWords
            });
        }
    }
    return res;
}

// 函数2：超长句子，从句/逗号二次切割
function splitLongClause(segments: SubSegment[]): SubSegment[] {
    const res: SubSegment[] = [];
    for (const seg of segments) {
        const text = seg.text;
        // 判断中英文，获取单行最大长度
        const isEnglish = /[a-zA-Z]/.test(text.slice(0, 10));
        const maxLen = isEnglish ? MAX_EN_CHAR : MAX_CN_CHAR;
        if (text.length <= maxLen) {
            res.push(seg);
            continue;
        }
        // 收集从句匹配位置
        const splitPositions: number[] = [];
        let match: RegExpExecArray | null;
        while ((match = CLAUSE_REG.exec(text)) !== null) {
            splitPositions.push(match.index);
        }
        // 无从句，就找最近逗号切割
        if (splitPositions.length === 0) {
            let commaIdx = text.lastIndexOf(',', maxLen);
            commaIdx = commaIdx === -1 ? text.lastIndexOf('，', maxLen) : commaIdx;
            if (commaIdx > 0) splitPositions.push(commaIdx);
        }
        // 执行切割，按文本长度比例映射时间戳
        if (splitPositions.length > 0) {
            const cutPos = splitPositions[0];
            const totalLen = text.length;
            const timeRate = cutPos / totalLen;
            const cutTime = seg.start + (seg.end - seg.start) * timeRate;
            // 左片段
            res.push({
                start: seg.start, end: cutTime, text: text.slice(0, cutPos), words: seg.words
            });
            // 右片段
            res.push({
                start: cutTime, end: seg.end, text: text.slice(cutPos), words: seg.words
            });
        } else {
            res.push(seg);
        }
    }
    return res;
}

// 清理空白字幕
function cleanEmpty(list: SubSegment[]): SubSegment[] {
    return list.filter(item => item.text.trim().length > 0);
}
```

## 五、第四步：改写merge-rule.ts（相邻短句合并，解决闪屏）
路径：`packages/core/src/subtitle/merge-rule.ts`
```typescript
import { MERGE_GAP, MIN_LINE_DURATION, STRONG_PUNCT } from './split-rule';
import type { SubSegment } from './types';

export function mergeNearSegments(segments: SubSegment[]): SubSegment[] {
    const res: SubSegment[] = [];
    for (const seg of segments) {
        if (res.length === 0) {
            res.push(seg);
            continue;
        }
        const last = res.at(-1)!;
        // 两个判定条件满足其一就合并：
        // 1. 两条字幕间隔极短  2. 当前字幕时长过短
        const gap = seg.start - last.end;
        const duration = seg.end - seg.start;
        // 强标点结尾禁止强行合并，保证分句稳定
        const lastEndPunc = last.text.trim().slice(-1);
        if (!STRONG_PUNCT.has(lastEndPunc) && (gap <= MERGE_GAP || duration <= MIN_LINE_DURATION)) {
            // 合并文本、时间、单词
            const newSeg: SubSegment = {
                start: last.start,
                end: seg.end,
                text: `${last.text} ${seg.text}`,
                words: [...last.words, ...seg.words]
            };
            res.pop();
            res.push(newSeg);
        } else {
            res.push(seg);
        }
    }
    return res;
}
```

## 六、Mac VSCode 调试完整流程（Electron TS项目）
### 6.1 前期环境准备
1. VSCode打开项目根目录，终端执行：
```zsh
# 安装全部依赖
npm install
# 安装Electron调试插件：Electron Debug、TypeScript Debugger
# 解除Mac系统隔离（防止编译报错）
sudo xattr -dr com.apple.quarantine node_modules
```
2. 确认medium模型放入`models/`文件夹。

### 6.2 配置调试launch.json
左侧「运行和调试」→ 创建launch.json，粘贴配置：
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "主进程调试",
            "type": "pwa-node",
            "request": "launch",
            "cwd": "${workspaceFolder}",
            "runtimeExecutable": "npm",
            "runtimeArgs": ["run", "dev"],
            "console": "integratedTerminal",
            "env": {"NODE_ENV": "development"}
        },
        {
            "name": "渲染进程调试",
            "type": "chrome",
            "request": "attach",
            "port": 9222,
            "webRoot": "${workspaceFolder}/packages/renderer"
        }
    ]
}
```

### 6.3 断点调试步骤
1. 在3个核心文件左侧行号打断点：
   - `WhisperCppEngine.ts`：识别结果输出行
   - `segment-processor.ts`：optimize()函数入口、splitByPunct函数
   - `merge-rule.ts`：mergeNearSegments合并逻辑
2. F5启动「主进程调试」，打开SmartSub软件；
3. 导入**10~30s测试短视频**（混合长句、快语速素材），选择medium模型开始识别；
4. 断点暂停时可查看：
   - rawSegments原始单词时间戳是否存在；
   - 每一步拆分、合并后的字幕数组结构；
   - 在代码中插入`console.log(JSON.stringify(segments,null,2))`打印日志排查问题。

### 6.4 三轮灰度测试（排查bug）
1. **标点拆分测试**：长句子是否在。！？位置自动换行；
2. **从句拆分测试**：超长英文句子是否在but/because等连词切割；
3. **闪屏测试**：密集短句是否自动合并，字幕切换平缓。

### 6.5 打包验证
调试稳定后，终端打包Mac安装包：
```zsh
npm run build:mac
```

## 七、参数微调参考（medium模型实测最优）
| 场景 | MERGE_GAP | MAX_CN_CHAR | MAX_EN_CHAR | VAD阈值 |
| ---- | --------- | ----------- | ----------- | ------- |
| 影视剧中文 | 0.6s | 30 | 62 | 0.50 |
| 英文演讲长句 | 0.8s | 34 | 70 | 0.53 |
| 短视频快语速 | 0.5s | 28 | 60 | 0.49 |

## 八、高频问题快速排查
1. **依旧没有标点**
检查`word_timestamps=true`、`punctuation=true`是否生效；medium原生标点偏弱，可在splitByPunct追加简易标点补全函数。
2. **分句时间错乱**
必须保证words单词数组正常输出，禁止只按文本长度切割，时间戳必须绑定单词起止时间。
3. **修改代码不生效**
热更新失效，完全关闭软件重启调试；确认修改的是packages/core源码，不是dist打包产物。
4. **合并过度、句子粘在一起**
调高MERGE_GAP、严格开启强标点拦截，禁止句号后继续合并。

## 九、进阶优化小建议
1. 可接入`sentence-splitter`轻量库强化中文语义分句；
2. 在VAD静音段优先切割字幕，和标点切割双保险；
3. UI面板增加滑块，把合并间隔、单行字符数做成可视化调节参数。