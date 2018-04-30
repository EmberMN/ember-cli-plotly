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
      name: 'Bound layout'
    }];
  }
});
