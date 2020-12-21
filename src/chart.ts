// eslint-disable-next-line import/no-cycle,object-curly-newline
import { EventFunc, Params, Events, IUpdate, DataTypes } from './dispatch';

export default class Chart implements IUpdate {
  private readonly root: HTMLElement;
  private readonly raiseEvent;

  constructor(eventFunction: EventFunc) {
    this.raiseEvent = eventFunction;
    this.root = document.querySelector('#chart');
    // this.root.innerHTML = 'CHART';
  }

  update(params: Params) {
    console.log(params, this);
  }

  example() {
    this.raiseEvent(Events.UPDATE, { country: 'Global', lastDay: true, per100K: false });
  }
}
