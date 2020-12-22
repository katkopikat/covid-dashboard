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
  console.log(scaleWithWeight);

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
            <canvas id="map-tooltip__chart-area" style="width:200px;height: 200px;"></canvas>
          </div>
        </div>`;
  } else if (!item) {
    template = `
        <div>
        <header class="map-tooltip__header"/>
            <h3 class="map-tooltip__title">${countryName}</h3>
          </header>
          <p class="map-tooltip__description">${currentKey}: <b>N/A</b></p>
        </div>`;
  }
  return template;
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
  convertDataToRelative,
};
