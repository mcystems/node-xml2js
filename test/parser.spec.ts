import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as os from 'os';
import {Parser, parseString} from "../src/parser";
import {expect} from 'chai';
import {ElementNameProcessor, ElementValidator, parserDefaults, ParserOption} from "../src/defaults";
import {oc} from "ts-optchain";
import {XmlTsNode} from "../src/xmlTsNode";

const fileName = path.join(__dirname, '/fixtures/sample.xml');

async function readFile(path: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    });
  });
}

type SkeletonType = ParserOption & { __xmlString?: string };

async function skeleton(options: SkeletonType): Promise<XmlTsNode | null> {

  const xmlString = options != null ? options.__xmlString : undefined;
  if (options != null) {
    delete options.__xmlString;
  }
  const x2js = new Parser(options);

  if (!xmlString) {
    let data = await readFile(fileName);
    data = data.split(os.EOL).join('\n');
    return await x2js.parseString(data);
  } else {
    return await x2js.parseString(xmlString);
  }
}

const nameToUpperCase: ElementNameProcessor = {
  process(name: string): string {
    return name.toUpperCase();
  }
};

const nameCutoff: ElementNameProcessor = {
  process(name: string): string {
    return name.substr(0, 4);
  }
};

/*
 The `validator` function validates the value at the XPath. It also transforms the value
 if necessary to conform to the schema or other validation information being used. If there
 is an existing value at this path it is supplied in `currentValue` (e.g. this is the second or
 later item in an array).
 If the validation fails it should throw an Error.
 */
const validator: ElementValidator = {
  validate(xpath: string, currentValue: string, newValue: string): any {
    if (xpath === '/sample/validatortest/numbertest') {
      return Number(newValue);
    } else if (['/sample/arraytest', '/sample/validatortest/emptyarray', '/sample/validatortest/oneitemarray'].includes(
      xpath)) {
      if (!newValue || newValue.indexOf('item') < 0) {
        return {'item': []};
      }
    } else if (['/sample/arraytest/item', '/sample/validatortest/emptyarray/item',
      '/sample/validatortest/oneitemarray/item'].includes(xpath)) {
      if (!currentValue) {
        return newValue;
      }
    } else if (xpath === '/validationerror') {
      throw new Error("Validation error!");
    }
    return newValue;
  }
};

// shortcut, because it is quite verbose

describe('parser tests', () => {
  it('test parse with defaults', async () => {
    const r = await skeleton(parserDefaults);
    expect(oc(r).sample.chartest[0].$.desc()).to.equals('Test for CHARs');
    expect(oc(r).sample.chartest[0]._()).to.equals('Character data here!');
    expect(oc(r).sample.cdatatest[0].$.desc()).to.equals('Test for CDATA');
    expect(oc(r).sample.cdatatest[0].$.misc()).to.equals('true');
    expect(oc(r).sample.cdatatest[0]._()).to.equals('CDATA here!');
    expect(oc(r).sample.nochartest[0].$.desc()).to.equals('No data');
    expect(oc(r).sample.nochartest[0].$.misc()).to.equals('false');
    expect(oc(r).sample.listtest[0].item[0]._())
      .to
      .equals(
        '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
    expect(oc(r).sample.listtest[0].item[0].subitem[0]._()).to.equals('Foo(1)');
    expect(oc(r).sample.listtest[0].item[0].subitem[1]._()).to.equals('Foo(2)');
    expect(oc(r).sample.listtest[0].item[0].subitem[2]._()).to.equals('Foo(3)');
    expect(oc(r).sample.listtest[0].item[0].subitem[3]._()).to.equals('Foo(4)');
    expect(oc(r).sample.listtest[0].item[1]._()).to.equals('Qux.');
    expect(oc(r).sample.listtest[0].item[2]._()).to.equals('Quux.');
  });

  it('test parse with explicitCharkey', async () => {
    const r = await skeleton({...parserDefaults, explicitCharkey: true});
    expect(oc(r).sample.chartest[0].$.desc()).to.equals('Test for CHARs');
    expect(oc(r).sample.chartest[0]._()).to.equals('Character data here!');
    expect(oc(r).sample.cdatatest[0].$.desc()).to.equals('Test for CDATA');
    expect(oc(r).sample.cdatatest[0].$.misc()).to.equals('true');
    expect(oc(r).sample.cdatatest[0]._()).to.equals('CDATA here!');
    expect(oc(r).sample.nochartest[0].$.desc()).to.equals('No data');
    expect(oc(r).sample.nochartest[0].$.misc()).to.equals('false');
    expect(oc(r).sample.listtest[0].item[0]._())
      .to
      .equals(
        '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
    expect(oc(r).sample.listtest[0].item[0].subitem[0]._()).to.equals('Foo(1)');
    expect(oc(r).sample.listtest[0].item[0].subitem[1]._()).to.equals('Foo(2)');
    expect(oc(r).sample.listtest[0].item[0].subitem[2]._()).to.equals('Foo(3)');
    expect(oc(r).sample.listtest[0].item[0].subitem[3]._()).to.equals('Foo(4)');
    expect(oc(r).sample.listtest[0].item[1]._()).to.equals('Qux.');
    expect(oc(r).sample.listtest[0].item[2]._()).to.equals('Quux.');
  });

  it('test parse with mergeAttrs', async () => {
    const r = await skeleton({...parserDefaults, mergeAttrs: true});
    expect(oc(r).sample.chartest[0].desc[0]()).to.equals('Test for CHARs');
    expect(oc(r).sample.chartest[0]._()).to.equals('Character data here!');
    expect(oc(r).sample.cdatatest[0].desc[0]()).to.equals('Test for CDATA');
    expect(oc(r).sample.cdatatest[0].misc[0]()).to.equals('true');
    expect(oc(r).sample.cdatatest[0]._()).to.equals('CDATA here!');
    expect(oc(r).sample.nochartest[0].desc[0]()).to.equals('No data');
    expect(oc(r).sample.nochartest[0].misc[0]()).to.equals('false');
    expect(oc(r).sample.listtest[0].item[0].subitem[0]._()).to.equals('Foo(1)');
    expect(oc(r).sample.listtest[0].item[0].subitem[1]._()).to.equals('Foo(2)');
    expect(oc(r).sample.listtest[0].item[0].subitem[2]._()).to.equals('Foo(3)');
    expect(oc(r).sample.listtest[0].item[0].subitem[3]._()).to.equals('Foo(4)');
    expect(oc(r).sample.listtest[0].item[1]._()).to.equals('Qux.');
    expect(oc(r).sample.listtest[0].item[2]._()).to.equals('Quux.');
    expect(oc(r).sample.listtest[0].single[0]._()).to.equals('Single');
    expect(oc(r).sample.listtest[0].attr[0]()).to.equals('Attribute');
  });

  it('test parse with mergeAttrs and not explicitArray', async () => {
    const r = await skeleton({...parserDefaults, mergeAttrs: true, explicitArray: false});

    expect(oc(r).sample.chartest.desc()).to.equals('Test for CHARs');
    expect(oc(r).sample.chartest._()).to.equals('Character data here!');
    expect(oc(r).sample.cdatatest.desc()).to.equals('Test for CDATA');
    expect(oc(r).sample.cdatatest.misc()).to.equals('true');
    expect(oc(r).sample.cdatatest._()).to.equals('CDATA here!');
    expect(oc(r).sample.nochartest.desc()).to.equals('No data');
    expect(oc(r).sample.nochartest.misc()).to.equals('false');
    expect(oc(r).sample.listtest.item[0].subitem[0]._()).to.equals('Foo(1)');
    expect(oc(r).sample.listtest.item[0].subitem[1]._()).to.equals('Foo(2)');
    expect(oc(r).sample.listtest.item[0].subitem[2]._()).to.equals('Foo(3)');
    expect(oc(r).sample.listtest.item[0].subitem[3]._()).to.equals('Foo(4)');
    expect(oc(r).sample.listtest.item[1]._()).to.equals('Qux.');
    expect(oc(r).sample.listtest.item[2]._()).to.equals('Quux.');
    expect(oc(r).sample.listtest.single._()).to.equals('Single');
    expect(oc(r).sample.listtest.attr()).to.equals('Attribute');
  });

  it('test parse with explicitChildren', async () => {
    const r = await skeleton({...parserDefaults, explicitChildren: true});

    expect(oc(r).sample.$$.chartest[0].$.desc()).to.equals('Test for CHARs');
    expect(oc(r).sample.$$.chartest[0]._()).to.equals('Character data here!');
    expect(oc(r).sample.$$.cdatatest[0].$.desc()).to.equals('Test for CDATA');
    expect(oc(r).sample.$$.cdatatest[0].$.misc()).to.equals('true');
    expect(oc(r).sample.$$.cdatatest[0]._()).to.equals('CDATA here!');
    expect(oc(r).sample.$$.nochartest[0].$.desc()).to.equals('No data');
    expect(oc(r).sample.$$.nochartest[0].$.misc()).to.equals('false');
    expect(oc(r).sample.$$.listtest[0].$$.item[0]._())
      .to
      .equals(
        '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
    expect(oc(r).sample.$$.listtest[0].$$.item[0].$$.subitem[0]()).to.equals('Foo(1)');
    expect(oc(r).sample.$$.listtest[0].$$.item[0].$$.subitem[1]()).to.equals('Foo(2)');
    expect(oc(r).sample.$$.listtest[0].$$.item[0].$$.subitem[2]()).to.equals('Foo(3)');
    expect(oc(r).sample.$$.listtest[0].$$.item[0].$$.subitem[3]()).to.equals('Foo(4)');
    expect(oc(r).sample.$$.listtest[0].$$.item[1]()).to.equals('Qux.');
    expect(oc(r).sample.$$.listtest[0].$$.item[2]()).to.equals('Quux.');
    expect(oc(r).sample.$$.nochildrentest[0].$$()).to.equals(undefined);
  });

  it('test parse with explicitChildren and preserveChildrenOrder', async () => {
    const r = await skeleton({...parserDefaults, explicitChildren: true, preserveChildrenOrder: true});

    expect(oc(r).sample.$$[10]['#name']).to.equals('ordertest');
    expect(oc(r).sample.$$[10].$$[0]['#name']).to.equals('one');
    expect(oc(r).sample.$$[10].$$[0]._).to.equals('1');
    expect(oc(r).sample.$$[10].$$[1]['#name']).to.equals('two');
    expect(oc(r).sample.$$[10].$$[1]._).to.equals('2');
    expect(oc(r).sample.$$[10].$$[2]['#name']).to.equals('three');
    expect(oc(r).sample.$$[10].$$[2]._).to.equals('3');
    expect(oc(r).sample.$$[10].$$[3]['#name']).to.equals('one');
    expect(oc(r).sample.$$[10].$$[3]._).to.equals('4');
    expect(oc(r).sample.$$[10].$$[4]['#name']).to.equals('two');
    expect(oc(r).sample.$$[10].$$[4]._).to.equals('5');
    expect(oc(r).sample.$$[10].$$[5]['#name']).to.equals('three');
    expect(oc(r).sample.$$[10].$$[5]._).to.equals('6');
  });

  it('test parse with explicitChildren and charsAsChildren and preserveChildrenOrder', async () => {
    const r = await skeleton(
      {...parserDefaults, explicitChildren: true, preserveChildrenOrder: true, charsAsChildren: true});

    expect(oc(r).sample.$$[10]['#name']).to.equals('ordertest');
    expect(oc(r).sample.$$[10].$$[0]['#name']).to.equals('one');
    expect(oc(r).sample.$$[10].$$[0]._).to.equals('1');
    expect(oc(r).sample.$$[10].$$[1]['#name']).to.equals('two');
    expect(oc(r).sample.$$[10].$$[1]._).to.equals('2');
    expect(oc(r).sample.$$[10].$$[2]['#name']).to.equals('three');
    expect(oc(r).sample.$$[10].$$[2]._).to.equals('3');
    expect(oc(r).sample.$$[10].$$[3]['#name']).to.equals('one');
    expect(oc(r).sample.$$[10].$$[3]._).to.equals('4');
    expect(oc(r).sample.$$[10].$$[4]['#name']).to.equals('two');
    expect(oc(r).sample.$$[10].$$[4]._).to.equals('5');
    expect(oc(r).sample.$$[10].$$[5]['#name']).to.equals('three');
    expect(oc(r).sample.$$[10].$$[5]._).to.equals('6');

    // test text ordering with XML nodes in the middle
    expect(oc(r).sample.$$[17]['#name']).to.equals('textordertest');
    expect(oc(r).sample.$$[17].$$[0]['#name']).to.equals('__text__');
    expect(oc(r).sample.$$[17].$$[0]._).to.equals('this is text with ');
    expect(oc(r).sample.$$[17].$$[1]['#name']).to.equals('b');
    expect(oc(r).sample.$$[17].$$[1]._).to.equals('markup');
    expect(oc(r).sample.$$[17].$$[2]['#name']).to.equals('em');
    expect(oc(r).sample.$$[17].$$[2]._).to.equals('like this');
    expect(oc(r).sample.$$[17].$$[3]['#name']).to.equals('__text__');
    expect(oc(r).sample.$$[17].$$[3]._).to.equals(' in the middle');
  });

  it('test parse with explicitChildren and charsAsChildren and preserveChildrenOrder and includeWhiteChars',
    async () => {
      const r = await skeleton(
        {
          ...parserDefaults,
          explicitChildren: true,
          preserveChildrenOrder: true,
          charsAsChildren: true,
          includeWhiteChars: true
        });

      expect(oc(r).sample.$$[35]['#name']).to.equals('textordertest');
      expect(oc(r).sample.$$[35].$$[0]['#name']).to.equals('__text__');
      expect(oc(r).sample.$$[35].$$[0]._).to.equals('this is text with ');
      expect(oc(r).sample.$$[35].$$[1]['#name']).to.equals('b');
      expect(oc(r).sample.$$[35].$$[1]._).to.equals('markup');
      expect(oc(r).sample.$$[35].$$[2]['#name']).to.equals('__text__');
      expect(oc(r).sample.$$[35].$$[2]._).to.equals('   ');
      expect(oc(r).sample.$$[35].$$[3]['#name']).to.equals('em');
      expect(oc(r).sample.$$[35].$$[3]._).to.equals('like this');
      expect(oc(r).sample.$$[35].$$[4]['#name']).to.equals('__text__');
      expect(oc(r).sample.$$[35].$$[4]._).to.equals(' in the middle');
    });

  it(
    'test parse with explicitChildren and charsAsChildren and preserveChildrenOrder and includeWhiteChars and normalize',
    async () => {
      const r = await skeleton({
        ...parserDefaults,
        explicitChildren: true,
        preserveChildrenOrder: true,
        charsAsChildren: true,
        includeWhiteChars: true,
        normalize: true
      });

      // normalized whitespace-only text node becomes empty string
      expect(oc(r).sample.$$[35]['#name']).to.equals('textordertest');
      expect(oc(r).sample.$$[35].$$[0]['#name']).to.equals('__text__');
      expect(oc(r).sample.$$[35].$$[0]._).to.equals('this is text with');
      expect(oc(r).sample.$$[35].$$[1]['#name']).to.equals('b');
      expect(oc(r).sample.$$[35].$$[1]._).to.equals('markup');
      expect(oc(r).sample.$$[35].$$[2]['#name']).to.equals('__text__');
      expect(oc(r).sample.$$[35].$$[2]._).to.equals('');
      expect(oc(r).sample.$$[35].$$[3]['#name']).to.equals('em');
      expect(oc(r).sample.$$[35].$$[3]._).to.equals('like this');
      expect(oc(r).sample.$$[35].$$[4]['#name']).to.equals('__text__');
      expect(oc(r).sample.$$[35].$$[4]._).to.equals('in the middle');
    });

  it('test element without children', async () => {
    const r = await skeleton({...parserDefaults, explicitChildren: true});

    expect(oc(r).sample.$$.nochildrentest[0].$$).to.equals(undefined);
  });

  it('test parse with explicitChildren and charsAsChildren', async () => {
    const r = await skeleton({...parserDefaults, explicitChildren: true, charsAsChildren: true});

    expect(oc(r).sample.$$.chartest[0].$$._).to.equals('Character data here!');
    expect(oc(r).sample.$$.cdatatest[0].$$._).to.equals('CDATA here!');
    expect(oc(r).sample.$$.listtest[0].$$.item[0].$$._)
      .to
      .equals(
        '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
  });

  it('test text trimming, normalize', async () => {
    const r = await skeleton({...parserDefaults, trim: true, normalize: true});
    expect(oc(r).sample.whitespacetest[0]._).to.equals('Line One Line Two')
  });

  it('test text trimming, no normalizing', async () => {
    const r = await skeleton({...parserDefaults, trim: true, normalize: false});
    expect(oc(r).sample.whitespacetest[0]._).to.equals('Line One\n        Line Two');
  });

  it('test text no trimming, normalize', async () => {
    const r = await skeleton({...parserDefaults, trim: false, normalize: true});
    expect(oc(r).sample.whitespacetest[0]._).to.equals('Line One Line Two');
  });

  it('test text no trimming, no normalize', async () => {
    const r = await skeleton({...parserDefaults, trim: false, normalize: false});
    expect(oc(r).sample.whitespacetest[0]._,).to.equals('\n        Line One\n        Line Two\n    ');
  });

  it('test enabled root node elimination', async () => {
    const r = await skeleton({...parserDefaults, __xmlString: '<root></root>', explicitRoot: false});

    return expect(oc(r)).to.equals('');
  });

  it('test disabled root node elimination', async () => {
    const r = await skeleton({...parserDefaults, __xmlString: '<root></root>', explicitRoot: true});
    expect(r).to.deep.equal({root: ''});
  });

  it('test default empty tag result', async () => {
    const r = await skeleton({...parserDefaults});
    expect(oc(r).sample.emptytest).to.equals(['']);
  });

  it('test empty tag result specified null', async () => {
    const r = await skeleton({...parserDefaults, emptyTag: null});

    expect(oc(r).sample.emptytest[0]._()).to.equals(undefined);
  });

  it('test invalid empty XML file', async () => {
    const r = await skeleton({...parserDefaults, __xmlString: ' '});
    expect(r).to.equals(null);
  });

  it('test enabled normalizeTags', async () => {
    const r = await skeleton({...parserDefaults, normalizeTags: true});

    expect(Object.keys(oc(r).sample.tagcasetest).length).to.equals(1);
  });

  it('test child node without explicitArray', async () => {
    const r = await skeleton({...parserDefaults, explicitArray: false});

    expect(oc(r).sample.arraytest.item[0].subitem).to.equals('Baz.');
    expect(oc(r).sample.arraytest.item[1].subitem[0]).to.equals('Foo.');
    expect(oc(r).sample.arraytest.item[1].subitem[1]).to.equals('Bar.');
  });

  it('test child node with explicitArray', async () => {
    const r = await skeleton({...parserDefaults, explicitArray: true});

    expect(oc(r).sample.arraytest[0].item[0].subitem[0]).to.equals('Baz.');
    expect(oc(r).sample.arraytest[0].item[1].subitem[0]).to.equals('Foo.');
    expect(oc(r).sample.arraytest[0].item[1].subitem[1]).to.equals('Bar.');
  });

  it('test ignore attributes', async () => {
    const r = await skeleton({...parserDefaults, ignoreAttrs: true});

    expect(oc(r).sample.chartest[0]).to.equals('Character data here!');
    expect(oc(r).sample.cdatatest[0]).to.equals('CDATA here!');
    expect(oc(r).sample.nochartest[0]).to.equals('');
    expect(oc(r).sample.listtest[0].item[0]._)
      .to
      .equals(
        '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
    expect(oc(r).sample.listtest[0].item[0].subitem[0]).to.equals('Foo(1)');
    expect(oc(r).sample.listtest[0].item[0].subitem[1]).to.equals('Foo(2)');
    expect(oc(r).sample.listtest[0].item[0].subitem[2]).to.equals('Foo(3)');
    expect(oc(r).sample.listtest[0].item[0].subitem[3]).to.equals('Foo(4)');
    expect(oc(r).sample.listtest[0].item[1]).to.equals('Qux.');
    expect(oc(r).sample.listtest[0].item[2]).to.equals('Quux.');
  });

  it('test simple callback mode', async () => {
    const x2js = new Parser(parserDefaults);
    try {
      const data = await readFile(fileName);

      const r = await x2js.parseString(data);
      expect(oc(r).sample.chartest[0]._).to.equals('Character data here!');
    } catch (err) {
      expect.fail(err, null);
    }
  });


  it('test simple callback with options', async () => {
    try {
      const data = await readFile(fileName);
      const opts = {...parserDefaults, trim: true, normalize: true};
      const r = await parseString(data, opts);
      expect(oc(r).sample.whitespacetest[0]._).to.equals('Line One Line Two');
    } catch (err) {
      expect.fail(err, null);
    }
  });

  it('test double parse', async () => {
    const x2js = new Parser(parserDefaults);
    try {
      const data = await readFile(fileName);
      let r = await x2js.parseString(data);
      expect(oc(r).sample.chartest[0]._).to.equals('Character data here!');
      r = await x2js.parseString(data);
      expect(oc(r).sample.chartest[0]._).to.equals('Character data here!');
    } catch (err) {
      expect.fail(err, null);
    }
  });

  it('test element with garbage XML', async () => {
    const x2js = new Parser(parserDefaults);
    const xmlString = "<<>fdfsdfsdf<><<><??><<><>!<>!<!<>!.";
    try {
      await x2js.parseString(xmlString);
    } catch (err) {
      expect(err.message).to.equals('Unencoded <\nLine: 0\nColumn: 2\nChar: <');
    }
  });

  it('test simple function without options', async () => {
    const data = await readFile(fileName);
    const r = await parseString(data);
    expect(oc(r)['sample'].chartest[0]._).to.equals('Character data here!');
  });

  it('test simple function with options', async () => {
    const data = await readFile(fileName);
    const r = await parseString(data);
    expect(oc(r)['sample'].chartest[0]._).to.equals('Character data here!');
  });
  it('test validator', async () => {
    const r = await skeleton({...parserDefaults, validator});
    expect(typeof oc(r).sample.validatortest[0].stringtest[0]).to.equals('string');
    expect(typeof oc(r).sample.validatortest[0].numbertest[0]).to.equals('number');
    expect(oc(r).sample.validatortest[0].emptyarray[0].item).a.instanceOf(Array);
    expect(oc(r).sample.validatortest[0].emptyarray[0].item.length).to.equals(0);
    expect(oc(r).sample.validatortest[0].oneitemarray[0].item).a.instanceOf(Array);
    expect(oc(r).sample.validatortest[0].oneitemarray[0].item.length).to.equals(1);
    expect(oc(r).sample.validatortest[0].oneitemarray[0].item[0]).to.equals('Bar.');
    expect(oc(r).sample.arraytest[0].item).a.instanceOf(Array);
    expect(oc(r).sample.arraytest[0].item.length).to.equals(2);
    expect(oc(r).sample.arraytest[0].item[0].subitem[0]).to.equals('Baz.');
    expect(oc(r).sample.arraytest[0].item[1].subitem[0]).to.equals('Foo.');
    expect(oc(r).sample.arraytest[0].item[1].subitem[1]).to.equals('Bar.');
  });

  it('test validation error', async () => {
    try {
      const x2js = new Parser({...parserDefaults, validator: validator});
      await x2js.parseString('<validationerror/>');
    } catch (err) {
      expect(err.message).to.equals('Validation error!');
    }
  });

  it('test xmlns', async () => {
    const r = await skeleton({...parserDefaults, xmlns: true});
    expect(oc(r).sample["pfx:top"][0].$ns.local).to.equals('top');
    expect(oc(r).sample["pfx:top"][0].$ns.uri).to.equals('http://foo.com');
    expect(oc(r).sample["pfx:top"][0].$["pfx:attr"].value).to.equals('baz');
    expect(oc(r).sample["pfx:top"][0].$["pfx:attr"].local).to.equals('attr');
    expect(oc(r).sample["pfx:top"][0].$["pfx:attr"].uri).to.equals('http://foo.com');
    expect(oc(r).sample["pfx:top"][0].middle[0].$ns.local).to.equals('middle');
    expect(oc(r).sample["pfx:top"][0].middle[0].$ns.uri).to.equals('http://bar.com');
  });

  it('test empty CDATA', async () => {
    const xml = '<xml><Label><![CDATA[]]></Label><MsgId>5850440872586764820</MsgId></xml>';
    const r = await parseString(xml);
    expect(oc(r).xml.Label[0].cdata).to.equals(false);
  });

  it('test CDATA whitespaces result', async () => {
    const xml = '<spacecdatatest><![CDATA[ ]]></spacecdatatest>';
    const r = await parseString(xml);
    expect(oc(r).spacecdatatest).to.equals(' ');
  });

  it('test escaped CDATA result', async () => {
    const xml = '<spacecdatatest><![CDATA[]]]]><![CDATA[>]]></spacecdatatest>';
    const r = await parseString(xml);
    expect(oc(r).spacecdatatest).to.equals(']]>');

  });

  it('test escaped CDATA result', async () => {
    const xml = '<spacecdatatest><![CDATA[]]]]><![CDATA[>]]></spacecdatatest>';
    const r = await parseString(xml);
    expect(oc(r).spacecdatatest).to.equals(']]>');

  });

  it('test non-strict parsing', async () => {
    const html = '<html><head></head><body><br></body></html>';
    try {
      await parseString(html, {...parserDefaults, strict: false});
    } catch (err) {
      expect(err).to.equals(null);
    }
  });

  it('test not closed but well formed xml', async () => {
    const xml = "<test>";
    try {
      await parseString(xml);
    } catch (err) {
      expect(err.message).to.equals('Unclosed root tag\nLine: 0\nColumn: 6\nChar: ');
    }
  });

  it('test cdata-named node', async () => {
    const xml = "<test><cdata>hello</cdata></test>";
    const r = await parseString(xml);
    expect(oc(r).test.cdata[0]).to.equals('hello');
  });

  it('test onend with empty xml', async () => {
    const xml = `<?xml version="1.0"?>`;
    const parsed = await parseString(xml);
      expect(parsed).equals(null);
  });

  it('test single attrNameProcessors', async () => {
    const r = await skeleton({...parserDefaults, attrNameProcessors: [nameToUpperCase]});

    expect(oc(r).sample.attrNameProcessTest[0].$.hasOwnProperty('CAMELCASEATTR'))
      .to
      .equals(true);
    expect(oc(r).sample.attrNameProcessTest[0].$.hasOwnProperty('LOWERCASEATTR'))
      .to
      .equals(true);
  });

  it('test multiple attrNameProcessors', async () => {
    const r = await skeleton({...parserDefaults, attrNameProcessors: [nameToUpperCase, nameCutoff]});
    expect(oc(r).sample.attrNameProcessTest[0].$.hasOwnProperty('CAME')).to.equals(true);
    expect(oc(r).sample.attrNameProcessTest[0].$.hasOwnProperty('LOWE')).to.equals(true);
  });

  it('test single attrValueProcessors', async () => {
    const r = await skeleton({...parserDefaults, attrValueProcessors: [nameToUpperCase]});
    expect(oc(r).sample.attrValueProcessTest[0].$.camelCaseAttr)
      .to
      .equals('CAMELCASEATTRVALUE');
    expect(oc(r).sample.attrValueProcessTest[0].$.lowerCaseAttr)
      .to
      .equals('LOWERCASEATTRVALUE');
  });

  it('test multiple attrValueProcessors', async () => {
    const r = await skeleton({...parserDefaults, attrValueProcessors: [nameToUpperCase, nameCutoff]});
    expect(oc(r).sample.attrValueProcessTest[0].$.camelCaseAttr).to.equals('CAME');
    expect(oc(r).sample.attrValueProcessTest[0].$.lowerCaseAttr).to.equals('LOWE');
  });

  it('test single valueProcessor', async () => {
    const r = await skeleton({...parserDefaults, valueProcessors: [nameToUpperCase]});
    expect(oc(r).sample.valueProcessTest[0]).to.equals('SOME VALUE');
  });

  it('test multiple valueProcessor', async () => {
    const r = await skeleton({...parserDefaults, valueProcessors: [nameToUpperCase, nameCutoff]});
    expect(oc(r).sample.valueProcessTest[0]).to.equals('SOME');
  });

  it('test single tagNameProcessors', async () => {
    const r = await skeleton({...parserDefaults, tagNameProcessors: [nameToUpperCase]});
    expect(oc(r).hasOwnProperty('SAMPLE')).to.equals(true);
    expect(oc(r).SAMPLE.hasOwnProperty('TAGNAMEPROCESSTEST')).to.equals(true);
  });

  it('test single tagNameProcessors in simple callback', async () => {
    const data = await readFile(fileName);
    const r = await parseString(data, {...parserDefaults, tagNameProcessors: [nameToUpperCase]});
    expect(oc(r).hasOwnProperty('SAMPLE')).to.equals(true);
    expect(oc(r)['SAMPLE'].hasOwnProperty('TAGNAMEPROCESSTEST')).to.equals(true);
  });

  it('test multiple tagNameProcessors', async () => {
    const r = await skeleton({...parserDefaults, tagNameProcessors: [nameToUpperCase, nameCutoff]});
    expect(oc(r).hasOwnProperty('SAMP')).to.equals(true);
    expect(oc(r).SAMP.hasOwnProperty('TAGN')).to.equals(true);
  });
})
;
