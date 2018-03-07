import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return {
      examples: [{
        name: 'Static data',
        route: 'examples.static'
      }]
    }
  }
});
