import type { RemoveNeverProperties } from '@restkit/core';
import type { FILTER_OPERATORS_MAP, FilterValueType } from '../constants';

/**
 * Extracts all possible filter operator tokens from the operators map
 */
export type FilterOperatorToken =
  (typeof FILTER_OPERATORS_MAP)[keyof typeof FILTER_OPERATORS_MAP]['token'];

/**
 * Maps TypeScript types to their corresponding FilterValueType enum values
 */
export type InferFilterValueType<T> = T extends string
  ? FilterValueType.String
  : T extends number
    ? FilterValueType.Number
    : T extends Date
      ? FilterValueType.Date
      : T extends boolean
        ? FilterValueType.Boolean
        : T extends unknown[]
          ? FilterValueType.Array
          : never;

/**
 * A map from operator name to its definition (token and supported value types)
 */
export type FilterOperatorDefinition = {
  [K in keyof typeof FILTER_OPERATORS_MAP]: {
    token: (typeof FILTER_OPERATORS_MAP)[K]['token'];
    valueTypes: readonly FilterValueType[];
  };
};

/**
 * Transforms the operator map to be keyed by token instead of operator name
 */
export type OperatorByToken = {
  [K in keyof typeof FILTER_OPERATORS_MAP as (typeof FILTER_OPERATORS_MAP)[K]['token']]: (typeof FILTER_OPERATORS_MAP)[K];
};

/**
 * Gets operators that support a given value type
 */
export type OperatorsForValueType<VT extends FilterValueType> = {
  [K in keyof typeof FILTER_OPERATORS_MAP as VT extends (typeof FILTER_OPERATORS_MAP)[K]['valueTypes'][number]
    ? (typeof FILTER_OPERATORS_MAP)[K]['token']
    : never]: (typeof FILTER_OPERATORS_MAP)[K];
};

/**
 * Determines the expected input type for a specific operator and data type
 */
export type OperatorInputType<
  T,
  TToken extends FilterOperatorToken
> = TToken extends 'btw' | 'nbtw' // Between operators take a tuple of [min, max]
  ? [T, T]
  : // In/NotIn operators take an array
    TToken extends 'in' | 'nin'
    ? T[]
    : // Check if the operator supports the value type
      InferFilterValueType<T> extends OperatorByToken[TToken]['valueTypes'][number]
      ? // Special handling for string-specific operators
        TToken extends
          | typeof FILTER_OPERATORS_MAP.contains.token
          | typeof FILTER_OPERATORS_MAP.containsIgnoreCase.token
          | typeof FILTER_OPERATORS_MAP.notContains.token
          | typeof FILTER_OPERATORS_MAP.notContainsIgnoreCase.token
          | typeof FILTER_OPERATORS_MAP.startsWith.token
          | typeof FILTER_OPERATORS_MAP.startsWithIgnoreCase.token
          | typeof FILTER_OPERATORS_MAP.endsWith.token
          | typeof FILTER_OPERATORS_MAP.endsWithIgnoreCase.token
          | typeof FILTER_OPERATORS_MAP.patternMatch.token
          | typeof FILTER_OPERATORS_MAP.notPatternMatch.token
        ? string
        : T
      : never;

/**
 * Creates a map of all possible filter operators for a type to their expected input types
 */
export type FilterOperatorTypeMap<T> = RemoveNeverProperties<{
  [Token in FilterOperatorToken]: OperatorInputType<T, Token>;
}>;

/**
 * Represents a filter operator with its token and value
 */
export interface FilterOperator<TToken extends FilterOperatorToken, TValue> {
  token: TToken;
  value: TValue;
}

/**
 * Filter operator function signature
 */
export type FilterOperatorFunction<TToken extends FilterOperatorToken, T> = (
  value: OperatorInputType<T, TToken>
) => FilterOperator<TToken, OperatorInputType<T, TToken>>;

/**
 * Picks specific filter operators from all possible operators for a type
 */
export type PickFilterOperators<T, TTokens extends FilterOperatorToken> = {
  [K in TTokens]: FilterOperatorFunction<K, T>;
};

/**
 * Gets all valid filter operators for a given type
 */
export type CompatibleFilterOperators<T> = {
  [K in FilterOperatorToken as K extends keyof FilterOperatorTypeMap<T>
    ? K
    : never]: FilterOperatorFunction<K, T>;
};
