const request = async () => {
   const res = await fetch('https://disease.sh/v3/covid-19/historical/all?lastdays=365');
   return await res.json();
}

export default request;
