import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as os from 'os';
import {Parser, parseString} from "../src/parser";
import {expect} from 'chai';
import {ElementNameProcessor, ElementValidator, parserDefaults} from "../src/defaults";

const fileName = path.join(__dirname, '/fixtures/sample.xml');

const skeleton = (options, checks) =>
  function () {
    const xmlString = options != null ? options.__xmlString : undefined;
    if (options != null) {
      delete options.__xmlString;
    }
    const x2js = new Parser(options);
    x2js.addListener('end', function (r) {
      checks(r);

    });
    if (!xmlString) {
      return fs.readFile(fileName, 'utf8', function (err, data) {
        data = data.split(os.EOL).join('\n');
        return x2js.parseString(data);
      });
    } else {
      return x2js.parseString(xmlString);
    }
  }
;

const nameToUpperCase: ElementNameProcessor = {
  process(name: string): string {
    return name.toUpperCase();
  }
};

const nameCutoff = name => name.substr(0, 4);

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
  it('test parse with defaults', () => {
    skeleton(undefined, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.chartest[0].$.desc).to.equals('Test for CHARs');
      expect(r.sample.chartest[0]._,).to.equals('Character data here!');
      expect(r.sample.cdatatest[0].$.desc).to.equals('Test for CDATA');
      expect(r.sample.cdatatest[0].$.misc).to.equals('true');
      expect(r.sample.cdatatest[0]._).to.equals('CDATA here!');
      expect(r.sample.nochartest[0].$.desc).to.equals('No data');
      expect(r.sample.nochartest[0].$.misc).to.equals('false');
      expect(r.sample.listtest[0].item[0]._)
        .to
        .equals(
          '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
      expect(r.sample.listtest[0].item[0].subitem[0]).to.equals('Foo(1)');
      expect(r.sample.listtest[0].item[0].subitem[1]).to.equals('Foo(2)');
      expect(r.sample.listtest[0].item[0].subitem[2]).to.equals('Foo(3)');
      expect(r.sample.listtest[0].item[0].subitem[3]).to.equals('Foo(4)');
      expect(r.sample.listtest[0].item[1]).to.equals('Qux.');
      expect(r.sample.listtest[0].item[2]).to.equals('Quux.');
      // determine number of items in object
      expect(Object.keys(r.sample.tagcasetest[0]).length).to.equals(3);
    })
  });

  it('test parse with explicitCharkey', () => {
    skeleton({explicitCharkey: true}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.chartest[0].$.desc).to.equals('Test for CHARs');
      expect(r.sample.chartest[0]._).to.equals('Character data here!');
      expect(r.sample.cdatatest[0].$.desc).to.equals('Test for CDATA');
      expect(r.sample.cdatatest[0].$.misc).to.equals('true');
      expect(r.sample.cdatatest[0]._).to.equals('CDATA here!');
      expect(r.sample.nochartest[0].$.desc).to.equals('No data');
      expect(r.sample.nochartest[0].$.misc).to.equals('false');
      expect(r.sample.listtest[0].item[0]._)
        .to
        .equals(
          '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
      expect(r.sample.listtest[0].item[0].subitem[0]._).to.equals('Foo(1)');
      expect(r.sample.listtest[0].item[0].subitem[1]._).to.equals('Foo(2)');
      expect(r.sample.listtest[0].item[0].subitem[2]._).to.equals('Foo(3)');
      expect(r.sample.listtest[0].item[0].subitem[3]._).to.equals('Foo(4)');
      expect(r.sample.listtest[0].item[1]._).to.equals('Qux.');
      expect(r.sample.listtest[0].item[2]._).to.equals('Quux.');
    })
  });

  it('test parse with mergeAttrs', () => {
    skeleton({mergeAttrs: true}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.chartest[0].desc[0]).to.equals('Test for CHARs');
      expect(r.sample.chartest[0]._).to.equals('Character data here!');
      expect(r.sample.cdatatest[0].desc[0]).to.equals('Test for CDATA');
      expect(r.sample.cdatatest[0].misc[0]).to.equals('true');
      expect(r.sample.cdatatest[0]._).to.equals('CDATA here!');
      expect(r.sample.nochartest[0].desc[0]).to.equals('No data');
      expect(r.sample.nochartest[0].misc[0]).to.equals('false');
      expect(r.sample.listtest[0].item[0].subitem[0]).to.equals('Foo(1)');
      expect(r.sample.listtest[0].item[0].subitem[1]).to.equals('Foo(2)');
      expect(r.sample.listtest[0].item[0].subitem[2]).to.equals('Foo(3)');
      expect(r.sample.listtest[0].item[0].subitem[3]).to.equals('Foo(4)');
      expect(r.sample.listtest[0].item[1]).to.equals('Qux.');
      expect(r.sample.listtest[0].item[2]).to.equals('Quux.');
      expect(r.sample.listtest[0].single[0]).to.equals('Single');
      expect(r.sample.listtest[0].attr[0]).to.equals('Attribute');
    })
  });

  it('test parse with mergeAttrs and not explicitArray', () => {
    skeleton({mergeAttrs: true, explicitArray: false}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.chartest.desc).to.equals('Test for CHARs');
      expect(r.sample.chartest._).to.equals('Character data here!');
      expect(r.sample.cdatatest.desc).to.equals('Test for CDATA');
      expect(r.sample.cdatatest.misc).to.equals('true');
      expect(r.sample.cdatatest._).to.equals('CDATA here!');
      expect(r.sample.nochartest.desc).to.equals('No data');
      expect(r.sample.nochartest.misc).to.equals('false');
      expect(r.sample.listtest.item[0].subitem[0]).to.equals('Foo(1)');
      expect(r.sample.listtest.item[0].subitem[1]).to.equals('Foo(2)');
      expect(r.sample.listtest.item[0].subitem[2]).to.equals('Foo(3)');
      expect(r.sample.listtest.item[0].subitem[3]).to.equals('Foo(4)');
      expect(r.sample.listtest.item[1]).to.equals('Qux.');
      expect(r.sample.listtest.item[2]).to.equals('Quux.');
      expect(r.sample.listtest.single).to.equals('Single');
      expect(r.sample.listtest.attr).to.equals('Attribute');
    })
  });

  it('test parse with explicitChildren', () => {
    skeleton({explicitChildren: true}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.$$.chartest[0].$.desc).to.equals('Test for CHARs');
      expect(r.sample.$$.chartest[0]._).to.equals('Character data here!');
      expect(r.sample.$$.cdatatest[0].$.desc).to.equals('Test for CDATA');
      expect(r.sample.$$.cdatatest[0].$.misc).to.equals('true');
      expect(r.sample.$$.cdatatest[0]._).to.equals('CDATA here!');
      expect(r.sample.$$.nochartest[0].$.desc).to.equals('No data');
      expect(r.sample.$$.nochartest[0].$.misc).to.equals('false');
      expect(r.sample.$$.listtest[0].$$.item[0]._)
        .to
        .equals(
          '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
      expect(r.sample.$$.listtest[0].$$.item[0].$$.subitem[0]).to.equals('Foo(1)');
      expect(r.sample.$$.listtest[0].$$.item[0].$$.subitem[1]).to.equals('Foo(2)');
      expect(r.sample.$$.listtest[0].$$.item[0].$$.subitem[2]).to.equals('Foo(3)');
      expect(r.sample.$$.listtest[0].$$.item[0].$$.subitem[3]).to.equals('Foo(4)');
      expect(r.sample.$$.listtest[0].$$.item[1]).to.equals('Qux.');
      expect(r.sample.$$.listtest[0].$$.item[2]).to.equals('Quux.');
      expect(r.sample.$$.nochildrentest[0].$$).to.equals(undefined);
      // determine number of items in object
      expect(Object.keys(r.sample.$$.tagcasetest[0].$$).length).to.equals(3);
    })
  });

  it('test parse with explicitChildren and preserveChildrenOrder', () => {
    skeleton({explicitChildren: true, preserveChildrenOrder: true}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.$$[10]['#name']).to.equals('ordertest');
      expect(r.sample.$$[10].$$[0]['#name']).to.equals('one');
      expect(r.sample.$$[10].$$[0]._).to.equals('1');
      expect(r.sample.$$[10].$$[1]['#name']).to.equals('two');
      expect(r.sample.$$[10].$$[1]._).to.equals('2');
      expect(r.sample.$$[10].$$[2]['#name']).to.equals('three');
      expect(r.sample.$$[10].$$[2]._).to.equals('3');
      expect(r.sample.$$[10].$$[3]['#name']).to.equals('one');
      expect(r.sample.$$[10].$$[3]._).to.equals('4');
      expect(r.sample.$$[10].$$[4]['#name']).to.equals('two');
      expect(r.sample.$$[10].$$[4]._).to.equals('5');
      expect(r.sample.$$[10].$$[5]['#name']).to.equals('three');
      expect(r.sample.$$[10].$$[5]._).to.equals('6');
    })
  });

  it('test parse with explicitChildren and charsAsChildren and preserveChildrenOrder', () => {
    skeleton({explicitChildren: true, preserveChildrenOrder: true, charsAsChildren: true}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.$$[10]['#name']).to.equals('ordertest');
      expect(r.sample.$$[10].$$[0]['#name']).to.equals('one');
      expect(r.sample.$$[10].$$[0]._).to.equals('1');
      expect(r.sample.$$[10].$$[1]['#name']).to.equals('two');
      expect(r.sample.$$[10].$$[1]._).to.equals('2');
      expect(r.sample.$$[10].$$[2]['#name']).to.equals('three');
      expect(r.sample.$$[10].$$[2]._).to.equals('3');
      expect(r.sample.$$[10].$$[3]['#name']).to.equals('one');
      expect(r.sample.$$[10].$$[3]._).to.equals('4');
      expect(r.sample.$$[10].$$[4]['#name']).to.equals('two');
      expect(r.sample.$$[10].$$[4]._).to.equals('5');
      expect(r.sample.$$[10].$$[5]['#name']).to.equals('three');
      expect(r.sample.$$[10].$$[5]._).to.equals('6');

      // test text ordering with XML nodes in the middle
      expect(r.sample.$$[17]['#name']).to.equals('textordertest');
      expect(r.sample.$$[17].$$[0]['#name']).to.equals('__text__');
      expect(r.sample.$$[17].$$[0]._).to.equals('this is text with ');
      expect(r.sample.$$[17].$$[1]['#name']).to.equals('b');
      expect(r.sample.$$[17].$$[1]._).to.equals('markup');
      expect(r.sample.$$[17].$$[2]['#name']).to.equals('em');
      expect(r.sample.$$[17].$$[2]._).to.equals('like this');
      expect(r.sample.$$[17].$$[3]['#name']).to.equals('__text__');
      expect(r.sample.$$[17].$$[3]._).to.equals(' in the middle');
    })
  });

  it('test parse with explicitChildren and charsAsChildren and preserveChildrenOrder and includeWhiteChars', () => {
    skeleton({explicitChildren: true, preserveChildrenOrder: true, charsAsChildren: true, includeWhiteChars: true},
      function (r) {
        console.log(`Result object: ${util.inspect(r, false, 10)}`);
        expect(r.sample.$$[35]['#name']).to.equals('textordertest');
        expect(r.sample.$$[35].$$[0]['#name']).to.equals('__text__');
        expect(r.sample.$$[35].$$[0]._).to.equals('this is text with ');
        expect(r.sample.$$[35].$$[1]['#name']).to.equals('b');
        expect(r.sample.$$[35].$$[1]._).to.equals('markup');
        expect(r.sample.$$[35].$$[2]['#name']).to.equals('__text__');
        expect(r.sample.$$[35].$$[2]._).to.equals('   ');
        expect(r.sample.$$[35].$$[3]['#name']).to.equals('em');
        expect(r.sample.$$[35].$$[3]._).to.equals('like this');
        expect(r.sample.$$[35].$$[4]['#name']).to.equals('__text__');
        expect(r.sample.$$[35].$$[4]._).to.equals(' in the middle');
      })
  });

  it(
    'test parse with explicitChildren and charsAsChildren and preserveChildrenOrder and includeWhiteChars and normalize',
    () => {
      skeleton({
        explicitChildren: true,
        preserveChildrenOrder: true,
        charsAsChildren: true,
        includeWhiteChars: true,
        normalize: true
      }, function (r) {
        console.log(`Result object: ${util.inspect(r, false, 10)}`);
        // normalized whitespace-only text node becomes empty string
        expect(r.sample.$$[35]['#name']).to.equals('textordertest');
        expect(r.sample.$$[35].$$[0]['#name']).to.equals('__text__');
        expect(r.sample.$$[35].$$[0]._).to.equals('this is text with');
        expect(r.sample.$$[35].$$[1]['#name']).to.equals('b');
        expect(r.sample.$$[35].$$[1]._).to.equals('markup');
        expect(r.sample.$$[35].$$[2]['#name']).to.equals('__text__');
        expect(r.sample.$$[35].$$[2]._).to.equals('');
        expect(r.sample.$$[35].$$[3]['#name']).to.equals('em');
        expect(r.sample.$$[35].$$[3]._).to.equals('like this');
        expect(r.sample.$$[35].$$[4]['#name']).to.equals('__text__');
        expect(r.sample.$$[35].$$[4]._).to.equals('in the middle');
      })
    });

  it('test element without children', () => {
    skeleton({explicitChildren: true}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.$$.nochildrentest[0].$$).to.equals(undefined);
    })
  });

  it('test parse with explicitChildren and charsAsChildren', () => {
    skeleton({explicitChildren: true, charsAsChildren: true}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.$$.chartest[0].$$._).to.equals('Character data here!');
      expect(r.sample.$$.cdatatest[0].$$._).to.equals('CDATA here!');
      expect(r.sample.$$.listtest[0].$$.item[0].$$._)
        .to
        .equals(
          '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
      // determine number of items in object
      expect(Object.keys(r.sample.$$.tagcasetest[0].$$).length).to.equals(3);
    })
  });

  it('test text trimming, normalize', () => {
    skeleton({trim: true, normalize: true},
      r => expect(r.sample.whitespacetest[0]._).to.equals('Line One Line Two'));
  });

  it('test text trimming, no normalizing', () => {
    skeleton({trim: true, normalize: false},
      r => expect(r.sample.whitespacetest[0]._).to.equals('Line One\n        Line Two'));
  });

  it('test text no trimming, normalize', () => {
    skeleton({trim: false, normalize: true},
      r => expect(r.sample.whitespacetest[0]._).to.equals('Line One Line Two'));
  });

  it('test text no trimming, no normalize', () => {
    skeleton({trim: false, normalize: false},
      r => expect(r.sample.whitespacetest[0]._,).to.equals(
        '\n        Line One\n        Line Two\n    '));
  });

  it('test enabled root node elimination', () => {
    skeleton({__xmlString: '<root></root>', explicitRoot: false}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      return expect(r).to.equals('');
    })
  });

  it('test disabled root node elimination', () => {
    skeleton({__xmlString: '<root></root>', explicitRoot: true},
      r => expect(r).to.equals({root: ''}))
  });

  it('test default empty tag result', () => {
    skeleton(undefined, r => expect(r.sample.emptytest).to.equals(['']));
  });

  it('test empty tag result specified null', () => {
    skeleton({emptyTag: null}, r => expect(r.sample.emptytest[0]).to.equals(null))
  });

  it('test invalid empty XML file', () => {
    skeleton({__xmlString: ' '}, r => expect(r).to.equals(null))
  });

  it('test enabled normalizeTags', () => {
    skeleton({normalizeTags: true}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(Object.keys(r.sample.tagcasetest).length).to.equals(1);
    })
  });

  it('test parse with custom char and attribute object keys', () => {
    skeleton({attrkey: 'attrobj', charkey: 'charobj'}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.chartest[0].attrobj.desc).to.equals('Test for CHARs');
      expect(r.sample.chartest[0].charobj).to.equals('Character data here!');
      expect(r.sample.cdatatest[0].attrobj.desc).to.equals('Test for CDATA');
      expect(r.sample.cdatatest[0].attrobj.misc).to.equals('true');
      expect(r.sample.cdatatest[0].charobj).to.equals('CDATA here!');
      expect(r.sample.cdatawhitespacetest[0].charobj).to.equals('   ');
      expect(r.sample.nochartest[0].attrobj.desc).to.equals('No data');
      expect(r.sample.nochartest[0].attrobj.misc).to.equals('false');
    })
  });

  it('test child node without explicitArray', () => {
    skeleton({explicitArray: false}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.arraytest.item[0].subitem).to.equals('Baz.');
      expect(r.sample.arraytest.item[1].subitem[0]).to.equals('Foo.');
      expect(r.sample.arraytest.item[1].subitem[1]).to.equals('Bar.');
    })
  });

  it('test child node with explicitArray', () => {
    skeleton({explicitArray: true}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.arraytest[0].item[0].subitem[0]).to.equals('Baz.');
      expect(r.sample.arraytest[0].item[1].subitem[0]).to.equals('Foo.');
      expect(r.sample.arraytest[0].item[1].subitem[1]).to.equals('Bar.');
    })
  });

  it('test ignore attributes', () => {
    skeleton({ignoreAttrs: true}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.chartest[0]).to.equals('Character data here!');
      expect(r.sample.cdatatest[0]).to.equals('CDATA here!');
      expect(r.sample.nochartest[0]).to.equals('');
      expect(r.sample.listtest[0].item[0]._)
        .to
        .equals(
          '\n            This  is\n            \n            character\n            \n            data!\n            \n        ');
      expect(r.sample.listtest[0].item[0].subitem[0]).to.equals('Foo(1)');
      expect(r.sample.listtest[0].item[0].subitem[1]).to.equals('Foo(2)');
      expect(r.sample.listtest[0].item[0].subitem[2]).to.equals('Foo(3)');
      expect(r.sample.listtest[0].item[0].subitem[3]).to.equals('Foo(4)');
      expect(r.sample.listtest[0].item[1]).to.equals('Qux.');
      expect(r.sample.listtest[0].item[2]).to.equals('Quux.');
    })
  });

  it('test simple callback mode', () => {
    const x2js = new Parser();
    return fs.readFile(fileName, function (err, data) {
      expect(err).to.equals(null);
      return x2js.parseString(data, function (err, r) {
        expect(err).to.equals(null);
        // just a single test to check whether we parsed anything
        expect(r.sample.chartest[0]._).to.equals('Character data here!');

      });
    });
  });

  it('test simple callback with options', () => {
    return fs.readFile(fileName, (err, data) => {
      const opts = {...parserDefaults};
      opts.trim = true;
      opts.normalize = true;
      parseString(data, opts,
        function (err, r) {
          console.log(r);
          expect(r.sample.whitespacetest[0]._).to.equals('Line One Line Two');
        });
    })
  });

  it('test double parse', () => {
    const x2js = new Parser();
    return fs.readFile(fileName, function (err, data) {
      expect(err).to.equals(null);
      return x2js.parseString(data, function (err, r) {
        expect(err).to.equals(null);
        // make sure we parsed anything
        expect(r.sample.chartest[0]._).to.equals('Character data here!');
        return x2js.parseString(data, function (err, r) {
          expect(err).to.equals(null);
          expect(r.sample.chartest[0]._).to.equals('Character data here!');

        });
      });
    });
  });

  it('test element with garbage XML', () => {
    const x2js = new Parser();
    const xmlString = "<<>fdfsdfsdf<><<><??><<><>!<>!<!<>!.";
    return x2js.parseString(xmlString, function (err, result) {
      expect(err).to.not.equals(null);
    });
  });

  it('test simple function without options', () => {
    return fs.readFile(fileName, (err, data) =>
      parseString(data, function (err, r) {
        expect(err).to.equals(null);
        expect(r.sample.chartest[0]._).to.equals('Character data here!');
      })
    );
  });

  it('test simple function with options', () => {
    return fs.readFile(fileName, (err, data) =>
      parseString(data, parserDefaults, function (err, r) {
        expect(err).to.equals(null);
        expect(r.sample.chartest[0]._).to.equals('Character data here!');
      })
    );
  });

  it('test async execution', () => {
    return fs.readFile(fileName, (err, data) => {
      const opts = {...parserDefaults};
      opts.async = true;
      parseString(data, opts, function (err, r) {
        expect(err).to.equals(null);
        expect(r.sample.chartest[0]).to.equals('Character data here!');
      });
    });
  });

  it('test validator', () => {
    skeleton({validator}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(typeof r.sample.validatortest[0].stringtest[0]).to.equals('string');
      expect(typeof r.sample.validatortest[0].numbertest[0]).to.equals('number');
      expect(r.sample.validatortest[0].emptyarray[0].item).a.instanceOf(Array);
      expect(r.sample.validatortest[0].emptyarray[0].item.length).to.equals(0);
      expect(r.sample.validatortest[0].oneitemarray[0].item).a.instanceOf(Array);
      expect(r.sample.validatortest[0].oneitemarray[0].item.length).to.equals(1);
      expect(r.sample.validatortest[0].oneitemarray[0].item[0]).to.equals('Bar.');
      expect(r.sample.arraytest[0].item).a.instanceOf(Array);
      expect(r.sample.arraytest[0].item.length).to.equals(2);
      expect(r.sample.arraytest[0].item[0].subitem[0]).to.equals('Baz.');
      expect(r.sample.arraytest[0].item[1].subitem[0]).to.equals('Foo.');
      expect(r.sample.arraytest[0].item[1].subitem[1]).to.equals('Bar.');
    })
  });

  it('test validation error', () => {
    const opts = {...parserDefaults};
    opts.validator = validator;
    const x2js = new Parser(opts);
    return x2js.parseString('<validationerror/>', function (err, r) {
      expect(err.message).to.equals('Validation error!');
    });
  });

  it('test error throwing', () => {
    const xml = '<?xml version="1.0" encoding="utf-8"?><test>content is ok<test>';
    try {
      parseString(xml, function (err, parsed) {
        throw new Error('error throwing in callback');
      });
      throw new Error('error throwing outside');
    } catch (e) {
      // the stream is finished by the time the parseString method is called
      // so the callback, which is synchronous, will bubble the inner error
      // out to here, make sure that happens
      expect(e.message).to.equals('error throwing in callback');

    }
  });

  it('test error throwing after an error (async)', () => {
    const xml = '<?xml version="1.0" encoding="utf-8"?><test node is not okay>content is ok</test node is not okay>';
    const opts = {...parserDefaults};
    opts.async = true;
    return parseString(xml, opts, function (err, parsed) {
      expect(err).to.equals('');
    });
  });

  it('test xmlns', () => {
    skeleton({xmlns: true}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample["pfx:top"][0].$ns.local).to.equals('top');
      expect(r.sample["pfx:top"][0].$ns.uri).to.equals('http://foo.com');
      expect(r.sample["pfx:top"][0].$["pfx:attr"].value).to.equals('baz');
      expect(r.sample["pfx:top"][0].$["pfx:attr"].local).to.equals('attr');
      expect(r.sample["pfx:top"][0].$["pfx:attr"].uri).to.equals('http://foo.com');
      expect(r.sample["pfx:top"][0].middle[0].$ns.local).to.equals('middle');
      expect(r.sample["pfx:top"][0].middle[0].$ns.uri).to.equals('http://bar.com');
    })
  });

  it('test callback should be called once', () => {
    const xml = '<?xml version="1.0" encoding="utf-8"?><test>test</test>';
    let i = 0;
    try {
      return parseString(xml, function (err, parsed) {
        i = i + 1;
        // throw something custom
        throw new Error('Custom error message');
      });
    } catch (e) {
      expect(i).to.equals(1);
      expect(e.message).to.equals('Custom error message');

    }
  });

  it('test no error event after end', () => {
    const xml = '<?xml version="1.0" encoding="utf-8"?><test>test</test>';
    let i = 0;
    const x2js = new Parser();
    x2js.on('error', () => i = i + 1);

    x2js.on('end', function () {
      //This is a userland callback doing something with the result xml.
      //Errors in here should not be passed to the parser's 'error' callbacks
      //Errors here should be propagated so that the user can see them and
      //fix them.
      throw new Error('some error in user-land');
    });

    try {
      x2js.parseString(xml);
    } catch (e) {
      expect(e.message).to.equals('some error in user-land');
    }

    expect(i).to.equals(0);

  });

  it('test empty CDATA', () => {
    const xml = '<xml><Label><![CDATA[]]></Label><MsgId>5850440872586764820</MsgId></xml>';
    return parseString(xml, function (err, parsed) {
      expect(parsed.xml.Label[0]).to.equals('');

    });
  });

  it('test CDATA whitespaces result', () => {
    const xml = '<spacecdatatest><![CDATA[ ]]></spacecdatatest>';
    return parseString(xml, function (err, parsed) {
      expect(parsed.spacecdatatest).to.equals(' ');

    });
  });

  it('test escaped CDATA result', () => {
    const xml = '<spacecdatatest><![CDATA[]]]]><![CDATA[>]]></spacecdatatest>';
    return parseString(xml, function (err, parsed) {
      expect(parsed.spacecdatatest).to.equals(']]>');

    });
  });

  it('test escaped CDATA result', () => {
    const xml = '<spacecdatatest><![CDATA[]]]]><![CDATA[>]]></spacecdatatest>';
    return parseString(xml, function (err, parsed) {
      expect(parsed.spacecdatatest).to.equals(']]>');

    });
  });

  it('test non-strict parsing', () => {
    const html = '<html><head></head><body><br></body></html>';
    const opts = {...parserDefaults};
    opts.strict = false;
    return parseString(html, opts, function (err, parsed) {
      expect(err).to.equals(null);
    });
  });

  it('test not closed but well formed xml', () => {
    const xml = "<test>";
    return parseString(xml, function (err, parsed) {
      expect(err.message).to.equals('Unclosed root tag\nLine: 0\nColumn: 6\nChar: ');
    });
  });

  it('test cdata-named node', () => {
    const xml = "<test><cdata>hello</cdata></test>";
    return parseString(xml, function (err, parsed) {
      expect(parsed.test.cdata[0]).to.equals('hello');
    });
  });

  it('test onend with empty xml', () => {
    const xml = `<?xml version="1.0"?>`;
    return parseString(xml, function (err, parsed) {
      expect(parsed).equals(null);
    });
  });

  it('test parsing null', () => {
    const xml = null;
    return parseString(xml, function (err, parsed) {
      expect(err).not.equals(null);
    });
  });

  it('test parsing undefined', () => {
    const xml = undefined;
    return parseString(xml, function (err, parsed) {
      expect(err).not.equals(null);
    });
  });

  it('test chunked processing', () => {
    const xml = "<longstuff>abcdefghijklmnopqrstuvwxyz</longstuff>";
    const opts = {...parserDefaults};
    opts.chunkSize = 10;
    return parseString(xml, opts, function (err, parsed) {
      expect(err).to.equals(null);
      expect(parsed.longstuff).to.equals('abcdefghijklmnopqrstuvwxyz');

    });
  });

  it('test single attrNameProcessors', () => {
    skeleton({attrNameProcessors: [nameToUpperCase]}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.attrNameProcessTest[0].$.hasOwnProperty('CAMELCASEATTR'))
        .to
        .equals(true);
      expect(r.sample.attrNameProcessTest[0].$.hasOwnProperty('LOWERCASEATTR'))
        .to
        .equals(true);
    })
  });

  it('test multiple attrNameProcessors', () => {
    skeleton({attrNameProcessors: [nameToUpperCase, nameCutoff]}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.attrNameProcessTest[0].$.hasOwnProperty('CAME')).to.equals(true);
      expect(r.sample.attrNameProcessTest[0].$.hasOwnProperty('LOWE')).to.equals(true);
    })
  });

  it('test single attrValueProcessors', () => {
    skeleton({attrValueProcessors: [nameToUpperCase]}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.attrValueProcessTest[0].$.camelCaseAttr)
        .to
        .equals('CAMELCASEATTRVALUE');
      expect(r.sample.attrValueProcessTest[0].$.lowerCaseAttr)
        .to
        .equals('LOWERCASEATTRVALUE');
    })
  });

  it('test multiple attrValueProcessors', () => {
    skeleton({attrValueProcessors: [nameToUpperCase, nameCutoff]}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.attrValueProcessTest[0].$.camelCaseAttr).to.equals('CAME');
      expect(r.sample.attrValueProcessTest[0].$.lowerCaseAttr).to.equals('LOWE');
    })
  });

  it('test single valueProcessor', () => {
    skeleton({valueProcessors: [nameToUpperCase]}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.valueProcessTest[0]).to.equals('SOME VALUE');
    })
  });

  it('test multiple valueProcessor', () => {
    skeleton({valueProcessors: [nameToUpperCase, nameCutoff]}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.sample.valueProcessTest[0]).to.equals('SOME');
    })
  });

  it('test single tagNameProcessors', () => {
    skeleton({tagNameProcessors: [nameToUpperCase]}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.hasOwnProperty('SAMPLE')).to.equals(true);
      expect(r.SAMPLE.hasOwnProperty('TAGNAMEPROCESSTEST')).to.equals(true);
    })
  });

  it('test single tagNameProcessors in simple callback', () => {
    return fs.readFile(fileName, (err, data) => {
      const opts = {...parserDefaults};
      opts.tagNameProcessors = [nameToUpperCase];
      parseString(data, opts, function (err, r) {
        console.log(`Result object: ${util.inspect(r, false, 10)}`);
        expect(r.hasOwnProperty('SAMPLE')).to.equals(true);
        expect(r.SAMPLE.hasOwnProperty('TAGNAMEPROCESSTEST')).to.equals(true);

      })
    });
  });

  it('test multiple tagNameProcessors', () => {
    skeleton({tagNameProcessors: [nameToUpperCase, nameCutoff]}, function (r) {
      console.log(`Result object: ${util.inspect(r, false, 10)}`);
      expect(r.hasOwnProperty('SAMP')).to.equals(true);
      expect(r.SAMP.hasOwnProperty('TAGN')).to.equals(true);
    })
  });
});
