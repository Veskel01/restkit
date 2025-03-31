export enum QueryElementType {
  SELECT = 'select',
  FILTER = 'filter',
  SORT = 'sort',
  PAGINATION = 'pagination'
}

export enum FilterValueType {
  String = 'string',
  Number = 'number',
  Date = 'date',
  Boolean = 'boolean',
  Array = 'array'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export const FILTER_OPERATORS_MAP = {
  equal: {
    token: 'eq',
    valueTypes: [
      FilterValueType.String,
      FilterValueType.Number,
      FilterValueType.Date,
      FilterValueType.Boolean,
      FilterValueType.Array
    ]
  },
  notEqual: {
    token: 'ne',
    valueTypes: [
      FilterValueType.String,
      FilterValueType.Number,
      FilterValueType.Date,
      FilterValueType.Boolean,
      FilterValueType.Array
    ]
  },
  greaterThan: {
    token: 'gt',
    valueTypes: [FilterValueType.Number, FilterValueType.Date]
  },
  greaterThanOrEqual: {
    token: 'gte',
    valueTypes: [FilterValueType.Number, FilterValueType.Date]
  },
  lessThan: {
    token: 'lt',
    valueTypes: [FilterValueType.Number, FilterValueType.Date]
  },
  lessThanOrEqual: {
    token: 'lte',
    valueTypes: [FilterValueType.Number, FilterValueType.Date]
  },
  contains: { token: 'cont', valueTypes: [FilterValueType.String] },
  containsIgnoreCase: { token: 'icont', valueTypes: [FilterValueType.String] },
  notContains: { token: 'ncont', valueTypes: [FilterValueType.String] },
  notContainsIgnoreCase: {
    token: 'nicont',
    valueTypes: [FilterValueType.String]
  },
  startsWith: { token: 'sw', valueTypes: [FilterValueType.String] },
  startsWithIgnoreCase: { token: 'isw', valueTypes: [FilterValueType.String] },
  endsWith: { token: 'ew', valueTypes: [FilterValueType.String] },
  endsWithIgnoreCase: { token: 'iew', valueTypes: [FilterValueType.String] },
  in: { token: 'in', valueTypes: [FilterValueType.Array] },
  notIn: { token: 'nin', valueTypes: [FilterValueType.Array] },
  between: {
    token: 'btw',
    valueTypes: [FilterValueType.Number, FilterValueType.Date]
  },
  notBetween: {
    token: 'nbtw',
    valueTypes: [FilterValueType.Number, FilterValueType.Date]
  },
  patternMatch: { token: 'rgx', valueTypes: [FilterValueType.String] },
  notPatternMatch: { token: 'nrgx', valueTypes: [FilterValueType.String] }
} as const;

export const LOGICAL_FILTER_OPERATORS = {
  and: 'and',
  or: 'or'
} as const;
