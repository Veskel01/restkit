export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isObject<T extends Record<string, unknown>>(
  value: unknown
): value is T {
  if (isNil(value)) {
    return false;
  }

  return typeof value === 'object';
}
