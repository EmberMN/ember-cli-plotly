import Component from '@ember/component';
import EmberObject, { computed, observer } from '@ember/object';
import { map } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';

import layout from '../templates/components/plot-ly';

import { extend } from 'lodash';
import Plotly from 'plotly';
import md5 from 'md5';
import debug from 'debug';
const log = debug('ember-cli-plotly:plot-ly-component');

// TODO: Make configurable via ENV
// https://github.com/plotly/plotly.js/blob/5bc25b490702e5ed61265207833dbd58e8ab27f1/src/plot_api/plot_config.js#L22-L184
const defaultOptions = {
  staticPlot: false,
  editable: true,
  edits: {
    annotationPosition: false,
    annotationTail: false,
    annotationText: false,
    axisTitleText: false,
    colorbarPosition: false,
    colorbarTitleText: false,
    legendPosition: false,
    legendText: false,
    shapePosition: false,
    titleText: false
  },
  autosizable: false,
  queueLength: 0,
  fillFrame: false,
  frameMargins: 0,
  scrollZoom: false,
  doubleClick: 'reset+autosize',
  showTips: false,
  showAxisDragHandles: true,
  showAxisRangeEntryBoxes: true,
  showLink: false,
  sendData: true,
  linkText: 'Edit chart',
  showSources: false,
  displayModeBar: 'hover',
  modeBarButtonsToRemove: ['sendDataToCloud'],
  modeBarButtonsToAdd: [],
  modeBarButtons: false,
  displaylogo: true,
  plotGlPixelRatio: 2,
  setBackground: 'transparent',
  topojsonURL: 'https://cdn.plot.ly/',
  mapboxAccessToken: null,
  globalTransforms: [],
  locale: 'en-US',
};

const Trace = EmberObject.extend({
  x: null,
  y: null,
  hash: computed('x.[]', 'y.[]', {
    get() {
      //debugger;
      return [
        this.get('x').reduce(md5),
        this.get('y').reduce(md5)
      ].reduce(md5);
    }
  })
});

export default Component.extend({
  layout,
  init() {
    log('init');
    this._super(...arguments);
  },
  didReceiveAttrs() {
    log('didReceiveAttrs');

    const traces = this.get('traces') || [];
    const replotEveryTime = this.get('replotEveryTime') || false;
    if (!replotEveryTime) {
      const _hashes = this.get('_hashes') || {};

      // 1 - compute hash of each trace
      //     --> md5(JSON.stringify(Array.from(input_trace)))
      // 2 - store
      //
      this.set('_hashes', _hashes);
    }
    this.setProperties({
      traces,
      title: this.get('title') || '',
      xaxis: this.get('xaxis') || {},
      yaxis: this.get('yaxis') || {},
      options: extend(defaultOptions, this.get('options'))
    });
  },
  didInsertElement() {
    log('didInsertElement');
    //scheduleOnce('afterRender', this, '_newPlot');
  },
  didRender() {
    log('didRender');
    // FIXME: Do we really have to re-draw the whole thing when we add/remove a trace?
    scheduleOnce('afterRender', this, '_newPlot');
  },
  _traces: map('traces', function(item) {
    log('_traces map running');
    return Trace.create(item);
  }),
  _debug: observer('_traces.@each.hash', function() {
    log('_traces.@each.hash fired');
  }),

  _newPlot() {
    log('_newPlot');
    const id = this.elementId;
    const data = this.get('traces').reduce((data, trace) => {
      data.push({
        x: trace.x,
        y: trace.y,
        type: trace.type
      });
      return data;
    }, []);
    const layout = {
      title: this.get('title'),
      xaxis: this.get('xaxis'),
      yaxis: this.get('yaxis')
    };
    const options = this.get('options');
    Plotly.newPlot(id, data, layout, options).then(() => {
      log('newPlot finished');
    });
  },
  _addRemoveTrace(index) {
    log('_addRemoveTrace', index);
    const id = this.elementId;
    const trace = this.get('traces').objectAt(index);
    Plotly.deleteTraces(id, index).then(() => {
      log('Plotly.deleteTraces finished');
      return Plotly.addTraces(id, trace, index);
    }).then(() => {
      log('Plotly.addTraces finished');
      //debugger;
    });
  },
  actions: {
    traceDataChanged(index) {
      log('traceDataChanged', index);
      scheduleOnce('render', this, '_addRemoveTrace', index);
    },
    traceTypeChanged(index) {
      log('traceTypeChanged', index);
      const id = this.elementId;
      const type = this.get('traces').objectAt(index).get('type');
      Plotly.update(id, { type }).then(() => {
        log('Plotly.update finished');
      });
    }
  }
});
