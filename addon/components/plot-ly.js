import Component from '@ember/component';
import layout from '../templates/components/plot-ly';
import debug from 'debug';
const log = debug('ember-cli-plotly:plot-ly-component');

export default Component.extend({
  layout,
  init() {
    this._super(...arguments);
    this.setProperties({
      plotlyContainerId: `ember-cli-plotly-${Date.now()}`,
      traces: [],
      title: '',
      xaxis: {},
      yaxis: {}
    });
  },
  didInsertElement() {
    log('didInsertElement');
  }
});
