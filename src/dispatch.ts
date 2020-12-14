import Chart from './chart';
import Map from './map';
import Countries from './countries';
import Dashboard from './dashboard';

export default class Dispatch {
  private chart: Chart;
  private map: Map;
  private countries: Countries;
  private dashboard: Dashboard;

  constructor() {
    this.chart = new Chart();
    this.map = new Map();
    this.countries = new Countries();
    this.dashboard = new Dashboard();
  }

  start() {
    console.log('started', this);
  }
}
