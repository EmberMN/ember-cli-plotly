import { helper } from '@ember/component/helper';
import safeStringify from 'safe-json-stringify';

export function jsonStringify(params, { spaces = 2 }) {
  //return JSON.stringify(params[0], null, spaces);
  //const startTime = Date.now();
  //const result = safeStringify(params[0], null, spaces);
  //const endTime = Date.now();
  //console.log(`jsonStringify took ${endTime - startTime}ms`);
  return safeStringify(params[0], null, spaces);
}

export default helper(jsonStringify);
