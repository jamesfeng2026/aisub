# 字幕分段策略改进设计

## 背景

当前使用 whisper.cpp medium 模型提取英文字幕时，存在标点符号分割不准确的问题：

**问题示例：**
```
13 
00:00:53,410 --> 00:00:55,120
you're going out with the guy. There's

14
00:00:55,220 --> 00:00:57,090
gotta be something wrong with him. So

15
00:00:57,090 --> 00:00:57,930
does he have a hump?
```

**问题分析：**
- 句末标点（如 `.`）没有被正确识别为分割点
- 多个句子被合并到一条字幕中
- 影响字幕的可读性和用户体验

## 目标

改进字幕分段策略，实现：
1. 控制字幕长度（不宜太长）
2. 优先按标点符号分割
3. 对长句在主从句处分割

## 方案

**增强现有规则断句 + AI 可选增强**

### 核心改进

#### 1. 标点符号识别增强

**新增功能：**
- 引号/括号配对检测
- 省略号、破折号等特殊标点处理
- 中英文标点统一处理

**实现：**
```typescript
/** 引号和括号配对表 */
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

/** 检测文本是否在未闭合的引号/括号内 */
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

#### 2. 智能分割策略

**分层标点策略：**
- **句末标点**（`. ! ?`）：立即分割（除非在引号/括号内）
- **停顿性标点**（`, ;`）：达到长度后分割（除非在引号/括号内）
- **特殊情况**：等待配对结束再分割

**实现：**
```typescript
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

#### 3. AI 语义断句

**保持现有功能：**
- 作为可选增强选项
- 用户自主选择是否使用
- 使用现有的 AI 服务商配置

## 实现细节

### 修改文件

**主要修改：** `main/helpers/subtitleSegmentation.ts`

**修改点：**
1. 新增 `PAIRED_CHARS` 常量
2. 新增 `isInUnclosedPair` 函数
3. 新增 `shouldSplitAtPunct` 函数
4. 修改 `groupTokenCues` 函数中的分割逻辑
5. 修改硬切回溯逻辑

### 测试策略

**单元测试：**
- 引号配对检测测试
- 智能分割判断测试
- 实际分段效果测试

**集成测试：**
- 英文字幕分段
- 中文字幕分段
- 中英文混合字幕分段
- 引号、括号内的文本分段
- 长句分段

## 预期效果

**修改前：**
```
you're going out with the guy. There's
gotta be something wrong with him. So
does he have a hump?
```

**修改后：**
```
you're going out with the guy.
There's gotta be something wrong with him.
So does he have a hump?
```

## 风险评估

**低风险：**
- 基于现有架构，改动较小
- 向后兼容，不破坏现有功能
- 有完整的测试覆盖

**缓解措施：**
- 保持原有逻辑作为兜底
- 增加详细的日志记录
- 提供配置选项让用户回退

## 时间估算

- 实现时间：2-3 小时
- 测试时间：1-2 小时
- 总计：3-5 小时

## 后续优化

1. 根据用户反馈调整参数
2. 增加更多特殊标点的处理
3. 优化 AI 语义断句的提示词