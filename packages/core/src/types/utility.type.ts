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
            : 0;

/**
 * Removes properties with never values from an object
 * @param T - The type of the object
 * @returns A new object type with never values removed
 */
export type RemoveNeverProperties<T extends object> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

/**
 * Removes properties with null or undefined values from an object
 * @param T - The type of the object
 * @returns A new object type with null/undefined values removed
 */
export type RemoveNilProperties<T extends object> = {
  [K in keyof T as T[K] extends null | undefined ? never : K]: T[K];
};

/**
 * Checks if an object is empty
 * @param T - The type of the object
 * @returns true if the object is empty, false otherwise
 */
export type IsEmptyObject<T> = T extends Record<string, never> ? true : false;

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
