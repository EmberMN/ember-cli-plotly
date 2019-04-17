import { A } from '@ember/array';
import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import { computed } from '@ember/object';

const n = 51;
const x = new Array(n).fill(0).map((z,i) => 10*(2*i/(n-1) - 1)); // [-10, ..., 10]
const noise = x.map(() => 10*(Math.random()-0.5));

export default class CheckBoxesController extends Controller {
  constructor() {
    super(...arguments);

    // In this example the x & y arrays here should be considered static
    // (that is, the `chartData` computed property is not "watching" them)
    // Also note that use of A and EmberObject.create are only needed if
    // EmberENV.EXTEND_PROTOTYPES === false
    this.set('dataSets', A([{
        name: 'absolute',
        isPassedToPlotly: false,
        x,y: x.map(Math.abs)
      }, {
        name: 'linear',
        isPassedToPlotly: false,
        x,y: x.map(x => x/2+1)
      }, {
        name: 'cosine',
        isPassedToPlotly: true,
        x,y: x.map(Math.cos)
      }, {
        name: 'cubic',
        isPassedToPlotly: true,
        x,y: x.map(x => (x-5)*(x)*(x+5)/100)
      }, {
        name: 'mod5',
        isPassedToPlotly: false,
        x,y: x.map(x => x%5)
      }, {
        name: 'noise',
        isPassedToPlotly: false,
        x,y: noise
      }
    ].map(s => EmberObject.create(s))));
  }

  @computed('dataSets.@each.isPassedToPlotly')
  get chartData() {
    const dataSets = this.get('dataSets');
    return dataSets.filterBy('isPassedToPlotly', true);
  }
}
