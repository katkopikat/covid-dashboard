export default class Dashboard {
  private root: HTMLElement;

  constructor() {
    this.root = document.querySelector('#dashboard');
    this.root.innerHTML = 'DASHBOARD';
  }
}
