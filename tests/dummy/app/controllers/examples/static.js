import Controller from '@ember/controller';

export default Controller.extend({
  init() {
    this._super(...arguments);
    const x1 = [-3, -2, -1, 0, 1, 2, 3];
    const angles = new Array(60).fill(0).map((z,i) => -Math.PI + i*2*Math.PI/60);
    this.setProperties({
      chartData: [{
        x: x1,
        y: x1.map(x => Math.pow(x,2)),
        type: 'bar',
        bar: {
          color: '#7267ff',
        }
      }, {
        x: angles,
        y: angles.map(x => 2*Math.sin(5*x) + 10),
        type: 'scatter',
        line: {
          color: '#ff5737',
          dash: 'dash'
        }
      }, {
        // Smily :)
        x: [-0.7, 0.7, -1, -0.5, 0, 0.5, 1],
        y: [6, 6, 3, 2, 1.5, 2, 3],
        mode: 'markers',
        type: 'scatter',
        marker: {
          symbol: 'x-dot',
          size: 10,
          color: '#9c9802'
        }
      }],
      chartLayout: {
        xaxis: {
          //range: [-3.5, 3.5]
        },
        yaxis: {
          //range: [-15, 15]
        }
      },
      chartOptions: {}
    });
  },
});
