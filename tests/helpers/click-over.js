import { getRootElement, triggerEvent } from '@ember/test-helpers';
import debug from 'debug';
const log = debug('ember-cli-plotly:test');

function getScaleFactor(element) {
  const { transform } = window.getComputedStyle(element);
  let scaleFactor = 1;
  if (transform === 'none') {
    log(`no transformation applied; keeping default scaleFactor of ${scaleFactor}`);
  } else {
    const matchResults = transform.match(/matrix\((.*)\)/);
    if (matchResults) {
      const matrixConstants = matchResults[1].split(',').map(parseFloat);
      if (matrixConstants[0] === matrixConstants[3]) {
        scaleFactor = matrixConstants[0];
      } else {
        log('not sure how to determine scale factor from this matrix');
      }
    } else {
      log('unknown transformation');
    }
  }
  return scaleFactor;
}

function getCoordinates(target, container, scaleFactor) {
  container = container || target;
  scaleFactor = scaleFactor || 1;
  const containerRect = container.getBoundingClientRect();
  const c = {
    x: containerRect.x, // containerRect.left + containerRect.width/2,
    y: containerRect.y  //containerRect.top + containerRect.height/2
  };

  const targetRect = target.getBoundingClientRect();
  const t = {
    x: targetRect.x + targetRect.width/2,
    y: targetRect.y + targetRect.height/2
  };

  const coordinates = {
    x: c.x + (t.x - c.x - targetRect.width/2)/scaleFactor,
    y: c.y + (t.y - c.y - targetRect.height/2)/scaleFactor,
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
   - It seems to be incompatible with `transform: scale(0.5)`, which
     is applied by default to `#ember-testing`

  @public
  @param {Element} target the element or selector to click "over"
  @return {Promise<void>} resolves after settling
*/
export default function clickOver(target) {
  return async function() {
    const root = getRootElement();
    const scaleFactor = getScaleFactor(root);
    const { x, y } = getCoordinates(target, root, scaleFactor);
    const mouseEventProps = {
      clientX: x,
      clientY: y
    };
    const clickElement = document.elementFromPoint(x, y);
    if (!clickElement) {
      throw new Error(`Could not identify element at (${x},${y})`, clickElement);
    }
    await triggerEvent(clickElement, 'mousedown', mouseEventProps);
    await triggerEvent(document, 'mouseup', mouseEventProps);
    log('clickOver done', root, scaleFactor, mouseEventProps);
  }();
}
