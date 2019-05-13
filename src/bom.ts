export function stripBOM(str: string) {
  if (str[0] === '\uFEFF') {
    return str.substring(1);
  } else {
    return str;
  }
}
