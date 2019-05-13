import * as fs from 'fs';
import * as path from 'path';
import {expect} from 'chai';
import {Builder} from "../src/builder";
import {builderDefaults, parserDefaults} from "../src/defaults";
import {parseString} from "../src/parser";

// fileName = path.join __dirname, '/fixtures/sample.xml'

describe('Builder tests', () => {
  it('test building basic XML structure', () => {
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xml><Label/><MsgId>5850440872586764820</MsgId></xml>';
    const obj = {"xml": {"Label": [""], "MsgId": ["5850440872586764820"]}};
    const defaults = {...builderDefaults};
    defaults.renderOpts = {pretty: false};
    const builder = new Builder(defaults);
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test setting XML declaration', () => {
    const expected = '<?xml version="1.2" encoding="WTF-8" standalone="no"?><root/>';
    const opts = {...builderDefaults};
    opts.renderOpts = {pretty: false};
    opts.xmldec = {'version': '1.2', 'encoding': 'WTF-8', 'standalone': false};
    const builder = new Builder(opts);
    const actual = builder.buildObject({});
    expect(actual).to.equals(expected);
  });

  it('test pretty by default', () => {
    const expected = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
 <MsgId>5850440872586764820</MsgId>
</xml>`;
    const builder = new Builder(builderDefaults);
    const obj = {"xml": {"MsgId": ["5850440872586764820"]}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test setting indentation', () => {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
    <MsgId>5850440872586764820</MsgId>
</xml>`;
    const opts = {...builderDefaults};
    opts.renderOpts = {pretty: true, indent: '    '};
    const builder = new Builder(opts);
    const obj = {"xml": {"MsgId": ["5850440872586764820"]}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test headless option', () => {
    const expected = `\
<xml>
    <MsgId>5850440872586764820</MsgId>
</xml>`;
    const opts = {...builderDefaults};
    opts.renderOpts = {pretty: true, indent: '    '};
    opts.headless = true;
    const builder = new Builder(opts);
    const obj = {"xml": {"MsgId": ["5850440872586764820"]}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test allowSurrogateChars option', () => {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
    <MsgId>\uD83D\uDC33</MsgId>
</xml>`;
    const opts = {...builderDefaults};
    opts.renderOpts = {pretty: true, indent: '    '};
    opts.allowSurrogateChars = true;
    const builder = new Builder(opts);
    const obj = {"xml": {"MsgId": ["\uD83D\uDC33"]}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test explicit rootName is always used: 1. when there is only one element', () => {
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><FOO><MsgId>5850440872586764820</MsgId></FOO>';
    const opts = {...builderDefaults};
    opts.renderOpts = {pretty: false};
    opts.rootName = 'FOO';
    const builder = new Builder(opts);
    const obj = {"MsgId": ["5850440872586764820"]};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test explicit rootName is always used: 2. when there are multiple elements', () => {
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><FOO><MsgId>5850440872586764820</MsgId></FOO>';
    const opts = {...builderDefaults};
    opts.renderOpts = {pretty: false};
    opts.rootName = 'FOO';
    const builder = new Builder(opts);
    const obj = {"MsgId": ["5850440872586764820"]};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test default rootName is used when there is more than one element in the hash', () => {
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root><MsgId>5850440872586764820</MsgId><foo>bar</foo></root>';
    const opts = {...builderDefaults};
    opts.renderOpts = {pretty: false};
    const builder = new Builder(opts);
    const obj = {"MsgId": ["5850440872586764820"], "foo": "bar"};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test when there is only one first-level element in the hash, that is used as root', () => {
    const expected = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><first><MsgId>5850440872586764820</MsgId><foo>bar</foo></first>';
    const opts = {...builderDefaults};
    opts.renderOpts = {pretty: false};
    const builder = new Builder(opts);
    const obj = {"first": {"MsgId": ["5850440872586764820"], "foo": "bar"}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);

  });

  it('test parser -> builder roundtrip', () => {
    const fileName = path.join(__dirname, '/fixtures/build_sample.xml');
    return fs.readFile(fileName, function (err, xmlData) {
      const xmlExpected = xmlData.toString();
      const parserOpts = {...parserDefaults};
      parserOpts.trim = true;
      return parseString(xmlData, parserOpts, function (err, obj) {
        expect(err).to.equals(null);
        const builder = new Builder(builderDefaults);
        const xmlActual = builder.buildObject(obj);
        expect(xmlExpected).to.equals(xmlActual);
      });
    });
  });

  it('test building obj with undefined value', () => {
    const obj = {node: 'string', anothernode: undefined};
    const opts = {...builderDefaults};
    opts.renderOpts = {pretty: false};
    const builder = new Builder(opts);
    const actual = builder.buildObject(obj);
    const expected =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root><node>string</node><anothernode/></root>';
    expect(actual).to.equals(expected);
  });

  it('test building obj with null value', () => {
    const obj = {node: 'string', anothernode: null};
    const opts = {...builderDefaults};
    opts.renderOpts = {pretty: false};
    const builder = new Builder(opts);
    const actual = builder.buildObject(obj);
    const expected =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root><node>string</node><anothernode/></root>';
    expect(actual).to.equals(expected);
  });

  it('test escapes escaped characters', () => {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
 <MsgId>&amp;amp;&amp;lt;&amp;gt;</MsgId>
</xml>`;
    const builder = new Builder(builderDefaults);
    const obj = {"xml": {"MsgId": ["&amp;&lt;&gt;"]}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test cdata text nodes', () => {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
 <MsgId><![CDATA[& <<]]></MsgId>
</xml>`;
    const opts = {...builderDefaults};
    opts.cdata = true;
    const builder = new Builder(opts);
    const obj = {"xml": {"MsgId": ["& <<"]}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test cdata text nodes with escaped end sequence', () => {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
 <MsgId><![CDATA[& <<]]]]><![CDATA[>]]></MsgId>
</xml>`;
    const opts = {...builderDefaults};
    opts.cdata = true;
    const builder = new Builder(opts);
    const obj = {"xml": {"MsgId": ["& <<]]>"]}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);

  });

  it('test uses cdata only for chars &, <, >', () => {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
 <MsgId><![CDATA[& <<]]></MsgId>
 <Message>Hello</Message>
</xml>`;
    const opts = {...builderDefaults};
    opts.cdata = true;
    const builder = new Builder(opts);
    const obj = {"xml": {"MsgId": ["& <<"], "Message": ["Hello"]}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);

  });

  it('test uses cdata for string values of objects', () => {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
 <MsgId><![CDATA[& <<]]></MsgId>
</xml>`;
    const opts = {...builderDefaults};
    opts.cdata = true;
    const builder = new Builder(opts);
    const obj = {"xml": {"MsgId": "& <<"}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);

  });

  it('test does not error on non string values when checking for cdata', () => {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
 <MsgId>10</MsgId>
</xml>`;
    const opts = {...builderDefaults};
    opts.cdata = true;
    const builder = new Builder(opts);
    const obj = {"xml": {"MsgId": 10}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test does not error on array values when checking for cdata', () => {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xml>
 <MsgId>10</MsgId>
 <MsgId>12</MsgId>
</xml>`;
    const opts = {...builderDefaults};
    opts.cdata = true;
    const builder = new Builder(opts);
    const obj = {"xml": {"MsgId": [10, 12]}};
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });

  it('test building obj with array', () => {
    const expected = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<root>
 <MsgId>10</MsgId>
 <MsgId2>12</MsgId2>
</root>`;
    const opts = {...builderDefaults};
    opts.cdata = true;
    const builder = new Builder(opts);
    const obj = [{"MsgId": 10}, {"MsgId2": 12}];
    const actual = builder.buildObject(obj);
    expect(actual).to.equals(expected);
  });
});
