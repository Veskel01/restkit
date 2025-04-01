import type { Cloneable, MakeReadonly, NullishIf, SetFlag } from '../types';

/**
 * Enumeration of all supported attribute types.
 * These types represent the structure and semantics of resource fields.
 */
export enum AttributeType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  OBJECT = 'object',
  ARRAY = 'array',
  ENUM = 'enum',
  TUPLE = 'tuple',
  UNION = 'union',
  ONE_OF = 'oneOf'
}

export type AttributeFlags = {
  /** Whether the attribute can be selected in queries */
  selectable: boolean;
  /** Whether the attribute can be used in filters */
  filterable: boolean;
  /** Whether the attribute can be sorted */
  sortable: boolean;
  /** Whether the attribute can be null */
  nullable: boolean;
  /** Whether the attribute can be undefined */
  optional: boolean;
  /** Whether the attribute is readonly */
  readonly: boolean;
};

// TODO
export interface AttributeMetadata<TOutput> {
  /** Optional human-readable description of the attribute */
  description?: string;
}

/**
 * Infers the output type from an attribute definition.
 */
export type InferAttributeOutput<T extends AnyAttribute> = T['_output'];

/**
 * Infers the flag configuration from an attribute definition.
 */
export type InferAttributeFlags<T extends AnyAttribute> = T['_flags'];

/**
 * Represents a map of attribute definitions.
 */
export type AttributeMap = Record<string, AnyAttribute>;

/**
 * A generic representation of any attribute.
 */
export type AnyAttribute = Attribute<
  AttributeType,
  unknown,
  object,
  AttributeFlags
>;

export const DEFAULT_ATTRIBUTE_FLAGS = {
  selectable: true,
  filterable: true,
  sortable: true,
  nullable: false,
  optional: false,
  readonly: false
} as const;

export class Attribute<
  TType extends AttributeType,
  TOutput,
  TDef extends object = object,
  TFlags extends AttributeFlags = typeof DEFAULT_ATTRIBUTE_FLAGS
> implements Cloneable<Attribute<TType, TOutput, TDef, TFlags>>
{
  /** The type of the attribute */
  public readonly _type: TType;
  /** The output type of the attribute - used for type inference */
  public readonly _output: TOutput;
  /** The internal definition object (type-specific config) */
  public readonly _def: TDef;
  /** The behavior flags controlling optionality, filterability, etc. */
  public readonly _flags: TFlags;
  /** Descriptive metadata */
  public readonly metadata: AttributeMetadata<TOutput>;

  /**
   * Constructs a new attribute.
   *
   * @param def - Internal definition object (type-specific config)
   * @param type - The attribute's data type
   * @param flags - Behavior flags controlling optionality, filterability, etc.
   * @param meta - Descriptive metadata
   */
  public constructor({
    def,
    type,
    flags = DEFAULT_ATTRIBUTE_FLAGS as TFlags,
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
    this.metadata = meta;
  }

  /**
   * Adds a description to the attribute, useful for documentation or code generation.
   */
  public describe(description: string): this {
    this.metadata.description = description;
    return this;
  }

  /**
   * Marks the attribute as selectable or not.
   * Selectable attributes can be returned in query results.
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
   * Marks the attribute as filterable or not.
   * Filterable attributes can be used in filter expressions.
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
   * Marks the attribute as sortable or not.
   * Sortable attributes can be used in sort expressions.
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
   * Marks the attribute as optional.
   * This allows the value to be `undefined`.
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
   * Marks the attribute as nullable.
   * This allows the value to be `null`.
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
   * Marks the attribute as nullish (nullable and optional).
   * Shortcut for `.nullable(true).optional(true)`.
   */
  public nullish<const T extends boolean = true>(
    value: T = true as T
  ): Attribute<
    TType,
    TOutput | null | undefined,
    TDef,
    SetFlag<TFlags, 'nullable', T> & SetFlag<TFlags, 'optional', T>
  > {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: { ...this._flags, nullable: value, optional: value }
    });
  }

  /**
   * Marks the attribute as readonly. Value cannot be modified.
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
   * Creates a deep clone of this attribute.
   * Useful for reusing base definitions with minor modifications.
   *
   * @returns A new attribute with the same definition, type, and flags
   */
  public clone(): Attribute<TType, TOutput, TDef, TFlags> {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: this._flags
    });
  }

  /**
   * Internal helper for setting a key on the definition object.
   * @internal
   */
  protected assignDefProp<K extends keyof TDef>(key: K, value: TDef[K]): this {
    this._def[key] = value;
    return this;
  }
}
