import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('examples', function() {
    this.route('static');
    this.route('checkboxes');
    this.route('bound-layout');
    this.route('blank');
    this.route('lasso');
    this.route('legend-events');
    this.route('responsive');
    this.route('live-data');
    this.route('live-colors');
  });
});
