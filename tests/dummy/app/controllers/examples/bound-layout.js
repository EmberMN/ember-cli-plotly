import Controller from '@ember/controller';
import { computed, setProperties } from '@ember/object';
import { getLoggingFunctions } from 'ember-cli-plotly/utils/log';
const { log } = getLoggingFunctions('ember-cli-plotly:bound-layout');

const n = Math.pow(2, 16);
const x = new Array(n).fill(0).map((z, i) => 100 * ((2 * i) / (n - 1) - 1)); // [-10, ..., 10]

export default class BoundLayoutController extends Controller {
  constructor() {
    super(...arguments);
    setProperties(this, {
      xaxis: {
        min: -10,
        max: 10,
      },
      yaxis: {
        min: -2,
        max: 2,
      },
      chartData: [
        {
          name: 'Very long line',
          x: [-1e6, 1e6],
          y: [1e6, -1e6],
        },
        {
          name: 'x',
          x,
          y: x,
        },
        {
          name: '1/x',
          x,
          y: x.map((x) => 1 / x),
        },
        {
          name: 'normalized sinc',
          x,
          y: x.map((x) => Math.sin(Math.PI * x) / (Math.PI * x)),
        },
        {
          name: 'sin(1/x)',
          x,
          y: x.map((x) => Math.sin(1 / x)),
        },
        {
          name: 'log2',
          x,
          y: x.map((x) => Math.log2(x)),
        },
        {
          name: '2^x',
          x,
          y: x.map((x) => Math.pow(2, x)),
        },
      ],
    });
  }

  @computed('xaxis.{min,max}', 'yaxis.{min,max}')
  get chartLayout() {
    log('computing chartLayout');
    const getRange = (axisPropName) => {
      let min = parseFloat(this.get(`${axisPropName}.min`));
      if (typeof min !== 'number') min = 0;
      let max = parseFloat(this.get(`${axisPropName}.max`));
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
