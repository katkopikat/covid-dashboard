import Leaflet from 'leaflet';
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
  getCountryStyle,
  getDataForHeatMap,
  getGeoJsonData,
  getMapControlsTemplate,
  getSettingsTemplate,
  getTooltipTemplate,
  onCountryHighLight,
  pointToLayer,
  roundToPowerOfTen,
} from './common/helpers/map.helpers';
import {
  DataKey,
} from './common/models/common.model';

export default class Map {
  private root: HTMLElement;
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
  private absoluteData: ICovidData[];
  private relatedData: ICovidData[];
  private countryCodeToGo: string;
  private zoomInButton: HTMLButtonElement;
  private zoomOutButton: HTMLButtonElement;
  private showLegendButton: HTMLButtonElement;
  private scale: IMapLegendItem[];
  private dataType = DataKey;
  private currentDataType: DataKey = DataKey.cases;

  constructor(covidData: ICovidData[]) {
    this.data = covidData;
    this.root = document.querySelector('#map');
  }

  public init(): void {
    if (this.data) {
      this.render(this.currentDataType);
    }
  }

  private render(dataKey: DataKey): void {
    const { data, scale } = getDataForHeatMap(this.data, dataKey);
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
  }

  private changeHeatMapComponents(dataKey: DataKey) {
    const { data, scale } = getDataForHeatMap(this.data, dataKey);
    this.scale = scale;
    const markersGeoData = getGeoJsonData(data);
    this.mapElement.removeLayer(this.markersLayers);
    this.addMarkersLayer(markersGeoData);
  }

  private renderMap(mapOptions: IMapOptions): void {
    this.mapElement = new Leaflet.Map('map', mapOptions);
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

    this.showLegendButton = mapControls.querySelector('[data-show-settings]');
    this.showLegendButton.addEventListener('click', this.showSettings.bind(this));
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

  private showSettings(): void {
    this.settingsElement.classList.toggle('show-map-settings');
    if (this.settingsElement.classList.contains('show-map-settings')) {
      this.settingsElement.innerHTML = getSettingsTemplate();

      document.getElementById('case').addEventListener('click', () => {
        this.currentDataType = this.dataType.cases;
        this.changeHeatMapComponents(this.currentDataType);
      });
      document.getElementById('recovered').addEventListener('click', () => {
        this.currentDataType = this.dataType.recovered;
        this.changeHeatMapComponents(this.currentDataType);
      });
      document.getElementById('deaths').addEventListener('click', () => {
        this.currentDataType = this.dataType.deaths;
        this.changeHeatMapComponents(this.currentDataType);
      });
      this.legendElement.classList.remove('show-legend');
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

  // private changeDataType(value: string): void {
  //   console.log(value);
  // }

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
          this.countryCodeToGo = newCountryCodeToGo;
          const country: ICovidData = this.getCountryById(countryId);
          if (country) {
            this.goToCountry([country.countryInfo.long, country.countryInfo.lat]);
          }
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
  }

  private hideTooltip(): void {
    this.tooltipElement = document.querySelector('#tooltip');
    this.tooltipElement.style.display = 'none';
  }

  private goToCountry(countryCoords: number[]) {
    this.mapElement.flyTo(countryCoords.reverse(), 5);
  }

  private getCountryById(id: string): ICovidData {
    if (this.data) {
      return this.data.find(({ countryInfo }) => countryInfo.iso3 === id);
    }
    return null;
  }
}
