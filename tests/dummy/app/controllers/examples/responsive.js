import Controller from '@ember/controller';

import getNormalDistPDF from 'dummy/utils/get-normal-dist-pdf';

const n = 1001;
const x = new Array(n).fill(0).map((z,i) => 10*(2*i/(n-1) - 1)); // [-10, ..., 10]
const chartData = [{
  x, y: x.map(getNormalDistPDF(0, 1))
}, {
  x, y: x.map(getNormalDistPDF(-1, 0.5))
}, {
  x, y: x.map(getNormalDistPDF(1, 0.7)).map(y => -y)
}];

export default Controller.extend({
  init() {
    this._super(...arguments);
    this.setProperties({
      chartData
    });
  }
});
