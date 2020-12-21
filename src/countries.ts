// eslint-disable-next-line import/no-cycle
import { EventFunc, Params, Events } from './dispatch';

export default class Countries {
  private root: HTMLElement;
  private readonly raiseEvent;

  constructor(eventFunction: EventFunc) {
    this.raiseEvent = eventFunction;
    this.root = document.querySelector('#countries');
    // this.root.innerHTML = 'COUNTRIES';
  }

  update(params: Params) {
    console.log(params, this);
  }

  example() {
    this.raiseEvent(Events.UPDATE, { country: 'Global', lastDay: true, per100K: false });
  }
}
