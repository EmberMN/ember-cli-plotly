import { A } from '@ember/array';
import Component from '@ember/component';
import EmberObject, { observer } from '@ember/object';
import { computed } from '@ember-decorators/object';
import { debounce, scheduleOnce } from '@ember/runloop';

import layout from '../templates/components/plot-ly';

import Plotly from 'plotly.js';
import debug from 'debug';

const log = debug('ember-cli-plotly:plot-ly-component');
const warn = debug('ember-cli-plotly:plot-ly-component');
/* eslint-disable no-console */
warn.log = console.warn.bind(console);
/* eslint-enable no-console */

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

const knownPlotlyEvents = [
  'afterplot',
  'animated',
  'autosize',
  'click',
  'deselect',
  'doubleclick',
  'hover',
  'legendclick',
  'legenddoubleclick',
  'redraw',
  'relayout',
  'restyle',
  'selected',
  'selecting',
  'unhover',
].map(suffix => `plotly_${suffix}`);

export default class PlotlyComponent extends Component.extend({
  // TODO: Use @observes decorator once it is available
  _logUnrecognizedPlotlyEvents: observer('plotlyEvents.[]', function() {
    const plotlyEvents = this.get('plotlyEvents');
    if (plotlyEvents && typeof plotlyEvents.forEach === 'function') {
      plotlyEvents.forEach(eventName => {
        if (!knownPlotlyEvents.find(name => name === eventName)) {
          warn(`Passing unrecognized plotly event: '${eventName}'`);
        }
      });
    }
    else {
      log(`plotlyEvents does not appear to be an array`, plotlyEvents);
    }
  }),

  _triggerUpdate: observer('chartData.triggerUpdate', function() {
    log(`_triggerUpdate observer firing`);
    scheduleOnce('render', this, '_react');
  })
}) {

  constructor(...args) {
    super(...args);
    this.set('layout', layout);
    this.set('_resizeEventHandler', () => {
      log('_resizeEventHandler');
      debounce(this, () => {
        log('debounced _resizeEventHandler');
        scheduleOnce('afterRender', this, '_onResize');
      }, 200);  // TODO: Make throttling/debouncing/whatever more flexible/configurable
    });
    this._logUnrecognizedPlotlyEvents();
  }

  // Consumers should override this if they want to handle plotly_events
  onPlotlyEvent(eventName, ...args) {
    log('onPlotlyEvent fired (does nothing since it was not overridden)', eventName, ...args);
  }

  // Lifecycle hooks
  didInsertElement() {
    log('didInsertElement called -- will call _newPlot');
    scheduleOnce('render', this, '_newPlot');
  }

  didUpdate() {
    log('didUpdate called -- will call _react', this);
    scheduleOnce('render', this, '_react');
  }

  willDestroyElement() {
    log('willDestroyElement called -- unbinding event listeners and calling Plotly.purge');
    this._unbindPlotlyEventListeners();
    Plotly.purge(this.elementId);
  }

  // Private
  // Merge user-provided parameters with defaults
  @computed('chartData', 'chartLayout', 'chartOptions', 'isResponsive', 'plotlyEvents')
  get _parameters() {
    const parameters = Object.assign({}, {
      chartData: this.get('chartData') || A(),
      chartLayout: this.get('chartLayout') || EmberObject.create(),
      chartOptions: Object.assign(defaultOptions, this.get('chartOptions')),
      isResponsive: !!this.get('isResponsive'),
      plotlyEvents: this.get('plotlyEvents') || []
    });
    log(`computing parameters =`, parameters);
    return parameters;
  }

  _onResize() {
    log('_onResize');
    Plotly.Plots.resize(this.elementId);
  }

  _bindPlotlyEventListeners() {
    if (this.get('_parameters.isResponsive')) {
      window.addEventListener('resize', this._resizeEventHandler);
    }

    const plotlyEvents = this.getWithDefault('plotlyEvents', []);
    log('_bindPlotlyEventListeners', plotlyEvents, this.element);
    plotlyEvents.forEach((eventName) => {
      // Note: Using plotly.js' 'on' method (copied from EventEmitter)
      this.element.on(eventName, (...args) => this.onPlotlyEvent(eventName, ...args));
    });
  }

  _unbindPlotlyEventListeners() {
    window.removeEventListener('resize', this._resizeEventHandler);
    const events = this.getWithDefault('plotlyEvents', []);
    log('_unbindPlotlyEventListeners', events, this.element);
    events.forEach((eventName) => {
      // Note: Using plotly.js' 'removeListener' method (copied from EventEmitter)
      if (typeof this.element.removeListener === 'function') {
        this.element.removeListener(eventName, this.onPlotlyEvent);
      }
    });
  }

  _isDomElementBad() {
    return !this.element || !this.elementId || this.get('isDestroying') || this.get('isDestroyed');
  }

  _newPlot() {
    if (this._isDomElementBad()) {
      warn(`_newPlot aborting since element (or its ID) is not available or component is (being) destroyed.`);
      return;
    }
    const id = this.elementId;
    const { chartData, chartLayout, chartOptions } = this.get('_parameters');
    this._unbindPlotlyEventListeners();
    log('About to call Plotly.newPlot');
    Plotly.newPlot(id, chartData, chartLayout, chartOptions).then(() => {
      log('newPlot finished');
      this._bindPlotlyEventListeners();
      // TODO: Hook
    });
  }

  _react() {
    if (this._isDomElementBad()) {
      warn(`_updateChart aborting since element (or its ID) is not available or component is (being) destroyed.`);
      return;
    }
    const id = this.elementId;
    const { chartData, chartLayout, chartOptions } = this.get('_parameters');
    log('About to call Plotly.react', chartData[0].x, chartData[0].y);
    chartLayout.datarevision = chartLayout.datarevision + 1; // Force update
    Plotly.react(id, chartData, chartLayout, chartOptions).then(() => {
      log('react finished');
      // TODO: Hook
    });
  }
}
