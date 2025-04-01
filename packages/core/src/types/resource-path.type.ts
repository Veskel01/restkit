import type {
  AnyAttribute,
  ArrayAttribute,
  InferAttributeOutput,
  ObjectAttribute,
  OneOfAttribute
} from '../attributes';
import type { AnyResource } from '../schema';
import type {
  ArrayMarker,
  DefaultPathDepth,
  DefaultPathSeparator,
  IsMarkedAsOptional,
  MarkAsArray,
  MarkAsOptional,
  OptionalMarker
} from './mark.type';
import type { DecrementDepth } from './utility.type';

/**
 * Recursively extracts all valid attribute paths from a given set of attributes, with depth control.
 * Handles nested objects, arrays, and OneOf discriminated unions.
 *
 * @template TAttributes - Record of attributes (e.g., from a Resource definition)
 * @template TPrefix - Current path prefix, built up during recursion
 * @template TPathSeparator - Character used to separate path segments
 * @template TDepth - Current depth level, used to avoid infinite recursion
 */
type ExtractPaths<
  TAttributes extends Record<string, AnyAttribute>,
  TPrefix extends string,
  TPathSeparator extends string,
  TDepth extends number
> = TDepth extends 0
  ? never
  : {
      [K in keyof TAttributes]: TAttributes[K] extends ArrayAttribute<
        infer TItem
      >
        ? TItem extends AnyAttribute
          ? TItem extends ObjectAttribute<infer TShape>
            ?
                | (TPrefix extends ''
                    ? `${MarkAsArray<K & string>}`
                    : `${TPrefix}${TPathSeparator}${MarkAsArray<K & string>}`)
                | ExtractPaths<
                    TShape,
                    TPrefix extends ''
                      ? `${MarkAsArray<K & string>}`
                      : `${TPrefix}${TPathSeparator}${MarkAsArray<K & string>}`,
                    TPathSeparator,
                    DecrementDepth<TDepth>
                  >
            : TPrefix extends ''
              ? `${MarkAsArray<K & string>}`
              : `${TPrefix}${TPathSeparator}${MarkAsArray<K & string>}`
          : never
        : TAttributes[K] extends ObjectAttribute<infer TShape>
          ?
              | (TPrefix extends ''
                  ? `${K & string}`
                  : `${TPrefix}${TPathSeparator}${K & string}`)
              | ExtractPaths<
                  TShape,
                  TPrefix extends ''
                    ? `${K & string}`
                    : `${TPrefix}${TPathSeparator}${K & string}`,
                  TPathSeparator,
                  DecrementDepth<TDepth>
                >
          : TAttributes[K] extends OneOfAttribute<
                infer TDiscriminator,
                infer TCases
              >
            ?
                | (TPrefix extends ''
                    ? `${K & string}`
                    : `${TPrefix}${TPathSeparator}${K & string}`)
                | (TPrefix extends ''
                    ? `${K & string}${TPathSeparator}${TDiscriminator}`
                    : `${TPrefix}${TPathSeparator}${K & string}${TPathSeparator}${TDiscriminator}`)
                | ExtractOneOfCasePaths<
                    TCases,
                    K & string,
                    TPrefix,
                    TPathSeparator,
                    TDiscriminator,
                    DecrementDepth<TDepth>
                  >
            : TPrefix extends ''
              ? `${K & string}`
              : `${TPrefix}${TPathSeparator}${K & string}`;
    }[keyof TAttributes];

/**
 * Extracts paths from each case in a OneOf attribute.
 * Preserves optionality in the path using a suffix marker (e.g., `?`).
 * This is necessary because OneOf cases may have fields not always present
 * and such fields are considered optional in the context of the flattened path representation.
 *
 * @template TCases - Tuple/array of case object attributes
 * @template TKey - Path key leading to the OneOf attribute
 * @template TPrefix - Path prefix before TKey
 * @template TPathSeparator - String used to delimit nested paths (e.g., "." or "/")
 * @template TDiscriminator - Name of the discriminator key for the union
 * @template TDepth - Maximum depth for recursion
 */
type ExtractOneOfCasePaths<
  TCases,
  TKey extends string,
  TPrefix extends string,
  TPathSeparator extends string,
  TDiscriminator extends string,
  TDepth extends number
> = TDepth extends 0
  ? never
  : TCases extends readonly (infer TCase)[]
    ? TCase extends ObjectAttribute<infer TShape>
      ? {
          [K in Exclude<keyof TShape, TDiscriminator>]:
            | (TPrefix extends ''
                ? MarkAsOptional<`${TKey}${TPathSeparator}${K & string}`>
                : MarkAsOptional<`${TPrefix}${TPathSeparator}${TKey}${TPathSeparator}${K & string}`>)
            | (TShape[K] extends ObjectAttribute<infer TNestedShape>
                ? ExtractNestedPaths<
                    TNestedShape,
                    TPrefix extends ''
                      ? MarkAsOptional<`${TKey}${TPathSeparator}${K & string}`>
                      : MarkAsOptional<`${TPrefix}${TPathSeparator}${TKey}${TPathSeparator}${K & string}`>,
                    TPathSeparator,
                    DecrementDepth<TDepth>
                  >
                : TShape[K] extends OneOfAttribute<
                      infer TNestedDiscriminator,
                      infer TNestedCases
                    >
                  ?
                      | (TPrefix extends ''
                          ? MarkAsOptional<`${TKey}${TPathSeparator}${K & string}${TPathSeparator}${TNestedDiscriminator}`>
                          : MarkAsOptional<`${TPrefix}${TPathSeparator}${TKey}${TPathSeparator}${K & string}${TPathSeparator}${TNestedDiscriminator}`>)
                      | ExtractOneOfCasePaths<
                          TNestedCases,
                          MarkAsOptional<`${TKey}${TPathSeparator}${K & string}`>,
                          TPrefix,
                          TPathSeparator,
                          TNestedDiscriminator,
                          DecrementDepth<TDepth>
                        >
                  : never);
        }[Exclude<keyof TShape, TDiscriminator>]
      : never
    : never;

/**
 * Extracts nested object paths from a given object shape, preserving optional markers.
 * Typically used inside OneOf or deeply nested ObjectAttribute recursion.
 *
 * @template TShape - The nested shape of object attributes
 * @template TPrefix - Current path prefix (already includes full ancestry)
 * @template TPathSeparator - Separator to use in building full path
 * @template TDepth - Recursion depth limiter
 */
type ExtractNestedPaths<
  TShape extends Record<string, AnyAttribute>,
  TPrefix extends string,
  TPathSeparator extends string,
  TDepth extends number
> = TDepth extends 0
  ? never
  : {
      [K in keyof TShape]:
        | `${TPrefix}${TPathSeparator}${K & string}`
        | (TShape[K] extends ObjectAttribute<infer TNestedShape>
            ? ExtractNestedPaths<
                TNestedShape,
                `${TPrefix}${TPathSeparator}${K & string}`,
                TPathSeparator,
                DecrementDepth<TDepth>
              >
            : TShape[K] extends OneOfAttribute<
                  infer TNestedDiscriminator,
                  infer TNestedCases
                >
              ?
                  | `${TPrefix}${TPathSeparator}${K & string}${TPathSeparator}${TNestedDiscriminator}`
                  | ExtractOneOfCasePaths<
                      TNestedCases,
                      `${TPrefix}${TPathSeparator}${K & string}`,
                      '',
                      TPathSeparator,
                      TNestedDiscriminator,
                      DecrementDepth<TDepth>
                    >
              : never);
    }[keyof TShape];

/**
 * Infers the output type of a OneOf structure as a union of all possible shapes.
 * Useful when computing the final inferred shape of a OneOfAttribute.
 *
 * @template TCases - Tuple of case object attributes used in the OneOf
 */
type UnionOfOneOfOutputs<TCases> = TCases extends readonly (infer TCase)[]
  ? TCase extends ObjectAttribute<infer TShape>
    ? { [K in keyof TShape]: InferAttributeOutput<TShape[K]> }
    : never
  : never;

/**
 * Removes optional markers (e.g., '?') from a given string path.
 * Used to normalize paths before accessing the shape.
 *
 * @template TPath - Path string that may contain optional suffixes
 */
type RemoveAllOptionalMarkers<TPath extends string> =
  TPath extends `${infer Head}${OptionalMarker}${infer Rest}`
    ? `${Head}${RemoveAllOptionalMarkers<Rest>}`
    : TPath;

/**
 * Recursively extracts the value type at a given normalized (marker-free) path.
 * Optionally returns `undefined` if the path is marked as optional.
 *
 * @template TResource - The resource to resolve
 * @template TPath - The normalized path (without markers)
 * @template TIsOptional - Whether this path includes optional segments
 * @template TPathSeparator - The path delimiter (e.g. '.')
 * @template TDepth - Depth limiter to prevent infinite recursion
 */
type MergeOptionalChainProps<
  TResource extends AnyResource,
  TPath extends string,
  TIsOptional extends boolean,
  TPathSeparator extends string,
  TDepth extends number
> = TDepth extends 0
  ? never
  : TPath extends `${infer Head}${TPathSeparator}${infer Tail}`
    ? Head extends keyof TResource['attributes']
      ? TResource['attributes'][Head] extends ObjectAttribute<infer TShape>
        ? MergeObjectProps<
            TShape,
            Tail,
            TIsOptional,
            TPathSeparator,
            DecrementDepth<TDepth>
          >
        : TResource['attributes'][Head] extends OneOfAttribute<
              infer TDiscriminator,
              infer TCases
            >
          ? Tail extends TDiscriminator
            ? string // Discriminator field is always a string
            : MergeOneOfProps<
                TCases,
                Tail,
                TIsOptional,
                TPathSeparator,
                TDiscriminator,
                DecrementDepth<TDepth>
              >
          : never
      : Head extends `${infer ArrayName}${ArrayMarker}`
        ? ArrayName extends keyof TResource['attributes']
          ? TResource['attributes'][ArrayName] extends ArrayAttribute<
              infer TItem
            >
            ? TItem extends ObjectAttribute<infer TShape>
              ? MergeObjectProps<
                  TShape,
                  Tail,
                  TIsOptional,
                  TPathSeparator,
                  DecrementDepth<TDepth>
                >
              : TIsOptional extends true
                ? InferAttributeOutput<TItem> | undefined
                : InferAttributeOutput<TItem>
            : never
          : never
        : never
    : TPath extends keyof TResource['attributes']
      ? TResource['attributes'][TPath] extends OneOfAttribute<
          string,
          infer TCases
        >
        ? TIsOptional extends true
          ? UnionOfOneOfOutputs<TCases> | undefined
          : UnionOfOneOfOutputs<TCases>
        : TIsOptional extends true
          ? InferAttributeOutput<TResource['attributes'][TPath]> | undefined
          : InferAttributeOutput<TResource['attributes'][TPath]>
      : TPath extends `${infer ArrayName}${ArrayMarker}`
        ? ArrayName extends keyof TResource['attributes']
          ? TResource['attributes'][ArrayName] extends ArrayAttribute<
              infer TItem
            >
            ? TIsOptional extends true
              ? InferAttributeOutput<TItem> | undefined
              : InferAttributeOutput<TItem>
            : never
          : never
        : unknown;

/**
 * Recursively resolves the value type of a nested path within an object shape.
 * Used to follow paths through ObjectAttributes, handling OneOf and Array types as needed.
 *
 * @template TShape - The shape (attributes) of the current object
 * @template TPath - The remaining subpath to evaluate
 * @template TIsOptional - Whether the current path branch is optional (inferred from markers)
 * @template TPathSeparator - The string used to separate path segments
 * @template TDepth - Current recursion depth control
 */
type MergeObjectProps<
  TShape extends Record<string, AnyAttribute>,
  TPath extends string,
  TIsOptional extends boolean,
  TPathSeparator extends string,
  TDepth extends number
> = TDepth extends 0
  ? never
  : TPath extends `${infer Head}${TPathSeparator}${infer Tail}`
    ? Head extends keyof TShape
      ? TShape[Head] extends ObjectAttribute<infer TNestedShape>
        ? TIsOptional extends true
          ?
              | MergeObjectProps<
                  TNestedShape,
                  Tail,
                  true,
                  TPathSeparator,
                  DecrementDepth<TDepth>
                >
              | undefined
          : MergeObjectProps<
              TNestedShape,
              Tail,
              false,
              TPathSeparator,
              DecrementDepth<TDepth>
            >
        : TShape[Head] extends OneOfAttribute<
              infer TNestedDiscriminator,
              infer TNestedCases
            >
          ? Tail extends TNestedDiscriminator
            ? TIsOptional extends true
              ? string | undefined
              : string
            : TIsOptional extends true
              ?
                  | MergeOneOfProps<
                      TNestedCases,
                      Tail,
                      true,
                      TPathSeparator,
                      TNestedDiscriminator,
                      DecrementDepth<TDepth>
                    >
                  | undefined
              : MergeOneOfProps<
                  TNestedCases,
                  Tail,
                  false,
                  TPathSeparator,
                  TNestedDiscriminator,
                  DecrementDepth<TDepth>
                >
          : never
      : never
    : TPath extends keyof TShape
      ? TIsOptional extends true
        ? InferAttributeOutput<TShape[TPath]> | undefined
        : InferAttributeOutput<TShape[TPath]>
      : TPath extends `${infer ArrayName}${ArrayMarker}`
        ? ArrayName extends keyof TShape
          ? TShape[ArrayName] extends ArrayAttribute<infer TItem>
            ? TIsOptional extends true
              ? InferAttributeOutput<TItem> | undefined
              : InferAttributeOutput<TItem>
            : never
          : never
        : unknown;

/**
 * Resolves the value type for a nested path inside a OneOf discriminated union structure.
 * Evaluates the provided path against each union case shape and merges their results.
 *
 * @template TCases - List of OneOf case object attributes
 * @template TPath - Remaining subpath to evaluate
 * @template TIsOptional - Whether current branch is optional
 * @template TPathSeparator - String used to separate path segments
 * @template TDiscriminator - Name of the discriminator field
 * @template TDepth - Current recursion depth counter
 */
type MergeOneOfProps<
  TCases,
  TPath extends string,
  TIsOptional extends boolean,
  TPathSeparator extends string,
  TDiscriminator extends string,
  TDepth extends number
> = TDepth extends 0
  ? never
  : TCases extends readonly (infer TCase)[]
    ? TCase extends ObjectAttribute<infer TShape>
      ? TPath extends `${infer Head}${TPathSeparator}${infer Tail}`
        ? Head extends keyof Omit<TShape, TDiscriminator>
          ? TShape[Head] extends ObjectAttribute<infer TNestedShape>
            ? TIsOptional extends true
              ?
                  | MergeObjectProps<
                      TNestedShape,
                      Tail,
                      true,
                      TPathSeparator,
                      DecrementDepth<TDepth>
                    >
                  | undefined
              : MergeObjectProps<
                  TNestedShape,
                  Tail,
                  true,
                  TPathSeparator,
                  DecrementDepth<TDepth>
                >
            : TShape[Head] extends OneOfAttribute<
                  infer TNestedDiscriminator,
                  infer TNestedCases
                >
              ? TIsOptional extends true
                ?
                    | MergeOneOfProps<
                        TNestedCases,
                        Tail,
                        true,
                        TPathSeparator,
                        TNestedDiscriminator,
                        DecrementDepth<TDepth>
                      >
                    | undefined
                : MergeOneOfProps<
                    TNestedCases,
                    Tail,
                    true,
                    TPathSeparator,
                    TNestedDiscriminator,
                    DecrementDepth<TDepth>
                  >
              : TShape[Head] extends ArrayAttribute<infer TItem>
                ? Tail extends ''
                  ? TIsOptional extends true
                    ? InferAttributeOutput<TShape[Head]> | undefined
                    : InferAttributeOutput<TShape[Head]>
                  : TItem extends ObjectAttribute<infer TItemShape>
                    ? TIsOptional extends true
                      ?
                          | MergeObjectProps<
                              TItemShape,
                              Tail,
                              true,
                              TPathSeparator,
                              DecrementDepth<TDepth>
                            >
                          | undefined
                      : MergeObjectProps<
                          TItemShape,
                          Tail,
                          true,
                          TPathSeparator,
                          DecrementDepth<TDepth>
                        >
                    : never
                : Tail extends ''
                  ? TIsOptional extends true
                    ? InferAttributeOutput<TShape[Head]> | undefined
                    : InferAttributeOutput<TShape[Head]>
                  : never
          : never
        : TPath extends keyof Omit<TShape, TDiscriminator>
          ? TIsOptional extends true
            ? InferAttributeOutput<TShape[TPath]> | undefined
            : InferAttributeOutput<TShape[TPath]>
          : TPath extends `${infer ArrayName}${ArrayMarker}`
            ? ArrayName extends keyof Omit<TShape, TDiscriminator>
              ? TShape[ArrayName] extends ArrayAttribute<infer TItem>
                ? TIsOptional extends true
                  ? InferAttributeOutput<TItem> | undefined
                  : InferAttributeOutput<TItem>
                : never
              : never
            : never
      : never
    : never;

/**
 * All valid paths for a resource, including deeply nested ones.
 * Combines the root-level attributes and their nested descendants into a flattened path union.
 *
 * @template TResource - The resource to infer paths from
 * @template TPathSeparator - Delimiter used in path (default: '.')
 * @template TDepth - Optional depth control to prevent deep recursion (default: 5)
 */
export type ResourcePath<
  TResource extends AnyResource,
  TPathSeparator extends string = DefaultPathSeparator,
  TDepth extends number = DefaultPathDepth
> = ExtractPaths<TResource['attributes'], '', TPathSeparator, TDepth>;

/**
 * Computes the type of a value located at a specific path in a resource.
 * Supports deeply nested structures with depth limit and optional markers.
 *
 * @template TResource - The resource instance to inspect
 * @template TPath - A valid path (as resolved by `ResourcePath`)
 * @template TPathSeparator - Delimiter used for path navigation
 * @template TDepth - Maximum recursion depth
 */
export type ResourceValueByPath<
  TResource extends AnyResource,
  TPath extends ResourcePath<TResource, TPathSeparator, TDepth>,
  TPathSeparator extends string = DefaultPathSeparator,
  TDepth extends number = DefaultPathDepth
> = TDepth extends 0
  ? never
  : MergeOptionalChainProps<
      TResource,
      RemoveAllOptionalMarkers<TPath>,
      IsMarkedAsOptional<TPath>,
      TPathSeparator,
      TDepth
    >;
