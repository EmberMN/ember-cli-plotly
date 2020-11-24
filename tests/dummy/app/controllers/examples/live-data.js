import Controller from '@ember/controller';
import { later } from '@ember/runloop';
import { A } from '@ember/array';
import EmberObject, { action } from '@ember/object';

import debug from 'debug';
const log = debug('ember-cli-plotly:dummy:live-data');

const interval = 1000;

export default class ExamplesLiveDataController extends Controller.extend({
  init() {
    this._super(...arguments);
    this.setProperties({
      _updating: false,
      chartData: A(),
      //chartLayout: {},
      //chartConfig: {},
      plotlyEvents: ['plotly_restyle'],
      currentTrace: 0,
      currentIndex: 0
    });
  }
}) {
  update() {
    log('update firing');
    if (!this._updating) {
      return;
    }

    const currentTrace = this.currentTrace;
    const currentIndex = this.currentIndex;
    log(`Update called: currentTrace=${currentTrace}, currentIndex=${currentIndex}`, this.get(`chartData`));

    if (!this.get(`chartData.${currentTrace}`)) {
      this.chartData.pushObject(EmberObject.create({
        x: A(),
        y: A()
      }));
    }

    // Generate some data
    this.set(`chartData.${currentTrace}.x.${currentIndex}`, currentIndex);
    this.set(`chartData.${currentTrace}.y.${currentIndex}`, 100*Math.random());

    // Force update
    this.set('chartData.triggerUpdate', !this.chartData.triggerUpdate);

    if (currentIndex >= 5) {
      this.set('currentTrace', currentTrace + 1);
      this.set('currentIndex', 0);
    }
    else {
      this.set('currentIndex', 1 + currentIndex);
    }
    later(this, 'update', interval);
  }


  @action
  clear() {
    log(`Clear clicked`);
    this.setProperties({
      currentTrace: 0,
      currentIndex: 0
    });
    this.chartData.clear();
  }

  @action
  start() {
    log(`Start clicked`, this._updating);
    if (this._updating === false) {
      this.set('_updating', true);
      later(this, 'update', interval);
    }
  }

  @action
  stop() {
    log(`Stop clicked`);
    this.set('_updating', false);
  }

  @action
  onPlotlyEvent(eventName, eventData) {
    log(`onPlotlyEvent got ${eventName} -->`, eventData, this);
  }
}
