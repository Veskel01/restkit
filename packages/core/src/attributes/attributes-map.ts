import { boolean } from './primitives/boolean';
import { date } from './primitives/date';
import { enumerable } from './primitives/enum';
import { literal } from './primitives/literal';
import { number } from './primitives/number';
import { string } from './primitives/string';

import { array } from './composite/array';
import { object } from './composite/object';
import { oneOf } from './composite/one-of';
import { tuple } from './composite/tuple';
import { union } from './composite/union';

export const attr = {
  boolean,
  date,
  enum: enumerable,
  literal,
  number,
  string,
  array,
  object,
  oneOf,
  tuple,
  union
};
