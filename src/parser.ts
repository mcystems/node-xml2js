import * as sax from 'sax';
import {QualifiedTag, SAXParser, Tag} from 'sax';
import {stripBOM} from './bom';
import {NormalizeProcessor} from './processors';
import {ElementNameProcessor, ElementValueProcessor, parserDefaults, ParserOption} from './defaults';
import {CharacterPosition, XmlTsNode} from "./xmlTsNode";
import {oc} from "ts-optchain";

// Underscore has a nice function for this, but we try to go without dependencies
const isEmpty = thing => (typeof thing === "object") && (thing != null) && (Object.keys(thing).length === 0);

const processValue = function (processors: ElementValueProcessor[], item, key?) {
  for (let processor of processors) {
    item = processor.process(item, key);
  }
  return item;
};

const processName = function (processors: ElementNameProcessor[], item) {
  for (let processor of processors) {
    item = processor.process(item);
  }
  return item;
};


export class Parser {
  readonly options: ParserOption;
  readonly xmlnsKey: string;
  private saxParser: SAXParser;
  private resultObject: XmlTsNode | null;
  private stack: Array<XmlTsNode>;
  private resolve: (value?: (PromiseLike<XmlTsNode | null> | XmlTsNode | null)) => void;
  private reject: (reason?: any) => void;
  readonly tagnameProcessors: Array<ElementNameProcessor> = [];

  constructor(opts: ParserOption) {
    this.assignOrPush = this.assignOrPush.bind(this);
    this.reset = this.reset.bind(this);
    this.parseString = this.parseString.bind(this);
    this.onText = this.onText.bind(this);
    this.onOpenTag = this.onOpenTag.bind(this);
    this.onCloseTag = this.onCloseTag.bind(this);
    this.onText = this.onText.bind(this);

    this.options = opts;
    // overwrite them with the specified options, if any
    for (let key of Object.keys(opts || {})) {
      // @ts-ignore
      this.options[key] = opts[key];
    }
    // define the key used for namespaces
    if (this.options.xmlns) {
      this.xmlnsKey = "$ns";
    }
    if (this.options.normalizeTags) {
      this.tagnameProcessors.unshift(new NormalizeProcessor());
      // this.options.tagNameProcessors.unshift(new NormalizeProcessor());
    }
  }

  private getBasicXmlTsNode(name: string, text?: string): XmlTsNode {
    const node: XmlTsNode = {
      name: name,
      cdata: false,
      pos: this.getActualPosition()
    };
    if (text !== undefined && text !== null) {
      node._ = text;
    }
    return node;
  }

  /**
   * Makes an attribute to a subnode
   * @param obj Node of attribute
   * @param key attribute key
   * @param newValue attribute value
   */
  private assignOrPush(obj: XmlTsNode, key, newValue) {
    if (key in obj) {
      if (!(obj[key] instanceof Array)) {
        obj[key] = [obj[key]];
      }
      return obj[key].push(newValue);
    } else {
      if (this.options.explicitArray) {
        return obj[key] = [newValue];
      } else {
        return obj[key] = newValue;
      }
    }
  }

  getActualPosition(): CharacterPosition {
    return {
      line: this.saxParser.line,
      column: this.saxParser.column,
      pos: this.saxParser.position
    }
  }

  private onOpenTag(node: Tag | QualifiedTag): number {
    let obj: XmlTsNode = this.getBasicXmlTsNode('');
    if (!this.options.ignoreAttrs) {
      for (let key of Object.keys(node.attributes || {})) {
        const newValue = this.options.attrValueProcessors
          ? processValue(this.options.attrValueProcessors, node.attributes[key], key) : node.attributes[key];
        const processedKey = this.options.attrNameProcessors
          ? processName(this.options.attrNameProcessors, key) : key;
        if (this.options.mergeAttrs) {
          this.assignOrPush(obj, processedKey, newValue);
        } else {
          obj.$ = {...oc(obj).$({}), [processedKey]: newValue};
        }
      }
    }

    // need a place to store the node name
    obj.name = this.tagnameProcessors
      ? processName(this.tagnameProcessors, node.name) : node.name;
    if (this.options.xmlns && (<QualifiedTag>node).uri) {
      obj[this.xmlnsKey] = {uri: (<QualifiedTag>node).uri, local: (<QualifiedTag>node).local};
    }
    return this.stack.push(obj);
  }

  private onCloseTag(): void {
    let cdata, emptyStr;
    let current: XmlTsNode | undefined = this.stack.pop();
    if (!current) {
      throw new Error('close tab before open');
    }
    const nodeName = current.name;

    const parent: XmlTsNode | undefined = this.stack[this.stack.length - 1];

    if (current._) {
      if (current._.match(/^\s*$/) && !cdata) {
        current._ = this.options.emptyTag != '' ? this.options.emptyTag : current._;
        // if() {
        //   then @options.emptyTag else emptyStr
        // }
        // delete current._;
      } else {
        if (this.options.trim && current._) {
          current._ = current._.trim();
        }
        if (this.options.normalize) {
          current._ = current._.replace(/\s{2,}/g, " ").trim();
        }
        current._ = this.options.valueProcessors ? processValue(this.options.valueProcessors, current._,
          nodeName) : current._;
      }
    }

    if (this.options.validator != null) {
      const xpath = `/${this.stack.map(n => n.name).concat(nodeName).join('/')}`;
      if (this.options.validator && current) {
        current = this.options.validator.validate(xpath, parent && (<XmlTsNode>parent[nodeName]), current);
      }
    }

    // put children into <childkey> property and unfold chars if necessary
    if (parent) {
      parent.$$ = parent.$$ || [];
      const clone: XmlTsNode = JSON.parse(JSON.stringify(current));
      parent.$$.push(clone);
    } else {
      // if explicitRoot was specified, wrap stuff in the root tag name
      if (this.options.explicitRoot && current) {
        // avoid circular references
        const old: XmlTsNode = current;
        current = {[nodeName]: old, name: '__logical_root__', cdata: false, pos: {line: 0, column: 0, pos: 0}};
      }
    }

    // check whether we closed all the open tags
    if (this.stack.length > 0) {
      this.assignOrPush(parent, nodeName, current);
    } else {
      if (current) {
        this.resultObject = current;
      }
    }
  }

  private onText(text: string): XmlTsNode | null {
    const s = this.stack[this.stack.length - 1];
    if (s) {
      s._ = s._ ? s._ + text : text;
      if (this.options.explicitChildren && this.options.preserveChildrenOrder && this.options.charsAsChildren
        && (this.options.includeWhiteChars || (text.replace(/\\n/g, '').trim() !== ''))) {
        s.$$ = s.$$ || [];
        const charChild: XmlTsNode = this.getBasicXmlTsNode('__text__',
          this.options.normalize ? text.replace(/\s{2,}/g, " ").trim() : text);
        s.$$.push(charChild);
      }
    }
    return s;
  }

  /**
   * Reset and setup sax parser
   */
  private reset() {
    // make the SAX parser. tried trim and normalize, but they are not very helpful
    this.saxParser = sax.parser(this.options.strict, {
      trim: false,
      normalize: false,
      xmlns: this.options.xmlns,
      position: true
    });

    this.saxParser.onerror = (error: Error) => {
      this.reject(error);
    };

    this.resultObject = null;
    this.saxParser.onopentag = this.onOpenTag;
    this.saxParser.onclosetag = this.onCloseTag;
    this.saxParser.onend = () => {
      this.resolve(this.resultObject);
    };

    this.saxParser.ontext = this.onText;
    return this.saxParser.oncdata = text => {
      const s = this.onText(text);
      if (s) {
        return s.cdata = true;
      }
    };
  }

  async parseString(str: string): Promise<XmlTsNode | null> {
    return new Promise<XmlTsNode | null>(
      (resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
        try {
          this.reset();
          this.stack = [];

          str = str.toString();
          if (str.trim() === '') {
            resolve(null);
          }

          str = stripBOM(str);
          this.saxParser.write(str).close();
        } catch (error) {
          reject(error);
        }
      }
    );
  }
}

export const parseString = async function (str: string, opts?: ParserOption) {
  const parser = new Parser(opts ? {...parserDefaults, ...opts} : parserDefaults);
  return await parser.parseString(str);
};
