import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { clearRender, render, settled } from '@ember/test-helpers';
import clickOver from 'dummy/tests/helpers/click-over';

import hbs from 'htmlbars-inline-precompile';
import debug from 'debug';
const log = debug('ember-cli-plotly:test');

// FIXME: wrong path?
import Plotly from 'plotly.js';

module('Integration | Component | plotly', function (hooks) {
  setupRenderingTest(hooks);

  const barLayerSelector = 'svg > g.cartesianlayer > g > g.plot > g.barlayer';
  const scatterLayerSelector =
    'svg > g.cartesianlayer > g > g.plot > g.scatterlayer';
  const legendEntrySelector = 'g.infolayer > g.legend > g > g > g';

  test('it renders', async function (assert) {
    await render(hbs`<Plotly />`);
    assert.equal(
      this.element.querySelectorAll('div.plot-container').length,
      1,
      'Plotly.js should have created a .plot-container element inside its div'
    );
    assert.equal(
      this.element.querySelectorAll('.svg-container').length,
      1,
      'Plotly should generate an element with class svg-container'
    );
  });

  test('it clears', async function (assert) {
    await render(hbs`<Plotly />`);
    await clearRender();
    // TODO: See if we can confirm that Plotly.purge gets called
    assert.equal(
      this.element.querySelectorAll('div.plotly-container').length,
      0,
      'The .plotly-container element should be gone after clearing the render'
    );
  });

  test('it draws a simple scatter chart', async function (assert) {
    const traces = [
      {
        x: [1, 2, 3],
        y: [2, 4, 6],
        type: 'scatter',
      },
      {
        x: [-1, 10],
        y: [-2, -20],
        type: 'scatter',
      },
    ];
    this.set('traces', traces);
    await render(hbs`<Plotly @data={{this.traces}} />`);
    assert.strictEqual(
      this.element.querySelectorAll(legendEntrySelector).length,
      2,
      'Legend should containe 2 entries'
    );
    assert.ok(
      this.element.querySelector(scatterLayerSelector),
      'Plot should contain scatterLayer'
    );
    assert.strictEqual(
      this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter`)
        .length,
      2,
      'There should be 2 scatter traces'
    );
    assert.strictEqual(
      this.element.querySelectorAll(
        `${scatterLayerSelector} g.trace.scatter:first-child > g.points > path`
      ).length,
      3,
      'First trace should have 3 points'
    );
    assert.strictEqual(
      this.element.querySelectorAll(
        `${scatterLayerSelector} g.trace.scatter:last-child > g.points > path`
      ).length,
      2,
      'Second trace should have 2 points'
    );
  });

  // TODO: test resize

  test('it forwards plotly_click event to arg-specific handler', async function (assert) {
    const done = assert.async();
    assert.expect(2); // First check the dot's existence, then make sure we got the click event

    this.setProperties({
      // Put a big dot at the origin
      data: [
        {
          x: [0],
          y: [0],
          type: 'scatter',
          mode: 'markers',
          marker: {
            size: 32,
          },
        },
      ],
      layout: {},
      onPlotlyClick(eventData) {
        log(`onPlotlyClick fired`, eventData);
        assert.strictEqual(
          eventData?.points?.curveNumber,
          1,
          'Should receive plotly_click event on curveNumber 1'
        );
        done();
      },
    });
    await render(
      hbs`<Plotly
        @data={{this.data}}
        @layout={{this.layout}}
        @on={{hash
          plotly_click=this.onPlotlyClick
        }}
      />`);

    const dot = this.element.querySelector(
      'svg.main-svg > g.cartesianlayer > g > g.plot > g.scatterlayer > g > g.points > path'
    );
    assert.ok(dot, 'Found marker/dot element (virtual click target)');
    await clickOver(dot);
  });

  test('it updates the chart when the source data changes', async function (assert) {
    // Start by creating a simple, 2-point scatter plot (just 1 series/trace)
    const traces = [
      {
        x: [0, 1],
        y: [0, 1],
        type: 'scatter',
      },
    ];
    this.set('traces', traces);
    await render(hbs`<Plotly @traces={{this.traces}} />`);
    assert.ok(
      this.element.querySelector(scatterLayerSelector),
      'Plot should contain scatterLayer'
    );
    assert.strictEqual(
      this.element.querySelectorAll(
        `${scatterLayerSelector} g.trace.scatter > g.points > path`
      ).length,
      2,
      'Trace should have 2 points'
    );
    assert.strictEqual(
      this.element.querySelectorAll(legendEntrySelector).length,
      0,
      'There should be no legend entry (since there is only 1 trace)'
    );

    log('Add another point to that single series');
    run(() => {
      traces.get('firstObject.x').pushObject(2);
      traces.get('firstObject.y').pushObject(2);
    });
    await settled();
    assert.strictEqual(
      this.element.querySelectorAll(
        `${scatterLayerSelector} g.trace.scatter > g.points > path`
      ).length,
      3,
      'Trace should have 3 points after data updates'
    );
    assert.strictEqual(
      this.element.querySelectorAll(legendEntrySelector).length,
      0,
      'There should still be no legend entries'
    );

    log('push another trace');
    run(() => {
      traces.pushObject(
        EmberObject.create({
          x: A([-1, 0, 1]),
          y: A([1, 0, -1]),
          type: 'scatter',
        })
      );
    });
    await settled();
    assert.strictEqual(
      this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter`)
        .length,
      2,
      'There should be 2 traces now'
    );

    log('Remove a point from the second trace');
    run(() => {
      traces.get('1.x').removeAt(0);
      traces.get('1.y').removeAt(0);
    });
    await settled();
    assert.strictEqual(
      this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter`)
        .length,
      2,
      'There should be 2 traces now'
    );
    assert.strictEqual(
      this.element.querySelectorAll(legendEntrySelector).length,
      2,
      'There should be 2 legend entries now'
    );

    log('Change type of second trace to bar');
    run(() => {
      traces.set('1.type', 'bar');
    });
    await settled();
    assert.strictEqual(
      this.element.querySelectorAll(`${barLayerSelector} g.trace.bars`).length,
      1,
      'There should be 1 (bar) trace now'
    );
    assert.strictEqual(
      this.element.querySelectorAll(`${scatterLayerSelector} g.trace.scatter`)
        .length,
      1,
      'There should be 1 (scatter) trace now'
    );
  });
});
