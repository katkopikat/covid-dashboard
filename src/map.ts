// eslint-disable-next-line import/no-cycle,object-curly-newline
import Leaflet from 'leaflet';
import {
  EventFunc, Params, Events, IUpdate, DataTypes,
} from './dispatch';
import mapConfig from './common/config/map.config';
import {
  Common,
  ICovidData,
  IFeature,
  IMapLegendItem,
  IMapOptions,
} from './common/models/map.model';
import geoData from './common/data/countries.geo.json';
import {
  convertDataToRelative,
  getCountryStyle,
  getDataForHeatMap,
  getGeoJsonData,
  getMapControlsTemplate,
  getTooltipTemplate,
  onCountryHighLight,
  pointToLayer,
  roundToPowerOfTen,
} from './common/helpers/map.helpers';
import { DataKey } from './common/models/common.model';
import MapService from './common/services/map.service';
import Chart from 'chart.js';

export default class Map implements IUpdate {
  private readonly root: HTMLElement;
  private readonly raiseEvent;
  private legendElement: HTMLElement;
  private settingsElement: HTMLElement;
  private tooltipElement: HTMLElement;
  private mapElement = null;
  private layer = null;
  private countriesLayer;
  private markersLayers;
  private maxZoom = 7;
  private minZoom = 1;
  private mapOptions: IMapOptions = {
    center: [0, 0],
    zoom: 2,
    minZoom: this.minZoom,
    maxZoom: this.maxZoom,
    worldCopyJump: true,
    zoomControl: false,
  };

  private data: ICovidData[];
  private countryCodeToGo: string;
  private zoomInButton: HTMLButtonElement;
  private zoomOutButton: HTMLButtonElement;
  private showLegendButton: HTMLButtonElement;
  private scale: IMapLegendItem[];
  private currentDataType: DataKey = DataKey.cases;
  private mapService: MapService;
  private dataSettings: Params;
  private countryFlyInZoom = 4;

  constructor(eventFunction: EventFunc) {
    this.raiseEvent = eventFunction;
    this.root = document.querySelector('.map');
    this.dataSettings = {
      country: 'Global',
      dataType: DataTypes.CASES,
      lastDay: false,
      per100k: false,
    };

    this.mapService = new MapService();
    this.mapService.getMapData().then((data: ICovidData[]) => {
      this.data = data;
      this.init();
    });
  }

  update(params: Params): void {
    this.dataSettings = { ...params };
    this.changeHeatMapComponents();

    if (this.dataSettings.country !== this.countryCodeToGo && this.dataSettings.country) {
      const country: ICovidData = this.getCountryById(this.dataSettings.country);
      if (country) {
        this.goToCountry([country.countryInfo.long, country.countryInfo.lat]);
      }
    }
  }

  private postSettings(settings: Params) {
    this.raiseEvent(Events.UPDATE, settings);
  }

  public init(): void {
    if (this.data) {
      this.render();
    }
  }

  private render(): void {
    this.currentDataType = this.getDataKey();
    const { per100k } = this.dataSettings;
    const { data, scale } = getDataForHeatMap(this.data, this.currentDataType, per100k);
    this.scale = scale;
    const markersGeoData = getGeoJsonData(data);
    this.renderMap(this.mapOptions);
    this.insertTooltip();
    this.insertMapControls();
    this.insertLegend();
    this.insertSettings();
    this.addTileLayer();
    this.addCountriesLayer();
    this.addMarkersLayer(markersGeoData);
    this.addSettingsListener();
    this.addResizeListener();
  }

  addResizeListener(): void {
    const mapFullButton: HTMLButtonElement = this.root.querySelector('.btn_fullscreen--map');

    if (mapFullButton) {
      mapFullButton.addEventListener('click', () => {
        setTimeout(() => {
          this.mapElement.invalidateSize();
        }, 400);
      });
    }
  }

  private getDataKey(): DataKey {
    const { dataType } = this.dataSettings;
    const { lastDay } = this.dataSettings;
    const typeAdapter = {
      [DataTypes.CASES]: DataKey.cases,
      [DataTypes.DEATH]: DataKey.deaths,
      [DataTypes.RECOVERED]: DataKey.recovered,
    };
    const lastDayAdapter = {
      [DataKey.cases]: DataKey.todayCases,
      [DataKey.deaths]: DataKey.todayDeaths,
      [DataKey.recovered]: DataKey.todayRecovered,
    };

    let type: DataKey = typeAdapter[dataType];

    if (lastDay) {
      type = lastDayAdapter[type];
    }
    return type;
  }

  private changeHeatMapComponents() {
    this.currentDataType = this.getDataKey();
    const { per100k } = this.dataSettings;
    const { data, scale } = getDataForHeatMap(this.data, this.currentDataType, per100k);
    this.scale = scale;
    const markersGeoData = getGeoJsonData(data);
    this.mapElement.removeLayer(this.markersLayers);
    this.addMarkersLayer(markersGeoData);
  }

  private renderMap(mapOptions: IMapOptions): void {
    this.mapElement = new Leaflet.Map('map', mapOptions);
  }

  private addSettingsListener(): void {
    const periodController: HTMLInputElement = this.root.querySelector('[name="period"]');
    periodController.addEventListener('change', (e: InputEvent) => {
      // period controller. Default is false -> period = all time | true -> period = one day
      const newValue: boolean = (e.target as HTMLInputElement).checked;
      const newSettings: Params = { ...this.dataSettings, lastDay: newValue };
      this.postSettings(newSettings);
    });

    const absoluteController: HTMLInputElement = this.root.querySelector('[name="numeric"]');
    absoluteController.addEventListener('change', (e: InputEvent) => {
      // absolute controller. Default is false -> numeric = absolute | true -> relative
      const newValue: boolean = (e.target as HTMLInputElement).checked;
      const newSettings: Params = { ...this.dataSettings, per100k: newValue };
      this.postSettings(newSettings);
    });

    const dataTypeControllers: NodeListOf<HTMLInputElement> = this.root.querySelectorAll(
      '[name="map_radio"]',
    );

    Array.from(dataTypeControllers).forEach((radioController: HTMLInputElement) => {
      // default cases; other - recovered | deaths
      radioController.addEventListener('change', (e: InputEvent) => {
        const newValue: string = (e.target as HTMLInputElement).value;
        const adapter = {
          cases: DataTypes.CASES,
          deaths: DataTypes.DEATH,
          recovered: DataTypes.RECOVERED,
        };

        const newSettings: Params = { ...this.dataSettings, dataType: adapter[newValue] };
        this.postSettings(newSettings);
      });
    });
  }

  private addTileLayer(): void {
    this.layer = new Leaflet.TileLayer(mapConfig.url);
    this.mapElement.addLayer(this.layer);
  }

  private addCountriesLayer(): void {
    this.countriesLayer = Leaflet.geoJSON();
    this.countriesLayer.initialize(geoData, {
      onEachFeature: (feature, layer) => {
        this.eachCountryHandler(feature, layer);
      },
      style: getCountryStyle,
    });
    this.countriesLayer.addTo(this.mapElement);
  }

  private addMarkersLayer(data: Common): void {
    this.markersLayers = Leaflet.geoJSON();
    this.markersLayers.initialize(data, {
      onEachFeature: (feature, layer) => {
        this.eachMarkerHandler(feature, layer);
      },
      pointToLayer,
    });
    this.markersLayers.addTo(this.mapElement);
  }

  private insertTooltip() {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.id = 'tooltip';
    (this.root as HTMLElement).prepend(this.tooltipElement);

    this.tooltipElement.addEventListener('mouseover', () => {
      this.tooltipElement.style.display = 'block';
    });

    this.tooltipElement.addEventListener('mouseout', () => {
      this.tooltipElement.style.display = 'none';
    });
  }

  private insertLegend() {
    this.legendElement = document.createElement('div');
    this.legendElement.className = 'map-legend';
    this.legendElement.innerHTML = '<h3>Legend</h3>';
    (this.root as HTMLElement).prepend(this.legendElement);
  }

  private insertSettings() {
    this.settingsElement = document.createElement('div');
    this.settingsElement.className = 'map-settings';
    this.settingsElement.innerHTML = '<h3>Settings</h3>';
    (this.root as HTMLElement).prepend(this.settingsElement);
  }

  private insertMapControls() {
    const mapControls: HTMLElement = document.createElement('section');
    mapControls.className = 'map-controls';
    mapControls.innerHTML = getMapControlsTemplate();

    this.zoomInButton = mapControls.querySelector('[data-zoom-in]');
    this.zoomInButton.addEventListener('click', this.zoomIn.bind(this));

    this.zoomOutButton = mapControls.querySelector('[data-zoom-out]');
    this.zoomOutButton.addEventListener('click', this.zoomOut.bind(this));

    this.showLegendButton = mapControls.querySelector('[data-show-legend]');
    this.showLegendButton.addEventListener('click', this.showLegend.bind(this));

    (this.root as HTMLElement).prepend(mapControls);
  }

  private zoomIn() {
    const newZoom = this.mapElement.getZoom() + 1;
    this.mapElement.setZoom(newZoom);
    if (newZoom === this.maxZoom) {
      this.zoomInButton.disabled = true;
    }

    this.zoomOutButton.disabled = false;
  }

  private zoomOut() {
    const newZoom = this.mapElement.getZoom() - 1;
    this.mapElement.setZoom(newZoom);
    if (newZoom === this.minZoom) {
      this.zoomOutButton.disabled = true;
    }
    this.zoomInButton.disabled = false;
  }

  private showLegend(): void {
    this.legendElement.classList.toggle('show-legend');
    if (this.legendElement.classList.contains('show-legend')) {
      this.legendElement.innerHTML = this.getLegendTemplate();
      this.settingsElement.classList.remove('show-map-settings');
      this.makeMapDisabled();
      return;
    }
    this.makeMapEnable();
  }

  private getLegendTemplate() {
    const elements: string = this.scale
      .slice()
      .reverse()
      .map((item: IMapLegendItem, index, arr) => {
        const MARKER_SIZE_STEP = 0.3;
        const { markerWeight, currentKey } = item;
        const width = Number(MARKER_SIZE_STEP * markerWeight).toFixed(1);
        const height = Number(MARKER_SIZE_STEP * markerWeight).toFixed(1);
        const styles = `width: ${width}em; height: ${height}em`;
        const minValue = roundToPowerOfTen(item.range.min, Math.floor(Math.log10(item.range.min)));
        const maxValue = roundToPowerOfTen(item.range.max, Math.floor(Math.log10(item.range.max)));
        let legendDescription = `<span>> ${minValue.toLocaleString()} - ${maxValue.toLocaleString()}</span>`;

        if (index === arr.length - 1) {
          legendDescription = `<span>1 - ${maxValue.toLocaleString()}</span>`;
        } else if (index === 0) {
          legendDescription = `<span>> ${minValue.toLocaleString()}</span>`;
        }
        return `<li class="legend-item">
            <div class="legend-marker-wrapper">
              <span class="legend-marker legend-marker--${currentKey}" style="${styles}"></span>
            </div>
            ${legendDescription}
          </li>`;
      })
      .join('');
    return `<h3 class="legend-title">Legend</h3><ul class="legend-list">${elements}</ul>`;
  }

  private makeMapDisabled() {
    this.mapElement.doubleClickZoom.disable();
    if (this.mapElement.tap) {
      this.mapElement.tap.disable();
    }
    document.getElementById('map').style.cursor = 'default';
  }

  private makeMapEnable() {
    this.mapElement.doubleClickZoom.enable();
    if (this.mapElement.tap) {
      this.mapElement.tap.enable();
    }
    document.getElementById('map').style.cursor = 'grab';
  }

  private onCountryMouseOut(e) {
    this.countriesLayer.resetStyle(e.target);
    this.hideTooltip();
  }

  private eachCountryHandler(feature: IFeature, layer) {
    layer.on({
      click: () => {
        const countryId = feature.id;
        const newCountryCodeToGo: string = countryId;

        if (this.countryCodeToGo !== newCountryCodeToGo) {
          const newSettings: Params = { ...this.dataSettings, country: newCountryCodeToGo };
          this.postSettings(newSettings);
        }
      },

      mouseover: (e: { target: { feature: IFeature } }) => {
        const countryId: string = feature.id;
        const countryName: string = feature.properties.name as string;
        const item: ICovidData = this.getCountryById(countryId);
        this.showTooltip(item, countryName, this.currentDataType);
        onCountryHighLight(e);
      },

      mouseout: (e) => this.onCountryMouseOut(e),
    });
  }

  private eachMarkerHandler(feature: IFeature, layer): void {
    layer.on({
      mouseover: (e: { target: { feature: { properties: ICovidData } } }) => {
        const item: ICovidData = e.target.feature.properties as ICovidData;
        const countryName: string = item.country;
        this.showTooltip(item, countryName, this.currentDataType);
      },

      mouseout: () => this.hideTooltip(),
    });
  }

  private showTooltip(item: ICovidData, countryName: string, currentKey: DataKey): void {
    const template = getTooltipTemplate(item, countryName, currentKey);
    this.tooltipElement.innerHTML = template;
    this.tooltipElement.style.display = 'block';
    if (item) {
      this.addChart(item);
    }
  }

  private hideTooltip(): void {
    this.tooltipElement = document.querySelector('#tooltip');
    this.tooltipElement.style.display = 'none';
  }

  private goToCountry(countryCoords: number[]) {
    this.mapElement.flyTo(countryCoords.reverse());
    this.zoomInButton.disabled = false;
    this.zoomOutButton.disabled = false;
  }

  private getCountryById(id: string): ICovidData {
    if (this.data) {
      return this.data.find(({ countryInfo }) => countryInfo.iso3 === id);
    }
    return null;
  }

  private addChart(item: ICovidData) {
    let chartData: number[] = this.dataSettings.lastDay
      ? [item.todayDeaths, item.todayCases, item.todayRecovered]
      : [item.deaths, item.cases, item.recovered];

    if (this.dataSettings.per100k) {
      const currentKey: DataKey = this.getDataKey();
      chartData = chartData.map((value: number, index: number) => {
        if (/death/gi.test(currentKey) && index === 0) {
          return value;
        }
        if (/case/gi.test(currentKey) && index === 1) {
          return value;
        }
        if (/recovered/gi.test(currentKey) && index === 2) {
          return value;
        }
        return convertDataToRelative(value, item.population);
      });
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
          },
        ],
        labels: chartLegend,
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Chart.js Doughnut Chart',
          },
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      },
    };
    const ctx = (document.getElementById('map-tooltip__chart-area') as any).getContext('2d');
    (window as any).myDoughnut = new Chart(ctx, config);
  }
}
