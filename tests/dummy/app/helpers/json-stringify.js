import { helper } from '@ember/component/helper';
//import { htmlSafe } from '@ember/string';

export function jsonStringify(params, { spaces=2 }) {
  return JSON.stringify(params[0], null, spaces);
}

export default helper(jsonStringify);
