export default class Countries {
  private root: HTMLElement;

  constructor() {
    this.root = document.querySelector('#countries');
    this.root.innerHTML = 'COUNTRIES';
  }
}
