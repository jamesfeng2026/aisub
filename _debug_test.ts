import { isInUnclosedPair, shouldSplitAtPunct, groupTokenCues } from './main/helpers/subtitleSegmentation';

// Test 1: closed double quotes
const r1 = isInUnclosedPair('He said, "I\'m going"');
console.log('Test 1 (closed double quotes):', r1, '(expected: false)');

// Test 2: nested closed pairs
const r2 = isInUnclosedPair('He said, "The book (written by John)"');
console.log('Test 2 (nested closed):', r2, '(expected: false)');

// Test 3: English period split
const tokens: [string, string, string][] = [
  ['0', '0.3', "you're"],
  ['0.3', '0.6', 'going'],
  ['0.6', '0.9', 'out'],
  ['0.9', '1.2', 'with'],
  ['1.2', '1.5', 'the'],
  ['1.5', '1.8', 'guy.'],
  ['1.8', '2.1', "There's"],
];
const cues = groupTokenCues(tokens);
console.log('Test 3 (english period):', JSON.stringify(cues));

// Test 4: soft-split duration gate
const tokens2: [string, string, string][] = [
  ['0', '1.4', '啊'],
  ['1.4', '2.8', '，'],
  ['2.8', '3.2', '好'],
];
const cues2 = groupTokenCues(tokens2);
console.log('Test 4 (soft-split duration):', JSON.stringify(cues2));

// Test 5: shouldSplitAtPunct with period
const defOpts = { maxGapSeconds: 0.5, maxDurationSeconds: 8, maxWidth: 40, softMaxWidth: 10, softMaxDuration: 2.5 };
const r5 = shouldSplitAtPunct('world.', 'world.', 10, defOpts as any);
console.log('Test 5 (period split):', r5, '(expected: true)');

// Test 6: shouldSplitAtPunct inside unclosed quotes
const r6 = shouldSplitAtPunct('He said, "Hello.', 'Hello.', 10, defOpts as any);
console.log('Test 6 (period inside quotes):', r6, '(expected: false)');