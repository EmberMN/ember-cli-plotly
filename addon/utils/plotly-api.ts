import {
  Config,
  Data,
  Layout,
  PlotlyHTMLElement as BrokenPlotlyHTMLElement,
} from 'plotly.js';

// TODO: Submit PR to @types/plotly.js to use signatures from
//       node's events' removeListener & removeAllListeners
export interface PlotlyHTMLElement extends Omit<BrokenPlotlyHTMLElement, 'removeListener' | 'removeAllListeners'> {
  removeListener: (
    eventName: string | symbol,
    listener: (...args: any[]) => void
  ) => this;
  removeAllListeners: (event?: string | symbol) => this;
}

export interface PlotlyConfig extends Partial<Omit<Config, 'scrollZoom' | 'setBackground'>> {
  // Missing parentheses around function in @types/plotly.js definitions
  // See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60184
  setBackground?:
    | ((gd: PlotlyHTMLElement, color: string) => any)
    | 'opaque'
    | 'transparent';
  // Missing string option in @types/plotly.js definitions
  scrollZoom?: string | boolean;
  // Missing option (added in v1.49)
  // See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60203
  doubleClickDelay?: number;
  // Missing option (added in v2.10)
  // See https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/60205
  typesetMath?: boolean;
  // Missing option (added in v1.49.0)
  // See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60204
  watermark?: boolean;
  // (did not file report)
  notifyOnLogging?: number;
}

export type PlotlyData = Data;

export interface PlotlyLayout extends Partial<Layout> {}

export const defaultConfig: PlotlyConfig = {
  staticPlot: false,
  typesetMath: true,
  plotlyServerURL: '',
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
  responsive: true, // DEPRECATED: will always be true in Plotly.js v3.x
  fillFrame: false,
  frameMargins: 0,
  scrollZoom: 'gl3d+geo+mapbox',
  doubleClick: 'reset+autosize',
  doubleClickDelay: 300,
  showAxisDragHandles: true,
  showAxisRangeEntryBoxes: true,
  showTips: false,
  showLink: false,
  linkText: 'Edit chart',
  sendData: true,
  showSources: false,
  displayModeBar: 'hover',
  showSendToCloud: false,
  showEditInChartStudio: false,
  modeBarButtonsToRemove: [],
  modeBarButtonsToAdd: [],
  modeBarButtons: false,
  toImageButtonOptions: {
    // filename: 'plot.png',
    // format: 'png',
    // width: 1920,
    // height: 1080,
    // scale: 2,
  },
  displaylogo: false,
  watermark: false,
  plotGlPixelRatio: 2,
  setBackground: 'transparent',
  // TODO: is it possible to use the bundled '<path-to-plotly.js>/dist/topojson/'?
  topojsonURL: 'https://cdn.plot.ly/',
  mapboxAccessToken: undefined,
  logging: 1, // must only be changed via Plotly.setPlotConfig
  notifyOnLogging: 0, // must only be changed via Plotly.setPlotConfig
  queueLength: 0, // undo/redo queue
  globalTransforms: [],
  locale: 'en-US',
  locales: {},
};
