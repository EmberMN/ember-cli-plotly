import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import generateDataSets from 'dummy/utils/datasets';

export default class ExamplesLegendEventsController extends Controller {
  @tracked lastClicked;
  @tracked lastDoubleClicked;
  @tracked data = generateDataSets();

  @tracked config = {
    doubleClickDelay: 300,
  };

  @action
  onLegendClick(eventData) {
    // Note that this function will also run on single click events
    // See https://www.somesolvedproblems.com/2018/07/how-do-you-make-plotlys-click-and.html
    console.log(`onLegendClick got eventData -->`, eventData);
    const { curveNumber } = eventData;
    this.lastClicked = `${curveNumber} ${Date.now()}`;
  }

  @action
  onLegendDoubleClick(eventData) {
    console.log(`onLegendClick got eventData -->`, eventData);
    const { curveNumber } = eventData;
    this.lastDoubleClicked = `${curveNumber} ${Date.now()}`;
    return false; // signals default behavior should not apply
  }
}
