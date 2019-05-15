// matches all xml prefixes, except for `xmlns:`
import {ElementNameProcessor} from "./defaults";

const prefixMatch = new RegExp(/(?!xmlns)^.*:/);

export class NormalizeProcessor implements ElementNameProcessor {
  process(str: string): string {
    return str.toLowerCase();
  }
}

export class FirstCharLowerCaseProcessor implements ElementNameProcessor {
  process(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}
export const stripPrefix = str => str.replace(prefixMatch, '');

export const parseNumbers = function(str) {
  if (!isNaN(str)) {
    str = (str % 1) === 0 ? parseInt(str, 10) : parseFloat(str);
  }
  return str;
};

export const parseBooleans = function(str) {
  if (/^(?:true|false)$/i.test(str)) {
    str = str.toLowerCase() === 'true';
  }
  return str;
};
