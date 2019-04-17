import Controller from '@ember/controller';
import { computed } from '@ember/object';
import debug from 'debug';
const log = debug('ember-cli-plotly:plot-ly-component');

const n = Math.pow(2,16);
const x = new Array(n).fill(0).map((z,i) => 100*(2*i/(n-1)-1)); // [-10, ..., 10]

export default class BoundLayoutController extends Controller {
  constructor() {
    super(...arguments);
    this.setProperties({
      xaxis: {
        min: -10,
        max: 10
      },
      yaxis: {
        min: -2,
        max: 2
      },
      chartData: [{
          name: 'Very long line',
          x: [-1E6,1E6],
          y: [1E6,-1E6]
        },{
          name: 'x',
          x,
          y: x
        },{
          name: '1/x',
          x,
          y: x.map(x => 1/x)
        },{
          name: 'normalized sinc',
          x,
          y: x.map(x => Math.sin(Math.PI*x)/(Math.PI*x))
        },{
          name: 'sin(1/x)',
          x,
          y: x.map(x => Math.sin(1/x))
        },{
          name: 'log2',
          x,
          y: x.map(x => Math.log2(x))
        },{
          name: '2^x',
          x,
          y: x.map(x => Math.pow(2,x))
        }
      ]
    });
  }

  @computed('xaxis.{min,max}', 'yaxis.{min,max}')
  get chartLayout() {
    log('computing chartLayout');
    const getRange = (axisPropName) => {
      let min = parseFloat(this.get(`${axisPropName}.min`));
      if (typeof min !== 'number')
        min = 0;
      let max = parseFloat(this.get(`${axisPropName}.max`));
      if (typeof max !== 'number')
        max = min + 1;
      return [min, max];
    };

    return {
      xaxis: {
        range: getRange('xaxis')
      },
      yaxis: {
        range: getRange('yaxis')
      }
    };
  }
}
