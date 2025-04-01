/**
 * Represents an object that can be cloned.
 *
 * @template T - The type of the object to clone
 */
export interface Cloneable<T> {
  clone(): T;
}
