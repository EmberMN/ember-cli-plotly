import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { clearRender, render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import debug from 'debug';
const log = debug('ember-cli-plotly:test');

module('Integration | Component | plot-ly', function (hooks) {
  setupRenderingTest(hooks);

  const barLayerSelector = 'svg > g.cartesianlayer > g > g.plot > g.barlayer';
  const scatterLayerSelector = 'svg > g.cartesianlayer > g > g.plot > g.scatterlayer';
  const legendEntrySelector = 'g.infolayer > g.legend > g > g > g';

  test('it renders', async function (assert) {
    await render(hbs`{{plot-ly}}`);
    assert.equal(this.element.querySelectorAll('div.plot-container').length, 1,
      'Plotly.js should have created a .plot-container element inside its div');
    assert.equal(this.element.querySelectorAll('.svg-container').length,
      1, 'Plotly should generate an element with class svg-container');
  });

  test('it clears', async function (assert) {
    await render(hbs`{{plot-ly}}`);
    await clearRender();
    // TODO: See if we can confirm that Plotly.purge gets called
    assert.equal(this.element.querySelectorAll('div.plotly-container').length, 0,
      'The .plotly-container element should be gone after clearing the render');
  });


  test('it draws a simple scatter chart', async function (assert) {
    const traces = [{
      x: [1, 2, 3],
      y: [2, 4, 6],
      type: 'scatter'
    }, {
      x: [-1, 10],
      y: [-2, -20],
      type: 'scatter'
    }];
    this.set('traces', traces);
    await render(hbs`{{plot-ly traces=traces}}`);
    assert.equal(this.element.querySelectorAll(legendEntrySelector).length,
      2, 'Legend should containe 2 entries');
    assert.ok(this.element.querySelector(scatterLayerSelector), 'Plot should contain scatterLayer');
    assert.equal(this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter`).length,
      2, 'There should be 2 scatter traces');
    assert.equal(this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter:first-child > g.points > path`).length,
      3, 'First trace should have 3 points');
    assert.equal(this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter:last-child > g.points > path`).length,
      2, 'Second trace should have 2 points');
  });

  test('it updates the chart when the source data changes', async function (assert) {
    log('Start by creating a simple, 2-point scatter plot (just 1 series/trace)');
    const traces = A([EmberObject.create({
      x: A([0, 1]),
      y: A([0, 1]),
      type: 'scatter'
    })]);
    this.set('traces', traces);
    await render(hbs`{{plot-ly traces=traces}}`);
    assert.ok(this.element.querySelector(scatterLayerSelector), 'Plot should contain scatterLayer');
    assert.equal(this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter > g.points > path`).length,
      2, 'Trace should have 2 points');
    assert.equal(this.element.querySelectorAll(legendEntrySelector).length,
      0, 'There should be no legend entry (since there is only 1 trace)');


    log('Add another point to that single series');
    run(() => {
      traces.get('firstObject.x').pushObject(2);
      traces.get('firstObject.y').pushObject(2);
    });
    await settled();
    assert.equal(this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter > g.points > path`).length,
      3, 'Trace should have 3 points after data updates');
    assert.equal(this.element.querySelectorAll(legendEntrySelector).length,
      0, 'There should still be no legend entries');

    log('push another trace');
    run(() => {
      traces.pushObject(EmberObject.create({
        x: A([-1, 0, 1]),
        y: A([1, 0, -1]),
        type: 'scatter'
      }));
    });
    await settled();
    assert.equal(this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter`).length,
      2, 'There should be 2 traces now');

    log('Remove a point from the second trace');
    run(() => {
      traces.get('1.x').removeAt(0);
      traces.get('1.y').removeAt(0);
    });
    await settled();
    assert.equal(this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter`).length,
      2, 'There should be 2 traces now');
    assert.equal(this.element.querySelectorAll(legendEntrySelector).length,
      2, 'There should be 2 legend entries now');

    log('Change type of second trace to bar');
    run(() => {
      traces.set('1.type', 'bar');
    });
    await settled();
    assert.equal(this.element.querySelectorAll(`${barLayerSelector} g.trace.bars`).length,
      1, 'There should be 1 (bar) trace now');
    assert.equal(this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter`).length,
      1, 'There should be 1 (scatter) trace now');
  });
});
