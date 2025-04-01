import type {
  ARRAY_MARKER,
  DEFAULT_MAX_PATH_DEPTH,
  DEFAULT_PATH_SEPARATOR,
  OPTIONAL_MARKER
} from '../constants';

/**
 * The default path separator used in resource paths.
 */
export type DefaultPathSeparator = typeof DEFAULT_PATH_SEPARATOR;

/**
 * The default maximum path depth used in resource paths.
 */
export type DefaultPathDepth = typeof DEFAULT_MAX_PATH_DEPTH;

/**
 * The marker used to indicate that a string in literal type is an array.
 */
export type ArrayMarker = typeof ARRAY_MARKER;

/**
 * Marks a string as an array.
 *
 * @template T - The string to mark as an array
 */
export type MarkAsArray<T extends string> = `${T}${ArrayMarker}`;

/**
 * Checks if a string is marked as an array.
 *
 * @template T - The string to check
 */
export type IsMarkedAsArray<T extends string> =
  T extends `${string}${ArrayMarker}` ? true : false;

/**
 * The marker used to indicate that an attribute is optional.
 */
export type OptionalMarker = typeof OPTIONAL_MARKER;

/**
 * Marks a string as optional.
 *
 * @template T - The string to mark as optional
 */
export type MarkAsOptional<T extends string> = `${T}${OptionalMarker}`;

/**
 * Checks if a string is marked as optional.
 *
 * @template T - The string to check
 */
export type IsMarkedAsOptional<T extends string> =
  T extends `${string}${OptionalMarker}`
    ? true
    : T extends `${string}${OptionalMarker}${string}`
      ? true
      : false;

/**
 * Removes the optional marker from a path if present
 *
 * @template T - The path string
 */
export type RemoveOptionalMarker<T extends string> =
  T extends `${infer Base}${OptionalMarker}` ? Base : T;
