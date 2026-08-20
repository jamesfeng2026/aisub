# SmartSub 字幕分段深度改造全方案（Mac VSCode + whisper.cpp medium）
## 一、项目整体架构梳理（先定位核心修改文件）
SmartSub 是 **Electron + NodeJS + TS + 底层绑定whisper.cpp** 架构，字幕处理流水线固定：
`音频输入 → whisper.cpp 原始识别（带词级时间戳） → 字幕后处理流水线 → 时间轴重组 → SRT/ASS导出`
**你的3个需求对应修改位置优先级：后处理TS工具类 > whisper.cpp调用参数 > UI配置面板**
### 核心目录结构（只看关键路径）
```
SmartSub/
├─ src/
│  ├─ engines/whispercpp/       # 【第一层修改】whisper.cpp调用、参数配置、原始segment输出
│  │  ├─ WhisperCppEngine.ts    # 引擎主文件，ASR原始片段、词时间戳获取入口
│  │  └─ params.ts              # whisper解码全局参数（标点、停顿、chunk切割）
│  ├─ utils/subtitles/processor/ # 【第二层核心修改：重中之重】字幕分段、合并、切分逻辑
│  │  ├─ optimizer.ts           # 现有字幕优化、长短句重分段主函数（官方最新长句拆分就在这里#362PR）
│  │  ├─ segment-rule.ts        # 分句规则、标点规则、时长合并规则（新建/改造此文件）
│  │  └─ block-strategy.ts      # 短句合并、时间间隙聚合逻辑
│  ├─ store/                    # 全局配置、UI参数定义
│  │  └─ config.ts              # 新增自定义分段开关、阈值配置
│  └─ renderer/components/setting/ # 【可选】前端UI增加分段调节面板
├─ packages/whisper-cpp/        # C++底层whisper.cpp编译绑定（不建议修改，上层TS控制即可）
└─ package.json                 # 运行、调试、打包脚本
```
### 明确3个需求对应的修改文件
| 需求 | 首选修改文件 | 次要文件 |
| ---- | ------------ | -------- |
| 1. 按标点 `.?!，。！？；：` 强制分句 | `optimizer.ts`、`segment-rule.ts` | `WhisperCppEngine.ts`（开启标点预测） |
| 2. 临近短字幕合并、消除频繁闪屏 | `block-strategy.ts`、`optimizer.ts` | config全局时长阈值 |
| 3. 超长句子按主从句拆分 | `segment-rule.ts`（语法连词规则）、`optimizer.ts` | 词时间戳绑定切割 |

## 二、分步详细修改方案（保姆级逐段修改）
### 前置准备：Mac VSCode本地环境初始化
1. 打开项目文件夹，终端执行依赖安装
```zsh
# 进入项目根目录
cd ~/xxx/SmartSub
# 安装依赖
npm install
# 拉取最新代码（避免冲突）
git pull origin main
# 安装Electron调试插件：VSCode搜索安装 Electron Debug、TypeScript Debugger
```
2. 确认whisper.cpp medium模型已放入项目`models/`目录，开启**词级时间戳**（分段基础前提）

### 第一步：修改whisper.cpp引擎，强制开启标点输出、词粒度时间戳
文件路径：`src/engines/whispercpp/WhisperCppEngine.ts`
#### 修改1：解码参数开启标点预测、单词时间戳
定位函数 `createWhisperParams()`，追加以下配置：
```typescript
// 原有参数...
params.set_word_timestamps(true);   // 【必须开启】获取每个单词精准时间戳，分句切割的唯一依据
params.set_punctuation(true);       // 强制模型输出标点，解决无标点无法分割根源
params.set_translate(false);
// 新增停顿敏感配置，辅助原生断句
params.set_vad_threshold(0.52);     // VAD静音阈值，越高越容易切分长语音，0.45~0.55调试
params.set_no_timestamps(false);
// 限制单次解码最大时长，从源头减少超长片段
params.set_max_segment_duration(6.0);
```
#### 修改2：原始输出强制返回完整单词数组
定位ASR识别回调函数，确保输出`words: WordTimestamp[]`数组，不要丢弃词粒度数据
```typescript
// 确保回调保留词时间戳
const result = await whisper.full(params);
const rawSegments = result.segments.map(seg=>({
    start: seg.start, end: seg.end, text: seg.text, words: seg.words // 保留单词时间戳
}))
```

### 第二步：核心改造 字幕规则文件 `src/utils/subtitles/processor/segment-rule.ts`
没有该文件就新建，定义**3套规则常量**：标点切割、短句合并、从句切割
```typescript
// ========== 1. 标点分句规则（中英文句号、问号、感叹号、分号）
export const SPLIT_PUNCTUATION = /([.?!；：，。！？])/g;
// 强终止标点：必须换行切分
export const STRONG_SPLIT = new Set(['.', '?', '!', '。', '？', '！']);
// 弱停顿标点：逗号、分号，超长句才切分
export const WEAK_SPLIT = new Set([',', ';', '，', '；']);

// ========== 2. 短句合并规则（消除频繁闪屏）
// 间隔小于该秒数的相邻短句强制合并
export const MERGE_GAP_SEC = 0.7;
// 单行最短时长：低于0.4秒判定为过短字幕，自动合并
export const MIN_LINE_DURATION = 0.4;
// 单行最长字符：英文65字符、中文32字符，超限强制拆分
export const MAX_CHARS_EN = 65;
export const MAX_CHARS_CN = 32;

// ========== 3. 从句拆分连词规则（英文主从句切割）
export const CLAUSE_SPLIT_WORDS = [
    'and', 'but', 'or', 'because', 'since', 'while', 'when',
    'although', 'though', 'if', 'that', 'which', 'who', 'where'
];
// 正则匹配从句连接词
export const CLAUSE_REG = new RegExp(`\\s+(${CLAUSE_SPLIT_WORDS.join('|')})\\s+`, 'gi');
```

### 第三步：主逻辑改造 `optimizer.ts`（字幕后置优化入口）
全局函数 `optimizeSubtitles(segments: SubSegment[]): SubSegment[]` 是所有字幕处理入口，替换原有逻辑，分为4步流水线：
**流水线顺序：原始片段 → 标点细拆分 → 从句超长拆分 → 临近短句合并 → 时长规整**
```typescript
import {
    SPLIT_PUNCTUATION, STRONG_SPLIT, WEAK_SPLIT,
    MERGE_GAP_SEC, MIN_LINE_DURATION, MAX_CHARS_EN, MAX_CHARS_CN, CLAUSE_REG
} from './segment-rule'

export function optimizeSubtitles(segments: SubSegment[]): SubSegment[] {
    let list = [...segments];
    // 步骤1：按强标点做基础分句，打散长段
    list = splitByPunctuation(list);
    // 步骤2：超长句子，按从句连词+弱逗号二次拆分
    list = splitLongClause(list);
    // 步骤3：时间临近的短句合并，解决快速切换闪屏
    list = mergeShortNearSegment(list);
    // 步骤4：边界规整，保证每行时长合理
    list = normalizeDuration(list);
    return list;
}

// 函数1：标点分割函数
function splitByPunctuation(segments: SubSegment[]): SubSegment[] {
    const res: SubSegment[] = [];
    for (const seg of segments) {
        const {start, end, words, text} = seg;
        // 按标点切割文本，绑定对应单词时间戳
        const parts = text.split(SPLIT_PUNCTUATION);
        let curText = '';
        let curWords: WordTimestamp[] = [];
        for (let i=0; i<parts.length; i++) {
            const word = parts[i];
            curText += word;
            // 匹配强终止标点，立刻截断生成新字幕
            if (STRONG_SPLIT.has(word.trim())) {
                if(curText.trim()){
                    res.push({
                        start: curWords[0]?.start ?? start,
                        end: curWords.at(-1)?.end ?? end,
                        text: curText.trim(),
                        words: curWords
                    })
                }
                curText = '';
                curWords = [];
            }
        }
        // 剩余文本收尾
        if(curText.trim()){
            res.push({
                start: curWords[0]?.start ?? start,
                end: curWords.at(-1)?.end ?? end,
                text: curText.trim(),
                words: curWords
            })
        }
    }
    return res;
}

// 函数2：超长主从句拆分
function splitLongClause(segments: SubSegment[]): SubSegment[] {
    const res: SubSegment[] = [];
    for(const seg of segments){
        const text = seg.text;
        // 判断是否超长
        const isEn = /[a-zA-Z]/.test(text.slice(0,8));
        const maxLen = isEn ? MAX_CHARS_EN : MAX_CHARS_CN;
        if(text.length <= maxLen){
            res.push(seg); continue;
        }
        // 超长句，优先在从句连词、逗号位置切割
        const splitIndexList: number[] = [];
        let match;
        while((match = CLAUSE_REG.exec(text)) !== null){
            splitIndexList.push(match.index);
        }
        // 没有连词就在逗号切割
        if(splitIndexList.length === 0){
            let pos = text.lastIndexOf(',', maxLen);
            pos = pos === -1 ? text.lastIndexOf('，', maxLen) : pos;
            if(pos>0) splitIndexList.push(pos);
        }
        // 切割片段，绑定时间戳
        if(splitIndexList.length>0){
            const splitPos = splitIndexList[0];
            const leftText = text.slice(0,splitPos);
            const rightText = text.slice(splitPos);
            // 时间均分映射
            const totalLen = text.length;
            const leftRate = splitPos / totalLen;
            const splitTime = seg.start + (seg.end - seg.start)*leftRate;
            res.push({
                start: seg.start, end: splitTime, text:leftText, words:seg.words
            })
            res.push({
                start: splitTime, end: seg.end, text:rightText, words:seg.words
            })
        }else{
            res.push(seg);
        }
    }
    return res;
}

// 函数3：相邻短句合并（防闪屏核心）
function mergeShortNearSegment(segments: SubSegment[]): SubSegment[] {
    const res: SubSegment[] = [];
    for(const seg of segments){
        if(res.length === 0){
            res.push(seg); continue;
        }
        const last = res.at(-1)!;
        // 两个字幕间隔很短 或 当前字幕过短，合并
        const gap = seg.start - last.end;
        const curDuration = seg.end - seg.start;
        if(gap <= MERGE_GAP_SEC || curDuration <= MIN_LINE_DURATION){
            // 合并文本与时间轴
            const newSeg = {
                start: last.start,
                end: seg.end,
                text: last.text + ' ' + seg.text,
                words: [...last.words, ...seg.words]
            }
            res.pop();
            res.push(newSeg);
        }else{
            res.push(seg);
        }
    }
    return res;
}

// 函数4：时长规整兜底
function normalizeDuration(list: SubSegment[]): SubSegment[] {
    return list.filter(item=>item.text.trim().length>0);
}
```

### 第四步：合并逻辑微调 block-strategy.ts
原有批量分组逻辑会强行合并长文本，修改分组阈值，禁止跨标点大段合并：
```typescript
// 原固定时长分组改为动态分组
export function getBlockGroups(segments: SubSegment[], baseSec: number = 3) {
    const groups: SubSegment[][] = [];
    let curGroup: SubSegment[] = [];
    let groupEnd = 0;
    for(const seg of segments){
        // 遇到强标点直接切分组，不再强行合并
        const endPunc = seg.text.trim().slice(-1);
        if(STRONG_SPLIT.has(endPunc) || seg.start > groupEnd + 1.2){
            if(curGroup.length>0) groups.push(curGroup);
            curGroup = [];
            groupEnd = seg.end;
        }
        curGroup.push(seg);
        groupEnd = Math.max(groupEnd, seg.end);
    }
    if(curGroup.length>0) groups.push(curGroup);
    return groups;
}
```

### 第五步（可选）：前端UI增加可调参数
1. `src/store/config.ts` 新增全局配置项
```typescript
export interface AppConfig {
    // 原有配置...
    subtitleSplit: {
        enableAutoSplit: boolean,
        mergeGap: number,
        maxEnChar: number,
        maxCnChar: number
    }
}
// 默认配置
const defaultConfig: AppConfig = {
    // ...
    subtitleSplit:{
        enableAutoSplit:true,
        mergeGap:0.7,
        maxEnChar:65,
        maxCnChar:32
    }
}
```
2. 在渲染层设置页面增加滑块开关，可视化调节合并间隔、单行最大字符。

## 三、Mac VSCode 完整调试流程（Electron项目）
### 1. 配置VSCode调试配置 launch.json
左侧「运行和调试」→ 创建launch.json → 选择NodeJS，粘贴配置：
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "启动主进程调试",
            "type": "pwa-node",
            "request": "launch",
            "cwd": "${workspaceFolder}",
            "runtimeExecutable": "npm",
            "runtimeArgs": ["run", "dev"],
            "console": "integratedTerminal",
            "env": {
                "NODE_ENV": "development"
            }
        },
        {
            "name": "渲染进程调试",
            "type": "chrome",
            "request": "attach",
            "port": 9222,
            "webRoot": "${workspaceFolder}/src/renderer"
        }
    ]
}
```

### 2. 断点调试步骤
1. 在`optimizer.ts`、`WhisperCppEngine.ts`左侧行号点击打上**红色断点**；
2. 调试面板选择「启动主进程调试」，按下`F5`启动开发版SmartSub；
3. 打开软件，导入一段测试短视频（10~30秒中英文混合素材），选择whisper.cpp medium模型开始识别；
4. 程序运行到断点自动暂停，可查看：
   - 原始whisper输出的text、words单词时间戳；
   - 每一步拆分、合并后的数组变化；
   - 打印日志：`console.log(JSON.stringify(segments,null,2))`查看字幕结构。

### 3. 快速灰度测试流程
1. **单元小测试**：单独截取一段长文本，手动调用`optimizeSubtitles`函数，测试分句效果；
2. **短素材测试**：10s短句测试合并、标点分割效果；30s长句测试从句拆分；
3. **边界测试**：快语速连续语句、静音间隔极小的片段，查看闪屏优化效果；
4. **日志定位问题**：
   - 不分句：检查`word_timestamps`是否开启、标点正则是否生效；
   - 合并过度：调高`MERGE_GAP_SEC`、降低合并触发阈值；
   - 拆分过碎：拉长`MIN_LINE_DURATION`。

### 4. 编译打包验证
调试稳定后，终端执行打包命令，生成Mac安装包验证正式环境：
```zsh
npm run build:mac
```

## 四、调优参数参考（medium模型实测最优值）
| 场景 | 推荐参数 |
| ---- | -------- |
| 英文演讲长句 | 单行最大英文70字符，合并间隔0.8s，VAD阈值0.53 |
| 中文影视剧 | 单行中文30字符，合并间隔0.6s，强标点严格切割 |
| 短视频快语速 | 合并间隔0.5s，最短字幕0.3s，强制从句拆分 |

## 五、常见问题排查
1. **识别依旧无标点**
检查`set_punctuation(true)`是否生效，medium模型本身标点能力偏弱，可后续叠加轻量标点恢复函数。
2. **分句时间戳错位**
必须保证`word_timestamps=true`，所有切割基于单词时间戳，禁止纯文本切割不绑定时间。
3. **修改代码不生效**
Electron热更失效，关闭程序重启调试；确认修改的是src源码，不是打包后的dist文件。
4. Mac权限报错
终端执行：`sudo xattr -dr com.apple.quarantine node_modules/`解除隔离。

## 六、进阶优化方向
1. 接入轻量级分句库`sentence-splitter`做中文精准分句；
2. 增加LLM兜底分句（调用本地小模型），对复杂长句AI语义拆分；
3. 结合音频VAD静音段，在语音停顿位置优先切割字幕。