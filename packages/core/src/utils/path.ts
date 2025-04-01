import { DEFAULT_PATH_SEPARATOR } from '../constants';
import type { DefaultPathSeparator } from '../types';

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

export function createPathFromSegments<
  const TSegments extends [string, ...string[]],
  TSeparator extends string = DefaultPathSeparator
>(
  segments: TSegments,
  separator: TSeparator = DEFAULT_PATH_SEPARATOR as TSeparator
): Path<TSegments, TSeparator> {
  return segments.join(separator) as Path<TSegments, TSeparator>;
}
