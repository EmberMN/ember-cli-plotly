import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import generateDataSets from 'dummy/utils/datasets'

import * as debug from 'debug';
const log = debug('ember-cli-plotly:dummy:lasso');

export default class LassoExampleController extends Controller.extend({
  init() {
    this._super(...arguments);
    this.setProperties({
      chartData: generateDataSets().map(trace => Object.assign(trace, {
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
