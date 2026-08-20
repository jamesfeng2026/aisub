# 字幕分段策略改进实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 改进字幕分段策略，增强标点符号识别和智能分割逻辑，解决 whisper.cpp medium 模型标点符号分割不准确的问题。

**Architecture:** 在现有的规则断句引擎中增加引号/括号配对检测和智能分割策略，保持向后兼容，AI 语义断句作为可选增强。

**Tech Stack:** TypeScript, Electron, whisper.cpp

## Global Constraints

- 保持向后兼容，不破坏现有功能
- 所有修改必须有对应的单元测试
- 遵循现有的代码风格和命名规范
- 使用现有的测试框架（scripts/test-engine-units.ts）

---

## File Structure

**修改文件：**
- `main/helpers/subtitleSegmentation.ts` - 主要修改文件，增加智能标点识别和分割逻辑

**测试文件：**
- `scripts/test-engine-units.ts` - 添加单元测试

---

### Task 1: 增加引号/括号配对检测功能

**Files:**
- Modify: `main/helpers/subtitleSegmentation.ts:67-85` - 在标点符号常量定义后添加新功能

**Interfaces:**
- Produces: `PAIRED_CHARS` 常量，`isInUnclosedPair(text: string): boolean` 函数

- [ ] **Step 1: 添加引号/括号配对表常量**

在 `main/helpers/subtitleSegmentation.ts` 的第 85 行后添加：

```typescript
/** 引号和括号配对表：用于检测未闭合的配对。 */
const PAIRED_CHARS: Record<string, string> = {
  '「': '」',
  '『': '』',
  '【': '】',
  '《': '》',
  '"': '"',
  ''': ''',
  '(': ')',
  '[': ']',
  '{': '}',
};
```

- [ ] **Step 2: 实现引号/括号配对检测函数**

在 `PAIRED_CHARS` 常量后添加：

```typescript
/**
 * 检测文本是否在未闭合的引号/括号内。
 * 
 * @example
 * isInUnclosedPair('He said, "I\'m going') // true（引号未闭合）
 * isInUnclosedPair('He said, "I\'m going"') // false（引号已闭合）
 * isInUnclosedPair('The book (written by John') // true（括号未闭合）
 * isInUnclosedPair('The book (written by John)') // false（括号已闭合）
 */
function isInUnclosedPair(text: string): boolean {
  const stack: string[] = [];
  for (const ch of text) {
    for (const [open, close] of Object.entries(PAIRED_CHARS)) {
      if (ch === open) {
        stack.push(open);
      } else if (ch === close) {
        if (stack.length > 0 && stack[stack.length - 1] === open) {
          stack.pop();
        }
      }
    }
  }
  return stack.length > 0;
}
```

- [ ] **Step 3: 编写单元测试**

在 `scripts/test-engine-units.ts` 中添加测试：

```typescript
// Test: isInUnclosedPair - 引号配对检测
describe('isInUnclosedPair', () => {
  it('should detect unclosed quotes', () => {
    expect(isInUnclosedPair('He said, "I\'m going')).toBe(true);
    expect(isInUnclosedPair('He said, "I\'m going"')).toBe(false);
  });
  
  it('should detect unclosed parentheses', () => {
    expect(isInUnclosedPair('The book (written by John')).toBe(true);
    expect(isInUnclosedPair('The book (written by John)')).toBe(false);
  });
  
  it('should handle nested pairs', () => {
    expect(isInUnclosedPair('He said, "The book (written by John)"')).toBe(false);
    expect(isInUnclosedPair('He said, "The book (written by John"')).toBe(true);
  });
  
  it('should handle Chinese quotes', () => {
    expect(isInUnclosedPair('他说：「你好')).toBe(true);
    expect(isInUnclosedPair('他说：「你好」')).toBe(false);
  });
});
```

- [ ] **Step 4: 运行测试验证**

Run: `npm run test:engine-units`
Expected: 所有测试通过

- [ ] **Step 5: Commit**

```bash
git add main/helpers/subtitleSegmentation.ts scripts/test-engine-units.ts
git commit -m "feat: add paired punctuation detection for subtitle segmentation"
```

---

### Task 2: 实现智能分割判断函数

**Files:**
- Modify: `main/helpers/subtitleSegmentation.ts` - 在 `isInUnclosedPair` 函数后添加

**Interfaces:**
- Consumes: `SENTENCE_END_CHARS`, `SOFT_PUNCT_CHARS`, `isInUnclosedPair`
- Produces: `shouldSplitAtPunct(text: string, punct: string, currentLength: number, options: Required<GroupTokenCuesOptions>): boolean`

- [ ] **Step 1: 实现智能分割判断函数**

在 `isInUnclosedPair` 函数后添加：

```typescript
/**
 * 智能判断是否应该在标点处分割。
 * 
 * @param text 当前累积的文本
 * @param punct 当前标点字符
 * @param currentLength 当前字幕长度
 * @param options 分割选项
 * @returns 是否应该分割
 */
function shouldSplitAtPunct(
  text: string,
  punct: string,
  currentLength: number,
  options: Required<GroupTokenCuesOptions>
): boolean {
  // 如果在未闭合的引号/括号内，不分割
  if (isInUnclosedPair(text)) {
    return false;
  }
  
  // 句末标点：立即分割
  if (SENTENCE_END_CHARS.includes(punct)) {
    return true;
  }
  
  // 停顿性标点：达到软长度后分割
  if (SOFT_PUNCT_CHARS.includes(punct)) {
    return currentLength >= options.softMaxWidth;
  }
  
  return false;
}
```

- [ ] **Step 2: 编写单元测试**

在 `scripts/test-engine-units.ts` 中添加测试：

```typescript
// Test: shouldSplitAtPunct - 智能分割判断
describe('shouldSplitAtPunct', () => {
  const defaultOptions = {
    maxGapSeconds: 0.5,
    maxDurationSeconds: 8,
    maxWidth: 40,
    softMaxWidth: 10,
    softMaxDuration: 2.5,
  };
  
  it('should split at sentence end punctuation', () => {
    expect(shouldSplitAtPunct('Hello world', '.', 10, defaultOptions)).toBe(true);
    expect(shouldSplitAtPunct('Hello world', '!', 10, defaultOptions)).toBe(true);
    expect(shouldSplitAtPunct('Hello world', '?', 10, defaultOptions)).toBe(true);
  });
  
  it('should not split inside unclosed quotes', () => {
    expect(shouldSplitAtPunct('He said, "Hello', '.', 10, defaultOptions)).toBe(false);
    expect(shouldSplitAtPunct('He said, "Hello', '!', 10, defaultOptions)).toBe(false);
  });
  
  it('should split at soft punctuation when length reached', () => {
    expect(shouldSplitAtPunct('Hello world', ',', 15, defaultOptions)).toBe(true);
    expect(shouldSplitAtPunct('Hello world', ',', 5, defaultOptions)).toBe(false);
  });
  
  it('should not split at soft punctuation inside quotes', () => {
    expect(shouldSplitAtPunct('He said, "Hello', ',', 15, defaultOptions)).toBe(false);
  });
});
```

- [ ] **Step 3: 运行测试验证**

Run: `npm run test:engine-units`
Expected: 所有测试通过

- [ ] **Step 4: Commit**

```bash
git add main/helpers/subtitleSegmentation.ts scripts/test-engine-units.ts
git commit -m "feat: add intelligent punctuation split decision function"
```

---

### Task 3: 修改 groupTokenCues 函数使用智能分割

**Files:**
- Modify: `main/helpers/subtitleSegmentation.ts:1045-1057` - 修改收尾逻辑

**Interfaces:**
- Consumes: `shouldSplitAtPunct`, `visualWidth`

- [ ] **Step 1: 找到需要修改的代码位置**

在 `main/helpers/subtitleSegmentation.ts` 中找到以下代码（约在第 1045-1057 行）：

```typescript
// 收尾当前 cue（标点已含在 curText 内）：
//  - 句末标点：立即切（句子边界）；
//  - 停顿性标点：cue 达软宽度/软时长后软切（§6.2，标点优先于硬上限，避免切在词中）。
const trimmed = text.trim();
if (
  SENTENCE_END.test(trimmed) ||
  (SOFT_PUNCT.test(trimmed) &&
    (visualWidth(curText) >= opts.softMaxWidth ||
      curEnd - curStart >= opts.softMaxDuration))
) {
  flush();
}
```

- [ ] **Step 2: 替换为智能分割逻辑**

将上述代码替换为：

```typescript
// 收尾当前 cue（标点已含在 curText 内）：
//  - 句末标点：立即切（句子边界）；
//  - 停顿性标点：cue 达软宽度/软时长后软切（§6.2，标点优先于硬上限，避免切在词中）。
//  - 智能判断：如果在未闭合的引号/括号内，不分割。
const trimmed = text.trim();
const shouldSplit = shouldSplitAtPunct(
  curText,
  trimmed,
  visualWidth(curText),
  opts
);

if (shouldSplit) {
  flush();
}
```

- [ ] **Step 3: 编写集成测试**

在 `scripts/test-engine-units.ts` 中添加测试：

```typescript
// Test: groupTokenCues with enhanced punctuation - 实际分段效果
describe('groupTokenCues with enhanced punctuation', () => {
  it('should split at sentence end punctuation', () => {
    const tokens = [
      ['00:00:00,000', '00:00:02,000', "you're going out with the guy."],
      ['00:00:02,000', '00:00:04,000', "There's gotta be something wrong with him."],
    ];
    const cues = groupTokenCues(tokens);
    expect(cues.length).toBe(2);
    expect(cues[0][2]).toBe("you're going out with the guy.");
    expect(cues[1][2]).toBe("There's gotta be something wrong with him.");
  });
  
  it('should not split inside quotes', () => {
    const tokens = [
      ['00:00:00,000', '00:00:02,000', 'He said, "I\'m going'],
      ['00:00:02,000', '00:00:04,000', ' to the store."'],
    ];
    const cues = groupTokenCues(tokens);
    expect(cues.length).toBe(1);
    expect(cues[0][2]).toBe('He said, "I\'m going to the store."');
  });
  
  it('should not split inside parentheses', () => {
    const tokens = [
      ['00:00:00,000', '00:00:02,000', 'The book (written by John'],
      ['00:00:02,000', '00:00:04,000', ') is good.'],
    ];
    const cues = groupTokenCues(tokens);
    expect(cues.length).toBe(1);
    expect(cues[0][2]).toBe('The book (written by John) is good.');
  });
});
```

- [ ] **Step 4: 运行测试验证**

Run: `npm run test:engine-units`
Expected: 所有测试通过

- [ ] **Step 5: Commit**

```bash
git add main/helpers/subtitleSegmentation.ts scripts/test-engine-units.ts
git commit -m "feat: integrate intelligent punctuation split into groupTokenCues"
```

---

### Task 4: 修改硬切回溯逻辑

**Files:**
- Modify: `main/helpers/subtitleSegmentation.ts:976-1010` - 修改硬切回溯逻辑

**Interfaces:**
- Consumes: `isInUnclosedPair`, `HARD_BREAK_PUNCT`

- [ ] **Step 1: 找到需要修改的代码位置**

在 `main/helpers/subtitleSegmentation.ts` 中找到以下代码（约在第 976-1010 行）：

```typescript
// 硬上限触发：回溯到 cue 内最后一个可断标点后切分（避免孤立句尾词）。
// 余部（标点后的 token）留作新 cue 开头；若余部加上本 token 仍超限，
// 则余部也单独成条（保证任何 cue 不超宽；单字余部由 mergeShortCues 回收）。
let cut = -1;
for (let i = buf.length - 2; i >= 0; i -= 1) {
  if (HARD_BREAK_PUNCT.test(buf[i].text.trim())) {
    cut = i;
    break;
  }
}
```

- [ ] **Step 2: 替换为智能回溯逻辑**

将上述代码替换为：

```typescript
// 硬上限触发：回溯到 cue 内最后一个可断标点后切分（避免孤立句尾词）。
// 余部（标点后的 token）留作新 cue 开头；若余部加上本 token 仍超限，
// 则余部也单独成条（保证任何 cue 不超宽；单字余部由 mergeShortCues 回收）。
// 智能判断：跳过在未闭合引号/括号内的标点。
let cut = -1;
for (let i = buf.length - 2; i >= 0; i -= 1) {
  const bufText = buf.slice(0, i + 1).map(t => t.text).join('');
  const punct = buf[i].text.trim();
  
  // 如果在未闭合的引号/括号内，跳过这个标点
  if (isInUnclosedPair(bufText)) {
    continue;
  }
  
  if (HARD_BREAK_PUNCT.test(punct)) {
    cut = i;
    break;
  }
}
```

- [ ] **Step 2: 编写测试验证硬切回溯**

在 `scripts/test-engine-units.ts` 中添加测试：

```typescript
// Test: groupTokenCues hard break with quotes - 硬切回溯测试
describe('groupTokenCues hard break with quotes', () => {
  it('should not hard break inside quotes', () => {
    // 创建一个超长的引号内文本，测试硬切不会在引号内分割
    const longText = 'He said, "' + 'This is a very long sentence that would normally trigger a hard break. '.repeat(5) + '"';
    const tokens = [
      ['00:00:00,000', '00:00:10,000', longText],
    ];
    const cues = groupTokenCues(tokens);
    // 应该保持完整，不在引号内分割
    expect(cues.length).toBe(1);
    expect(cues[0][2]).toBe(longText);
  });
});
```

- [ ] **Step 3: 运行测试验证**

Run: `npm run test:engine-units`
Expected: 所有测试通过

- [ ] **Step 4: Commit**

```bash
git add main/helpers/subtitleSegmentation.ts scripts/test-engine-units.ts
git commit -m "feat: enhance hard break logic with paired punctuation check"
```

---

### Task 5: 集成测试和验证

**Files:**
- Test: 实际字幕文件测试

- [ ] **Step 1: 准备测试音频文件**

使用您之前遇到问题的音频文件进行测试。

- [ ] **Step 2: 运行开发模式**

Run: `npm run dev`

- [ ] **Step 3: 提取字幕**

使用 whisper.cpp medium 模型提取英文字幕，观察分段效果。

- [ ] **Step 4: 验证预期效果**

检查字幕是否按标点符号正确分割：

**预期效果：**
```
13 
00:00:53,410 --> 00:00:55,120
you're going out with the guy.

14
00:00:55,220 --> 00:00:57,090
There's gotta be something wrong with him.

15
00:00:57,090 --> 00:00:57,930
So does he have a hump?
```

- [ ] **Step 5: 测试其他场景**

测试以下场景：
1. 中文字幕分段
2. 中英文混合字幕分段
3. 引号、括号内的文本分段
4. 长句分段

- [ ] **Step 6: 记录测试结果**

如果发现问题，记录下来并调整参数或逻辑。

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "test: verify subtitle segmentation improvement with real audio"
```

---

### Task 6: 文档更新

**Files:**
- Update: `docs/docs/advanced/ai-refine.md` - 更新文档说明改进内容

- [ ] **Step 1: 更新 AI 精修文档**

在 `docs/docs/advanced/ai-refine.md` 中添加说明：

```markdown
## 字幕分段改进

### 规则断句增强

我们改进了规则断句引擎，增强了标点符号识别能力：

1. **引号/括号配对检测**：避免在未闭合的引号、括号内分割字幕
2. **智能标点策略**：
   - 句末标点（`. ! ?`）：立即分割
   - 停顿性标点（`, ;`）：达到一定长度后分割
   - 特殊情况：等待配对结束再分割
3. **中英文统一处理**：统一处理中英文标点符号

### AI 语义断句

对于更复杂的语义分割需求，可以使用 AI 语义断句功能：

- 使用大模型分析语义边界
- 智能识别主从句、语义单元
- 需要配置 AI 服务商（如 DeepSeek、OpenAI 等）

详见 [AI 语义断句](#ai-语义断句) 章节。
```

- [ ] **Step 2: Commit**

```bash
git add docs/docs/advanced/ai-refine.md
git commit -m "docs: update documentation for subtitle segmentation improvement"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- ✅ 引号/括号配对检测 - Task 1
- ✅ 智能分割策略 - Task 2
- ✅ 集成到现有函数 - Task 3
- ✅ 硬切回溯改进 - Task 4
- ✅ 测试验证 - Task 5
- ✅ 文档更新 - Task 6

**2. Placeholder scan:**
- ✅ 没有 "TBD"、"TODO"、"implement later" 等占位符
- ✅ 所有代码步骤都有完整的代码实现
- ✅ 所有测试步骤都有完整的测试代码
- ✅ 所有命令都有具体的命令和预期输出

**3. Type consistency:**
- ✅ `isInUnclosedPair(text: string): boolean` - 在 Task 1 定义，Task 2 使用
- ✅ `shouldSplitAtPunct(text: string, punct: string, currentLength: number, options: Required<GroupTokenCuesOptions>): boolean` - 在 Task 2 定义，Task 3 使用
- ✅ 所有函数签名和类型定义一致

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-06-subtitle-segmentation-improvement.md`. 

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**