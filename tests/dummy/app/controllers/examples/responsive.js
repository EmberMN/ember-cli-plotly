import Controller from '@ember/controller';

const n = 1001;
const x = new Array(n).fill(0).map((z,i) => 10*(2*i/(n-1) - 1)); // [-10, ..., 10]
const getNormalDistPDF = (mu, sigma) => {
  // See PDF equation here: https://en.wikipedia.org/wiki/Log-normal_distribution
  const k1 = 1 / (Math.sqrt(2*Math.PI*sigma*sigma));
  const k2 = 2 * sigma * sigma;
  return x => k1*Math.exp(-Math.pow(x-mu, 2) / k2);
};
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
