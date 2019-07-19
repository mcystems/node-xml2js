import {XmlTsNode} from "./xmlTsNode";

export interface ElementNameProcessor {
  process(name: string): string;
}

export interface ElementValueProcessor {
  process(value: string, name: string): string;
}

export interface ElementValidator {
  validate(xpath: string, currentValue: XmlTsNode, newValue: XmlTsNode): any;
}

export interface RenderOpts {
  pretty: boolean;
  indent?: string;
  newline?: string;
}

export interface XmlDecl {
  version: string;
  encoding: string;
  standalone: boolean;
}

export interface BuilderOption {
  attrkey: string;
  cdata: boolean
  charkey: string;
  doctype: any | null;
  headless: boolean;
  renderOpts: RenderOpts;
  rootName: string;
  xmldec: XmlDecl;
}

export interface ParserOption {
  attrNameProcessors: ElementNameProcessor[];
  attrValueProcessors: ElementValueProcessor[];
  cdata: boolean;
  charsAsChildren: boolean;
  doctype: object | null;
  emptyTag: string | undefined;
  explicitArray: boolean;// always put child nodes in an array
  explicitCharkey: boolean;
  explicitChildren: boolean;// fold children elements into dedicated property
  explicitRoot: boolean;
  headless: boolean;
  ignoreAttrs: boolean;// ignore all attributes regardless
  includeWhiteChars: boolean;// include white-space only text nodes
  mergeAttrs: boolean;// merge attributes and child elements onto parent object.  this may cause collisions.
  normalize: boolean; // normalize implicates trimming; just so you know
  normalizeTags: boolean; // normalize tag names to lower case
  preserveChildrenOrder: boolean;
  renderOpts: RenderOpts;
  rootName: string;
  strict: boolean;
  tagNameProcessors: ElementNameProcessor[];
  trim: boolean;
  validator: ElementValidator | null;
  valueProcessors: ElementValueProcessor[];
  xmldec: XmlDecl;
  xmlns: boolean;
  additionalMeta?: any; //additional meta information
}

export const parserDefaults: ParserOption = {
  attrNameProcessors: [],
  attrValueProcessors: [],
  cdata: false,
  charsAsChildren: false,
  doctype: null,
  emptyTag: '',
  explicitArray: true,
  explicitCharkey: false,
  explicitChildren: false,
  explicitRoot: true,
  headless: false,
  ignoreAttrs: false,
  includeWhiteChars: false,// include white-space only text nodes
  mergeAttrs: false,
  normalize: false,
  normalizeTags: false,
  preserveChildrenOrder: false,
  renderOpts: {'pretty': true, 'indent': '  ', 'newline': '\n'},
  rootName: 'root',  // xml building options
  strict: true,
  tagNameProcessors: [],
  trim: false,
  validator: null,
  valueProcessors: [],
  xmldec: {'version': '1.0', 'encoding': 'UTF-8', 'standalone': true},
  xmlns: false,
};

export const builderDefaults: BuilderOption = {
  attrkey: "$",
  cdata: false,
  charkey: "_",
  doctype: null,
  headless: false,
  renderOpts: {'pretty': true, 'indent': ' ', 'newline': '\n'},
  rootName: "root",
  xmldec: {'version': '1.0', 'encoding': 'UTF-8', 'standalone': true}
};
