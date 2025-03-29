import type { Cloneable } from '../types/factory.type';
import type { MakeReadonly, NullishIf } from '../types/utility.type';

/**
 * Enumeration of all supported attribute types
 */
export enum AttributeType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'date',
  Object = 'object',
  Array = 'array',
  Enum = 'enum',
  Tuple = 'tuple'
}

/**
 * Base interface for attribute behavior flags
 */
export interface AttributeFlags {
  selectable: boolean;
  filterable: boolean;
  sortable: boolean;
  optional: boolean;
  nullable: boolean;
  readonly: boolean;
}

const DEFAULT_FLAGS = {
  selectable: true,
  filterable: true,
  sortable: true,
  optional: false,
  nullable: false,
  readonly: false
} as const;

// TODO
export interface AttributeMetadata<TOutput> {
  description?: string;
  defaultValue?: TOutput;
}

/**
 * Utility type to set a flag in AttributeFlags
 */
type SetFlag<
  Flags extends AttributeFlags,
  K extends keyof AttributeFlags,
  V extends boolean
> = Omit<Flags, K> & { [P in K]: V };

export type AnyAttribute = Attribute<
  AttributeType,
  unknown,
  object,
  AttributeFlags
>;

/**
 * Extracts the output type from an attribute
 */
export type InferAttributeOutput<T extends AnyAttribute> = T['_output'];

/**
 * Extracts the flags configuration from an attribute
 */
export type InferAttributeFlags<T extends AnyAttribute> = T['_flags'];

export class Attribute<
  TType extends AttributeType = AttributeType,
  TOutput = unknown,
  TDef extends object = object,
  TFlags extends AttributeFlags = typeof DEFAULT_FLAGS
> implements Cloneable<Attribute<TType, TOutput, TDef, TFlags>>
{
  /**
   * Defines the attribute type.
   * @internal
   */
  public readonly _type: TType;

  /**
   * Used for type inference to determine output type.
   * @internal
   */
  public readonly _output: TOutput;

  /**
   * Contains type-specific definitions and constraints.
   * @internal
   */
  public readonly _def: TDef;

  /**
   * Controls behavior in data operations (querying, filtering, etc).
   * @internal
   */
  public readonly _flags: TFlags;

  /**
   * Contains descriptive and contextual information.
   * @internal
   */
  public readonly _meta: AttributeMetadata<TOutput>;

  public constructor({
    def,
    type,
    flags = DEFAULT_FLAGS as TFlags,
    meta = {} as AttributeMetadata<TOutput>
  }: {
    def: TDef;
    type: TType;
    flags?: TFlags;
    meta?: AttributeMetadata<TOutput>;
  }) {
    this._type = type;
    this._def = def;
    this._flags = flags;
    this._output = {} as TOutput;
    this._meta = meta;
  }

  /**
   * Adds human-readable description to the attribute.
   * Useful for documentation generation and self-documenting schemas.
   */
  public describe(description: string): this {
    this._meta.description = description;
    return this;
  }

  /**
   * Sets the default value for the attribute.
   * This value will be used if no value is provided during attribute creation.
   */
  public defaultValue(value: TOutput): this {
    this._meta.defaultValue = value;
    return this;
  }

  /**
   * Controls whether this attribute can be selected in query operations.
   * When set to false, prevents including this field in query results.
   */
  public selectable<const T extends boolean = true>(
    value: T = true as T
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'selectable', T>> {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: { ...this._flags, selectable: value }
    });
  }

  /**
   * Controls whether this attribute can be used in filter expressions.
   * When set to false, prevents using this field in where clauses and filter operations.
   */
  public filterable<const T extends boolean = true>(
    value: T = true as T
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'filterable', T>> {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: { ...this._flags, filterable: value }
    });
  }

  /**
   * Controls whether this attribute can be used in sorting operations.
   * When set to false, prevents ordering by this field in queries.
   */

  public sortable<const T extends boolean = true>(
    value: T = true as T
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'sortable', T>> {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: { ...this._flags, sortable: value }
    });
  }

  /**
   * Marks the attribute as optional, allowing the field to be undefined.
   * Affects both type inference and validation during schema operations.
   */
  public optional<const T extends boolean = true>(
    value: T = true as T
  ): Attribute<
    TType,
    NullishIf<T, TOutput, undefined>,
    TDef,
    SetFlag<TFlags, 'optional', T>
  > {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: { ...this._flags, optional: value }
    });
  }

  /**
   * Marks the attribute as nullable, allowing null values.
   * Affects both type inference and validation during schema operations.
   */
  public nullable<const T extends boolean = true>(
    value: T = true as T
  ): Attribute<
    TType,
    NullishIf<T, TOutput>,
    TDef,
    SetFlag<TFlags, 'nullable', T>
  > {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: { ...this._flags, nullable: value }
    });
  }

  /**
   * Marks the attribute as nullable, allowing null or undefined values.
   * This is a shortcut for calling `nullable(true)` and `optional(true)`.
   */
  public nullish<const T extends boolean = true>(
    value: T = true as T
  ): Attribute<
    TType,
    TOutput | null | undefined,
    TDef,
    SetFlag<TFlags, 'nullable', T>
  > {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: { ...this._flags, nullable: value }
    });
  }

  /**
   * Marks the attribute as readonly, preventing modifications.
   */
  public readonly<const T extends boolean = true>(
    value: T = true as T
  ): Attribute<
    TType,
    MakeReadonly<TOutput>,
    TDef,
    SetFlag<TFlags, 'readonly', T>
  > {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: { ...this._flags, readonly: value }
    });
  }

  /**
   * Clones the current attribute, creating a new independent instance
   * with the same configuration. Useful for creating variations of an attribute.
   * @returns A new attribute instance with identical configuration
   */
  public clone(): Attribute<TType, TOutput, TDef, TFlags> {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: this._flags
    });
  }

  /**
   * Helper method to assign values to definition properties.
   * Used internally by specialized attribute classes to modify constraints.
   */
  protected assignDefProp<K extends keyof TDef>(key: K, value: TDef[K]): this {
    this._def[key] = value;
    return this;
  }
}
