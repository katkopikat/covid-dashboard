<<<<<<< HEAD
import _Chart from "../../chart";
import ChartService from "../services/chart.service";
=======
import _Chart from '../../chart';
import ChartService from '../services/chart.service';
import { DataTypes } from '../../dispatch';
>>>>>>> develop

const chartServise = new ChartService();

const generatePer100KData = (dataSet, population) => {
  const keys = Object.keys(dataSet);
  keys.forEach((key) => {
    dataSet[key] = Math.ceil(((dataSet[key] / population) * 100000));
<<<<<<< HEAD
  })
  return Object.values(dataSet)
}

const generateCountryData = (iso3, countriesData ) => {
  const data = chartServise.getHistoricalCountryData(iso3)
    .then((res) => {
      const countryData = countriesData.find(({ countryInfo }) => countryInfo.iso3 === iso3);
      console.log(countryData)
      return {
        historicalCountryData: res,
        lastDaysCountryData: {
          cases: {month: countryData.todayCases},
          deaths: {month: countryData.todayDeaths},
          recovered:{month: countryData.todayRecovered},
          date: countryData.updated,
        },
        population: countryData.population,
      }
    })

  return data
}
=======
  });
  return Object.values(dataSet);
};

const generateCountryData = (iso3, countriesData) => {
  if (iso3 === 'GLOBAL') {
    const data = chartServise.getGlobalAllData()
      .then((data) => ({
        historicalCountryData: data[0],
        lastDaysCountryData: {
          cases: data[1].todayCases,
          deaths: data[1].todayDeaths,
          recovered: data[1].todayRecovered,
          date: data[1].date,
        },
        population: data[1].population,
      }));
    return data;
  }
  const data = chartServise.getHistoricalCountryData(iso3)
    .then((res) => {
      const countryData = countriesData.find(({ countryInfo }) => countryInfo.iso3 === iso3);
      return {
        historicalCountryData: res,
        lastDaysCountryData: {
          cases: { month: countryData.todayCases },
          deaths: { month: countryData.todayDeaths },
          recovered: { month: countryData.todayRecovered },
          date: countryData.updated,
        },
        population: countryData.population,
      };
    });
  return data;
};

const colorSpansFromSettings = (type, spans) => {
  switch (type) {
    case DataTypes.CASES: {
      spans.forEach((span) => {
        if (span.textContent === 'Cases') {
          spans.forEach((spanTwo) => {
            spanTwo.classList.remove('chart-mode-cases');
            spanTwo.classList.remove('chart-mode-recovered');
            spanTwo.classList.remove('chart-mode-deaths');
          });
          span.classList.add('chart-mode-cases');
        }
      });
      break;
    }
    case DataTypes.RECOVERED: {
      spans.forEach((span) => {
        if (span.textContent === 'Recovered') {
          spans.forEach((spanTwo) => {
            spanTwo.classList.remove('chart-mode-cases');
            spanTwo.classList.remove('chart-mode-recovered');
            spanTwo.classList.remove('chart-mode-deaths');
          });
          span.classList.add('chart-mode-recovered');
        }
      });
      break;
    }
    default: {
      spans.forEach((span) => {
        if (span.textContent === 'Deaths') {
          spans.forEach((spanTwo) => {
            spanTwo.classList.remove('chart-mode-cases');
            spanTwo.classList.remove('chart-mode-recovered');
            spanTwo.classList.remove('chart-mode-deaths');
          });
          span.classList.add('chart-mode-deaths');
        }
      });
    }
  }
};

const raskrasitPoBratskiSpan = (type, spanToggles) => {
  spanToggles.forEach((span) => {
    if (type === span.textContent.toLowerCase()) {
      spanToggles.forEach((spanTwo) => {
        spanTwo.classList.remove('chart-mode-cases');
        spanTwo.classList.remove('chart-mode-recovered');
        spanTwo.classList.remove('chart-mode-deaths');
      });
      span.classList.add(`chart-mode-${type}`);
    }
  });
};
>>>>>>> develop

export {
  generatePer100KData,
  generateCountryData,
<<<<<<< HEAD
}
=======
  raskrasitPoBratskiSpan,
  colorSpansFromSettings,
};
>>>>>>> develop
