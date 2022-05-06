import { tracked } from '@glimmer/tracking';
import { deepTracked } from 'ember-deep-tracked';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { runInDebug, warn } from '@ember/debug';
import { debounce, scheduleOnce } from '@ember/runloop';
import { validateGraphDiv, validateEventHandlerArgs } from '../utils/misc';

// TODO: It would be nice if we could automatically build/pack
//       the parts of plotly we need/use when webpack runs...
//       Some users want to lazy-load Plotly later, which
//       Embroider / v2 addon format might eventually help accomplish.
//       I'm not sure how to do this though. For now, we let the
//       consuming app define an alias in ember-auto-import config
import Plotly from "plotly.js";
import { PlotlyConfig, PlotlyData, PlotlyLayout, PlotlyHTMLElement } from '../utils/plotly-api';

import {
  getOptions,
  PlotlyComponentOptions,
} from '../utils/ember-cli-plotly-config';

export interface PlotlyArgs extends Partial<PlotlyComponentOptions> {
  id?: string;
  config?: PlotlyConfig;
  data?: PlotlyData;
  layout?: PlotlyLayout;
  on?: {
    [eventName: string]: () => any;
  };
}

export default class PlotlyComponent extends Component<PlotlyArgs> {
  makeUniqueId() {
    return `plotly-${Date.now()}-${Math.floor(10000 * Math.random())}`;
  }
  @tracked plotlyContainerElementId = this.args.id ?? this.makeUniqueId();
  @deepTracked options = getOptions(this.args);
  @tracked hasCreatedPlot = false;

  get chartConfig() {
    return this.options.config;
  }

  get chartData() {
    warn(
      'The @data argument was not provided (hence the plot may be empty).',
      Boolean(this.args.data),
      {
        id: 'ember-cli-plotly.missing-data',
      }
    );
    // FIXME: it feels brittle / inelegant to rely on a side-effect in a getter
    //        (this is very much like the observer pattern available in EmberObject)
    //        Nevertheless, glimmer/octane autotracking will not cache by default
    //        (without using @cached), so this should at least work,
    //        but it is a problem waiting to happen :/
    //        (e.g. can easily make an infinite loop).
    if (this.options.updateOnDataChange) {
      const immediate = false;
      debounce(this, this.update, "debounced updateOnDataChange", this.options.updateDebounceInterval, immediate);
    }
    return this.args.data ?? [];
  }

  // Note 1: when the data array is modified after plot has
  //         been created then datarevision needs to be updated
  //         in order for Plotly.react to apply the changes.
  //         See https://plotly.com/python/reference/layout/#layout-datarevision
  // Note 2: user interactions like zooming will be lost/reset during update
  //         unless the `uirevision` layout property is set and unchanged.
  //         See https://plotly.com/javascript/uirevision/
  get chartLayout() {
    return {
      //datarevision: 0,
      //uirevision: 0,
      ...this.options.layout,
    };
  }

  @action async update(source?: string) {
    console.log(`plotly-component: update called ${source ? '(' + source + ')' : ''}`, this.args.data);
    warn(`update aborted since component was destroyed.`, !this.isDestroying, {
      id: 'ember-cli-plotly.update-called-after-destroy',
    });
    if (this.isDestroying) {
      return;
    }
    const gd = document.getElementById(this.plotlyContainerElementId);
    if (!gd) {
      // graph div element is not yet in the DOM
      return;
    }
    let didSucceed = false;
    try {
      await Plotly.react(
        gd,
        this.chartData,
        this.chartLayout,
        this.chartConfig
      );
      didSucceed = true;
    } catch (e) {
      warn(
        `Plotly.js threw exception while attempting to update chart`,
        false,
        {
          id: 'ember-cli-plotly.plotly-js-exception',
        }
      );
      runInDebug(() => {
        console.error({
          e,
          gd,
          config: this.chartConfig,
          data: this.chartData,
          layout: this.chartLayout,
        });
        //debugger; // eslint-disable-line no-debugger
        //throw e;
      });
    } finally {
      if (didSucceed && !this.hasCreatedPlot) {
        this.bindPlotlyEventListeners();
        this.hasCreatedPlot = true;
      }
    }
  }

  @action
  bindPlotlyEventListeners() {
    if (this.args.autoResize) {
      window.addEventListener('resize', this.resizeEventHandler);
    }

    // Process arg-provided event handlers
    const maybeGraphDiv = document.getElementById(this.plotlyContainerElementId);
    if (validateGraphDiv(maybeGraphDiv)) {
      const gd = <PlotlyHTMLElement> maybeGraphDiv;
      for (const [eventName, handler] of Object.entries(this.args.on ?? {})) {
        if (validateEventHandlerArgs(eventName, handler)) {
          gd.on(eventName, handler);
        }
      }
    } else {
      //debugger;
      //this.hasCreatedPlot = false;
    }
  }

  @action
  unbindPlotlyEventListeners() {
    // The official Plotly.js documentation doesn't appear to specify methods
    // for removing/unbinding event handlers, but the maintainers
    // suggest that the standard removeListener and removeAllListeners methods
    // from node's events API are supported:
    // https://stackoverflow.com/questions/37372193/unbind-click-events-in-plotly
    // https://github.com/plotly/plotly.js/issues/107#issuecomment-279716312
    const gd = document.getElementById(this.plotlyContainerElementId);
    if (validateGraphDiv(gd)) {
      for (const [eventName, handler] of Object.entries(this.args.on ?? {})) {
        if (validateEventHandlerArgs(eventName, handler)) {
          gd.removeListener?.(eventName, handler);
        }
      }
    }
  }

  @action
  resizeEventHandler() {
    debounce(
      this,
      this.debouncedResizeEventHandler,
      this.options.resizeDebounceInterval,
      false
    );
  }

  debouncedResizeEventHandler() {
    scheduleOnce('afterRender', this, this.callPlotlyResize);
  }

  callPlotlyResize() {
    Plotly.Plots.resize(this.plotlyContainerElementId)
  }


  @action tearDown() {
    this.unbindPlotlyEventListeners();
    if (this.options.autoResize) {
      window.removeEventListener('resize', this.resizeEventHandler);
    }
  }
}
