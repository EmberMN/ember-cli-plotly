import { helper } from '@ember/component/helper';

/// This is admittedly kind-of lame.
/// This function merely peeks at all the parameters passed to it (shallowly)
/// for the purpose of triggering any corresponding getters
/// (so that they get recomputed if they're out of date)
export default helper(function lookButDoNotTouch(positional, named) {
  let unusedThing;
  for (const thing of positional) {
    unusedThing = thing;
  }
  for (const thing of Object.values(named)) {
    unusedThing = thing; // eslint-disable-line no-unused-vars
  }
  return undefined;
});
