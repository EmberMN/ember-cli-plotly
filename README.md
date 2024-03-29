# ember-cli-plotly

[![Latest NPM release](https://img.shields.io/npm/v/ember-cli-plotly)](https://www.npmjs.com/package/ember-cli-plotly)
[![Maintainability](https://api.codeclimate.com/v1/badges/a99a88d28ad37a79dbf6/maintainability)](https://codeclimate.com/github/codeclimate/codeclimate/maintainability)
[![Ember Observer Score](https://emberobserver.com/badges/ember-cli-plotly.svg)](https://emberobserver.com/addons/ember-cli-plotly)
[![Dependencies up to date](https://david-dm.org/EmberMN/ember-cli-plotly/status.svg)](https://david-dm.org/EmberMN/ember-cli-plotly)


This addon strives to make it easy & efficient to use
[plotly.js](https://plot.ly/javascript/) in Ember applications.

## Installation

```
ember install ember-cli-plotly
```

## TODO: Write documentation / create github pages

## Usage

:exclamation: This API should be considered unstable for all v0.x versions of this addon.

## Examples

### Static
This example uses [`ember-array-helper`](https://github.com/kellyselden/ember-array-helper).

```handlebars
{{plot-ly
  chartData=(array
    (hash
      name='y = 2x' 
      x=(array 1 2 3) 
      y=(array 2 4 6)
      type='scatter'
    ) 
    (hash 
      name='y = -x -1'
      x=(array 0 2) 
      y=(array -1 -3)
      type='scatter'
    ) 
  )
}}
```

### Dynamic
(See the [examples in the 'dummy app'](./tests/dummy/app/controllers/examples/))

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
      defaultEvents: [/* list names of plotly events to forward by default */]
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

export default class SomeController extends Controller.extend({
  init() {
    this._super(...arguments);
    this.setProperties({
      chartLayout: {
        // Layout options
        // See https://plot.ly/javascript/reference/#layout
      },
      chartConfig: {
        // Override default options from config/environment.js & plotly.js
        // See https://github.com/plotly/plotly.js/blob/master/src/plot_api/plot_config.js
      },
      // Component will listen for these events and forward them via onPlotlyEvent
      plotlyEvents: ['plotly_restyle']
    });
  }
}) {
  @computed('model.{x,y,type}')
  get chartData() {
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
{{plot-ly
  chartData=chartData
  chartLayout=chartLayout
  chartConfig=chartConfig
  onPlotlyEvent=onPlotlyEvent
  isResponsive=true
}}

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
