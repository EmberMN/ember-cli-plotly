'use strict';

module.exports = {
  name: 'ember-cli-plotly',

  // Magic incantation from https://github.com/ember-decorators/ember-decorators/issues/96#issuecomment-307318090
  init: function(app) {
    this._super.init && this._super.init.apply(this, arguments);

    this.options = this.options || {};
    this.options.babel = this.options.babel || {};
    this.options.babel.plugins = this.options.babel.plugins || [];

    // FIXME: Not sure which of these (if either) I should be using?
    if (this.options.babel.plugins.indexOf('transform-decorators-legacy') === -1) {
      this.options.babel.plugins.push('transform-decorators-legacy');
    }
    //if (this.options.babel.plugins.indexOf('transform-decorators') === -1) {
    //  this.options.babel.plugins.push('transform-decorators');
    //}
  }
};
