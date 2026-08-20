function normalizeProviderModelNames(provider) {
  const source = Array.isArray(provider?.customModelNames)
    ? provider.customModelNames
    : [];

  const values = source
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);

  if (values.length > 0) {
    return Array.from(new Set(values));
  }

  const fallback = String(provider?.modelName ?? '').trim();
  return fallback ? [fallback] : [];
}

function getPrimaryModelName(provider) {
  const names = normalizeProviderModelNames(provider);
  return names[0] || '';
}

module.exports = {
  normalizeProviderModelNames,
  getPrimaryModelName,
};
