const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeProviderModelNames, getPrimaryModelName } = require('./providerModelUtils');

test('normalizeProviderModelNames prefers explicit custom list', () => {
  const provider = {
    modelName: 'deepseek-chat',
    customModelNames: ['gpt-4o', 'claude-3.5-sonnet'],
  };

  assert.deepEqual(normalizeProviderModelNames(provider), [
    'gpt-4o',
    'claude-3.5-sonnet',
  ]);
  assert.equal(getPrimaryModelName(provider), 'gpt-4o');
});

test('normalizeProviderModelNames falls back to single modelName', () => {
  const provider = { modelName: 'deepseek-chat' };

  assert.deepEqual(normalizeProviderModelNames(provider), ['deepseek-chat']);
  assert.equal(getPrimaryModelName(provider), 'deepseek-chat');
});

test('normalizeProviderModelNames trims empty values and deduplicates', () => {
  const provider = {
    customModelNames: ['  ', 'gpt-4o', 'gpt-4o', ''],
  };

  assert.deepEqual(normalizeProviderModelNames(provider), ['gpt-4o']);
  assert.equal(getPrimaryModelName(provider), 'gpt-4o');
});
