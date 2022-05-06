import {
  PlotlyConfig,
  PlotlyLayout,
  defaultConfig,
} from '../utils/plotly-api';
import { PlotlyArgs } from '../components/plotly';

export interface PlotlyComponentOptions {
  autoResize: boolean;
  resizeDebounceInterval: number;
  updateDebounceInterval: number;
  updateOnDataChange: boolean;
}

export interface EmberCliPlotlyConfig extends PlotlyComponentOptions {
  config?: PlotlyConfig;
  layout?: PlotlyLayout;
}

import config from 'ember-get-config';
const ecPlotlyConfig: EmberCliPlotlyConfig =
  config.environment['ember-cli-plotly'] ?? {};

// Since _.defaultsDeep would be overkill
// https://lodash.com/docs/4.17.15#defaultsDeep
function getFirst(key: string, list: any[], defaultValue: any) {
  for (const obj of list) {
    const candidate = obj[key];
    if (candidate !== undefined) {
      return candidate;
    }
  }
  return defaultValue;
}

export function getOptions(options: PlotlyArgs = {}): EmberCliPlotlyConfig {
  const sources = [options, ecPlotlyConfig];
  return {
    // Args for <Plotly /> component
    autoResize: getFirst('autoResize', sources, true),
    resizeDebounceInterval: getFirst('resizeDebounceInterval', sources, 100),
    updateDebounceInterval: getFirst('updateDebounceInterval', sources, 50),
    updateOnDataChange: getFirst('updateOnDataChange', sources, true),
    // plotly.js API
    config: {
      ...defaultConfig,
      ...(ecPlotlyConfig.config ?? {}),
      ...(options.config ?? {}),
    },
    layout: {
      //...defaultLayout, // We don't provide a default layout
      ...(ecPlotlyConfig.layout ?? {}),
      ...(options.layout ?? {}),
    },
  };
}
