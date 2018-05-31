import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return [{
      id: 'blank',
      name: 'No data'
    }, {
      id: 'static',
      name: 'Static data'
    }, {
      id: 'checkboxes',
      name: 'Computed via checkboxes'
    }, {
      id: 'bound-layout',
      name: 'Chart layout details bound to computed properties'
    }, {
      id: 'lasso',
      name: 'Select traces with lasso'
    }, {
      id: 'live-data',
      name: 'Update chart as "live" data is generated'
    }, {
      id: 'legend-events',
      name: 'Handle legend click/doubleclick events'
    }, {
      id: 'responsive',
      name: 'Responsive / fluid layout'
    }];
  }
});
