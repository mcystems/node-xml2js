/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
"use strict";

const defaults = require('./defaults');
const builder = require('./builder');
const parser = require('./parser');
const processors = require('./processors');

module.exports.defaults = defaults.defaults;

module.exports.processors = processors;

module.exports.ValidationError = class ValidationError extends Error {
  constructor(message) {
    super();
    this.message = message;
  }
};

module.exports.Builder = builder.Builder;

module.exports.Parser = parser.Parser;

module.exports.parseString = parser.parseString;
