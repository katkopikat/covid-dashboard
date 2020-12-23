import { ICovidData, ICovidGlobalData } from '../models/map.model';

export default class DoughnutService {
  private endpoints: { [k: string]: string };
  constructor() {
    this.endpoints = {
      countries: 'https://disease.sh/v3/covid-19/countries',
      global: 'https://disease.sh/v3/covid-19/all',
    };
  }

  async getCountriesData(): Promise<ICovidData[]> {
    const response = await fetch(this.endpoints.countries, {
      method: 'GET',
    });
    const data: ICovidData[] = await response.json();
    return data;
  }

  async getGlobalData(): Promise<ICovidGlobalData> {
    const response = await fetch(this.endpoints.global, {
      method: 'GET',
    });
    const data: ICovidGlobalData = await response.json();
    return data;
  }
}
