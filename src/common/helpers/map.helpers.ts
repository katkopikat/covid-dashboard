import Leaflet from 'leaflet';
import IsoToLatLong from 'country-iso-to-coordinates';
import { Common, ICovidData, ICovidDataWeight, IFeature, IMapLegendItem } from '../models/map.model';

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
  const element: IMapLegendItem = scale
    .find((item: IMapLegendItem) => numb >= item.range.min && numb <= item.range.max);
  if (element) {
    return element.markerWeight;
  }
  return 1;
};

const generateScale = (value: number, currentKey: string, maxItemsCount = 9, startDiv = 2): IMapLegendItem[] => {
  let scale: IMapLegendItem[] = [];

  for (let i = value; i >= 1000; i /= startDiv) {
    const item: IMapLegendItem = {
      range: {
        min: Math.floor(i / startDiv),
        max: Math.floor(i),
      },
      currentKey,
    };
    scale.push(item);
  }

  if (scale.length > maxItemsCount) {
    scale = generateScale(value, currentKey, maxItemsCount, startDiv + 1);
  }
  return scale;
};

const getScaleWithWeight = (scale: IMapLegendItem[]) => {
  const scaleWithWeight = [...scale.slice().reverse()];
  return scaleWithWeight
    .map((item: IMapLegendItem, index: number) => ({ ...item, markerWeight: index + 1 }));
};

const convertDataToRelative = (
  value: number, population: number,
) => Math.round(value / (population / 100000));

const getDataForHeatMap = (countries: ICovidData[], currentKey = 'cases', relative = true): { data: ICovidDataWeight[], scale: IMapLegendItem[] } => {
  let copyData = [...countries];

  if (relative) {
    copyData = copyData.filter((item: ICovidData) => item.population).map((item: ICovidData) => ({
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

  console.log(copyData);

  const scale = generateScale(copyData.slice(-1)[0][currentKey], currentKey);
  const scaleWithWeight = getScaleWithWeight(scale);

  console.log(scaleWithWeight)

  const data = copyData
    .map((item: ICovidData) => (
      { ...item, markerIndex: getMarkerSize(item[currentKey], scaleWithWeight), currentKey }
    ));
  return {
    data,
    scale: scaleWithWeight,
  };
};

const pointToLayer = (feature: { [k: string]: any }, latlng: number[]) => {
  const MARKER_SIZE_STEP = 0.3;
  const country = feature.properties.Country;
  const totalConfirmed = feature.properties.TotalConfirmed;
  const totalDeaths = feature.properties.TotalDeaths;
  const totalRecovered = feature.properties.TotalRecovered;
  const date = feature.properties.Date;
  const { markerIndex, currentKey } = feature.properties;
  const width = MARKER_SIZE_STEP * markerIndex;
  const height = MARKER_SIZE_STEP * markerIndex;
  // width: 3.6em;
  // height: 3.6em;
  const html = `
    <span class="icon-marker icon-marker--${currentKey}" style="width: ${width}em; height: ${height}em"></span>
    <span class="icon-marker-tooltip">
      <h2>${country}</h2>
      <ul>
        <li><strong>Confirmed:</strong> ${totalConfirmed}</li>
        <li><strong>Deaths:</strong> ${totalDeaths}</li>
        <li><strong>Recovered:</strong> ${totalRecovered}</li>
        <li><strong>Last Update:</strong> ${new Date(date).toLocaleDateString()}</li>
      </ul>
    </span>
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
  // getDataForHeatMap(Countries);
  const geoJson = {
    type: 'FeatureCollection',
    features: data.map((country: ICovidData) => {
      // const { countryInfo = {} } = country;
      // debugger
      // const { CountryCode } = country;
      // conso
      // const [lat, lng] = (IsoToLatLong[CountryCode] || { coordinate: [] }).coordinate;
      const { lat, long } = country.countryInfo;
      // console.log(IsoToLatLong[CountryCode])
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
    }).filter((item) => item),
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

export { getCountryStyle, getGeoJsonData, pointToLayer, onCountryHighLight, getMapControlsTemplate, getDataForHeatMap, roundToPowerOfTen };
