import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce, scheduleOnce } from '@ember/runloop';
import Plotly from 'plotly.js/dist/plotly';
import config from 'ember-get-config';
import { getLoggingFunctions } from 'ember-cli-plotly/utils/log';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _initializerDefineProperty(target, property, descriptor, context) {
  if (!descriptor) return;
  Object.defineProperty(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }

  return desc;
}

var TEMPLATE = hbs("{{#if this._showStateForDebugging}}\n  <button type=\"button\" {{on \"click\" this.update}}>Force update</button>\n  {{! we \"use\" this.data here to ensure recomputation }}\n  <pre style=\"max-height: 200px; overflow-y: scroll;\">\n{{print-json this.data}}\n  </pre>\n{{else}}\n  {{look-but-do-not-touch this.config this.data this.layout}}\n{{/if}}\n<div\n  id={{this.plotlyContainerElementId}}\n  {{did-insert this.update}}\n  {{did-update this.update}}\n  {{will-destroy this.unbindPlotlyEventListeners}}\n  ...attributes\n>\n  {{!yield}}\n</div>\n");

var _class, _descriptor, _descriptor2, _descriptor3;
const ecPlotlyOptions = config.environment['ember-cli-plotly'] ?? {
  defaultConfig: {},
  defaultLayout: {}
};
const {
  log,
  logVerbose,
  warn
} = getLoggingFunctions('ember-cli-plotly'); // Args:
//   @config=(config object per Plotly.js API)
//      ^^^ inherits from config.environment['ember-cli-plotly'].defaultConfig
//   @data=(data object per Plotly.js API)
//   @layout=(layout object per Plotly.js API)
//      ^^^ inherits from config.environment['ember-cli-plotly'].defaultLayout
//   @on={{hash eventName=handlerFunction}}
//   (the following all inherit from corresponding config.environment['ember-cli-plotly'] keys)
//   @debounceInterval
//   @watchChartDataForUpdates ?
//   TODO: should we take a function that we'll call with a forceUpdate function consuming app can call?

let PlotlyComponent = (_class = class PlotlyComponent extends Component {
  constructor(...args) {
    super(...args);

    _initializerDefineProperty(this, "_showStateForDebugging", _descriptor, this);

    _defineProperty(this, "hasCreatedPlot", false);

    _initializerDefineProperty(this, "plotlyContainerElementId", _descriptor2, this);

    _initializerDefineProperty(this, "options", _descriptor3, this);
  }

  get resizeDebounceInterval() {
    return this.args.layout ?? ecPlotlyOptions.resizeDebounceInterval;
  }

  // Merge user-provided parameters with defaults
  get config() {
    return { ...ecPlotlyOptions.defaultPlotlyConfig,
      ...this.args.config
    };
  } // FIXME: it feels brittle / inelegant to rely on a side-effect in a getter
  //        (this is very much like the observer pattern available in EmberObject)
  //        Nevertheless, glimmer/octane autotracking will not cache by default
  //        without @cached, so this should at least work, but it is a problem
  //        waiting to happen (e.g. can easily make an infinite loop).


  get data() {
    if (this.hasCreatedPlot) {
      debounce(this, this.update, {}, this.debounceInterval, true);
    }

    return this.args.data;
  } // Note 1: when the data array is modified after plot has
  //         been created then datarevision needs to be updated
  //         in order for Plotly.react to apply the changes.
  //         See https://plotly.com/python/reference/layout/#layout-datarevision
  // Note 2: user interactions like zooming will be lost/reset during update
  //         unless the `uirevision` layout property is set and unchanged.
  //         See https://plotly.com/javascript/uirevision/


  get layout() {
    return {
      datarevision: 0,
      uirevision: 0,
      ...ecPlotlyOptions.defaultConfig,
      ...(document.getElementById(this.plotlyContainerElementId)?.layout || {}),
      ...this.args.layout
    };
  }

  get debounceInterval() {
    return this.args.debounceInterval ?? this.options.debounceInterval;
  }

  get watchChartDataForUpdates() {
    return this.args.watchChartDataForUpdates ?? this.options.watchChartDataForUpdates;
  }

  get eventHandlers() {
    return this.args.on ?? {};
  } /// Called whenever we should tell Plotly to (re)generate the plot.
  /// This is where we connect to the plotly.js API (namely, newPlot & react)


  async update() {
    logVerbose(`update running`);

    if (this.isDestroying) {
      warn(`update aborting since component is (being) destroyed.`);
      return;
    }

    const plotlyArgs = [this.plotlyContainerElementId, this.data, this.layout, this.config];
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
  } // Stuff for handling dynamic resizing of window
  // (would be nice to respond to size of container instead)


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

  bindPlotlyEventListeners() {
    log(`bindPlotlyEventListeners`);

    if (this.args.isResponsive) {
      // TODO: Drop this option?
      window.addEventListener('resize', this.resizeEventHandler);
    } // Process arg-provided event handlers


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

  unbindPlotlyEventListeners() {
    // The official Plotly.js documentation doesn't appear to specify methods
    // for removing/unbinding event handlers, but the maintainers
    // suggest that removeAllListeners is supported:
    // https://stackoverflow.com/questions/37372193/unbind-click-events-in-plotly
    // https://github.com/plotly/plotly.js/issues/107#issuecomment-279716312
    document.getElementById(this.plotlyContainerElementId)?.removeAllListeners?.();
    window.removeEventListener('resize', this.resizeEventHandler);
  }

}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "_showStateForDebugging", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return false;
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "plotlyContainerElementId", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return `plotly-component-${Date.now()}-${Math.floor(10000 * Math.random())}`;
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "options", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return {
      debounceInterval: 50,
      // shared for both data update & window resize
      isResponsive: true,
      watchChartDataForUpdates: true,
      ...ecPlotlyOptions
    };
  }
}), _applyDecoratedDescriptor(_class.prototype, "update", [action], Object.getOwnPropertyDescriptor(_class.prototype, "update"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "resizeEventHandler", [action], Object.getOwnPropertyDescriptor(_class.prototype, "resizeEventHandler"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "bindPlotlyEventListeners", [action], Object.getOwnPropertyDescriptor(_class.prototype, "bindPlotlyEventListeners"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "unbindPlotlyEventListeners", [action], Object.getOwnPropertyDescriptor(_class.prototype, "unbindPlotlyEventListeners"), _class.prototype)), _class);
setComponentTemplate(TEMPLATE, PlotlyComponent);

export { PlotlyComponent as default };
