export default class Chart {
  private root: HTMLElement;

  constructor() {
    this.root = document.querySelector('#chart');
    this.root.innerHTML = 'CHART';
  }
}
