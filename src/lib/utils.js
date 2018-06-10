export function flattenDeep(array) {
  return array.reduce((acc, val) => Array.isArray(val) 
      ? acc.concat(flattenDeep(val)) 
      : acc.concat(val),
    []);
}
