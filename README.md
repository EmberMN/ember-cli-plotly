# ember-cli-plotly

[![Build Status](https://travis-ci.org/EmberMN/ember-cli-plotly.svg?branch=master)](https://travis-ci.org/EmberMN/ember-cli-plotly)

This addon strives to make it easy & efficient to use
[plotly.js](https://plot.ly/javascript/) in Ember applications.
If you want to work with the plotly.js API directly then you may instead want to use
[ember-plotly-shim](https://github.com/brianhjelle/ember-plotly-shim)
to just import the library into the pipeline.

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

```js
// my-app/config/environment.js

module.exports = function (environment) {
  const ENV = {
    // ...
    // ember-cli-plotly
    plotlyComponent: {
      defaultOptions: {
        // Override plotly defaults
      }
    },
    // ember-plotly-shim
    plotly: {
      // See https://github.com/brianhjelle/ember-plotly-shim#usage
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

export default Controller.extend({
  init() {
    this._super(...arguments);
    this.setProperties({
      chartLayout: {
        // Layout options
        // See https://plot.ly/javascript/reference/#layout
      },
      chartOptions: {
        // Override default options 
        // See https://github.com/plotly/plotly.js/blob/master/src/plot_api/plot_config.js
      }
    });
  },
  chartData: computed('model.{x,y,type}', function() {
    return {
      x: this.get('model.x'),
      y: this.get('model.y'),
      type: this.get('model.type')
    };
  }),
  onPlotlyEvent(eventName, ...args) {
    const handler = {
      plotly_click(...args) {
        console.log('Received `plotly_click` event', ...args);
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
});
```

```handlebars
{{! my-app/app/templates/somewhere.hbs }}
{{plot-ly
  chartData=chartData
  chartLayout=chartLayout
  chartOptions=chartOptions
  onPlotlyEvent=onPlotlyEvent
}}

```



:warning: The information below was automatically generated
(it needs to be updated)

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-cli-plotly`
* `npm install`

### Linting

* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `npm test` – Runs `ember try:each` to test your addon against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
