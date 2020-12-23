// eslint-disable-next-line import/no-cycle,object-curly-newline
import { EventFunc, Params, Events, IUpdate, DataTypes } from './dispatch';

async function getData() {
  const results = await Promise.all([
    fetch('https://disease.sh/v3/covid-19/all'),
    fetch('https://disease.sh/v3/covid-19/countries'),
  ]);
  const res = [await results[0].json(), await results[1].json()];
  return res;
}

export default class Countries implements IUpdate {
  private readonly searchInput: HTMLInputElement;
  private readonly countriesList: HTMLElement;
  private readonly countryHeader: HTMLElement;
  private readonly dateOfUpd: HTMLElement;
  private readonly raiseEvent: EventFunc;
  private currentCountry: string;
  private data;

  constructor(eventFunction: EventFunc) {
    this.raiseEvent = eventFunction;
    this.searchInput = document.querySelector('#search_country');
    this.countriesList = document.querySelector('ul.countries__list');
    this.countryHeader = document.querySelector('span.header__heading--country');
    this.dateOfUpd = document.querySelector('span.header__update-time');

    this.init();
  }

  init(): void {
    this.searchInput.addEventListener('input', () => {
      this.redrawList(this.getParams());
    });

    document.querySelector('.countries .btn__settings').addEventListener('click', () => {
      this.raiseEvent(Events.UPDATE,
        { ...this.getParams(), country: this.getIso(this.currentCountry) });
    });

    this.countriesList.addEventListener('click', (ev) => {
      let ul: HTMLElement = ev.target as HTMLElement;
      while (ul.nodeName !== 'LI') {
        ul = ul.parentElement;
      }

      this.updateCountry(ul.querySelector('.country__name').textContent);
      this.raiseEvent(Events.UPDATE,
        { ...this.getParams(), country: this.getIso(this.currentCountry) });
    });

    getData().then((res) => {
      const world = res[0];
      world.country = 'Global';
      world.countryInfo = { iso3: 'GLOBAL', flag: './assets/images/global-flag.png' };
      this.data = [world, ...res[1]].filter((el) => el.country !== 'MS Zaandam' && el.country !== 'Diamond Princess');
      this.updateCountry('Global');
      this.redrawList(this.getParams());
    });
  }

  updateCountry(countryName: string): void {
    this.currentCountry = countryName;
    this.countryHeader.textContent = this.currentCountry === 'Global' ? '' : ` for ${this.currentCountry}`;
    this.updateDate(countryName);
  }

  private updateDate(countryName: string): void {
    const { updated } = this.data.find((el) => el.country === countryName);
    const date: Date = new Date(updated);
    this.dateOfUpd.textContent = `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU')}`;
  }

  getParams(): Params {
    const p: Params = {
      country: this.currentCountry,
    };

    const settingsEl : HTMLElement = document.querySelector('.settings__countries');

    p.lastDay = (settingsEl.querySelector('[name="period"]') as HTMLInputElement).checked;
    p.per100k = (settingsEl.querySelector('[name="numeric"]') as HTMLInputElement).checked;

    settingsEl.querySelectorAll('[name="country_radio"]')
      .forEach((el: HTMLInputElement, i: number) => {
        if (el.checked) {
          p.dataType = i as DataTypes;
        }
      });

    return p;
  }

  setParams(p: Params): void {
    const settingsEl : HTMLElement = document.querySelector('.settings__countries');

    (settingsEl.querySelector('[name="period"]') as HTMLInputElement).checked = p.lastDay;
    (settingsEl.querySelector('[name="numeric"]') as HTMLInputElement).checked = p.per100k;

    settingsEl.querySelectorAll('[name="country_radio"]').forEach((el: HTMLInputElement, i: number) => {
      // eslint-disable-next-line no-param-reassign
      el.checked = i as DataTypes === p.dataType;
    });
    this.currentCountry = this.data.find((el) => el.countryInfo.iso3 === p.country).country;
  }

  update(pars: Params): void {
    this.setParams(pars);
    this.redrawList(pars);
  }

  redrawList(pars: Params): void {
    const toTens = (x: number): number => Math.round(x * 10) / 10;
    type DataFunc = (data) => number;
    const fData: Array<Array<Array<DataFunc>>> = [
      [ // All time
        [ // All cases
          (data) => data.cases,
          (data) => data.recovered,
          (data) => data.deaths,
        ],
        [ // per 100 K
          (data) => toTens(data.casesPerOneMillion / 10),
          (data) => toTens(data.recoveredPerOneMillion / 10),
          (data) => toTens(data.deathsPerOneMillion / 10),
        ],
      ],
      [ // Last Day
        [ // All cases
          (data) => data.todayCases,
          (data) => data.todayRecovered,
          (data) => data.todayDeaths,
        ],
        [ // per 100 K
          (data) => toTens(data.todayCases / data.population / 1e-5),
          (data) => toTens(data.todayRecovered / data.population / 1e-5),
          (data) => toTens(data.todayDeaths / data.population / 1e-5),
        ],
      ],
    ];

    const formatter: Intl.NumberFormat = new Intl.NumberFormat();
    const getValue: Function = fData[pars.lastDay ? 1 : 0][pars.per100k ? 1 : 0][pars.dataType];
    const colorClass: string = ['country__number--cases', 'country__number--recovered',
      'country__number--deaths'][pars.dataType];
    const filterValue = this.searchInput.value.toLowerCase();

    this.countriesList.innerHTML = '';
    this.data.sort((a, b) => getValue(b) - getValue(a));
    this.data
      .filter((el) => !filterValue || el.country.toLowerCase().includes(filterValue))
      .forEach((el) => {
        this.countriesList.insertAdjacentHTML('beforeend', `<li class="countries__item">
        <span class="flag"><img class="country__flag" src="${el.countryInfo.flag}"></span>
        <span class="country__number ${colorClass}">${formatter.format(getValue(el))}</span>
        <span class="country__name">${el.country}</span></li>`);
      });
  }

  getIso(countryName: string): string {
    return this.data
      .find((el) => el.country === countryName)
      .countryInfo.iso3;
  }
}
