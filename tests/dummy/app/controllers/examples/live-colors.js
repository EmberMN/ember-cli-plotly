import Controller from '@ember/controller';
import { later } from '@ember/runloop';
import { action, computed } from '@ember-decorators/object';

import getNormalDistPDF from 'dummy/utils/get-normal-dist-pdf';

import * as debug from 'debug';
const log = debug('ember-cli-plotly:dummy:live-color');

//const interval = 0; // (go as fast as the plot can update)
const interval = 200;

const activeColor = '#01a0e1';
const passiveColor = '#959595';
const highlightColor = '#d474ff';

// Data to plot
const n = 101;
const x = new Array(n).fill(0).map((z,i) => 5*(2*i/(n-1) - 1)); // [-5, ..., 5]
const sourceData = [{
  name: "Group 1 (0,1)",
  mu: 0,
  sigma: 1,
  traces: 4,
  noiseFunction: y => y + 0.2*(2*(Math.random() ** 10) - 1),
  scaleFactor: 50
}, {
  name: "Group 2 (2,2)",
  mu: 2,
  sigma: 2,
  traces: 10,
  noiseFunction: (y, i) => y + 0.1*Math.sin(2*Math.PI*50*Math.random()*i/n),
  scaleFactor: 25
}].map(({ name, mu, sigma, traces, noiseFunction, scaleFactor }) => {
  const array = [];
  for (let i=0; i < traces; i++) {
    array.push({
      name: `${(i+1)} (${name})`,
      x,
      y: x.map(getNormalDistPDF(mu, sigma))
          .map(y => scaleFactor*y)
          .map(noiseFunction),
      mode: 'lines'
    });
  }
  return array;
}).reduce((array, set) => {
  set.forEach(s => array.push(s));
  return array;
}, []);

export default class ExamplesLiveColorsController extends Controller {
  _isHighlighted = sourceData.map(() => false);
  plotlyEvents = ['plotly_legenddoubleclick'];
  currentTrace = 1;  // Start on second trace
  currentIndex = 0;
  _updating = false;  // Don't start the timer until user clicks button
  _revision = 0;

  _triggerUpdate() {
    log(`_triggerUpdate incrementing _revision (${this._revision})`);
    //this.set('chartData.triggerUpdate', (this.get('chartData.triggerUpdate') || 0) + 1);
    this.incrementProperty('_revision');
  }

  update() {
    log('update firing');
    if (!this.get('_updating')) {
      return;
    }

    const currentTrace = this.get('currentTrace');
    const currentIndex = this.get('currentIndex');
    log(`Update called: currentTrace=${currentTrace}, currentIndex=${currentIndex}`, this.get(`chartData`));

    // Prepare to do next point
    if (currentIndex >= sourceData[currentTrace].x.length) {
      // Stop when we've plotted all the data
      if (currentTrace >= sourceData.length) {
        log(`currentIndex (${currentIndex}) >= sourceData[currentTrace].x.length (${currentIndex >= sourceData[currentTrace].x.length})`);
        this.set('_updating', false);
      }
      else {
        this.set('currentTrace', currentTrace + 1);
        this.set('currentIndex', 0);
      }
    }
    else {
      this.set('currentIndex', 1 + currentIndex);
    }

    this._triggerUpdate();
    if (this.get('_updating')) {
      later(this, 'update', interval);
    }
  }

  _toggleHighlighting(curveNumber) {
    log(`_toggleHighlighting(${curveNumber}) changing ${this._isHighlighted[curveNumber]} -> ${!this._isHighlighted[curveNumber]}`);
    this._isHighlighted[curveNumber] = !this._isHighlighted[curveNumber];
    this._triggerUpdate();
  }

  @computed('currentTrace', 'currentIndex', '_isHighlighted.[]', '_revision')
  get chartData() {
    const currentTrace = (() => {
      // FIXME: Shouldn't need to sanity check this
      let ct = this.get('currentTrace');
      if (ct >= sourceData.length) {
        ct = sourceData.length - 1;
      }
      return ct;
    })();
    const currentIndex = this.get('currentIndex');
    log(`Computing chartData (currentTrace=${currentTrace}, currentIndex=${currentIndex})`);
    // We're going to copy sourceData (don't modify it!) into our own var here where we can set colors, slice to animate, etc.
    // For improved performance we could maintain this state instead of rebuilding it every time
    const chartData = JSON.parse(JSON.stringify(sourceData)).slice(0, currentTrace + 1); // FIXME: sloppy
    chartData[currentTrace].x = chartData[currentTrace].x.slice(0, currentIndex + 1);
    chartData[currentTrace].y = chartData[currentTrace].y.slice(0, currentIndex + 1);

    // Apply styling
    chartData.forEach((trace, i, array) => {
      trace.line = trace.line || {};

      // Active/passive coloring
      if (i === array.length - 1) {
        // Last trace (= active trace)
        trace.line.color = activeColor;
      }
      else {
        trace.line.color = passiveColor;
      }

      // Highlight selected traces
      if (this._isHighlighted[i]) {
        trace.line.color = highlightColor;
        //trace.line.width = 3;
      }
    });

    // TODO: See if there's a cleaner way to update than by manually re-triggering when chartData is computed
    chartData.triggerUpdate = this._revision;

    return chartData;
  }

  @action
  clear() {
    log(`Clear clicked`);
    this.setProperties({
      currentTrace: 0,
      currentIndex: 0
    });
  }

  @action
  start() {
    log(`Start clicked`, this.get('_updating'));
    if (this.get('_updating') === false) {
      this.set('_updating', true);
      later(this, 'update', interval);
    }
  }

  @action
  stop() {
    log(`Stop clicked`);
    this.set('_updating', false);
  }

  @action
  onPlotlyEvent(eventName, eventData) {
    log(`onPlotlyEvent got ${eventName} -->`, eventData);
    if (typeof this.plotlyEventHandlers[eventName] === 'function') {
      return this.plotlyEventHandlers[eventName].call(this, eventData);
    }
  }

  plotlyEventHandlers = {
    plotly_legenddoubleclick(eventData) {
      this._toggleHighlighting(eventData.curveNumber);
      return false; // prevent default behavior (hiding all other traces)
    }
  };
}
