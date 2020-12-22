export interface IMapOptions {
  center: number[];
  zoom: number;
  minZoom: number;
  maxZoom: number;
  worldCopyJump: boolean;
  zoomControl?: boolean;
}

export interface IFeature {
  type: string;
  id: string;
  properties: { [k: string]: string | number };
}

export interface Common { [k: string]: any }

export interface ICovidData {
  active: number;
  cases: number;
  deaths: number;
  population: number;
  recovered: number;
  country: string;
  todayCases: number;
  todayDeaths: number;
  todayRecovered: number;

  countryInfo: {
    iso2: string;
    iso3: string;
    lat: number;
    long: number;
    flag: string;
  }
}

export interface ICovidDataWeight extends ICovidData {
  markerIndex: number;
  currentKey: string;
}

export interface IMapLegendItem {
  range: {
    min: number;
    max: number;
  }
  markerWeight?: number;
  currentKey?: string;
}
