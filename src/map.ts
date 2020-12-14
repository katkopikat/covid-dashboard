export default class Map {
  private root: HTMLElement;

  constructor() {
    this.root = document.querySelector('#map');
    this.root.innerHTML = 'MAP';
  }
}
