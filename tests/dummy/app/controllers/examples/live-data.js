import { tracked } from '@glimmer/tracking';
import { deepTracked } from 'ember-deep-tracked';
import Controller from '@ember/controller';
import { later } from '@ember/runloop';
import { action } from '@ember/object';

const numXpoints = 10;

export default class ExamplesLiveDataController extends Controller {
  @tracked config = {};
  @deepTracked data = []; //[{ type: 'scatter', x: [1,2,3], y: [9,10,11] }];
  //@tracked data = [];
  @tracked layout = {
    @tracked datarevision: 0,
  };
  @tracked currentIndex = 0;
  @tracked currentTrace = 0;
  @tracked interval = 200;
  _updating = false;

  update() {
   if (!this._updating) {
      return;
    }

    this.layout.datarevision++;
    console.log(
      `live-data: currentTrace=${this.currentTrace}, currentIndex=${this.currentIndex}`,
      this.layout.datarevision,
    );

    if (!this.data[this.currentTrace]) {
      this.data.push({
        x: [],
        y: [],
      });
    }

    // Generate some data
    this.data[this.currentTrace].x[this.currentIndex] = this.currentIndex;
    this.data[this.currentTrace].y[this.currentIndex] = 100 * Math.random();

    if (this.currentIndex >= numXpoints) {
      this.currentTrace++;
      this.currentIndex = 0;
    } else {
      this.currentIndex++;
    }

    // FIXME: shouldn't have to replace array reference
    //this.data = this.data.map(s => ({ ...s }));
    //this.notifyPropertyChange('data');

    later(this, 'update', this.interval);
  }

  @action
  clear() {
    console.log(`Clear clicked`);
    this.currentIndex = 0;
    this.currentTrace = 0;
    this.data.length = 0;
  }

  @action
  start() {
    console.log(`Start clicked`, this._updating);
    if (!this._updating) {
      this._updating = true;
      later(this, 'update', this.interval);
    }
  }

  @action
  stop() {
    console.log(`Stop clicked`);
    this._updating = false;
  }

  @action
  onPlotlyEvent(eventName, eventData) {
    console.log(`onPlotlyEvent got ${eventName} -->`, eventData, this);
  }
}
