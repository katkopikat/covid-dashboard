import _Chart from 'chart.js'
import { EventFunc, Params, Events, IUpdate, DataTypes } from './dispatch';
import './assets/styles/chart.scss'
import ChartService from "./common/services/chart.service";
import {ICovidData} from "./common/models/map.model";
import {generatePer100KData} from "./common/helpers/chart.helpers";

const mapping: Map<number, string> = new Map([
  [1, 'Jan'],
  [2, 'Feb'],
  [3, 'Mar'],
  [4, 'Apr'],
  [5, 'May'],
  [6, 'June'],
  [7, 'July'],
  [8, 'Aug'],
  [9, 'Sep'],
  [10, 'Oct'],
  [11, 'Nov'],
  [12, 'Dec'],
])

const labels = {
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false,
  7: false,
  8: false,
  9: false,
  10: false,
  11: false,
  12: false,
};

export interface ResponseEbywii {
  date?: number;
  timeline?: {
    cases: Map<string , number>,
    deaths: Map<string , number>,
    recovered: Map<string , number>,
  }
  cases?: Map<string , number>,
  deaths?: Map<string , number>,
  recovered?: Map<string , number>,
}

export default class Chart {
  private mapService: any;
  private root: HTMLElement;
  private dataSet: ResponseEbywii
  private chartElement: HTMLElement;
  private chart: any;
  private readonly raiseEvent;
  private dataSettings: Params;
  private countriesDataSet: ICovidData;
  private population: number;
  private currentDataSet: object;
  private lastDaysData: ResponseEbywii;
  private lastChart: any;
  private lastData: any;


  constructor(eventFunction: EventFunc) {
    this.raiseEvent = eventFunction;
    this.dataSettings = {
      country: 'Global',
      dataType: DataTypes.CASES,
      lastDay: false,
      per100k: false,
    };
    this.root = document.querySelector('.chart');
    this.mapService = new ChartService();
    this.mapService.getGlobalData().then((globalData) => {
      this.mapService.getCountryData().then((countriesData) => {
        this.mapService.getGlobalLastDaysData().then((data) => {
          this.population = data.population;
          this.lastDaysData = {cases: data.todayCases, deaths: data.todayDeaths, recovered: data.todayRecovered, date: data.date}
          this.countriesDataSet = countriesData;
          this.dataSet = globalData;
          this.lastData = globalData;
          this.init()
        })
      })
    })
  }

  render() {
    this.root.querySelector('.chart__wrapper').innerHTML = `<canvas id="myChart"></canvas>`;
    this.chartElement = document.querySelector('#myChart');
    this.currentDataSet = this.dataSet.cases;
    this.chart = new _Chart(this.chartElement, {

      type: 'line',

      data: {
        labels:Object.keys(this.currentDataSet),
        datasets: [
          {
            data: Object.values(this.currentDataSet),
            backgroundColor: '#D10F49',
            fill: false,
          }
        ],
      },

      // Configuration options
      options: {
        responsive: true,
        legend: {
          display: false
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            gridLines: {
              offsetGridLines: true,
              zeroLineColor: '#1E2121',
              color: '#1E2121'
            },
            ticks: {
              mirror: true,
              color: 'white',
              fontSize: 10,
              autoSkip: false,
              userCallback: function(item, index, values) {
                const labelsKeys = Object.keys(labels);
                if (values !== undefined) {
                  if (labelsKeys.includes(parseInt(item.slice(0,2)).toString()) && labels[parseInt(item.slice(0,2))] === false) {
                    labels[parseInt(item.slice(0,2))] = true;
                    return mapping.get(parseInt(item.slice(0,2)))
                  }
                  if (item === values[values.length - 1]) {
                    labelsKeys.forEach((key) => {
                      labels[key] = false;
                      return 'some';
                    })
                  }
                }
              },
            }
          }],
          yAxes: [{
            gridLines: {
              zeroLineColor: '#1E2121',
              color: '#1E2121',
            },
            ticks: {
              userCallback: function(item, index, values) {
                if (item !== undefined) {
                  if (item >= 1000000) {
                    return `${item / 1000000}M`
                  } if (item >= 1000) {
                    return `${item / 1000}k`
                  }
                  return item
                }
              },
            }
          }]
        }
      }
    })
    this.lastChart = this.chart.config;

      this.addSettingsListeners()
  }

  init() {
    if (this.dataSet) {
      this.render()
    }
  }

//this.chart.data.datasets[0].data
//  country: 'Global',
//       dataType: DataTypes.CASES,
//       lastDay: false,
//       per100k: false,

  renderColorOfDataType() {
    switch (this.dataSettings.dataType) {
      case DataTypes.CASES: {
        this.chart.data = {
          labels:Object.keys(this.dataSet.cases),
          datasets: [{
            data: Object.values(this.dataSet.cases),
            backgroundColor: '#AA213A',
            fill: false
        }]}
        this.currentDataSet = this.dataSet.cases
        this.chart.update()
        break
      }
      case DataTypes.DEATH: {
        this.chart.data = {
          labels:Object.keys(this.dataSet.deaths),
          datasets: [{
            data: Object.values(this.dataSet.deaths),
            backgroundColor: '#1D6DEC',
            fill: false
          }]}
        this.currentDataSet = this.dataSet.deaths
        this.chart.update()
        break
      }
      default: {
        this.chart.data = {
          labels: Object.keys(this.dataSet.recovered),
          datasets: [{
            data: Object.values(this.dataSet.recovered),
            backgroundColor: '#3BCC92',
            fill: false
          }]}
        this.currentDataSet = this.dataSet.recovered
        this.chart.update()
      }
    }
  }

  renderLastDayBar() {
    if (this.dataSettings.lastDay) {
      this.lastChart = this.chart.config;
      this.lastData = this.dataSet;
      this.chart.destroy();
      this.dataSet = {...this.lastDaysData};
      this.chart = new _Chart(this.chartElement, {
        type: 'bar',
        data: {
          datasets: [
            {
              data: Object.values(this.currentDataSet),
              backgroundColor: '#D10F49',
              fill: false,
            }
          ],
        },
        options: {
          tooltips: {
            callbacks: {
              title: () => {
                return new Date(this.dataSet.date)
              }
            }
          },
          responsive: true,
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                userCallback: (item, index, values) => {
                  return new Date(this.dataSet.date).toLocaleString('default', { month: 'long' });
                },
              }
            }],
          }
        }
      })
    } else {
      this.chart.destroy();
      this.dataSet = this.lastData
      this.chart = new _Chart(this.chartElement, this.lastChart);
    }
  }

  update(params: Params) {
    this.dataSettings = params;
    this.renderLastDayBar();
    this.renderColorOfDataType();


    if (this.dataSettings.per100k) {
      const newData = generatePer100KData({...this.currentDataSet}, this.population);
      this.chart.data.datasets.forEach((dataset) => {
        dataset.data = newData
      })
    } else {
      this.chart.data.datasets.forEach((dataset) => {
        dataset.data = Object.values(this.currentDataSet);
      })
    }
    this.chart.update()
  }

  private postSettings(settings: Params) {
    this.raiseEvent(Events.UPDATE, settings);
  }

  addSettingsListeners(): void {
    const periodController: HTMLInputElement = this.root.querySelector('[name="period"]');
    const absoluteController: HTMLInputElement = this.root.querySelector('[name="numeric"]');
    const dataTypesControllers: NodeListOf<HTMLInputElement> = this.root.querySelectorAll('#chart_cases, #chart_deaths, #chart_recovered');

    periodController.addEventListener('change', (e:InputEvent) => {
      const newValue: boolean = (e.target as HTMLInputElement).checked;
      const newSettings: Params = {...this.dataSettings, lastDay: newValue};
      this.postSettings(newSettings);
    })

    absoluteController.addEventListener('change', (e: InputEvent) => {
      const newValue: boolean = (e.target as HTMLInputElement).checked;
      const newSettings: Params = {...this.dataSettings, per100k: newValue};

      this.postSettings(newSettings);
    })

    dataTypesControllers.forEach((radioController: HTMLInputElement) => {
      radioController.addEventListener('change', (e: InputEvent) => {
        const newValue: string = (e.target as HTMLInputElement).value;
        const adapter = {
          cases: DataTypes.CASES,
          deaths: DataTypes.DEATH,
          recovered: DataTypes.RECOVERED,
        }
        const newSetting: Params = {...this.dataSettings, dataType: adapter[newValue] };
        this.postSettings(newSetting)
      })
    })

  }
}
