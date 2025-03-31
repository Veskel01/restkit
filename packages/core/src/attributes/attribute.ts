import type { Cloneable } from '../types/factory.type';
import type { MakeReadonly, NullishIf } from '../types/utility.type';

/**
 * Enumeration of all supported attribute types.
 * These types represent the structure and semantics of resource fields.
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
 * Flags that define the behavior and usage of an attribute in queries and schemas.
 */
export interface AttributeFlags {
  /** Whether the attribute can be selected in queries */
  selectable: boolean;
  /** Whether the attribute can be used in filters */
  filterable: boolean;
  /** Whether the attribute can be sorted */
  sortable: boolean;
  /** Whether the attribute is optional (i.e., may be undefined) */
  optional: boolean;
  /** Whether the attribute is nullable (i.e., may be null) */
  nullable: boolean;
  /** Whether the attribute is readonly */
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

/**
 * Additional metadata for an attribute, used for documentation and defaulting.
 */
export interface AttributeMetadata {
  /** Optional human-readable description of the attribute */
  description?: string;
}

/**
 * Utility type to override a single flag in a given set of flags.
 */
type SetFlag<
  Flags extends AttributeFlags,
  K extends keyof AttributeFlags,
  V extends boolean
> = Omit<Flags, K> & { [P in K]: V };

/**
 * A generic representation of any attribute.
 */
export type AnyAttribute = Attribute<
  AttributeType,
  unknown,
  object,
  AttributeFlags
>;

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
 * Represents a typed, configurable attribute used in resource definitions.
 *
 * An attribute encapsulates a type (e.g., string, number), constraints (e.g., optional, nullable),
 * and behavior in relation to API operations (e.g., filterable, sortable).
 *
 * @template TType - One of the values from `AttributeType`
 * @template TOutput - The resolved TypeScript type of the attribute
 * @template TDef - Internal configuration for the attribute
 * @template TFlags - Behavior flags such as `optional`, `nullable`, etc.
 */
export class Attribute<
  TType extends AttributeType = AttributeType,
  TOutput = unknown,
  TDef extends object = object,
  TFlags extends AttributeFlags = typeof DEFAULT_FLAGS
> implements Cloneable<Attribute<TType, TOutput, TDef, TFlags>>
{
  public readonly _type: TType;
  public readonly _output: TOutput;
  public readonly _def: TDef;
  public readonly _flags: TFlags;
  public readonly _meta: AttributeMetadata;

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
    flags = DEFAULT_FLAGS as TFlags,
    meta = {} as AttributeMetadata
  }: {
    def: TDef;
    type: TType;
    flags?: TFlags;
    meta?: AttributeMetadata;
  }) {
    this._type = type;
    this._def = def;
    this._flags = flags;
    this._output = {} as TOutput;
    this._meta = meta;
  }

  /**
   * Adds a description to the attribute, useful for documentation or code generation.
   */
  public describe(description: string): this {
    this._meta.description = description;
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
   * Filterable attributes can be used in filter queries.
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
   * Sortable attributes can be used in sort queries.
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
    SetFlag<TFlags, 'nullable', T>
  > {
    return new Attribute({
      def: this._def,
      type: this._type,
      flags: { ...this._flags, nullable: value }
    });
  }

  /**
   * Marks the attribute as readonly.
   * This restricts mutation and signals that the field is fixed or system-managed.
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
   * Typically used by subclasses like `stringAttr().min(3)` etc.
   */
  protected assignDefProp<K extends keyof TDef>(key: K, value: TDef[K]): this {
    this._def[key] = value;
    return this;
  }
}
