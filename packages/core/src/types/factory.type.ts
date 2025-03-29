/**
 * Interface for objects that can create copies of themselves.
 *
 * @template T - The type that will be returned by clone, typically the implementing class
 *
 * @example
 * ```typescript
 * class Person implements Cloneable<Person> {
 *   constructor(public name: string, public age: number) {}
 *
 *   clone(): Person {
 *     return new Person(this.name, this.age);
 *   }
 * }
 * ```
 */
export interface Cloneable<T> {
  /**
   * Creates a copy of the current object.
   *
   * @returns A new instance of type T with the same state
   */
  clone(): T;
}
