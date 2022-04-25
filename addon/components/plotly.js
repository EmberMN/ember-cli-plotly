import Component from '@glimmer/component';
import { action } from '@ember/object';
import Ember from 'ember';

import { debounce, scheduleOnce } from '@ember/runloop';
import { buildWaiter } from '@ember/test-waiters';
const waiter = buildWaiter('ember-cli-plotly:component-loaded');

// TODO: It would be nice if we could automatically build/pack
//       the parts of plotly we need/use when webpack runs...
import Plotly from 'plotly.js/dist/plotly';

import { getLoggingFunctions } from 'ember-cli-plotly/utils/log';
const { log, logVerbose, warn } = getLoggingFunctions('ember-cli-plotly');

// TODO: Make configurable via ENV
// https://github.com/plotly/plotly.js/blob/5bc25b490702e5ed61265207833dbd58e8ab27f1/src/plot_api/plot_config.js#L22-L184
const defaultConfig = {
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
    titleText: false,
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

export const knownPlotlyEvents = [
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
].map((suffix) => `plotly_${suffix}`);

export default class PlotlyComponent extends Component {
  plotlyContainerElementId = `plotly-component-${Date.now()}-${Math.floor(
    10000 * Math.random()
  )}`;

  constructor(...args) {
    super(...args);
    log(`constructor running`);
    if (Ember.testing) {
      const token = waiter.beginAsync();
      plotly.finally(() => {
        waiter.endAsync(token);
      });
    }
    this._bindPlotlyEventListeners();
  }

  willDestroy() {
    log(`willDestroy`);
    super.willDestroy(...arguments);
    this._unbindPlotlyEventListeners();
  }

  // didInsertElement --> _newPlot
  // didUpdate --> _react
  // _triggerUpdate --> scheduleOnce('render', this, '_react');

  // Merge user-provided parameters with defaults
  //@computed('chartConfig', 'chartData', 'chartLayout', 'isResponsive', 'plotlyEvents')
  get _parameters() {
    const parameters = Object.assign(
      {},
      {
        chartData: this.args.chartData,
        chartLayout:
          this.args.chartLayout ||
          document.getElementById(this.plotlyContainerElementId)?.layout ||
          { datarevision: 0 },
        chartConfig: Object.assign(defaultConfig, this.args.chartConfig),
        isResponsive: !!this.args.isResponsive,
        plotlyEvents: this.args.plotlyEvents || [],
      }
    );
    log(`computing parameters =`, parameters);
    return parameters;
  }

  // TODO: Make throttling/debouncing/whatever more flexible/configurable
  _resizeEventHandler() {
    log('_resizeEventHandler');
    try {
      debounce(this, this._debouncedResizeEventHandler, 200);
    } catch (e) {
      warn(
        `_resizeEventHandler caught exception when calling debounce (not sure why this happens)`,
        e
      );
    }
  }

  _debouncedResizeEventHandler() {
    log(
      '_debouncedResizeEventHandler firing (scheduling _onResize to run after next render)'
    );
    scheduleOnce('afterRender', this, this._onResize);
  }

  _onResize() {
    log('_onResize firing');
    Plotly.Plots.resize(this.plotlyContainerElementId);
  }

  _boundResizeEventHandler() {} // overwritten in _bindPlotlyEventListeners
  _bindPlotlyEventListeners() {
    log(`_bindPlotlyEventListeners`);
    if (this._parameters.isResponsive) {
      this._boundResizeEventHandler = this._resizeEventHandler.bind(this);
      window.addEventListener('resize', this._boundResizeEventHandler);
    }
  }
  _unbindPlotlyEventListeners() {
    window.removeEventListener('resize', this._boundResizeEventHandler);
  }

  @action
  _newPlot() {
    logVerbose(`_newPlot running`);
    const id = this.plotlyContainerElementId;
    const { chartData, chartLayout, chartConfig } = this._parameters;
    this._unbindPlotlyEventListeners();
    log('About to call Plotly.newPlot');
    Plotly.newPlot(id, chartData, chartLayout, chartConfig)
      .then(() => {
        log('newPlot finished');
        this._bindPlotlyEventListeners();
        // TODO: Hook
      })
      .catch((e, ...args) => {
        warn(`Plotly.newPlot resulted in rejected promise`, e, ...args);
      });
  }

  @action
  async _react() {
    logVerbose(`_react running`);
    if (this.isDestroying) {
      warn(`_react aborting since component is (being) destroyed.`);
      return;
    }
    const id = this.plotlyContainerElementId;
    const { chartData, chartLayout, chartConfig } = this._parameters;
    // Force update
    log('About to call Plotly.react', chartData, chartLayout, chartConfig);
    try {
      await Plotly.react(id, chartData, chartLayout, chartConfig);
    } catch (e) {
      throw Error('Plotly.react failed', { cause: e });
    }
    log('react finished');
  }
}
