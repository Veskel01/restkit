import { FILTER_OPERATORS_MAP, FilterValueType } from '../constants';
import type {
  CompatibleFilterOperators,
  FilterOperatorFunction,
  FilterOperatorToken,
  FilterValueTypeToTsType,
  TsTypeToFilterValueType
} from '../types';

/**
 * Factory function to create type-safe operators for a specific value type
 * This automatically infers the TypeScript type from the FilterValueType enum
 */
export function createFilterOperators<T extends FilterValueType>(
  valueType: T
): CompatibleFilterOperators<FilterValueTypeToTsType<T>> {
  const result = new Map<
    FilterOperatorToken,
    FilterOperatorFunction<FilterOperatorToken, FilterValueTypeToTsType<T>>
  >();

  for (const [, def] of Object.entries(FILTER_OPERATORS_MAP)) {
    if (!def.valueTypes.includes(valueType as never)) {
      continue;
    }

    const fn: FilterOperatorFunction<
      FilterOperatorToken,
      FilterValueTypeToTsType<T>
    > = (value) => ({
      token: def.token,
      value
    });

    result.set(def.token, fn);
  }

  return Object.fromEntries(result) as unknown as CompatibleFilterOperators<
    FilterValueTypeToTsType<T>
  >;
}

export function getFilterOperatorsForType<
  TValueType extends FilterValueTypeToTsType<T>,
  T extends FilterValueType = TsTypeToFilterValueType<TValueType>
>(
  valueType: TsTypeToFilterValueType<TValueType>
): CompatibleFilterOperators<TValueType> {
  const operatorsMap = {
    [FilterValueType.String]: createFilterOperators(FilterValueType.String),
    [FilterValueType.Number]: createFilterOperators(FilterValueType.Number),
    [FilterValueType.Date]: createFilterOperators(FilterValueType.Date),
    [FilterValueType.Boolean]: createFilterOperators(FilterValueType.Boolean),
    [FilterValueType.Array]: createFilterOperators(FilterValueType.Array)
  } as Record<
    FilterValueType,
    CompatibleFilterOperators<FilterValueTypeToTsType<T>>
  >;

  return operatorsMap[
    valueType
  ] as unknown as CompatibleFilterOperators<TValueType>;
}
