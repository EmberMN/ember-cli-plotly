import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { later } from '@ember/runloop';
import { action } from '@ember/object';

import debug from 'debug';
const log = debug('ember-cli-plotly:dummy:live-data');

const numXpoints = 10;

export default class ExamplesLiveDataController extends Controller {
  @tracked config = {};
  @tracked data = [];
  @tracked layout = {};
  @tracked currentIndex = 0;
  @tracked currentTrace = 0;
  @tracked interval = 1000;
  _updating = false;

  update() {
    log('update firing');
    if (!this._updating) {
      return;
    }

    log(
      `Update called: currentTrace=${this.currentTrace}, currentIndex=${this.currentIndex}`,
      this.data
    );

    if (!this.data[this.currentTrace]) {
      this.data.push({
        x: [],
        y: [],
      });
    }

    // Generate some data
    this.data[this.currentTrace].x[this.currentIndex] = this.currentIndex;
    this.data[this.currentTrace].y[this.currentIndex] =
      100 * Math.random();

    this.notifyPropertyChange('data');

    if (this.currentIndex >= numXpoints) {
      this.currentTrace++;
      this.currentIndex = 0;
    } else {
      this.currentIndex++;
    }
    later(this, 'update', this.interval);
  }

  @action
  clear() {
    log(`Clear clicked`);
    this.currentIndex = 0;
    this.currentTrace = 0;
    this.data.length = 0;
  }

  @action
  start() {
    log(`Start clicked`, this._updating);
    if (!this._updating) {
      this._updating = true;
      later(this, 'update', this.interval);
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
