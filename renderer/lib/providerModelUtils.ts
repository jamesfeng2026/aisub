/**
 * Provider Model Name Utilities
 * Functions to handle multiple model names for providers
 */

export interface Provider {
  customModelNames?: string[];
  modelName?: string;
}

export function normalizeProviderModelNames(provider: Provider): string[] {
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

export function getPrimaryModelName(provider: Provider): string {
  const names = normalizeProviderModelNames(provider);
  return names[0] || '';
}