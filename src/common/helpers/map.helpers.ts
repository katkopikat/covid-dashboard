import Leaflet from 'leaflet';
import {
  ICovidData,
  ICovidDataWeight,
  IMapLegendItem,
} from '../models/map.model';
import { DataKey } from '../models/common.model';

const getCountryStyle = () => ({
  fillColor: '#E3E3E3',
  weight: 1,
  opacity: 0,
  color: 'white',
  fillOpacity: 0,
});

function onCountryHighLight(e) {
  const layer = e.target;

  layer.setStyle({
    weight: 2,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7,
  });

  if (!Leaflet.Browser.ie && !Leaflet.Browser.opera) {
    layer.bringToFront();
  }
}

const getMarkerSize = (numb: number, scale: IMapLegendItem[]): number => {
  const element: IMapLegendItem = scale.find(
    (item: IMapLegendItem) => numb >= item.range.min && numb <= item.range.max,
  );
  if (element) {
    return element.markerWeight;
  }
  return 1;
};

const generateScale = (
  value: number,
  currentKey: string,
  maxItemsCount = 9,
  startDiv = 2,
): IMapLegendItem[] => {
  let scale: IMapLegendItem[] = [];
  let count = 0;

  for (let i = value; i >= 1000 || count < maxItemsCount; i /= startDiv) {
    const minValue: number = Math.floor(i / startDiv);
    const maxValue: number = Math.floor(i);
    const item: IMapLegendItem = {
      range: {
        min: minValue,
        max: maxValue,
      },
      currentKey,
    };
    scale.push(item);
    count += 1;
    if (minValue === 1) {
      break;
    }
  }

  if (scale.length > maxItemsCount) {
    scale = generateScale(value, currentKey, maxItemsCount, startDiv + 1);
  }
  return scale;
};

const getScaleWithWeight = (scale: IMapLegendItem[]) => {
  const scaleWithWeight = [...scale.slice().reverse()];
  return scaleWithWeight.map((item: IMapLegendItem, index: number) => ({
    ...item,
    markerWeight: index + 1,
  }));
};

const convertDataToRelative = (value: number, population: number) => {
  const POPULATION_STEP = 100000;
  return Math.round(value / (population / POPULATION_STEP));
};

const getDataForHeatMap = (
  countries: ICovidData[],
  currentKey = 'cases',
  relative = false,
): { data: ICovidDataWeight[]; scale: IMapLegendItem[] } => {
  let copyData = [...countries];

  if (relative) {
    copyData = copyData
      .filter((item: ICovidData) => item.population)
      .map((item: ICovidData) => ({
        ...item,
        [currentKey]: convertDataToRelative(item[currentKey], item.population),
      }));
  }
  copyData.sort((a, b) => {
    if (a[currentKey] > b[currentKey]) {
      return 1;
    }
    if (a[currentKey] < b[currentKey]) {
      return -1;
    }
    return 0;
  });

  const scale = generateScale(copyData.slice(-1)[0][currentKey], currentKey);
  const scaleWithWeight = getScaleWithWeight(scale);

  const data = copyData.map((item: ICovidData) => ({
    ...item,
    markerIndex: getMarkerSize(item[currentKey], scaleWithWeight),
    currentKey,
  }));
  return {
    data,
    scale: scaleWithWeight,
  };
};

const pointToLayer = (feature: { [k: string]: any }, latlng: number[]) => {
  const MARKER_SIZE_STEP = 0.3;
  const { markerIndex, currentKey } = feature.properties;
  const width = MARKER_SIZE_STEP * markerIndex;
  const height = MARKER_SIZE_STEP * markerIndex;
  const html = `
    <span class="icon-marker icon-marker--${currentKey}" style="width: ${width}em; height: ${height}em"></span>
  `;

  return Leaflet.marker(latlng, {
    icon: Leaflet.divIcon({
      className: 'icon',
      html,
    }),
    riseOnHover: true,
  });
};

const getGeoJsonData = (data: ICovidData[]): { [k: string]: any } => {
  const geoJson = {
    type: 'FeatureCollection',
    features: data
      .map((country: ICovidData) => {
        const { lat, long } = country.countryInfo;
        if (!lat || !long) {
          return null;
        }

        return {
          type: 'Feature',
          properties: {
            ...country,
          },
          geometry: {
            type: 'Point',
            coordinates: [long, lat],
          },
        };
      })
      .filter((item) => item),
  };
  return geoJson;
};

const roundToPowerOfTen = (num: number, pow: number): number => {
  const div = 10 ** pow;
  const fixedValue = 0;
  return Number(Number(num / div).toFixed(fixedValue)) * div;
};

const getMapControlsTemplate = () => `
  <h3 class="visually-hidden">controls</h3>
  <button class="map-controls__button" data-zoom-in>+</button>
  <button class="map-controls__button" data-zoom-out>-</button>
  <button class="map-controls__button" data-show-legend>L</button>
  <button class="map-controls__button" data-show-settings>S</button>`;

const getTooltipTemplate = (item: ICovidData, countryName: string, currentKey: DataKey): string => {
  let template = `
      <div>
        <h3>${(item && item.country) || countryName}</h3>
      </div>`;

  if (item) {
    template = `
        <div>
          <h3>${item.country}</h3>
          <img class="flag" src="${item.countryInfo.flag}">
          <ul>
            <li>Total Confirmed: ${item.cases}</li>
            <li>Total Deaths: ${item.deaths}</li>
            <li>Total Recovered: ${item.recovered}</li>
            <li>${currentKey}: ${item[currentKey]}</li>
          </ul>
        </div>`;
  } else if (!item) {
    template = `
        <div>
          <h3>${countryName}</h3>
          <ul>
            <li>Total Confirmed: N/A</li>
            <li>Total Deaths: N/A</li>
            <li>Total Recovered: N/A</li>
          </ul>
        </div>`;
  }
  return template;
};

const getSettingsTemplate = () => {
  const form = `
  <div id="settings">
    <button id="case">case</button><br/>
    <button id="deaths">deaths</button><br/>
    <button id="recovered">recovered</button><br/>
  </div>`;
  return `<h3>Settings</h3>${form}`;
};

export {
  getCountryStyle,
  getGeoJsonData,
  pointToLayer,
  onCountryHighLight,
  getMapControlsTemplate,
  getDataForHeatMap,
  roundToPowerOfTen,
  getTooltipTemplate,
  getSettingsTemplate,
};
