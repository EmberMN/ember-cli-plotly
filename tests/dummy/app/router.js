import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('examples', function() {
    this.route('static');
    this.route('checkboxes');
    this.route('bound-layout');
    this.route('blank');
  });
});

export default Router;
