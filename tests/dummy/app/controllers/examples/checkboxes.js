import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';

const n = 51;
const x = new Array(n).fill(0).map((z, i) => 10 * ((2 * i) / (n - 1) - 1)); // [-10, ..., 10]
const noise = x.map(() => 10 * (Math.random() - 0.5));

class Series {
  @tracked name;
  @tracked isPassedToPlotly;
  @tracked x;
  @tracked y;

  constructor({ name, isPassedToPlotly, x, y}) {
    this.name = name;
    this.isPassedToPlotly = isPassedToPlotly;
    this.x = x;
    this.y = y;
  }
}

export default class CheckBoxesController extends Controller {
  @tracked
  dataSets = [
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

  get chartData() {
    console.log('getter called for chartData', this.dataSets);
    return this.dataSets.filter(({ isPassedToPlotly }) => isPassedToPlotly);
  }
}
