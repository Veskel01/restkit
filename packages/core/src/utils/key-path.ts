/**
 * Represents a type-safe joined key path from an array of string segments.
 *
 * Produces a dot-separated (or custom-separated) string literal type,
 * which is useful for modeling nested paths in resources or relations.
 *
 * @template TSegments - Array of string segments that make up the path
 * @template TSeparator - Separator to use when joining the segments
 *
 * @example
 * ```ts
 * type Path = KeyPath<['user', 'profile', 'id'], '.'>; // "user.profile.id"
 * type Custom = KeyPath<['a', 'b', 'c'], '/'>;          // "a/b/c"
 * ```
 */
export type KeyPath<
  TSegments extends string[],
  TSeparator extends string
> = TSegments extends []
  ? ''
  : TSegments extends [infer U]
    ? `${U & string}`
    : TSegments extends [infer U, ...infer Rest]
      ? `${U & string}${TSeparator}${KeyPath<Rest extends string[] ? Rest : never, TSeparator>}`
      : never;

/**
 * The default separator used for key paths.
 * This is a type-safe constant that can be used to specify the separator
 * when creating key paths.
 */
export const DEFAULT_KEY_PATH_SEPARATOR = '.' as const;

/**
 * Creates a key path string from an array of string segments, joined by a separator.
 * The returned value is both a runtime string and a type-safe literal.
 *
 * @param segments - An array of string segments (must include at least one)
 * @param separator - Optional separator string (defaults to `"."`)
 * @returns A typed and joined key path string
 *
 * @example
 * ```ts
 * const path = createKeyPath(['user', 'profile', 'id']);        // "user.profile.id"
 * const path2 = createKeyPath(['a', 'b', 'c'], '/');            // "a/b/c"
 * type Path = typeof path;                                      // "user.profile.id"
 * ```
 */
export function createKeyPath<
  TSegments extends [string, ...string[]],
  TSeparator extends string = typeof DEFAULT_KEY_PATH_SEPARATOR
>(
  segments: TSegments,
  separator: TSeparator = DEFAULT_KEY_PATH_SEPARATOR as TSeparator
): KeyPath<TSegments, TSeparator> {
  return segments.join(separator) as KeyPath<TSegments, TSeparator>;
}
