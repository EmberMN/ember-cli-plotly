import { getRootElement, triggerEvent } from '@ember/test-helpers';
import debug from 'debug';
const log = debug('ember-cli-plotly:test');

/// returns coordinates relative to viewport (e.g. `clientX` & `clientY`)
function getCoordinates(target, container) {
  container = container || target;
  const containerRect = container.getBoundingClientRect();
  const c = {
    x: containerRect.x, // containerRect.left + containerRect.width/2,
    y: containerRect.y, // containerRect.top +  containerRect.height/2
  };
  const targetRect = target.getBoundingClientRect();
  const t = {
    x: targetRect.x + targetRect.width/2,
    y: targetRect.y + targetRect.height/2
  };

  const coordinates = {
    x: c.x + (t.x - c.x - targetRect.width/2),
    y: c.y + (t.y - c.y - targetRect.height/2),
  };
  log('coordinates', coordinates, containerRect, targetRect);
  return coordinates;
}


/**
  This helper is designed to work-around the following
  annoying implementation details of the plotly.js library:
   - It uses a transparent "drag cover" div to handle all mouse events,
     so dispatching a click event to a `path.point` element, for example,
     will not result in the `plotly_click` event that would come from
     a real pointer click at that same screen location.
     See https://community.plot.ly/t/how-to-simulate-mouse-events-e-g-click/8828


  @public
  @param {Element} target the element or selector to click "over"
  @return {Promise<void>} resolves after settling
*/
export default async function clickOver(target) {
  const root = getRootElement();
  const { x, y } = getCoordinates(target, root);
  const mouseEventProps = {
    clientX: x,
    clientY: y,
  };
  // elementFromPoint only works for points that are within the viewport
  if (x > window.innerWidth || y > window.innerHeight) {
    window.scrollTo(x, y);
    // start over since the viewport changed (and thus coordinates changed)
    return clickOver(target);
  }
  const clickElement = document.elementFromPoint(x, y);
  if (!clickElement) {
    throw new Error(`Could not identify element at (${x},${y})`, clickElement);
  }
  await triggerEvent(clickElement, 'mousedown', mouseEventProps);
  await triggerEvent(document, 'mouseup', mouseEventProps);
  log('clickOver done', root, mouseEventProps);
}
