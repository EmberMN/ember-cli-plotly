import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import generateDataSets from 'dummy/utils/datasets';

export default class LassoExampleController extends Controller {
  @tracked config = {};
  @tracked data = generateDataSets().map((trace) =>
    Object.assign(trace, {
      mode: 'lines+markers',
      line: {
        shape: 'spline',
      },
    })
  );
  @tracked layout = {
    dragmode: 'lasso',
  };
  @tracked selectedPoints = [];

  //@computed('data', 'selectedPoints.@each.curveNumber')
  get selectedTraces() {
    const selectedPoints = this.selectedPoints;
    console.log(`selectedTraces got selectedPoints =`, selectedPoints);
    if (selectedPoints) {
      const data = this.data;
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
            name: data[i].name || '',
          };
        });
      return result;
    } else {
      return [];
    }
  }

  @action
  onPlotlyClick(eventData) {
    console.log(`onPlotlyClick -->`, eventData);
  }

  @action
  onPlotlySelected(eventData) {
    console.log(`onPlotlySelected -->`, eventData);
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
