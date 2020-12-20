export enum DataKey {
  cases = 'cases',
  deaths = 'deaths',
  recovered = 'recovered',
  todayCases = 'todayCases',
  todayDeaths = 'todayDeaths',
  todayRecovered = 'todayRecovered',
}

export interface IDispatchArgument {
  country: string;
  dataKey: DataKey
  allTime?: boolean;
  lastDay?: boolean;
  absoluteValues?: boolean;
  valuesForHundredThousands?: boolean;
}

export interface IRiseEvent {
  (option: IDispatchArgument): void;
}

export interface IDispatching {
  update(options: IDispatchArgument, callback: IRiseEvent): void;
}
