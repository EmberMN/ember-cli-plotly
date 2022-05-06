import { helper } from '@ember/component/helper';

export default helper(function printJson(positional, named) {
  const [obj] = positional;
  return JSON.stringify(obj, null, named.spaces ?? 2);
});
