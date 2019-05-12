"use strict";

// matches all xml prefixes, except for `xmlns:`
const prefixMatch = new RegExp(/(?!xmlns)^.*:/);

exports.normalize = str => str.toLowerCase();

exports.firstCharLowerCase = str => str.charAt(0).toLowerCase() + str.slice(1);

exports.stripPrefix = str => str.replace(prefixMatch, '');

exports.parseNumbers = function(str) {
  if (!isNaN(str)) {
    str = (str % 1) === 0 ? parseInt(str, 10) : parseFloat(str);
  }
  return str;
};

exports.parseBooleans = function(str) {
  if (/^(?:true|false)$/i.test(str)) {
    str = str.toLowerCase() === 'true';
  }
  return str;
};
