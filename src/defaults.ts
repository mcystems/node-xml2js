export interface ElementNameProcessor {
  process(name: string): string;
}

export interface ElementValueProcessor {
  process(value: string, name: string): string;
}

export interface ElementValidator {
  validate(xpath: string, currentValue: string, newValue: string): any;
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
  async: boolean;// callbacks are async?
  attrkey: string; // set default attribute object key
  attrNameProcessors: ElementNameProcessor[];
  attrValueProcessors: ElementValueProcessor[];
  cdata: boolean;
  charkey: string; // set default char object key
  charsAsChildren: boolean;
  childkey: string;
  chunkSize: number;
  doctype: object | null;
  emptyTag: string;
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
}

export const parserDefaults: ParserOption = {
  async: false,  // not async in 0.2 mode either
  attrkey: "$",
  attrNameProcessors: [],
  attrValueProcessors: [],
  cdata: false,
  charkey: "_",
  charsAsChildren: false,
  childkey: '$$',
  chunkSize: 10000,
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
