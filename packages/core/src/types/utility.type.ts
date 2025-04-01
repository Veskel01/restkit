/**
 * Utility type to set a flag in a record of flags.
 *
 * @template TFlags - The record of flags to modify
 * @template TKey - The key of the flag to set
 * @template TValue - The value to set the flag to
 */
export type SetFlag<
  TFlags extends Record<string, boolean>,
  TKey extends keyof TFlags,
  TValue extends boolean
> = Omit<TFlags, TKey> & {
  [P in TKey]: TValue;
};

/**
 * Conditional type for handling optional/nullable values
 * @param TCondition - Boolean condition determining if value is nullable/optional
 * @param TValue - The base value type
 * @param TNullishType - The type to use for null/undefined (default: undefined)
 * @param TMode - The mode of operation ('required' or 'optional')
 */
export type NullishIf<
  TCondition extends boolean,
  TValue,
  TNullishType extends undefined | null = null,
  TMode extends 'required' | 'optional' = 'required'
> = TMode extends 'required'
  ? TCondition extends true
    ? TValue | TNullishType
    : TValue
  : TCondition extends true
    ? TValue | TNullishType
    : TNullishType;

type BuiltIn =
  // biome-ignore lint/suspicious/noExplicitAny: required for built-in types
  | (((...args: any[]) => any) | (new (...args: any[]) => any))
  | { readonly [Symbol.toStringTag]: string }
  | Date
  | Error
  | Generator
  | Promise<unknown>
  | RegExp;

/**
 * Converts a type to a readonly version
 * @param T - The type to convert
 * @returns A readonly version of the type
 */
export type MakeReadonly<T> = T extends Map<infer K, infer V>
  ? ReadonlyMap<K, V>
  : T extends Set<infer V>
    ? ReadonlySet<V>
    : T extends [infer Head, ...infer Tail]
      ? readonly [Head, ...Tail]
      : T extends Array<infer V>
        ? readonly V[]
        : T extends BuiltIn
          ? T
          : Readonly<T>;

/**
 * Helper to convert a union type to an intersection type
 * @param U - The union type to convert
 * @returns The converted intersection type
 * @example
 * type A = { a: string } | { b: number }
 * type B = UnionToIntersection<A> // { a: string } & { b: number }
 */
export type UnionToIntersection<U> =
  // biome-ignore lint/suspicious/noExplicitAny: required for proper type inference
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

/**
 * Removes specified keys from an object type
 * @param T - The type of the object
 * @param K - The keys to remove
 * @returns A new object type with the specified keys removed
 */
export type OmitKeys<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Decrements a number by one if it is greater than 0
 * @param T - The type of the number
 * @returns The decremented number
 * @example
 * type A = 3
 * type B = DecrementDepth<A> // 2
 */
export type DecrementDepth<T extends number> = T extends 0
  ? 0
  : T extends 1
    ? 0
    : T extends 2
      ? 1
      : T extends 3
        ? 2
        : T extends 4
          ? 3
          : T extends 5
            ? 4
            : T extends 6
              ? 5
              : T extends 7
                ? 6
                : T extends 8
                  ? 7
                  : T extends 9
                    ? 8
                    : 0;
