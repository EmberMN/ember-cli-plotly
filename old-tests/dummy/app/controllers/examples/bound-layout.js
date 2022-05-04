import { tracked, cached } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { getLoggingFunctions } from 'ember-cli-plotly/utils/log';
const { log } = getLoggingFunctions('ember-cli-plotly:bound-layout');

const exampleFunctions = [
  {
    name: 'y=-x',
    y: (x) => -x,
  },
  {
    name: 'y=x',
    y: (x) => x,
  },
  {
    name: 'y=1/x',
    y: (x) => 1 / x,
  },
  {
    name: 'y=sin(pi*x)/(pi*x)',
    y: (x) => Math.sin(Math.PI * x) / (Math.PI * x),
  },
  {
    name: 'y=sin(1/x)',
    y: (x) => Math.sin(1 / x),
  },
  {
    name: 'y=log2(x)',
    y: (x) => Math.log2(x),
  },
  {
    name: 'y=2^x',
    y: (x) => Math.pow(2, x),
  },
];

function linspace(min = -10, max = 10, n = 100) {
  n = Math.round(n); // Force n to be an integer
  return new Array(n).fill(0).map((z, i) => min + (i * (max - min)) / (n - 1));
}

function getSampleData(funcs, xs) {
  return funcs.map(({ name, y }) => {
    return {
      name,
      x: xs,
      y: xs.map(y),
    };
  });
}

export default class BoundLayoutController extends Controller {
  xaxis = {
    @tracked min: -10,
    @tracked max: 10,
  };

  yaxis = {
    @tracked min: -2,
    @tracked max: 2,
  };

  @tracked useFixedData = false;

  @action
  toggleUseFixedData() {
    this.useFixedData = !this.useFixedData;
  }

  @cached
  get fixedData() {
    return getSampleData(
      exampleFunctions,
      linspace(-1e3, 1e3, Math.pow(2, 16))
    );
  }

  @tracked nPoints = 256;
  @cached
  get data() {
    log(`computing data; useFixedData=${this.useFixedData}`);
    if (this.useFixedData) {
      return this.fixedData;
    }
    log(
      `xmin=${this.xaxis.min}, xmax=${this.xaxis.max}, nPoints=${this.nPoints}`
    );
    return getSampleData(
      exampleFunctions,
      linspace(this.xaxis.min, this.xaxis.max, this.nPoints)
    );
  }

  get layout() {
    log(
      `computing layout`,
      this.xaxis.min,
      this.xaxis.max,
      this.yaxis.min,
      this.yaxis.max
    );
    const getRange = (axis) => {
      let min = parseFloat(this[axis].min);
      if (typeof min !== 'number') min = 0;
      let max = parseFloat(this[axis].max);
      if (typeof max !== 'number') max = min + 1;
      return [min, max];
    };

    return {
      xaxis: {
        range: getRange('xaxis'),
      },
      yaxis: {
        range: getRange('yaxis'),
      },
    };
  }
}
