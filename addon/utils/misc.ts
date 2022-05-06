import { warn } from "@ember/debug";
/// PlotlyHTMLElement is like HTMLElement but has `.on` method defined.
/// The plotly.js library adds this when a plot is initialized that uses
/// this container element.
import { PlotlyHTMLElement } from './plotly-api';

/// This function checks that the argument it receives is truthy and has an .on method.
/// If it does, we conclude that it's type is PlotlyHTMLElement.
/// See https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
export function validateGraphDiv(gd: PlotlyHTMLElement | HTMLElement | null): gd is PlotlyHTMLElement {
  warn(
    `Did not receive graph <div> with valid .on(...) method. Please make sure plotly.js has initialized.`,
    !gd || typeof (gd as PlotlyHTMLElement).on !== 'function',
    { id: 'ember-cli-plotly.invalid-graph-div' }
  );
  return Boolean(gd && 'on' in gd && typeof gd.on === 'function');
}

export function validateEventHandlerArgs(eventName, handler) {
  warn(
    `Could not bind plotly.js event handler: plotlyEventName must be a string (got ${eventName})`,
    typeof eventName !== 'string',
    { id: 'ember-cli-plotly.invalid-event-handler' }
  );
  warn(
    `Could not bind plotly.js event handler: handler must be a function (got ${handler})`,
    typeof handler !== 'function',
    { id: 'ember-cli-plotly.invalid-event-handler' }
  );
  return typeof eventName === 'string' && typeof handler === 'function';
}
