// eslint-disable-next-line import/no-cycle,object-curly-newline
import { EventFunc, Params, Events, IUpdate, DataTypes } from './dispatch';

export default class Dashboard implements IUpdate {
  private readonly root: HTMLElement;
  private readonly raiseEvent;

  constructor(eventFunction: EventFunc) {
    this.raiseEvent = eventFunction;
    this.root = document.querySelector('#dashboard');
    // this.root.innerHTML = 'DASHBOARD';
  }

  update(params: Params): void {
    console.log(params, this);
  }

  example() {
    this.raiseEvent(Events.UPDATE, { country: 'Global', lastDay: true, per100K: false });
  }
}
