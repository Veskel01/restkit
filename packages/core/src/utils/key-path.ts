export const KEY_PATH_SEPARATOR = '.' as const;

export type KeyPath<TSegments extends string[]> = TSegments extends []
  ? ''
  : TSegments extends [infer U]
    ? `${U & string}`
    : TSegments extends [infer U, ...infer Rest]
      ? `${U & string}${typeof KEY_PATH_SEPARATOR}${KeyPath<Rest extends string[] ? Rest : never>}`
      : never;

export function createKeyPath<TSegments extends [string, ...string[]]>(
  ...segments: TSegments
): KeyPath<TSegments> {
  return segments.join(KEY_PATH_SEPARATOR) as KeyPath<TSegments>;
}
