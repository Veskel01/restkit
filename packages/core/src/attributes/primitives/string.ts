import { Attribute, AttributeType } from '../root';

export class StringAttribute extends Attribute<AttributeType.STRING, string> {
  public constructor() {
    super({ def: {}, type: AttributeType.STRING });
  }
}

export function string(): StringAttribute {
  return new StringAttribute();
}
