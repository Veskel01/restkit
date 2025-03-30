import { FILTER_OPERATORS_MAP, type FilterValueType } from '../constants';
import type {
  CompatibleFilterOperators,
  FilterOperatorFunction,
  FilterOperatorToken,
  InferFilterValueType
} from '../types';

export function getCompatibleFilterOperators<T extends FilterValueType>(
  valueType: T
): CompatibleFilterOperators<InferFilterValueType<T>> {
  const validTokens = Object.values(FILTER_OPERATORS_MAP).filter((op) =>
    op.valueTypes.includes(valueType as never)
  );

  const operators: Record<
    FilterOperatorToken,
    FilterOperatorFunction<FilterOperatorToken, InferFilterValueType<T>>
  > = {} as Record<
    FilterOperatorToken,
    FilterOperatorFunction<FilterOperatorToken, InferFilterValueType<T>>
  >;

  for (const token of validTokens.map((op) => op.token)) {
    operators[token] = (value) => ({
      token,
      value
    });
  }

  return operators as unknown as CompatibleFilterOperators<
    InferFilterValueType<T>
  >;
}
