// Only literal colors and lengths are accepted. No URL, var(), expression(), or CSS declarations.
export function safeColor(value: string, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const color = value.trim();
  return /^(?:#[\da-f]{3,4}|#[\da-f]{6}|#[\da-f]{8}|[a-z]+|(?:rgb|rgba|hsl|hsla)\([\d\s.,%/+\-deg]+\))$/i.test(color) ? color : fallback;
}

export function safeLength(value: string, fallback: string): string {
  return typeof value === 'string' && /^(?:0|\d+(?:\.\d+)?(?:px|rem|em|%))$/.test(value.trim()) ? value.trim() : fallback;
}

export function safeOffset(value: string): string {
  return /^(?:\d+(?:\.\d+)?|\.\d+)%?$/.test(value) ? value : '0%';
}
