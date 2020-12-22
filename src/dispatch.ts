// eslint-disable-next-line import/no-cycle
import Chart from './chart';
// eslint-disable-next-line import/no-cycle
import Map from './map';
// eslint-disable-next-line import/no-cycle
import Countries from './countries';
// eslint-disable-next-line import/no-cycle
import Dashboard from './dashboard';

export interface Params {
  country?: string,
  dataType?: DataTypes,
  lastDay?: boolean,
  per100k?: boolean,
}

export type EventFunc = (message: Events, params: Params) => void;

export enum Events {
  UPDATE,
}

export enum DataTypes {
  CASES,
  RECOVERED,
  DEATH,
}

export interface IUpdate {
  update(params: Params): void;
}

export default class Dispatch {
  private chart: Chart;
  private map: Map;
  private countries: Countries;
  private dashboard: Dashboard;

  constructor() {
    const eventFunction: EventFunc = this.processEvent;
    this.chart = new Chart(eventFunction);
    this.map = new Map(eventFunction);
    this.countries = new Countries(eventFunction);
    this.dashboard = new Dashboard(eventFunction);
  }

  processEvent = (message: Events, params: Params) => {
    switch (message) {
      case Events.UPDATE: {
        this.chart.update(params);
        this.map.update(params);
        this.countries.update(params);
        this.dashboard.update(params);
        break;
      }
      default: break;
    }
  };

  start() {
    console.log('started', this);
  }
}
