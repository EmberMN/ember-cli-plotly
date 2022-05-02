import { helper } from '@ember/component/helper';

/// This function merely peeks at all the parameters passed to it (shallowly)
/// for the purpose of triggering any corresponding getters
/// (so that they get recomputed if they're out of date)

var lookButDoNotTouch = helper(function lookButDoNotTouch(positional, named) {

  for (const thing of positional) {
  }

  for (const thing of Object.values(named)) {
  }

  return undefined;
});

export { lookButDoNotTouch as default };
