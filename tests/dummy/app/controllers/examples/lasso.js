import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import generateDataSets from 'dummy/utils/datasets';

import debug from 'debug';
const log = debug('ember-cli-plotly:dummy:lasso');

export default class LassoExampleController extends Controller {
  @tracked chartConfig = {};
  @tracked chartData = generateDataSets().map((trace) =>
    Object.assign(trace, {
      mode: 'lines+markers',
      line: {
        shape: 'spline',
      },
    })
  );
  @tracked chartLayout = {
    dragmode: 'lasso',
  };
  @tracked selectedPoints = [];

  //@computed('chartData', 'selectedPoints.@each.curveNumber')
  get selectedTraces() {
    const selectedPoints = this.selectedPoints;
    log(`selectedTraces got selectedPoints =`, selectedPoints);
    if (selectedPoints) {
      const chartData = this.chartData;
      const result = selectedPoints
        .map((point) => point.curveNumber)
        .reduce((a, sp) => {
          if (!a.includes(sp)) {
            a.push(sp);
          }
          return a;
        }, [])
        .map((i) => {
          return {
            index: i,
            name: chartData[i].name || '',
          };
        });
      return result;
    } else {
      return [];
    }
  }

  @action
  onPlotlyClick(eventData) {
    log(`onPlotlyClick -->`, eventData);
  }

  @action
  onPlotlySelected(eventData) {
    log(`onPlotlySelected -->`, eventData);
    if (eventData?.points instanceof Array) {
      this.selectedPoints = eventData.points.map((p) => {
        return {
          curveNumber: p.curveNumber,
          pointIndex: p.pointIndex,
          pointNumber: p.pointNumber,
          x: p.x,
          y: p.y,
        };
      });
    }
  }
}
