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
}

type DefaultFlags = {
  selectable: true;
  filterable: true;
  sortable: true;
  optional: false;
  nullable: false;
};

// TODO
export interface AttributeMetadata<TOutput> {
  description?: string;
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

export type InferAttributeOutput<T extends AnyAttribute> = T['_flags'] extends {
  nullable: true;
  optional: true;
}
  ? T['_output'] | null | undefined
  : T['_flags'] extends { nullable: true }
    ? T['_output'] | null
    : T['_flags'] extends { optional: true }
      ? T['_output'] | undefined
      : T['_output'];

export class Attribute<
  TType extends AttributeType = AttributeType,
  TOutput = unknown,
  TDef extends object = object,
  TFlags extends AttributeFlags = DefaultFlags
> {
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
    flags = {
      filterable: true,
      selectable: true,
      sortable: true,
      nullable: false,
      optional: false
    } as TFlags
  }: {
    def: TDef;
    type: TType;
    flags?: TFlags;
  }) {
    this._type = type;
    this._def = def;
    this._flags = flags;
    this._output = {} as TOutput;
    this._meta = {};
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
   * Controls whether this attribute can be selected in query operations.
   * When set to false, prevents including this field in query results.
   */
  public selectable<const V extends boolean>(
    value: V
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'selectable', V>>;
  public selectable(): Attribute<
    TType,
    TOutput,
    TDef,
    SetFlag<TFlags, 'selectable', true>
  >;
  public selectable<const V extends boolean = true>(
    value?: V
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'selectable', V>> {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: {
        ...this._flags,
        selectable: value === undefined ? true : value
      }
    }) as Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'selectable', V>>;
  }

  /**
   * Controls whether this attribute can be used in filter expressions.
   * When set to false, prevents using this field in where clauses and filter operations.
   */
  public filterable<const V extends boolean>(
    value: V
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'filterable', V>>;
  public filterable(): Attribute<
    TType,
    TOutput,
    TDef,
    SetFlag<TFlags, 'filterable', true>
  >;
  public filterable<const V extends boolean = true>(
    value?: V
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'filterable', V>> {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: {
        ...this._flags,
        filterable: value === undefined ? true : value
      }
    }) as Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'filterable', V>>;
  }

  /**
   * Controls whether this attribute can be used in sorting operations.
   * When set to false, prevents ordering by this field in queries.
   */
  public sortable<const V extends boolean>(
    value: V
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'sortable', V>>;
  public sortable(): Attribute<
    TType,
    TOutput,
    TDef,
    SetFlag<TFlags, 'sortable', true>
  >;
  public sortable<const V extends boolean = true>(
    value?: V
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'sortable', V>> {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: {
        ...this._flags,
        sortable: value === undefined ? true : value
      }
    }) as Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'sortable', V>>;
  }

  /**
   * Marks the attribute as optional, allowing the field to be undefined.
   * Affects both type inference and validation during schema operations.
   */
  public optional<const V extends boolean>(
    value: V
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'optional', V>>;
  public optional(): Attribute<
    TType,
    TOutput,
    TDef,
    SetFlag<TFlags, 'optional', true>
  >;
  public optional<const V extends boolean = true>(
    value?: V
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'optional', V>> {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: {
        ...this._flags,
        optional: value === undefined ? true : value
      }
    }) as Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'optional', V>>;
  }

  /**
   * Marks the attribute as nullable, allowing null values.
   * Affects both type inference and validation during schema operations.
   */
  public nullable<const V extends boolean>(
    value: V
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'nullable', V>>;
  public nullable(): Attribute<
    TType,
    TOutput,
    TDef,
    SetFlag<TFlags, 'nullable', true>
  >;
  public nullable<const V extends boolean = true>(
    value?: V
  ): Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'nullable', V>> {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: {
        ...this._flags,
        nullable: value === undefined ? true : value
      }
    }) as Attribute<TType, TOutput, TDef, SetFlag<TFlags, 'nullable', V>>;
  }

  /**
   * Helper method to assign values to definition properties.
   * Used internally by specialized attribute classes to modify constraints.
   */
  protected assignToDef<K extends keyof TDef>(key: K, value: TDef[K]): this {
    this._def[key] = value;
    return this;
  }
}
