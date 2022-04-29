ember-cli-plotly
==============================================================================

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FEmberMN%2Fember-cli-plotly%2Fbadge&style=flat)](https://github.com/EmberMN/ember-cli-plotly/actions)
[![Latest NPM release](https://img.shields.io/npm/v/ember-cli-plotly)](https://www.npmjs.com/package/ember-cli-plotly)
[![Maintainability](https://api.codeclimate.com/v1/badges/a99a88d28ad37a79dbf6/maintainability)](https://codeclimate.com/github/codeclimate/codeclimate/maintainability)
[![Ember Observer Score](https://emberobserver.com/badges/ember-cli-plotly.svg)](https://emberobserver.com/addons/ember-cli-plotly)

This addon strives to make it easy & efficient to use [plotly.js](https://plot.ly/javascript/) in Ember applications.

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v12 or above
  (though only v16 is tested in CI)
* [Plotly.js](https://plotly.com/javascript/) v2.x
  (this addon leaves it as a peer dependency so that
   you can pick which version you want to use)

Installation
------------------------------------------------------------------------------

```
ember install ember-cli-plotly
# or (since this addon does not have any special blueprints, etc.)
npm install --save-dev ember-cli-plotly

# plotly.js is a peer dependency of this addon
npm install --save-dev plotly.js
```

Usage
------------------------------------------------------------------------------

Refer to the [examples in the 'dummy app'](./tests/dummy/app/controllers/examples/) for some working examples.


### Example: Static

```handlebars
<Plotly
  @data={{array
    (hash
      name="y = 2x" 
      x=(array 1 2 3) 
      y=(array 2 4 6)
      type="scatter"
    ) 
    (hash 
      name="y = -x -1"
      x=(array 0 2) 
      y=(array -1 -3)
      type="scatter"
    ) 
  }}
/>
```

### Example: Dynamic

```js
// my-app/config/environment.js
// FIXME: Configuring this addon here is not yet supported :(
module.exports = function (environment) {
  const ENV = {
    // ...
    // ember-cli-plotly
    plotlyComponent: {
      defaultConfig: {
        // Override plotly.js defaults
        displaylogo: false
      },
    },
    // ...
  };
  // ...
  return ENV;
};
```

```js
// my-app/app/routes/somewhere.js
import Route from '@ember/route';

export default Route.extend({
  model() {
    return {
      x: [1, 2, 3],
      y: [2, 4, 6],
      type: 'bar'
    }
  }
});
```

```js
// my-app/app/controllers/somewhere.js
import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default class SomeController extends Controller {
  layout = {
   // Layout options
   // See https://plot.ly/javascript/reference/#layout
  };
  config = {
   // Override default options from config/environment.js & plotly.js
   // See https://github.com/plotly/plotly.js/blob/master/src/plot_api/plot_config.js
  };
  // Component will listen for these events and forward them via onPlotlyEvent
  plotlyEvents = ['plotly_restyle'];

  @computed('model.{x,y,type}')
  get data() {
    return {
      x: this.get('model.x'),
      y: this.get('model.y'),
      type: this.get('model.type')
    };
  }
  
  onPlotlyEvent(eventName, ...args) {
    const handler = {
      plotly_restyle(...args) {
        console.log('Received `plotly_restyle` event', ...args);
      },
      // ... 
      // Can add handlers here for plotly events
      // See https://plot.ly/javascript/plotlyjs-events/
      // ...
    }[eventName] || ((...args) => {
      console.log(`No handler was defined for ${eventName}`, ...args);
    });
    handler(...args);
  }
}
```

```handlebars
{{! my-app/app/templates/somewhere.hbs }}
<Plotly
  @data=data
  @layout=layout
  @config=config
  @onPlotlyEvent=onPlotlyEvent
  @isResponsive=true
/>
```

## Debugging

This package uses [`debug`](https://github.com/visionmedia/debug)
with the `ember-cli-plotly` namespace, so you should be able to use one of the following
procedures to make debug messages visible (see [docs](https://github.com/visionmedia/debug)):

* Run `require('debug').enable('ember-cli-plotly:*')` from DevTools console
  (or manually set `localStorage.debug = 'ember-cli-plotly:*'`)
* Set `DEBUG="ember-cli-plotly:*"` environment variable


## License

This project is licensed under the [MIT License](LICENSE.md).
