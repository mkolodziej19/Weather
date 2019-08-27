//API functions
async function currentWeatherCall(city){
    let apiSite = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=8a615664a0840a23b03c4418f16b9b13`;
    let response = await fetch(apiSite);
    let data = await response.json();
    return data;
}

async function forecastWeatherCall(city, country){
    let apiSite = `http://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=8a615664a0840a23b03c4418f16b9b13`;
    let response = await fetch(apiSite);
    let data = await response.json();
    return data;
}

async function weatherCheck(city = 'London', country = 'GB', select = '2'){
    let weatherData;
    switch(select){
        case '1':
            //Current weather access
            weatherData = await currentWeatherCall(city).then(data => {
                let info = {
                    city: data.name,
                    country: data.sys.country,
                    temp: data.main.temp,
                    cloud: data.weather[0].description,
                    pres: data.main.pressure
                };
                //console.log(data);
                return info;
            });
            break;
        case '2':
            //Each 3 hour timestamp weather access
            weatherData = await forecastWeatherCall(city, country).then(data =>{
                let info = {
					city: data.city.name,
					country: data.city.country,
					first: [data.list[0].dt_txt, data.list[0].main.temp, data.list[0].main.pressure, data.list[0].weather[0].description],
					second: [data.list[1].dt_txt, data.list[1].main.temp, data.list[1].main.pressure, data.list[1].weather[0].description],
					third: [data.list[2].dt_txt, data.list[2].main.temp, data.list[2].main.pressure, data.list[2].weather[0].description],
					fourth: [data.list[3].dt_txt, data.list[3].main.temp, data.list[3].main.pressure, data.list[3].weather[0].description]
                };
                //console.log(data);
                return info;
            });
            break;
        default:
            console.log('Wrong select argument');
            break;
    }
    return weatherData;
}
weatherCheck('Wroclaw', 'PL').then(obj => console.log(obj));

//Search bar 
const endpoint = 'https://raw.githubusercontent.com/mkolodziej19/Weather/master/city.list.min.json';

const cities = [];

fetch(endpoint)
	.then(blob => blob.json())
	.then(data => cities.push(...data))

function findMatches(wordToMatch, cities) {
	return cities.filter(place => {
		const regex = new RegExp(wordToMatch, 'gi');
		return place.name.match(regex) || place.country.match(regex);
	});
}

function displayMatches() {
	const matchArray = findMatches(this.value, cities);
	const htmlArray = matchArray.map(place => {
		return `
			<li>
				<span class="name">${place.name}, ${place.country}</span>
				<span class="coords">lon: ${place.coord.lon} <br> lat: ${place.coord.lat}</span>
			</li>
		`;
	});
//	console.log(htmlArray.length);
	if (htmlArray.length===209579){
		suggestions.innerHTML='';
	}
	else if (htmlArray.length>1000){
		suggestions.innerHTML='<li style="color:#d00;">To many results</li>';
	}
	else if (htmlArray.length>0){
		const html=htmlArray.join('');
		suggestions.innerHTML=html;
	}
	else {
		suggestions.innerHTML='<li style="color:#d00;">No results</li>';
	}
}

const searchInput = document.querySelector('.search');
const suggestions = document.querySelector('.suggestions');

searchInput.addEventListener('change', displayMatches);
searchInput.addEventListener('keyup', displayMatches);





























