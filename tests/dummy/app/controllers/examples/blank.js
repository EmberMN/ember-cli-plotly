import Controller from '@ember/controller';

export default Controller.extend({
  init() {
    this._super(...arguments);
    this.setProperties({
      chartData: [],
      chartLayout: {
        xaxis: {},
        yaxis: {}
      },
      chartOptions: {}
    });
  },
});
