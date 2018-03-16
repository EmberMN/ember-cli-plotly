import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';

import * as debug from 'debug';
const log = debug('ember-cli-plotly:dummy:lasso');

const n = 101;
const x = new Array(n).fill(0).map((z,i) => 5*(2*i/(n-1) - 1)); // [-5, ..., 5]

export default class LassoExampleController extends Controller.extend({
  init() {
    this._super(...arguments);
    this.setProperties({
      chartData: [{
        name: 'y = -5',
        x,
        y: x.map(() => -5)
      }, {
        name: 'y = 2x-1',
        x,
        y: x.map(x => 2*x-1)
      }, {
        name: 'y = 1.5x',
        x,
        y: x.map(x => 1.5*x)
      }, {
        name: 'y = -1.8x + noise',
        x,
        y: x.map(x => -1.8*x + 2*(1-Math.random()))
      }, {
        name: 'y = 1/x',
        x,
        y: x.map(x => 1/x),
      }, {
        name: 'y = x*sin(2*x)',
        x,
        y: x.map(x => x*Math.sin(2*x)),
      }].map(trace => Object.assign(trace, {
        mode: 'lines+markers',
        line: {
          shape: 'spline'
        }
      })),
      chartLayout: {
        dragmode: 'lasso'
      },
      chartOptions: {
      },
      plotlyEvents: ['plotly_selected'],
      selectedPoints: [],
    });
  }
}) {

  @computed('selectedPoints', 'selectedPoints.@each.curveNumber')
  get selectedTraces() {
    const selectedPoints = this.get('selectedPoints');
    log(`selectedTraces got selectedPoints =`, selectedPoints);
    if (selectedPoints) {
      const chartData = this.get('chartData');
      const result = selectedPoints.map(point => point.curveNumber)
        .reduce((a, sp) => { if (!a.includes(sp)) { a.push(sp); } return a; }, [])
        .map(i => {
          return {
            index: i,
            name: chartData[i].name || ''
          };
        });
      return result;
    } else {
      return [];
    }
  }

  @action
  onPlotlyEvent(eventName, eventData) {
    log(`onPlotlyEvent got ${eventName} -->`, eventData);
    this.set('selectedPoints', eventData.points.map(p => {
      return {
        curveNumber: p.curveNumber,
        pointIndex: p.pointIndex,
        pointNumber: p.pointNumber,
        x: p.x,
        y: p.y
      };
    }));
  }
}
