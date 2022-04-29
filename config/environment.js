'use strict';

module.exports = function (/* environment, appConfig */) {
  return {
    'ember-cli-plotly': {
      resizeDebounceInterval: 100,
      updateDebounceInterval: 100,
      watchChartDataForUpdates: true,
      // Based on the defaults here:
      // https://github.com/plotly/plotly.js/blob/1739f3d7a86702ad83946eb2ceff83863012387d/src/plot_api/plot_config.js
      defaultConfig: {
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
        displaylogo: true,
        watermark: false,
        plotGlPixelRatio: 2,
        setBackground: 'transparent',
        // TODO: is it possible to use the bundled '<path-to-plotly.js>/dist/topojson/'?
        topojsonURL: 'https://cdn.plot.ly/',
        mapboxAccessToken: null,
        logging: 1, // must only be changed via Plotly.setPlotConfig
        notifyOnLogging: 0, // must only be changed via Plotly.setPlotConfig
        queueLength: 0, // undo/redo queue
        globalTransforms: [],
        locale: 'en-US',
        locales: {},
      },
    },
  };
};
