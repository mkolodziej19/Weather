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

//Displaying for Wrocław

function displayWeather(obj){
	const el = document.createElement("div");
	el.setAttribute("class", "tile");
//	el.id = "myDiv";
	el.innerHTML = `
		<h3>${obj.city}, ${obj.country}</h3>
			<div>${obj.first[0]}<br>${obj.first[1]}, ${obj.first[2]}, ${obj.first[3]}</div>
			<div class="second">${obj.second[0]}<br>${obj.second[1]}<br>${obj.second[2]}<br>${obj.second[3]}</div>
			<div class="second">${obj.third[0]}<br>${obj.third[1]}<br>${obj.third[2]}<br>${obj.third[3]}</div>
			<div class="second">${obj.fourth[0]}<br>${obj.fourth[1]}<br>${obj.fourth[2]}<br>${obj.fourth[3]}</div>
			<div style="clear:both;"></div>
	`;
//	el.classList.add("module");
	const div = document.querySelector("body");
	div.appendChild(el);
}

weatherCheck('Wroclaw', 'PL').then(obj => displayWeather(obj));

//Search bar 
const endpoint = 'https://raw.githubusercontent.com/mkolodziej19/Weather/master/city.list.min.json';

let citiesAll = [];
let cities = []

async function filtering(){
	await fetch(endpoint)
		.then(blob => blob.json())
		.then(data => citiesAll.push(...data));
	cities = citiesAll.filter(place => place.country==="PL");
//	console.log(cities);
}

filtering();

function findMatches(wordToMatch, cities) {
	return cities.filter(place => {
		return place.name.toLowerCase().match(wordToMatch.toLowerCase());
	});
}

function displayMatches() {
	const matchArray = findMatches(this.value, cities);
	const htmlArray = matchArray.map(place => {
//		const cityName = place.name.replace(this.value, `<span class="hl">${this.value}</span>`);
		return `
			<li>
				<span class="name">${place.name}, ${place.country}</span>
				<span class="coords">lon: ${place.coord.lon} <br> lat: ${place.coord.lat}</span>
			</li>
		`;
	});
//	console.log(this.value.length);
	if (this.value.length<3){
		suggestions.innerHTML='';
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

/*async function pisz(){
	console.log(cities);
}
pisz();*/



























