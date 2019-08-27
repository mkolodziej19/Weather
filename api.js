async function apiCall(city = 'London'){
    let apiSite = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=8a615664a0840a23b03c4418f16b9b13`;
    let response = await fetch(apiSite);
    let data = await response.json().then(data => data.name);
    return data;
}

let weatherData = apiCall().then(data => console.log(data))
