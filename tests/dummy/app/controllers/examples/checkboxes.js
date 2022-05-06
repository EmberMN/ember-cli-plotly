import { tracked } from '@glimmer/tracking';
import { deepTracked } from 'ember-deep-tracked';
import Controller from '@ember/controller';
import { get } from '@ember/object';

const n = 51;
const x = new Array(n).fill(0).map((z, i) => 10 * ((2 * i) / (n - 1) - 1)); // [-10, ..., 10]
const noise = x.map(() => 10 * (Math.random() - 0.5));

class Series {
  @tracked name;
  @tracked isPassedToPlotly;
  @tracked x;
  @tracked y;

  constructor({ name, isPassedToPlotly, x, y }) {
    this.name = name;
    this.isPassedToPlotly = isPassedToPlotly;
    this.x = x;
    this.y = y;
  }
}

function getDataSets() {
  return [
    {
      name: 'absolute',
      isPassedToPlotly: false,
      x,
      y: x.map(Math.abs),
    },
    {
      name: 'linear',
      isPassedToPlotly: false,
      x,
      y: x.map((x) => x / 2 + 1),
    },
    {
      name: 'cosine',
      isPassedToPlotly: true,
      x,
      y: x.map(Math.cos),
    },
    {
      name: 'cubic',
      isPassedToPlotly: true,
      x,
      y: x.map((x) => ((x - 5) * x * (x + 5)) / 100),
    },
    {
      name: 'mod5',
      isPassedToPlotly: false,
      x,
      y: x.map((x) => x % 5),
    },
    {
      name: 'noise',
      isPassedToPlotly: false,
      x,
      y: noise,
    },
  ].map((props) => new Series(props));
}

export default class CheckBoxesController extends Controller {
  //@deepTracked;
  @tracked
  dataSets = getDataSets();

  get numberChecked() {
    //return this.dataSets.filter(({ isPassedToPlotly }) => isPassedToPlotly).length;
    return this.data.length;
  }

  get data() {
    console.log('getter called for data', this.dataSets);
    //console.log('Calling .get just for funzees', get(this, 'dataSets.0'));
    return this.dataSets.filter(({ isPassedToPlotly }) => isPassedToPlotly);
  }
}
