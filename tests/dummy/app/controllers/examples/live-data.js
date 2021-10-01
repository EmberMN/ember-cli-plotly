import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { later } from '@ember/runloop';
import { action } from '@ember/object';

import debug from 'debug';
const log = debug('ember-cli-plotly:dummy:live-data');

const interval = 1000;

export default class ExamplesLiveDataController extends Controller {
  @tracked chartConfig = {};
  @tracked chartData = [];
  @tracked chartLayout = {};
  @tracked currentIndex = 0;
  @tracked currentTrace = 0;

  _updating = false;

  update() {
    log('update firing');
    if (!this._updating) {
      return;
    }

    log(`Update called: currentTrace=${this.currentTrace}, currentIndex=${this.currentIndex}`, this.chartData);

    if (!this.chartData[this.currentTrace]) {
      this.chartData.push({
        x: [],
        y: []
      });
    }

    // Generate some data
    this.chartData[this.currentTrace].x[this.currentIndex] = this.currentIndex;
    this.chartData[this.currentTrace].y[this.currentIndex] = 100*Math.random();

    this.notifyPropertyChange('chartData');

    if (this.currentIndex >= 5) {
      this.currentTrace++;
      this.currentIndex = 0;
    }
    else {
      this.currentIndex++;
    }
    later(this, 'update', interval);
  }


  @action
  clear() {
    log(`Clear clicked`);
    this.currentIndex = 0;
    this.currentTrace = 0;
    this.chartData.clear();
  }

  @action
  start() {
    log(`Start clicked`, this._updating);
    if (!this._updating) {
      this._updating = true;
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
