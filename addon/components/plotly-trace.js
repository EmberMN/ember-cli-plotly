import Component from '@ember/component';
import { observer } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import layout from '../templates/components/plotly-trace';
import debug from 'debug';
const log = debug('ember-cli-plotly:plotly-trace-component');

export default Component.extend({
  layout,
  tagName: '',
  //init() {
  //  this._super(...arguments);
  //  log('init');
  //},
  didReceiveAttrs() {
    log('didReceiveAttrs', this.get('x'), this.get('y'));
    this.setProperties({
      x: this.get('x') || [],
      y: this.get('y') || [],
      type: this.get('type') || 'scatter'
    });
  },
  //didRender() {
  //  log('didRender');
  //},

  _traceDataChanged: observer('x.[]', 'y.[]', function() {
    log('_traceDataChanged firing');
    scheduleOnce('afterRender', this, 'onTraceDataChanged');
  }),
  onTraceDataChanged() {
    log('Warning: onTraceDataChanged was not passed-in');
  },

  _traceTypeChanged: observer('type', function() {
    log('_traceTypeChanged firing');
    scheduleOnce('afterRender', this, 'onTraceTypeChanged');
  }),
  onTraceTypeChanged() {
    log('Warning: onTraceTypeChanged was not passed-in');
  }
});
