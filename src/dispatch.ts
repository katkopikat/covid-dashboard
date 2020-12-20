import Chart from './chart';
import Map from './map';
import Countries from './countries';
import Dashboard from './dashboard';

const endpoints = {
  summary: 'https://api.covid19api.com/summary',
  countries: 'https://disease.sh/v3/covid-19/countries',
};

export default class Dispatch {
  private chart: Chart;
  private map: Map;
  private countries: Countries;
  private dashboard: Dashboard;

  constructor() {
    fetch(endpoints.countries, {
      method: 'GET',
      // headers: {
      //   'X-Access-Token': '5cf9dfd5-3449-485e-b5ae-70a60e997864',
      // },
    })
      .then((response) => response.json())
      .then((data) => {
        this.chart = new Chart();
        this.map = new Map(data);
        this.map.init();
        this.countries = new Countries();
        this.dashboard = new Dashboard();
      });
  }

  start() {
    console.log('started', this);
  }
}
