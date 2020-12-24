// const chartService = async function () {
//   const data = await fetch('https://disease.sh/v3/covid-19/historical/Belarus?lastdays=all')
//   return data.json();
// }

<<<<<<< HEAD

import {ICovidData} from "../models/map.model";
import {IGlobalData} from "../models/chart.model";
=======
import { ICovidData } from '../models/map.model';
>>>>>>> develop

export default class ChartService {
  private endpoints: { [k: string]: string };
  constructor() {
    this.endpoints = {
<<<<<<< HEAD
      countries: 'https://disease.sh/v3/covid-19/countries?yesterday=true',
=======
      countries: 'https://disease.sh/v3/covid-19/countries',
>>>>>>> develop
      global: 'https://disease.sh/v3/covid-19/historical/all?lastdays=all',
      globalPopulation: 'https://disease.sh/v3/covid-19/all',
    };
  }

  async getCountryData() {
    const response = await fetch(this.endpoints.countries);

    const data: ICovidData[] = await response.json();
<<<<<<< HEAD
    return data
=======
    return data;
>>>>>>> develop
  }

  async getHistoricalCountryData(iso3) {
    const response = await fetch(`https://disease.sh/v3/covid-19/historical/${iso3}?lastdays=all`);

    const data = await response.json();

    return data.timeline;
  }

  async getGlobalData() {
    const response = await fetch(this.endpoints.global);

<<<<<<< HEAD
    const data: IGlobalData = await response.json();
=======
    const data = await response.json();
>>>>>>> develop

    return data;
  }

  async getGlobalLastDaysData() {
    const response = await fetch(this.endpoints.globalPopulation).then((res) => res.json());

    return {
      date: response.updated,
      population: response.population,
<<<<<<< HEAD
      todayDeaths: {month: response.todayDeaths},
      todayCases: {month: response.todayCases},
      todayRecovered: {month: response.todayRecovered},
    };
  }


}

=======
      todayDeaths: { month: response.todayDeaths },
      todayCases: { month: response.todayCases },
      todayRecovered: { month: response.todayRecovered },
    };
  }

  async getGlobalAllData() {
    const globalData = await this.getGlobalData();
    const globalLastDaysData = await this.getGlobalLastDaysData();

    return [globalData, globalLastDaysData];
  }
}
>>>>>>> develop
