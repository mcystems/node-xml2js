import * as processors from '../src/processors';
import {FirstCharLowerCaseProcessor, NormalizeProcessor} from '../src/processors';
import {parseString} from "../src/parser";
import {ElementValueProcessor, parserDefaults} from "../src/defaults";
import {expect} from 'chai';
import {oc} from "ts-optchain";

const parseNumbersExceptAccount: ElementValueProcessor = {
  process(value: string, name: string): string {
    if (name === 'accountNumber') {
      return value;
    }
    return processors.parseNumbers(value);
  }
};

describe('processors tests', () => {
  it('test normalize', () => {
    const demo = 'This shOUld BE loWErcase';
    const result = new NormalizeProcessor().process(demo);
    expect(result).to.equals('this should be lowercase');
  });

  it('test firstCharLowerCase', () => {
    const demo = 'ThiS SHould OnlY LOwercase the fIRST cHar';
    const result = new FirstCharLowerCaseProcessor().process(demo);
    expect(result).to.equals('thiS SHould OnlY LOwercase the fIRST cHar');
  });

  it('test stripPrefix', () => {
    const demo = 'stripMe:DoNotTouch';
    const result = processors.stripPrefix(demo);
    expect(result).to.equals('DoNotTouch');
  });

  it('test stripPrefix, ignore xmlns', () => {
    const demo = 'xmlns:shouldHavePrefix';
    const result = processors.stripPrefix(demo);
    expect(result).to.equals('xmlns:shouldHavePrefix');
  });

  it('test parseNumbers', () => {
    expect(processors.parseNumbers('0')).to.equals(0);
    expect(processors.parseNumbers('123')).to.equals(123);
    expect(processors.parseNumbers('15.56')).to.equals(15.56);
    expect(processors.parseNumbers('10.00')).to.equals(10);
  });

  it('test parseBooleans', () => {
    expect(processors.parseBooleans('true')).to.equals(true);
    expect(processors.parseBooleans('True')).to.equals(true);
    expect(processors.parseBooleans('TRUE')).to.equals(true);
    expect(processors.parseBooleans('false')).to.equals(false);
    expect(processors.parseBooleans('False')).to.equals(false);
    expect(processors.parseBooleans('FALSE')).to.equals(false);
    expect(processors.parseBooleans('truex')).to.equals('truex');
    expect(processors.parseBooleans('xtrue')).to.equals('xtrue');
    expect(processors.parseBooleans('x')).to.equals('x');
    expect(processors.parseBooleans('')).to.equals('');
  });

  it('test a processor that filters by node name', async () => {
    const xml = '<account><accountNumber>0012345</accountNumber><balance>123.45</balance></account>';
    const options = {...parserDefaults, valueProcessors: [parseNumbersExceptAccount], explicitArray: false};
    const parsed = await parseString(xml, options);
    expect(oc(parsed).account.accountNumber).to.deep.equal('0012345');
    expect(oc(parsed).account.balance).to.equals(123.45);
  });

  it('test a processor that filters by attr name', async () => {
    const xml = '<account accountNumber="0012345" balance="123.45" />';
    const options = {...parserDefaults, attrValueProcessors: [parseNumbersExceptAccount]};
    const parsed = await parseString(xml, options);
    expect(oc(parsed).account.$.accountNumber).to.equals('0012345');
    expect(oc(parsed).account.$.balance).to.equals(123.45);
  });
});
