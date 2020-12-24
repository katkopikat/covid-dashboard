import _Chart from 'chart.js';
// eslint-disable-next-line import/no-cycle
import {
  EventFunc, Params, Events, DataTypes,
} from './dispatch';
import './assets/styles/chart.scss';
import ChartService from './common/services/chart.service';
import { ICovidData } from './common/models/map.model';
// eslint-disable-next-line import/no-cycle
import {
  colorSpansFromSettings,
  generateCountryData,
  generatePer100KData,
  raskrasitPoBratskiSpan,
} from './common/helpers/chart.helpers';

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
]);

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

export default class Chart {
  private mapService: any;
  private root: HTMLElement;
  private dataSet: any;
  private chartElement: HTMLElement;
  private chart: any;
  private readonly raiseEvent;
  private dataSettings: Params;
  private countriesDataSet: ICovidData;
  private population: number;
  private currentDataSet: object;
  private lastDaysData: any;
  private lastChart: any;
  private lastData: any;
  private typeOfChart: string;

  constructor(eventFunction: EventFunc) {
    this.raiseEvent = eventFunction;
    this.dataSettings = {
      country: 'GLOBAL',
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
          this.lastDaysData = {
            cases: data.todayCases,
            deaths: data.todayDeaths,
            recovered: data.todayRecovered,
            date: data.date,
          };
          this.countriesDataSet = countriesData;
          this.dataSet = globalData;
          this.lastData = globalData;
          this.init();
        });
      });
    });
  }

  render() {
    this.root.querySelector('.chart__wrapper').innerHTML = '<canvas id="myChart"></canvas>';
    this.chartElement = document.querySelector('#myChart');
    this.currentDataSet = this.dataSet.cases;
    this.chart = new _Chart(this.chartElement, {

      type: 'line',

      data: {
        labels: Object.keys(this.currentDataSet),
        datasets: [
          {
            data: Object.values(this.currentDataSet),
            backgroundColor: '#1D6DEC',
            fill: false,
          },
        ],
      },

      // Configuration options
      options: {
        responsive: true,
        legend: {
          display: false,
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            gridLines: {
              offsetGridLines: true,
              zeroLineColor: '#1E2121',
              color: '#1E2121',
            },
            ticks: {
              mirror: true,
              color: 'white',
              fontSize: 10,
              autoSkip: false,
              userCallback(item, index, values) {
                const labelsKeys = Object.keys(labels);
                if (values !== undefined) {
                  if (labelsKeys.includes(parseInt(item.slice(0, 2), 10).toString())
                    && labels[parseInt(item.slice(0, 2), 10)] === false) {
                    labels[parseInt(item.slice(0, 2), 10)] = true;
                    return mapping.get(parseInt(item.slice(0, 2), 10));
                  }
                  if (item === values[values.length - 1]) {
                    labelsKeys.forEach((key) => {
                      labels[key] = false;
                      return 'some';
                    });
                  }
                }
                return undefined;
              },
            },
          }],
          yAxes: [{
            gridLines: {
              zeroLineColor: '#1E2121',
              color: '#1E2121',
            },
            ticks: {
              userCallback(item) {
                if (item !== undefined) {
                  if (item >= 1000000) {
                    return `${item / 1000000}M`;
                  } if (item >= 1000) {
                    return `${item / 1000}k`;
                  }
                  return item;
                }
                return undefined;
              },
            },
          }],
        },
      },
    });
    this.lastChart = this.chart.config;

    this.addSettingsListeners();
  }

  init() {
    if (this.dataSet) {
      this.render();
    }
  }

  renderColorOfDataType(params) {
    switch (params.dataType) {
      case DataTypes.CASES: {
        this.chart.data = {
          labels: this.dataSettings.lastDay
            ? Object.keys(this.lastDaysData.cases) : Object.keys(this.dataSet.cases),
          datasets: [{
            data: this.dataSettings.lastDay
              ? Object.values(this.lastDaysData.cases) : Object.values(this.dataSet.cases),
            backgroundColor: '#1D6DEC',
            fill: false,
          }],
        };
        this.currentDataSet = this.dataSettings.lastDay
          ? this.lastDaysData.cases
          : this.dataSet.cases;
        this.chart.update();
        break;
      }
      case DataTypes.DEATH: {
        this.chart.data = {
          labels: this.dataSettings.lastDay
            ? Object.keys(this.lastDaysData.deaths) : Object.keys(this.dataSet.deaths),
          datasets: [{
            data: this.dataSettings.lastDay
              ? Object.values(this.lastDaysData.deaths) : Object.values(this.dataSet.deaths),
            backgroundColor: '#AA213A',
            fill: false,
          }],
        };
        this.currentDataSet = this.dataSettings.lastDay
          ? this.lastDaysData.deaths
          : this.dataSet.deaths;
        this.chart.update();
        break;
      }
      default: {
        this.chart.data = {
          labels: this.dataSettings.lastDay
            ? Object.keys(this.lastDaysData.recovered) : Object.keys(this.dataSet.recovered),
          datasets: [{
            data: this.dataSettings.lastDay
              ? Object.values(this.lastDaysData.recovered) : Object.values(this.dataSet.recovered),
            backgroundColor: '#3BCC92',
            fill: false,
          }],
        };
        this.currentDataSet = this.dataSettings.lastDay
          ? this.lastDaysData.recovered
          : this.dataSet.recovered;
        this.chart.update();
      }
    }
    this.dataSettings.dataType = params.dataType;
  }

  renderLastDayBar(params) {
    if (params.lastDay) {
      this.typeOfChart = 'bar';
    } else {
      this.typeOfChart = 'line';
    }
    if (this.typeOfChart === 'bar') {
      this.lastChart = this.chart.config;
      this.lastData = this.dataSet;
      this.chart.destroy();
      this.dataSet = { ...this.lastDaysData };
      this.chart = new _Chart(this.chartElement, {
        type: 'bar',
        data: {
          datasets: [
            {
              data: Object.values(this.currentDataSet),
              backgroundColor: '#D10F49',
              fill: false,
            },
          ],
        },
        options: {
          tooltips: {
            callbacks: {
              title: () => `Date: ${new Date(this.dataSet.date).toLocaleString()}`,
            },
          },
          responsive: true,
          legend: {
            display: false,
          },
          scales: {
            xAxes: [{
              ticks: {
                userCallback: () => new Date(this.dataSet.date).toLocaleString('EN-en', { month: 'long' }),
              },
            }],
          },
        },
      });
    } else if (this.typeOfChart === 'line') {
      this.typeOfChart = 'line';
      this.chart.destroy();
      this.dataSet = this.lastData;
      this.chart = new _Chart(this.chartElement, this.lastChart);
    }
    this.dataSettings.lastDay = params.lastDay;
    this.chart.update();
  }

  async update(params: Params) {
    if (this.dataSettings.country !== params.country) {
      const data = generateCountryData(params.country, this.countriesDataSet);

      await data.then((res) => {
        this.dataSet = res.historicalCountryData;
        this.lastDaysData = {
          cases: res.lastDaysCountryData.cases,
          deaths: res.lastDaysCountryData.deaths,
          recovered: res.lastDaysCountryData.recovered,
          date: res.lastDaysCountryData.date,
        };
        this.dataSet.date = res.lastDaysCountryData.date;
        this.population = res.population;
        this.dataSettings.country = params.country;
      });
    }

    if (this.dataSettings.lastDay !== params.lastDay) {
      this.renderLastDayBar(params);
    }

    this.renderColorOfDataType(params);

    if (params.per100k) {
      const newData = generatePer100KData({ ...this.currentDataSet }, this.population);
      this.chart.data.datasets.forEach((dataset) => {
        // eslint-disable-next-line no-param-reassign
        dataset.data = newData;
      });
      this.chart.update();
      this.dataSettings.per100k = params.per100k;
    } else {
      this.chart.data.datasets.forEach((dataset) => {
        // eslint-disable-next-line no-param-reassign
        dataset.data = Object.values(this.currentDataSet);
        this.chart.update();
        this.dataSettings.per100k = params.per100k;
      });
    }
    colorSpansFromSettings(this.dataSettings.dataType, this.root.querySelectorAll('.chart__toggle-mode'));
  }

  private postSettings(settings: Params) {
    this.raiseEvent(Events.UPDATE, settings);
  }

  addSettingsListeners(): void {
    const settingsApplyButton = this.root.querySelector('.btn__settings');
    const spanToggles = this.root.querySelectorAll('.chart__toggle-mode');
    if (settingsApplyButton) {
      settingsApplyButton.addEventListener('click', () => {
        const periodController: HTMLInputElement = this.root.querySelector('[name="period"]');
        const absoluteController: HTMLInputElement = this.root.querySelector('[name="numeric"]');

        const dataTypeControllers: NodeListOf<HTMLInputElement> = this.root.querySelectorAll(
          '[name="radio"]',
        );

        const newPeriodValue: boolean = periodController.checked;
        const newRelativeValue: boolean = absoluteController.checked;
        const checkedDataTypeController: HTMLInputElement = Array.from(dataTypeControllers)
          .filter((radioController: HTMLInputElement) => radioController.checked)[0];

        const newDataTypeValue: string = checkedDataTypeController.value;
        raskrasitPoBratskiSpan(newDataTypeValue, spanToggles);
        const adapter = {
          cases: DataTypes.CASES,
          deaths: DataTypes.DEATH,
          recovered: DataTypes.RECOVERED,
        };

        const newSettings: Params = {
          ...this.dataSettings,
          lastDay: newPeriodValue,
          per100k: newRelativeValue,
          dataType: adapter[newDataTypeValue],
        };
        this.postSettings(newSettings);
      });
    }

    spanToggles.forEach((span) => {
      span.addEventListener('click', (e) => {
        const adapter = {
          cases: DataTypes.CASES,
          deaths: DataTypes.DEATH,
          recovered: DataTypes.RECOVERED,
        };
        const dataTypeControllers: NodeListOf<HTMLInputElement> = this.root.querySelectorAll(
          '[name="radio"]',
        );

        if ((e.target as HTMLElement).textContent === 'Recovered') {
          spanToggles.forEach((sp) => {
            sp.classList.remove('chart-mode-cases');
            sp.classList.remove('chart-mode-recovered');
            sp.classList.remove('chart-mode-deaths');
          });
          span.classList.add('chart-mode-recovered');
        }
        if ((e.target as HTMLElement).textContent === 'Deaths') {
          spanToggles.forEach((sp) => {
            sp.classList.remove('chart-mode-cases');
            sp.classList.remove('chart-mode-recovered');
            sp.classList.remove('chart-mode-deaths');
          });
          span.classList.add('chart-mode-deaths');
        }
        if ((e.target as HTMLElement).textContent === 'Cases') {
          spanToggles.forEach((sp) => {
            sp.classList.remove('chart-mode-cases');
            sp.classList.remove('chart-mode-recovered');
            sp.classList.remove('chart-mode-deaths');
          });
          span.classList.add('chart-mode-cases');
        }
        dataTypeControllers.forEach((controller) => {
          if (controller.value === (e.target as HTMLElement).textContent.toLowerCase()) {
            // eslint-disable-next-line no-param-reassign
            controller.checked = true;
          }
        });

        const newSettings: Params = {
          ...this.dataSettings,
          dataType: adapter[(e.target as HTMLElement).textContent.toLowerCase()],
        };
        this.postSettings(newSettings);
      });
    });
  }
}
