export interface Attribute {
  [name: string]: string
}

export interface CharacterPosition {
  line: number;
  column: number;
  pos: number;
  additionalMeta?: any;
}

export interface XmlTsNode {
  name: string;
  _?: string;
  $?: Attribute;
  $$?: Array<XmlTsNode>;
  pos: CharacterPosition;
  [name: string]: XmlTsNode | any;
}



