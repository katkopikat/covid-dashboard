// eslint-disable-next-line import/no-cycle,object-curly-newline
import { EventFunc, Params, Events, IUpdate, DataTypes } from './dispatch';
export default class Dashboard implements IUpdate {
  private readonly root: HTMLElement;
  private readonly raiseEvent;
  private dataSettings: Params;
  private endpointsLink: string;
  private country;
  private openFullScreen: boolean;
  /* eslint-disable linebreak-style */
  constructor(eventFunction: EventFunc) {
    this.raiseEvent = eventFunction;
    this.root = document.querySelector('.dashboard');
    this.dataSettings = {
      country: 'GLOBAL',
      dataType: DataTypes.CASES,
      lastDay: false,
      per100k: false,
    };

    this.country = {};
    this.addSettingsListener();
    this.renderDashboard();
  }

  update(params: Params): void {
    this.dataSettings = { ...params };
    this.updateParamsDisplay(this.dataSettings);
    this.renderDashboard();
  }

  updateParamsDisplay(p: Params): void {
    const settingsEl : HTMLElement = document.querySelector('.settings__dashboard');
    (settingsEl.querySelector('[name="period"]') as HTMLInputElement).checked = p.lastDay;
    (settingsEl.querySelector('[name="numeric"]') as HTMLInputElement).checked = p.per100k;
  }

  private addSettingsListener(): void {
    let newSettings: Params = { ...this.dataSettings } ;
    const periodController: HTMLInputElement = this.root.querySelector('[name="period"]');
    // period controller. Default is false -> period = all time | true -> period = one day
    periodController.addEventListener('change', (e) => {
      const newValuePeriod: boolean = (e.target as HTMLInputElement).checked;
      newSettings = { ...this.dataSettings, lastDay: newValuePeriod };
    });

    const absoluteController: HTMLInputElement = this.root.querySelector('[name="numeric"]');
    // absolute controller. Default is false -> numeric = absolute | true -> relative
    absoluteController.addEventListener('change', (e) => {
      const newValueNumeric: boolean = (e.target as HTMLInputElement).checked;
      newSettings = { ...this.dataSettings, per100k: newValueNumeric };
    });

     const okBtnSettings: HTMLInputElement = this.root.querySelector('.btn__settings');
     okBtnSettings.addEventListener('click', (e) => {
       this.postSettings(newSettings);
       this.update(newSettings)
     })
  }

  private postSettings(settings: Params): void {
    this.raiseEvent(Events.UPDATE, settings);
  }

  private render(): void{
    this.renderCountryName();
    this.renderData();
  }

  private renderDashboard(): void  {
    const endpointsLink: string = Dashboard.getLink(this.dataSettings.country);
    this.getData(endpointsLink).then(() => this.render());
  }

  static getLink(country: string): string {
    const link: string = country === 'GLOBAL' ? 'all' : `countries/${country}`;
    const url: string = `https://disease.sh/v3/covid-19/${link}`;
    return url;
  }

  private async getData(request: RequestInfo): Promise<any> {
    const loader: HTMLElement = this.root.querySelector('.loader')
    loader.classList.add('loader--active');
    const response = await fetch(request);
    const dataObj = await response.json();
    loader.classList.remove('loader--active');
    this.country = { ...dataObj };
    return dataObj;
  }

  private calcPerPopulation(param: string): string {
    const { population } = this.country;
    const dataNumb = parseInt(param, 10);
    const numb: number = ((dataNumb / population) * 100000).toFixed(3);
    return Dashboard.formatNumber(numb);
  }

  private renderCountryName(): void {
    const countryCases: HTMLElement = this.root.querySelector('.heading__section--cases');
    const countryRecovered: HTMLElement = this.root.querySelector('.heading__section--recovery');
    const countryDeath: HTMLElement = this.root.querySelector('.heading__section--death');
    if (this.dataSettings.country === 'GLOBAL') {
      countryCases.textContent = 'Global Cases';
      countryRecovered.textContent = 'Global Recovered';
      countryDeath.textContent = 'Global Deaths';
    } else {
      countryCases.textContent = `Cases for ${this.dataSettings.country}`;
      countryRecovered.textContent = `Recovered for ${this.dataSettings.country}`;
      countryDeath.textContent = `Deaths for ${this.dataSettings.country}`;
    }
  }

  static formatNumber(num: string | number): string {
    const n = String(num);
    // eslint-disable-next-line no-useless-concat
    return n.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, '$1' + ' ');
  }

  private renderData(): void {
    const numberCases: HTMLElement = this.root.querySelector('.dashboard__number--cases');
    const numberRecovered: HTMLElement = this.root.querySelector('.dashboard__number--recovered');
    const numberDeath: HTMLElement = this.root.querySelector('.dashboard__number--death');

    const { per100k } = this.dataSettings;
    const { lastDay } = this.dataSettings;
    const { todayCases } = this.country;
    const { todayRecovered } = this.country;
    const { todayDeaths } = this.country;
    const { cases } = this.country;
    const { recovered } = this.country;
    const { deaths } = this.country;

    const tempCases: string = lastDay ? todayCases : cases;
    const tempRecovered: string = lastDay ? todayRecovered : recovered;
    const tempDeaths: string = lastDay ? todayDeaths : deaths;

    if (todayCases === undefined || todayRecovered === undefined || todayDeaths === undefined
      || cases === undefined || recovered === undefined || deaths === undefined ){
      numberCases.textContent = '-- -- --';
      numberRecovered.textContent = '-- -- --';
      numberDeath.textContent = '-- -- --';
    } else {

      numberCases.textContent = per100k
      ? this.calcPerPopulation(tempCases)
      : Dashboard.formatNumber(tempCases);

    numberRecovered.textContent = per100k
      ? this.calcPerPopulation(tempRecovered)
      : Dashboard.formatNumber(tempRecovered);

    numberDeath.textContent = per100k
      ? this.calcPerPopulation(tempDeaths)
      : Dashboard.formatNumber(tempDeaths);
    }
  }
}
