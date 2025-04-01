import {
  type AnyAttribute,
  Attribute,
  AttributeType,
  type InferAttributeOutput
} from '../root';
import type { ObjectAttribute } from './object';

export type OneOfCase<TDiscriminator extends string> = ObjectAttribute<{
  [K in TDiscriminator]: AnyAttribute;
}>;

export interface OneOfAttributeDef<
  TDiscriminator extends string,
  TCases extends readonly OneOfCase<TDiscriminator>[]
> {
  discriminator: TDiscriminator;
  cases: TCases;
}

export class OneOfAttribute<
  TDiscriminator extends string,
  TCases extends readonly OneOfCase<TDiscriminator>[]
> extends Attribute<
  AttributeType.ONE_OF,
  InferAttributeOutput<TCases[number]>,
  OneOfAttributeDef<TDiscriminator, TCases>
> {
  public constructor(cases: TCases, discriminator: TDiscriminator) {
    super({ def: { cases, discriminator }, type: AttributeType.ONE_OF });
  }

  public get discriminator(): TDiscriminator {
    return this._def.discriminator;
  }
}

export function oneOf<
  TDiscriminator extends string,
  TCases extends readonly OneOfCase<TDiscriminator>[]
>(
  discriminator: TDiscriminator,
  cases: TCases
): OneOfAttribute<TDiscriminator, TCases> {
  return new OneOfAttribute(cases, discriminator);
}
