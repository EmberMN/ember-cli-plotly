import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | plotly-trace', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders (nothing)', async function(assert) {
    await render(hbs`{{plotly-trace}}`);
    assert.equal(this.element.textContent.trim(), '', "Shouldn't generate any DOM elements");

    // Template block usage:
    await render(hbs`
      {{#plotly-trace}}
        template block text
      {{/plotly-trace}}
    `);

    assert.equal(this.element.textContent.trim(), '', "Shouldn't generate any DOM elements");
  });
});
