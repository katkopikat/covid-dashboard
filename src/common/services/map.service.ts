import { ICovidData } from '../models/map.model';

export default class MapService {
  private endpoints: { [k: string]: string };
  constructor() {
    this.endpoints = {
      countries: 'https://disease.sh/v3/covid-19/countries',
    };
  }

  async getMapData(): Promise<ICovidData[]> {
    const response = await fetch(this.endpoints.countries, {
      method: 'GET',
    });
    const data: ICovidData[] = await response.json();
    return data;
  }
}
