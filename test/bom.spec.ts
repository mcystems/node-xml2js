import {parseString} from "../src/parser";
import {expect} from "chai";

describe('BOM tests', () => {
  it('test decoded BOM', () => {
    const demo = '\uFEFF<xml><foo>bar</foo></xml>';
    return parseString(demo, function (err, res) {
      expect(err).eq(null);
      expect(res.xml.foo[0]).equals('bar');
    });
  });
});

