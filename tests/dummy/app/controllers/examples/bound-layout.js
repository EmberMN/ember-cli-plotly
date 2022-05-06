import { tracked, cached } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action } from '@ember/object';

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
  @tracked useFixedData = false;
  @tracked nPoints = 256;
  @tracked xmin = '-10';
  @tracked xmax = '10';
  @tracked ymin = '-2';
  @tracked ymax = '2';
  datarevision = 0;
  uirevision = 0;

  @action
  toggleUseFixedData() {
    this.useFixedData = !this.useFixedData;
  }

  // Does it matter that this is decorated with @cached?
  // It should always produce the same value
  @cached
  get fixedData() {
    return getSampleData(
      exampleFunctions,
      linspace(-1e3, 1e3, Math.pow(2, 16))
    );
  }

  @cached
  get data() {
    // FIXME: check exactly if/when these are needed
    this.datarevision++;
    this.uirevision++;

    console.log(`computing data; useFixedData=${this.useFixedData}`);
    if (this.useFixedData) {
      return this.fixedData;
    }
    //console.log(`xmin=${this.xmin}, xmax=${this.xmax}, nPoints=${this.nPoints}`);
    const data = getSampleData(
      exampleFunctions,
      linspace(parseFloat(this.xmin), parseFloat(this.xmax), this.nPoints)
    );
    for (const series of data) {
      // Drop points with y=NaN values
      const x = [];
      const y = series.y.filter((y, i) => {
        if (isNaN(y)) {
          return false;
        }
        x.push(series.x[i]);
        return true;
      });
      series.x = x;
      series.y = y;
    }
    return data;
  }

  @cached
  get layout() {
    const getRange = (axis) => {
      let min = parseFloat(axis.startsWith('x') ? this.xmin : this.ymin);
      if (typeof min !== 'number') min = 0;
      let max = parseFloat(axis.startsWith('x') ? this.xmax : this.ymax);
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
      datarevision: this.datarevision,
      uirevision: this.uirevision,
    };
  }
}
