import Controller from '@ember/controller';
import { action } from '@ember/object';
import generateDataSets from 'dummy/utils/datasets'

import * as debug from 'debug';
const log = debug('ember-cli-plotly:dummy:legend-events');

export default class ExamplesLegendEventsController extends Controller.extend({
  init() {
    log('legend-events init');
    this._super(...arguments);
    this.setProperties({
      chartData: generateDataSets(),
      //chartLayout: {},
      //chartConfig: {},
      plotlyEvents: ['plotly_legendclick','plotly_legenddoubleclick'],
      lastClicked: null,
      lastDoubleClicked: null,
    });
  }
}) {
  @action
  onPlotlyEvent(eventName, eventData) {
    log(`onPlotlyEvent got ${eventName} -->`, eventData, this);
    if (eventName === 'plotly_legendclick') {
      this.set(`lastClicked`, eventData.curveNumber);
    }
    else if (eventName === 'plotly_legenddoubleclick') {
      this.set(`lastDoubleClicked`, eventData.curveNumber);
    }
  }
}
