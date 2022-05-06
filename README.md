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
* Node.js v14 or above (maybe even 12) though only v18 is tested in CI

Installation
------------------------------------------------------------------------------

You can install this via the usual `ember install ember-cli-plotly` process,
but this addon doesn't have any special blueprints, so installing via
package manager is sufficient:

```
npm install --save-dev ember-cli-plotly
```

Make sure that your project also includes plotly.js,
which is a peer dependency of this addon.
```
npm install --save-prod plotly.js
```

You'll also need to make sure that [`ember-auto-import`](https://github.com/ef4/ember-auto-import)
is [configured](https://github.com/ef4/ember-auto-import#customizing-build-behavior) so that
`plotly.js` will resolve to the actual [bundle](https://github.com/plotly/plotly.js/blob/master/dist/README.md#bundle-information)
that you want to use, e.g. [`plotly-basic-dist-min`](https://www.npmjs.com/package/plotly.js-basic-dist-min).
Plotly.js may also require some polyfills as well so that webpack can work with it.
Take a look at the [configuration for this addon's test app](./ember-cli-build.js)
for an example of how this can be done.

Usage
------------------------------------------------------------------------------

This addon exports a `<Plotly />` component which attempts to map the
[JavaScript API provided by plotly.js](https://plotly.com/javascript/reference/)
to something more conducive to use in an Ember application.
Using the component effectively replaces calling [`Plotly.newPlot/react`](https://plotly.com/javascript/plotlyjs-function-reference/#plotlynewplot).
Its template creates the ["graph div" (gd)](https://plotly.com/javascript/getting-started/#start-plotting)
with modifiers to handle setup and teardown.
Attributes passed to the component will be applied to that.
However, if you need to change the id you must pass it via the `@id` argument.
Otherwise, a unique (pseudorandom) id will be generated.

The `@data`, `@config`, and `@layout` arguments get passed to `Plotly.newPlot/react`.
If you want the chart to automatically update when data is changed, 
take a look at [`ember-deep-tracked`](https://github.com/NullVoxPopuli/ember-deep-tracked),
which can be used to track nested properties (like the numbers in `@data[0].x`).

Since [Plotly's events](https://plotly.com/javascript/plotlyjs-events/)
are not emitted as "normal" DOM events, one cannot simply
~~`{{on "plotly_something" this.doSomething}}`~~.
Rather one needs to use methods added to the gd element
(namely, `.on`, `removeEventListener`, and `removeAllListeners`).
For convenience, this `<Plotly />` component will accept an `@on`
argument containing a map of event names to handlers
(e.g. `@on={{hash plotly_click=this.myClickHandler plotly_legendclick=this.myLegendClickHandler}}`).



Examples
------------------------------------------------------------------------------

### Static

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
      name="y = -x - 1"
      x=(array 0 2) 
      y=(array -1 -3)
      type="scatter"
    ) 
  }}
/>
```

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
