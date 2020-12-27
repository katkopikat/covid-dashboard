import { convertDataToRelative, getCountryStyle, getMapControlsTemplate, getTooltipTemplate, roundToPowerOfTen } from '../src/common/helpers/map.helpers';
import { DataKey } from '../src/common/models/common.model';

test('Should value to became a relative', () => {
  const value = 10;
  const countryPopulation = 10 ** 5;
  expect(convertDataToRelative(value, countryPopulation)).toBe(value);
});

test('Should round a value', () => {
  const number = 1234;
  const powder = 2;
  expect(roundToPowerOfTen(number, powder)).toBe(1200);
});

test('Should be a map control\'s template', () => {
  const template = `
  <h3 class="visually-hidden">controls</h3>
  <button class="map-controls__button" data-zoom-in><i class="fas fa-search-plus"></i></button>
  <button class="map-controls__button" data-zoom-out><i class="fas fa-search-minus"></i></button>
  <button class="map-controls__button" data-show-legend><i class="fas fa-book-open"></i></button>`;
  expect(getMapControlsTemplate()).toBe(template);
});

test('Should return a country\'s style', () => {
  const returnedStyles: string = JSON.stringify(getCountryStyle());
  const etalonStyles: string = JSON.stringify({
    fillColor: '#E3E3E3',
    weight: 1,
    opacity: 0,
    color: 'white',
    fillOpacity: 0,
  });
  expect(returnedStyles).toBe(etalonStyles);
});

test('Should return a tooltip template', () => {
  const etalonTemplate = `
      <div>
          <header class="map-tooltip__header"/>
              <h3 class="map-tooltip__title">countryName</h3>
          </header>
          <p class="map-tooltip__description">${DataKey.cases}: <b>-- -- --</b></p>
      </div>`;

  expect(getTooltipTemplate(null, 'countryName', DataKey.cases)).toBe(etalonTemplate);
});
