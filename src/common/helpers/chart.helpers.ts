import _Chart from "../../chart";
import ChartService from "../services/chart.service";

const chartServise = new ChartService();

const generatePer100KData = (dataSet, population) => {
  const keys = Object.keys(dataSet);
  keys.forEach((key) => {
    dataSet[key] = Math.ceil(((dataSet[key] / population) * 100000));
  })
  return Object.values(dataSet)
}

const generateCountryData = (iso3, countriesData ) => {
    console.log(iso3)
  if (iso3 === 'GLOBAL') {
   const data = chartServise.getGlobalAllData()
     .then ((data) => {
       return {
         historicalCountryData: data[0],
         lastDaysCountryData: {
           cases: data[1].todayCases,
           deaths: data[1].todayDeaths,
           recovered: data[1].todayRecovered,
           date:data[1].date,
         },
         population: data[1].population,
       }
     })
   return data
  } else {
    const data = chartServise.getHistoricalCountryData(iso3)
      .then((res) => {
        const countryData = countriesData.find(({ countryInfo }) => countryInfo.iso3 === iso3);
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
    return data;
  }
}

const raskrasitPoBratskiSpan = (type, spanToggles) => {
  spanToggles.forEach((span) => {
    if (type === span.textContent.toLowerCase()) {
      spanToggles.forEach((span) => {
        span.classList.remove('chart-mode-cases')
        span.classList.remove('chart-mode-recovered')
        span.classList.remove( 'chart-mode-deaths')
      })
      span.classList.add(`chart-mode-${type}`)
    }
  })
}

export {
  generatePer100KData,
  generateCountryData,
  raskrasitPoBratskiSpan,
}
