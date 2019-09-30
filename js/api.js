//Global variables
const searchInput = document.querySelector('.search-bar');
const suggestions = document.querySelector('.suggestions');
let selectedCities = [];

//Background color
const hour = new Date().getHours();
if(hour <= 6 || hour >= 22){
	document.querySelector('html').style.backgroundImage = 'linear-gradient(135deg, rgba(5, 5, 5, 0.8), rgba(64, 64, 64, 0.8))';
}

//API functions
async function currentWeatherCall(city){
    let apiSite = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=8a615664a0840a23b03c4418f16b9b13`;
    let response = await fetch(apiSite);
    let data = await response.json();
    return data;
}

async function forecastWeatherCall(city, country){
    let apiSite = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=8a615664a0840a23b03c4418f16b9b13`;
    let response = await fetch(apiSite);
    let data = await response.json();
    return data;
}

async function weatherCheck(city, country){
	let weatherData = {
		city: null,
		country: 'PL',
		currData: {
			temp: null,
			min: null,
			max: null,
			pres: null,
			wind: null,
			cloud: null
		},
		forecastData: {
			day1: [],
			day2: [],
			day3: [],
			day4: []
		}
	}
    //Current weather access
	await currentWeatherCall(city).then(data => {
		weatherData.city = data.name;
		weatherData.currData.temp = data.main.temp;
		weatherData.currData.min = data.main.temp_min;
		weatherData.currData.max = data.main.temp_max;
		weatherData.currData.pres = data.main.pressure;
		weatherData.currData.wind = data.wind.speed;
		weatherData.currData.cloud = data.weather[0].description;
	});
	//Each 3 hour timestamp weather access
    await forecastWeatherCall(city, country).then(data =>{
		let currTime = data.list[0].dt_txt;
		currTime = parseInt(currTime[11] + currTime[12]);
		let i = 13 - currTime/3;

		weatherData.forecastData.day1 = [data.list[i].dt_txt, data.list[i].main.temp, data.list[i].weather[0].description],
		weatherData.forecastData.day2 = [data.list[i + 8].dt_txt, data.list[i + 8].main.temp, data.list[i + 8].weather[0].description],
		weatherData.forecastData.day3 = [data.list[i + 16].dt_txt, data.list[i + 16].main.temp, data.list[i + 16].weather[0].description],
		weatherData.forecastData.day4 = [data.list[i + 24].dt_txt, data.list[i + 24].main.temp, data.list[i + 24].weather[0].description]
	});
	return weatherData;
}

//Search bar display
const endpoint = 'json/city.list.min.json';
let citiesAll = [];
let cities = [];

function listenClick(){
	//Add event listener on every list item
	li = suggestions.querySelectorAll('li');
	li.forEach(item => item.addEventListener('click', getCity));
}

async function filtering(){
	//Filter for Poland cities only
	await fetch(endpoint)
		.then(blob => blob.json())
		.then(data => {
			data = data.filter(i => i.country === "PL")
			citiesAll.push(...data);
		});
	cities = citiesAll;
}

filtering();

function findMatches(wordToMatch, cities) {
	//Match cities to input value
	return cities.filter(place => {
		return place.name.toLowerCase().match(wordToMatch.toLowerCase());
	});
}

function displayMatches() {
	//Display data in li
	const matchArray = findMatches(this.value, cities);
	matchArray.splice(13, matchArray.length - 14);
	const htmlArray = matchArray.map(place => {
		return `
			<li>
				<div><span class="name">${place.name}</span>, <span class="country">${place.country}</span></div>
				<div class="coords">${place.coord.lon}<br>${place.coord.lat}</div>
			</li>
		`;
	});
	if (this.value.length<3){
		suggestions.innerHTML='';
	}	
	else if (htmlArray.length>0){
		const html=htmlArray.join('');
		suggestions.innerHTML=html;
		listenClick();
	} 
	else {
		suggestions.innerHTML='<li style="color:#d00;">No results</li>';
	}
}

searchInput.addEventListener('keyup', displayMatches);

//Get arguments from clicked elements
async function getCity(e){
	let city = e.currentTarget.getElementsByClassName('name');
	city = city[0].innerText;
	let country = e.currentTarget.getElementsByClassName('country');
	country = country[0].innerText;
	await weatherCheck(city, country).then(obj => {
		if(!selectedCities.some(i => i.city === obj.city))
			selectedCities.push(obj);
		else{
			selectedCities = selectedCities.filter(i => i.city !== obj.city)
			selectedCities.push(obj);
		}
		if(selectedCities.length > 1)
			selectedCities[0] = [selectedCities[selectedCities.length - 1], selectedCities[selectedCities.length - 1] = selectedCities[0]][0];
	});
	const wrapper = document.querySelector('.slider-wrapper');
	wrapper.innerHTML = '<div class="slider"></div>';
	for(let i = 0; i < selectedCities.length; ++i)
		displayTab(i);
	makeSlider();
	searchInput.value = '';
	li = suggestions.querySelectorAll('li');
	li.forEach(item => suggestions.removeChild(item));
}

function getWeekDay(d){
	const year = parseInt([d[0], d[1], d[2], d[3]].join(''));
	const month = parseInt([d[5], d[6]].join('')) - 1;
	const day = parseInt([d[8], d[9]].join(''))
	const date = new Date(year, month, day);
	let dayOfWeek = date.getDay();

	console.log(date);
	const dayTab = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	return dayTab[dayOfWeek];
}

function getTemp(value,degrees){
	switch(degrees){
		case 'C':
			return Math.round(value-273.15)+'°';
		case 'F':
			return Math.round((9/5)*(value-273.15)+32)+'°';
		default:
			console.log('Wrong degrees argument (should be "C" or "F"');
			break;
	}
}

function getIcon(description){
	switch (description){
		// Clouds
		case 'clear sky':
			return `<img class="icon" src="./icons/iconfinder_weather01_4102328.png" width="32px" height="32px">`;
		case 'few clouds':
		case 'few clouds: 11-25%':
			return `<img class="icon" src="./icons/iconfinder_weather02_4102326.png" width="32px" height="32px">`;
		case 'scattered clouds':
		case 'scattered clouds: 25-50%':
			return `<img class="icon" src="./icons/iconfinder_weather03_4102314.png" width="32px" height="32px">`;
		case 'broken clouds':
		case 'broken clouds: 51-84%':
		case 'overcast clouds: 85-100%':
		case 'overcast clouds':
			return `<img class="icon" src="./icons/iconfinder_weather04_4102315.png" width="32px" height="32px">`;
		// Rains
		case 'light intensity drizzle':
		case 'light intensity drizzle rain':
		case 'light rain':
		case 'light intensity shower rain':
		case 'drizzle':
		case 'drizzle rain':
			return `<img class="icon" src="./icons/iconfinder_weather05_4102316.png" width="32px" height="32px">`;
		case 'shower rain':
		case 'shower rain and drizzle':
		case 'shower drizzle':
		case 'rain':
		case 'moderate rain':
		case 'freezing rain':
		case 'shower rain':
		case 'ragged shower rain':
			return `<img class="icon" src="./icons/iconfinder_weather06_4102317.png" width="32px" height="32px">`;
		case 'heavy intensity drizzle':
		case 'heavy intensity drizzle rain':
		case 'heavy shower rain and drizzle':
		case 'heavy intensity rain':
		case 'very heavy rain':
		case 'heavy intensity shower rain':
		case 'extreme rain':
			return `<img class="icon" src="./icons/iconfinder_weather07_4102320.png" width="32px" height="32px">`;
		// Storms
		case 'thunderstorm':
		case 'light thunderstorm':
		case 'heavy thunderstorm':
		case 'ragged thunderstorm':
			return `<img class="icon" src="./icons/iconfinder_weather09_4102319.png" width="32px" height="32px">`;
		case 'thunderstorm with light rain':
		case 'thunderstorm with rain':
		case 'thunderstorm with heavy rain':
		case 'thunderstorm with light drizzle':
		case 'thunderstorm with drizzle':
		case 'thunderstorm with heavy drizzle':
			return `<img class="icon" src="./icons/iconfinder_weather08_4102318.png" width="32px" height="32px">`;
		// Snows
		case 'light snow':
		case 'Light shower sleet':
		case 'Light rain and snow':
		case 'Light shower snow':
			return `<img class="icon" src="./icons/iconfinder_weather11_4102327.png" width="32px" height="32px">`;
		case 'snow':
		case 'Snow':
		case 'Shower sleet':
		case 'Shower snow':
			return `<img class="icon" src="./icons/iconfinder_weather12_4102322.png" width="32px" height="32px">`;
		case 'Heavy snow':
		case 'Heavy shower snow':
		case 'Sleet':
		case 'Rain and snow':
			return `<img class="icon" src="./icons/iconfinder_weather13_4102323.png" width="32px" height="32px">`;
		// Atmospheric - only description
		case 'mist':
		case 'Smoke':
		case 'Haze':
		case 'sand/ dust whirls':
		case 'fog':
		case 'sand':
		case 'dust':
		case 'volcanic ash':
		case 'squalls':
		case 'tornado':
		default:
			return description;
	}
}

function displayTab(i){
	const box = document.createElement('div');
	box.setAttribute('class', 'weather-box');
	box.innerHTML = `

		<div class="top">
			<div class="cross">
			</div>
			<div class="city">
				<span><i class="fas fa-map-marker-alt"></i> <span class='city-name'>${selectedCities[i].city}</span></span>
			</div>
			<div class="temp">
				<div class="current">${getTemp(selectedCities[i].currData.temp, 'C')}</div>
				<div class="minmax">${getIcon(selectedCities[i].currData.cloud)} <span>${getTemp(selectedCities[i].currData.min, 'C')}</span><span>${getTemp(selectedCities[i].currData.max, 'C')}</span></div>
			</div>
		</div>
		<div class="bottom">
			<span class="more">
				<span>${selectedCities[i].currData.pres} hPa</span>
				<span><i class="fas fa-wind"></i> ${selectedCities[i].currData.wind} m/s</span>
			</span>
			<span class="forecast">
				<div>
					<span>${getIcon(selectedCities[i].forecastData.day1[2])}</span>
					<span>${getWeekDay(selectedCities[i].forecastData.day1[0])}</span>
					<span>${getTemp(selectedCities[i].forecastData.day1[1], 'C')}</span>
				</div>
				<div>
					<span>${getIcon(selectedCities[i].forecastData.day2[2])}</span>
					<span>${getWeekDay(selectedCities[i].forecastData.day2[0])}</span>
					<span>${getTemp(selectedCities[i].forecastData.day2[1], 'C')}</span>
				</div>
				<div>
					<span>${getIcon(selectedCities[i].forecastData.day3[2])}</span>
					<span>${getWeekDay(selectedCities[i].forecastData.day3[0])}</span>
					<span>${getTemp(selectedCities[i].forecastData.day3[1], 'C')}</span>
				</div>
				<div>
					<span>${getIcon(selectedCities[i].forecastData.day4[2])}</span>
					<span>${getWeekDay(selectedCities[i].forecastData.day4[0])}</span>
					<span>${getTemp(selectedCities[i].forecastData.day4[1], 'C')}</span>
				</div>
			</span>
		</div>
	
	`
	if(selectedCities[i].city === 'Warsaw')
		box.style.backgroundImage = 'url(/img/warszawa.jpg)';
	if(selectedCities[i].city === 'Wroclaw')
		box.style.backgroundImage = 'url(/img/wroclaw.jpg)';
	if(selectedCities[i].city === 'Krakow')
		box.style.backgroundImage = 'url(/img/krakow.jpg)';
	if(selectedCities[i].city === 'Gdańsk')
		box.style.backgroundImage = 'url(/img/gdansk.jpg)';
	if(selectedCities[i].city === 'Poznań')
		box.style.backgroundImage = 'url(/img/poznan.jpg)';
	const slider = document.querySelector('.slider');
	slider.appendChild(box);
	const cross = box.querySelector('.cross');
	cross.addEventListener('click', (e) => {
		const tab = e.target.parentNode.parentNode;
		const name = tab.querySelector('.city-name').innerText;
		selectedCities = selectedCities.filter(obj => obj.city !== name)
		const wrapper = document.querySelector('.slider-wrapper');
		wrapper.innerHTML = '<div class="slider"></div>';
		for(let i = 0; i < selectedCities.length; ++i)
			displayTab(i);
		makeSlider();
	});
}

function makeSlider(){
	$(document).ready(function(){
		$('.slider').slick({
			centerMode: true,
			centerPadding: '300px',
			slidesToShow: 1,
			responsive: [
				{
				  breakpoint: 1024,
				  settings: {
					centerMode: true,
					centerPadding: '150px',
					slidesToShow: 1
				  }
				}
			]
		});
	});
}
