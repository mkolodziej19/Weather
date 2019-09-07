//Global variables
const searchInput = document.querySelector('.search-bar');
const suggestions = document.querySelector('.suggestions');
let selectedCities = [];


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
		.then(data => citiesAll.push(...data));
	cities = citiesAll.filter(place => place.country==="PL");
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
	matchArray.splice(12, matchArray.length - 13);
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
searchInput.addEventListener('focusout', (e) => {
	//Czyszczenie listy przy focusout powoduje że getCity nie ma argumentów,
	//trzeba to jakoś sensownie rozwiązac żeby przy opuczczeniu searchbara
	//znikała lista ale jednoczesnie getCity miał argumenty
	//e.target.value = '';
	// li = suggestions.querySelectorAll('li');
	// li.forEach(item => suggestions.removeChild(item));
});

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
	displayData();
	searchInput.value = '';
	li = suggestions.querySelectorAll('li');
	li.forEach(item => suggestions.removeChild(item));

}

function getWeekDay(d){
	const year = [d[0], d[1], d[2], d[3]].join('');
	const month = [d[5], d[6]].join('');
	const day = [d[8], d[9]].join('');

	const date = new Date(year, month, day);
	let dayOfWeek = date.getDay();

	switch(dayOfWeek){
		case 0: 
			return 'Sun';
		case 1:
			return 'Mon';
		case 2:
			return 'Tue';
		case 3:
			return 'Wed';
		case 4:
			return 'Thu';
		case 5:
			return 'Fri';
		case 6:
			return 'Sat';
		default:
			console.log('Wrong date argument');
	};
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

function getIcon(){
	return `<i class="fas fa-sun"></i>`
}

function displayData(){
	const box = document.createElement('div');
	box.setAttribute('class', 'weather-box');
	box.innerHTML = `

		<div class="top">
			<div class="cross">
			</div>
			<div class="city">
				<span><i class="fas fa-map-marker-alt"></i> <span class='city-name'>${selectedCities[0].city}</span></span>
			</div>
			<div class="temp">
				<div class="current">${getTemp(selectedCities[0].currData.temp, 'C')}</div>
				<div class="minmax">${getIcon(selectedCities[0].currData.cloud)} <span>${getTemp(selectedCities[0].currData.min, 'C')}</span><span>${getTemp(selectedCities[0].currData.max, 'C')}</span></div>
			</div>
		</div>
		<div class="bottom">
			<span class="more">
				<span>${selectedCities[0].currData.pres} hPa</span>
				<span><i class="fas fa-wind"></i> ${selectedCities[0].currData.wind}</span>
			</span>
			<span class="forecast">
				<div>
					<span>${getIcon(selectedCities[0].forecastData.day1[2])}</span>
					<span>${getWeekDay(selectedCities[0].forecastData.day1[0])}</span>
					<span>${getTemp(selectedCities[0].forecastData.day1[1], 'C')}</span>
				</div>
				<div>
					<span>${getIcon(selectedCities[0].forecastData.day2[2])}</span>
					<span>${getWeekDay(selectedCities[0].forecastData.day2[0])}</span>
					<span>${getTemp(selectedCities[0].forecastData.day2[1], 'C')}</span>
				</div>
				<div>
					<span>${getIcon(selectedCities[0].forecastData.day3[2])}</span>
					<span>${getWeekDay(selectedCities[0].forecastData.day3[0])}</span>
					<span>${getTemp(selectedCities[0].forecastData.day3[1], 'C')}</span>
				</div>
				<div>
					<span>${getIcon(selectedCities[0].forecastData.day4[2])}</span>
					<span>${getWeekDay(selectedCities[0].forecastData.day4[0])}</span>
					<span>${getTemp(selectedCities[0].forecastData.day4[1], 'C')}</span>
				</div>
			</span>
		</div>
	
	`
	const slider = document.querySelector('.slider');
	slider.appendChild(box);
	const cross = box.querySelector('.cross');
	cross.addEventListener('click', (e) => {
		const tab = e.target.parentNode.parentNode;
		const name = tab.querySelector('.city-name').innerText;
		tab.parentNode.removeChild(tab);
		selectedCities = selectedCities.filter(obj => obj.city !== name)
		console.log(selectedCities);
	});
}