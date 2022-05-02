import { helper } from '@ember/component/helper';

var printJson = helper(function printJson(positional, named) {
  //console.log(JSON.stringify({ positional, named }, null, 2));
  //setTimeout(() => console.log('print-json', ...positional.map((x) => JSON.stringify(x))), 200);
  const [obj] = positional;
  return JSON.stringify(obj, null, 2);
});

export { printJson as default };
