import { array } from './array';
import { boolean } from './boolean';
import { date } from './date';
import { enumerable } from './enum';
import { number } from './number';
import { object } from './object';
import { string } from './string';
import { tuple } from './tuple';

/**
 * A collection of attribute constructors for building typed resource schemas.
 *
 * Each function in this object creates a specific type of `Attribute`,
 * which can be further configured using a fluent API (e.g. `.nullable()`, `.optional()`, `.describe()`, etc.).
 *
 * Commonly used when defining resources via the `resource()` helper.
 *
 * @example
 * ```ts
 * const user = resource('user', {
 *   id: attr.number().optional(),
 *   name: attr.string().nullable(),
 *   isActive: attr.boolean().defaultValue(true),
 *   roles: attr.enum(['admin', 'user', 'guest']),
 *   tags: attr.array(attr.string()),
 *   metadata: attr.object({ ... }),
 *   birthdate: attr.date(),
 *   preferences: attr.tuple([attr.string(), attr.number()])
 * });
 * ```
 */
export const attr = {
  boolean,
  number,
  string,
  date,
  enum: enumerable,
  array,
  object,
  tuple
};
