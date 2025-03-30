import { FilterValueType } from '../constants';
import type { CompatibleFilterOperators } from '../types';
import { getCompatibleFilterOperators } from './utils';

export function getStringFilterOperators(): CompatibleFilterOperators<string> {
  return getCompatibleFilterOperators(
    FilterValueType.String
  ) as CompatibleFilterOperators<string>;
}

// TODO
