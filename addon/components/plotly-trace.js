import Component from '@ember/component';
import layout from '../templates/components/plotly-trace';
//import debug from 'debug';
//debug = debug('ember-cli-plotly:plotly-trace-component');

export default Component.extend({
  layout,
  tagName: '',
  init() {
    this._super(...arguments);
    this.setProperties({
      x: [],
      y: [],
      type: 'scatter'
    });
  },
  didInsertElement() {
    //debug('didInsertElement');
  }
});
