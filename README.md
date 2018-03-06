# ember-cli-plotly

[![Build Status](https://travis-ci.org/EmberMN/ember-cli-plotly.svg?branch=master)](https://travis-ci.org/EmberMN/ember-cli-plotly)

This addon strives to make it easy & efficient to use
[plotly.js](https://plot.ly/javascript/) in Ember applications.
If you want to It uses [ember-plotly-shim](https://github.com/brianhjelle/ember-plotly-shim)
to import the library into the pipeline.
As , declarative API 

## Installation

```
ember install ember-cli-plotly
```

## TODO: Write documentation

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
import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  chartData: computed('model.x', 'model.y', function() {
    return {
      x: this.get('model.x'),
      y: this.get('model.y'),
      type: 'bar'
    };
  });
});
```

```handlebars
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
