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

  return data
}

export {
  generatePer100KData,
  generateCountryData,
}
