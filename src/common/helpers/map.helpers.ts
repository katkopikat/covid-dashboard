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
  const maxItemsCount = 9;
  const addition: number = scale.length >= maxItemsCount
    ? 1 : Math.floor(maxItemsCount / scale.length);
  return scaleWithWeight.map((item: IMapLegendItem, index: number) => ({
    ...item,
    markerWeight: (index + 1) * addition,
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
  const currentValue = feature.properties[currentKey];
  // const coefficient = 1;
  const coefficient = currentValue === 0 ? 0 : 1;
  const width = MARKER_SIZE_STEP * markerIndex * coefficient;
  const height = MARKER_SIZE_STEP * markerIndex * coefficient;
  const html = `
    <span class="icon-marker icon-marker--${currentKey}"
          style="width: ${width}em; height: ${height}em; margin-left: -${width / 2}em; margin-top: -${height / 2}em"></span>
  `;

  return Leaflet.marker(latlng, {
    icon: Leaflet.divIcon({
      className: 'heatmap-icon',
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
  <button class="map-controls__button" data-zoom-in><i class="fas fa-search-plus"></i></button>
  <button class="map-controls__button" data-zoom-out><i class="fas fa-search-minus"></i></button>
  <button class="map-controls__button" data-show-legend><i class="fas fa-book-open"></i></button>`;

const getTooltipTemplate = (item: ICovidData, countryName: string, currentKey: DataKey): string => {
  let template = `
      <div>
        <h3>${(item && item.country) || countryName}</h3>
      </div>`;

  if (item) {
    template = `
        <div>
          <header class="map-tooltip__header"/>
            <div class="map-flag__wrapper">
              <img class="map-flag" src="${item.countryInfo.flag}" alt="flag">
            </div>
            <h3 class="map-tooltip__title">${item.country}</h3>
          </header>
          <p class="map-tooltip__description"><span class="map-tooltip__key">${currentKey}</span>: <b>${item[currentKey].toLocaleString()}</b></p>

          <div id="map-tooltip__canvas-holder">
            <canvas id="map-tooltip__chart-area" style="width:150px;height: 150px;"></canvas>
          </div>
        </div>`;
  } else if (!item) {
    template = `
      <div>
          <header class="map-tooltip__header"/>
              <h3 class="map-tooltip__title">${countryName}</h3>
          </header>
          <p class="map-tooltip__description">${currentKey}: <b>-- -- --</b></p>
      </div>`;
  }
  return template;
};

const focusTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<svg enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
<path d="m497 0h-90c-8.284 0-15 6.716-15 15s6.716 15 15 15h75v75c0 8.284 6.716 15 15 15s15-6.716 15-15v-90c0-8.284-6.716-15-15-15z"/>
<path d="m105 0h-90c-8.284 0-15 6.716-15 15v90c0 8.284 6.716 15 15 15s15-6.716 15-15v-75h75c8.284 0 15-6.716 15-15s-6.716-15-15-15z"/>
<path d="m105 482h-75v-75c0-8.284-6.716-15-15-15s-15 6.716-15 15v90c0 8.284 6.716 15 15 15h90c8.284 0 15-6.716 15-15s-6.716-15-15-15z"/>
<path d="m497 392c-8.284 0-15 6.716-15 15v75h-75c-8.284 0-15 6.716-15 15s6.716 15 15 15h90c8.284 0 15-6.716 15-15v-90c0-8.284-6.716-15-15-15z"/>
<path d="m316 241h-45v-45c0-8.284-6.716-15-15-15s-15 6.716-15 15v45h-45c-8.284 0-15 6.716-15 15s6.716 15 15 15h45v45c0 8.284 6.716 15 15 15s15-6.716 15-15v-45h45c8.284 0 15-6.716 15-15s-6.716-15-15-15z"/>
</svg>
`;

export {
  getCountryStyle,
  getGeoJsonData,
  pointToLayer,
  onCountryHighLight,
  getMapControlsTemplate,
  getDataForHeatMap,
  roundToPowerOfTen,
  getTooltipTemplate,
  convertDataToRelative,
  focusTemplate,
};
