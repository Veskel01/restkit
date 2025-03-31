import { DEFAULT_PATH_SEPARATOR } from '../constants';

/**
 * Represents a type-safe joined path from an array of string segments.
 *
 * Produces a dot-separated (or custom-separated) string literal type,
 * which is useful for modeling nested paths in resources or relations.
 *
 * @template TSegments - Array of string segments that make up the path
 * @template TSeparator - Separator to use when joining the segments
 */
export type Path<
  TSegments extends string[],
  TSeparator extends string
> = TSegments extends []
  ? ''
  : TSegments extends [infer U]
    ? `${U & string}`
    : TSegments extends [infer U, ...infer Rest]
      ? `${U & string}${TSeparator}${Path<Rest extends string[] ? Rest : never, TSeparator>}`
      : never;

/**
 * Creates a path string by joining segments with the specified separator.
 * This is a simpler, more direct approach than the accessor function.
 *
 * @param segments - Array of string segments that make up the path
 * @param separator - Separator to use when joining the segments (defaults to ".")
 * @returns A path string with the segments joined by the separator
 *
 * @example
 * // Returns "user.profile.id"
 * const path = createPathFromSegments(["user", "profile", "id"]);
 *
 * // Returns "user/profile/id"
 * const customPath = createPathFromSegments(["user", "profile", "id"], "/");
 */
export function createPathFromSegments<
  const TSegments extends [string, ...string[]],
  TSeparator extends string = typeof DEFAULT_PATH_SEPARATOR
>(
  segments: TSegments,
  separator: TSeparator = DEFAULT_PATH_SEPARATOR as TSeparator
): Path<TSegments, TSeparator> {
  return segments.join(separator) as Path<TSegments, TSeparator>;
}
