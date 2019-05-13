/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const xml2js = require('../src/xml2js');
const assert = require('assert');
const equ = assert.strictEqual;

module.exports = {
  'test decoded BOM': function (test) {
    const demo = '\uFEFF<xml><foo>bar</foo></xml>';
    return xml2js.parseString(demo, function(err, res) {
      equ(err, null);

      equ(res.xml.foo[0], 'bar');
      return test.done();
    });
  }
};