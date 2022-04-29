import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce, scheduleOnce } from '@ember/runloop';

// TODO: It would be nice if we could automatically build/pack
//       the parts of plotly we need/use when webpack runs...
//       Some users want to lazy-load Plotly later, which
//       using Embroider / v2 addon format should eventually help
import Plotly from 'plotly.js/dist/plotly';

import config from 'ember-get-config';
const ecPlotlyOptions = config.environment['ember-cli-plotly'] ?? {
  defaultConfig: {},
  defaultLayout: {},
};

import { getLoggingFunctions } from 'ember-cli-plotly/utils/log';
const { log, logVerbose, warn } = getLoggingFunctions('ember-cli-plotly');

// Args:
//   @chartConfig=(config object per Plotly.js API)
//      ^^^ inherits from config.environment['ember-cli-plotly'].defaultConfig
//   @chartData=(data object per Plotly.js API)
//   @chartLayout=(layout object per Plotly.js API)
//      ^^^ inherits from config.environment['ember-cli-plotly'].defaultLayout
//   @on={{hash eventName=handlerFunction}}
//   (the following all inherit from corresponding config.environment['ember-cli-plotly'] keys)
//   @debounceInterval
//   @watchChartDataForUpdates ?
//   TODO: should we take a function that we'll call with a forceUpdate function consuming app can call?
export default class PlotlyComponent extends Component {
  @tracked _showStateForDebugging = false;

  // Internal state for deciding whether to call Plotly.react or Plotly.newPlot
  hasCreatedPlot = false;
  @tracked
  plotlyContainerElementId = `plotly-component-${Date.now()}-${Math.floor(
    10000 * Math.random()
  )}`;

  get resizeDebounceInterval() {
    return this.args.chartLayout ?? ecPlotlyOptions.resizeDebounceInterval;
  }
  @tracked
  options = {
    debounceInterval: 50, // shared for both chartData update & window resize
    isResponsive: true,
    watchChartDataForUpdates: true,
    ...ecPlotlyOptions,
  };

  // Merge user-provided parameters with defaults
  get chartConfig() {
    return {
      ...ecPlotlyOptions.defaultPlotlyConfig,
      ...this.args.chartConfig,
    };
  }

  // FIXME: it feels brittle / inelegant to rely on a side-effect in a getter
  //        (this is very much like the observer pattern available in EmberObject)
  //        Nevertheless, glimmer/octane autotracking will not cache by default
  //        without @cached, so this should at least work, but it is a problem
  //        waiting to happen (e.g. can easily make an infinite loop).
  get chartData() {
    if (this.hasCreatedPlot) {
      debounce(this, this.update, {}, this.debounceInterval, true);
    }
    return this.args.chartData;
  }

  // Note 1: when the chartData array is modified after plot has
  //         been created then datarevision needs to be updated
  //         in order for Plotly.react to apply the changes.
  //         See https://plotly.com/python/reference/layout/#layout-datarevision
  // Note 2: user interactions like zooming will be lost/reset during update
  //         unless the `uirevision` layout property is set and unchanged.
  //         See https://plotly.com/javascript/uirevision/
  get chartLayout() {
    return {
      datarevision: 0,
      uirevision: 0,
      ...ecPlotlyOptions.defaultConfig,
      ...(document.getElementById(this.plotlyContainerElementId)?.layout || {}),
      ...this.args.chartLayout,
    };
  }

  get debounceInterval() {
    return this.args.debounceInterval ?? this.options.debounceInterval;
  }

  get watchChartDataForUpdates() {
    return (
      this.args.watchChartDataForUpdates ??
      this.options.watchChartDataForUpdates
    );
  }

  get eventHandlers() {
    return this.args.on ?? {};
  }

  /// Called whenever we should tell Plotly to (re)generate the plot.
  /// This is where we connect to the plotly.js API (namely, newPlot & react)
  @action
  async update() {
    logVerbose(`update running`);
    if (this.isDestroying) {
      warn(`update aborting since component is (being) destroyed.`);
      return;
    }
    const plotlyArgs = [
      this.plotlyContainerElementId,
      this.chartData,
      this.chartLayout,
      this.chartConfig,
    ];
    const methodName = this.hasCreatedPlot ? 'react' : 'newPlot';
    log(`About to call Plotly.${methodName}`, ...plotlyArgs);
    try {
      if (this.hasCreatedPlot) {
        await Plotly.react(...plotlyArgs);
      } else {
        await Plotly.newPlot(...plotlyArgs);
        this.hasCreatedPlot = true;
        this.bindPlotlyEventListeners();
      }
      log('update finished');
    } catch (e) {
      warn(`Plotly.${methodName} failed`);
      throw e;
    }
  }

  // Stuff for handling dynamic resizing of window
  // (would be nice to respond to size of container instead)
  @action
  resizeEventHandler() {
    debounce(this, this.debouncedResizeEventHandler, this.debounceInterval, false);
  }

  debouncedResizeEventHandler() {
    logVerbose('debouncedResizeEventHandler firing (scheduling onResize)');
    scheduleOnce('afterRender', this, this.onResize);
  }

  onResize() {
    log('onResize firing');
    Plotly.Plots.resize(this.plotlyContainerElementId);
  }

  @action
  bindPlotlyEventListeners() {
    log(`bindPlotlyEventListeners`);
    if (this.args.isResponsive) { // TODO: Drop this option?
      window.addEventListener('resize', this.resizeEventHandler);
    }

    // Process arg-provided event handlers
    const gd = document.getElementById(this.plotlyContainerElementId);
    for (const [eventName, handler] of Object.entries(this.eventHandlers)) {
      this.bindPlotlyEventHandler(gd, eventName, handler);
    }
  }

  bindPlotlyEventHandler(element, eventName, handler) {
    function areValidEventHandlerArgs(gd, eventName, handler) {
      return validateEventHandlerArgs(gd, eventName, handler).length === 0;
    }

    function validateEventHandlerArgs(gd, eventName, handler) {
      const errors = [];
      if (!gd || typeof gd.on !== 'function') {
        errors.push(Error(`Graph <div> missing .on(...) method. Please make sure plotly.js has initialized first.`));
      }
      if (typeof eventName !== 'string') {
        errors.push(Error(`Could not bind plotly.js event handler: plotlyEventName must be a string (got ${plotlyEventName})`));
      }
      if (typeof handler !== 'function') {
        errors.push(Error(`Could not bind plotly.js event handler: handler must be a function (got ${handler})`));
      }
      return errors;
    }

    if (areValidEventHandlerArgs(element, eventName, handler)) {
      logVerbose(`Setting up ${eventName} event handler`, element, eventName, handler);
      element.on(eventName, handler);
    } else {
      debugger;
    }
  }

  @action
  unbindPlotlyEventListeners() {
    // The official Plotly.js documentation doesn't appear to specify methods
    // for removing/unbinding event handlers, but the maintainers
    // suggest that removeAllListeners is supported:
    // https://stackoverflow.com/questions/37372193/unbind-click-events-in-plotly
    // https://github.com/plotly/plotly.js/issues/107#issuecomment-279716312
    document.getElementById(this.plotlyContainerElementId)?.removeAllListeners?.();

    window.removeEventListener('resize', this.resizeEventHandler);
  }
}
