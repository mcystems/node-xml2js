export interface ElementNameProcessor {
  process(name: string): string;
}

export interface ElementValueProcessor {
  process(value: string, name: string): string;
}

export interface ElementValidator {
  validate(xpath: string, currentValue: string, newValue: string): string;
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
  charkey: string;
  rootName: string;
  renderOpts: RenderOpts;
  xmldec: XmlDecl;
  doctype: any | null;
  headless: boolean;
  /**
   * Deprecated option: https://github.com/oozcitak/xmlbuilder-js/commit/1f9b41a7ef5bd3f0f03d57439392d572f0adc189
   */
  allowSurrogateChars?: boolean;
  cdata: boolean
}

export interface ParserOption {
  explicitCharkey: boolean;
  trim: boolean;
  // normalize implicates trimming; just so you know
  normalize: boolean;
  // normalize tag names to lower case
  normalizeTags: boolean;
  // set default attribute object key
  attrkey: string;
  // set default char object key
  charkey: string;
  // always put child nodes in an array
  explicitArray: boolean;
  // ignore all attributes regardless
  ignoreAttrs: boolean;
  // merge attributes and child elements onto parent object.  this may
  // cause collisions.
  mergeAttrs: boolean;
  explicitRoot: boolean;
  validator: ElementValidator | null;
  xmlns: boolean;
  // fold children elements into dedicated property (works only in 0.2)
  explicitChildren: boolean;
  childkey: string;
  charsAsChildren: boolean;
  preserveChildrenOrder: boolean;
  // include white-space only text nodes
  includeWhiteChars: boolean;
  // callbacks are async? not in 0.1 mode
  async: boolean;
  strict: boolean;
  rootName: string;
  attrNameProcessors: ElementNameProcessor[];
  attrValueProcessors: ElementValueProcessor[];
  tagNameProcessors: ElementNameProcessor[];
  valueProcessors: ElementValueProcessor[];
  emptyTag: string;
  xmldec: XmlDecl;
  doctype: object | null;
  renderOpts: RenderOpts;
  headless: boolean;
  chunkSize: number;
  cdata: boolean;
}

export const parserDefaults: ParserOption = {
  explicitCharkey: false,
  trim: false,
  normalize: false,
  normalizeTags: false,
  attrkey: "$",
  charkey: "_",
  explicitArray: false,
  ignoreAttrs: false,
  mergeAttrs: false,
  explicitRoot: true,
  validator: null,
  xmlns: false,
  explicitChildren: false,
  preserveChildrenOrder: false,
  childkey: '$$',
  charsAsChildren: false,
  // include white-space only text nodes
  includeWhiteChars: false,
  // not async in 0.2 mode either
  async: false,
  strict: true,
  attrNameProcessors: [],
  attrValueProcessors: [],
  tagNameProcessors: [],
  valueProcessors: [],
  // xml building options
  rootName: 'root',
  xmldec: {'version': '1.0', 'encoding': 'UTF-8', 'standalone': true},
  doctype: null,
  renderOpts: {'pretty': true, 'indent': '  ', 'newline': '\n'},
  headless: false,
  chunkSize: 10000,
  emptyTag: '',
  cdata: false
};

export const builderDefaults: BuilderOption = {
  allowSurrogateChars: false,
  attrkey: "$",
  cdata: false,
  charkey: "_",
  doctype: null,
  headless: false,
  renderOpts: { 'pretty': true, 'indent': ' ', 'newline': '\n' },
  rootName: "root",
  xmldec: { 'version': '1.0', 'encoding': 'UTF-8', 'standalone': true }
};
