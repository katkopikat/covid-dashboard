import _Chart from "../../chart";

const generatePer100KData = (dataSet, population) => {
  const keys = Object.keys(dataSet);
  keys.forEach((key) => {
    dataSet[key] = Math.ceil(((dataSet[key] / population) * 100000));
  })
  return Object.values(dataSet)
}


export {
  generatePer100KData,
}
