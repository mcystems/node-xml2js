import {parseString} from "../src/parser";
import {expect} from "chai";
import {oc} from "ts-optchain";

describe('BOM tests', () => {
  it('test decoded BOM', async () => {
    const demo = '\uFEFF<xml><foo>bar</foo></xml>';
    const res = await parseString(demo);
    expect(oc(res).xml.foo[0]._()).equals('bar');
  });
});

