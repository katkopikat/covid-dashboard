import Chart from 'chart.js';
import { convertDataToRelative } from './common/helpers/map.helpers';
import { DataKey } from './common/models/common.model';
import { ICovidData, ICovidGlobalData } from './common/models/map.model';
import DoughnutService from './common/services/doughnut.service';
// eslint-disable-next-line import/no-cycle
import {
  DataTypes, EventFunc, IUpdate, Params,
} from './dispatch';

export default class Doughnut implements IUpdate {
  private readonly root: HTMLElement;
  private readonly raiseEvent;
  private dataSettings: Params;
  private dataService: DoughnutService;
  private globalData: ICovidGlobalData;
  private countriesData: ICovidData[];

  constructor(eventFunction: EventFunc) {
    this.raiseEvent = eventFunction;
    this.root = document.querySelector('.piechart');
    this.dataSettings = {
      country: 'Global',
      dataType: DataTypes.CASES,
      lastDay: false,
      per100k: false,
    };
    this.dataService = new DoughnutService();
    this.dataService.getGlobalData().then((data: ICovidGlobalData) => {
      this.globalData = data;
      this.init(this.globalData);
    });
  }

  update(params: Params): void {
    this.dataSettings = params;
    if (this.dataSettings.country !== 'global') {
      if (!this.countriesData) {
        this.dataService.getCountriesData().then((data: ICovidData[]) => {
          this.countriesData = data;
          this.renderForCountry();
        });
      } else {
        this.renderForCountry();
      }
    }
  }

  private init(data: ICovidGlobalData | ICovidData): void {
    if (data) {
      this.render(data);
    }
  }

  private renderForCountry(): void {
    const country: ICovidData = this.getCountryById(this.dataSettings.country);
    this.render(country);
  }

  private render(data: ICovidData | ICovidGlobalData): void {
    this.insertChartTemplate();
    this.addChart(data);
  }

  private insertChartTemplate(): void {
    const template = `
    <div id="doughnut__canvas-holder">
      <canvas id="doughnut__chart-area" style="width:150px;height: 150px;"></canvas>
    </div>
    <div id="doughnut__legend" class="noselect"></div>`;
    this.root.innerHTML = template;
  }

  private getCountryById(id: string): ICovidData {
    if (this.countriesData) {
      return this.countriesData.find(({ countryInfo }) => countryInfo.iso3 === id);
    }
    return null;
  }

  private addChart(item: ICovidData | ICovidGlobalData) {
    let chartData: number[];
    if (item) {
      chartData = this.dataSettings.lastDay
        ? [item.todayDeaths, item.todayCases, item.todayRecovered]
        : [item.deaths, item.cases, item.recovered];

      if (this.dataSettings.per100k) {
        chartData = chartData
          .map((value: number) => convertDataToRelative(value, item.population));
      }
    } else {
      chartData = [0, 0, 0];
    }

    const chartLegend: string[] = this.dataSettings.lastDay
      ? [DataKey.todayDeaths, DataKey.todayCases, DataKey.todayRecovered]
      : [DataKey.deaths, DataKey.cases, DataKey.recovered];

    const config = {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: chartData,
            backgroundColor: [
              '#AA213A',
              '#1d6dec',
              '#3BCC92',
            ],
            label: 'Dataset 1',
            borderColor: 'transparent',
            weight: 1,
          },
        ],
        labels: chartLegend,
      },
      options: {
        responsive: false,
        cutoutPercentage: 80,
        legend: false,
        legendCallback: (chart) => {
          let text = `<ul class="${chart.id}-legend doghnut-legend">`;
          for (let i = 0; i < chart.data.datasets[0].data.length; i += 1) {
            text = `${text}<li class="doghnut-legend__item">
              <span class="doghnut-legend__example" style="background-color: ${chart.data.datasets[0].backgroundColor[i]}"></span>`;
            if (chart.data.labels[i]) {
              text = `${text}<span class="doghnut-legend__key">${chart.data.labels[i]}</span>`;
            }
            text = `${text}</li>`;
          }
          text = `${text}</ul>`;
          return text;
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
        tooltips: {
          callbacks: {
            title: (tooltipItem, data) => data.labels[tooltipItem[0].index],
            label: (tooltipItem, data) => Number(
              data.datasets[0].data[tooltipItem.index],
            ).toLocaleString(),
          },
        },
      },
    };
    const ctx = (document.getElementById('doughnut__chart-area') as any).getContext('2d');
    const chart = new Chart(ctx, config);
    (document.getElementById('doughnut__legend') as any).innerHTML = chart.generateLegend();
  }
}
