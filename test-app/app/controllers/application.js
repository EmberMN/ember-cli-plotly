import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';

export default class ApplicationController extends Controller {
  @tracked chartConfig = {};
  @tracked chartData = {
    x: [1,2,3],
    y: [10, 20, 30]
  };
  @tracked chartLayout = {};
}
