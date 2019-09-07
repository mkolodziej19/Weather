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
const endpoint = 'city.list.min.json';
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

function displayData(){
	const box = document.createElement('div');
	box.setAttribute('class', 'weather-box');
	box.innerHTML = `

		<div class="top">
			<div class="city">
				<span><i class="fas fa-map-marker-alt"></i> ${selectedCities[0].city}</span>
			</div>
			<div class="temp">
				<div class="current">${displayTemp(selectedCities[0].currData.temp, 'C')}</div>
				<div class="minmax"><i class="fas fa-cloud-sun"></i><span>${displayTemp(selectedCities[0].currData.max, 'C')}</span><span>${displayTemp(selectedCities[0].currData.min, 'C')}</span></div>
			</div>
		</div>
		<div class="bottom">
			<span class="more">
				<span>${selectedCities[0].currData.pres} hPa</span>
				<span>${selectedCities[0].currData.wind}</span>
				<span>${selectedCities[0].currData.cloud}</span>
			</span>
			<span class="forecast">
				<div>
					${selectedCities[0].forecastData.day1[0]}<br>
					${selectedCities[0].forecastData.day1[1]}<br>
					${selectedCities[0].forecastData.day1[2]}
				</div>
				<div>
					${selectedCities[0].forecastData.day2[0]}<br>
					${selectedCities[0].forecastData.day2[1]}<br>
					${selectedCities[0].forecastData.day2[2]}
				</div>
				<div>
					${selectedCities[0].forecastData.day3[0]}<br>
					${selectedCities[0].forecastData.day3[1]}<br>
					${selectedCities[0].forecastData.day3[2]}
				</div>
				<div>
					${selectedCities[0].forecastData.day4[0]}<br>
					${selectedCities[0].forecastData.day4[1]}<br>
					${selectedCities[0].forecastData.day4[2]}
				</div>
			</span>
		</div>
	
	`
	const slider = document.querySelector('.slider');
	slider.appendChild(box);
}

//OLD DISPLAY
function displayTime(v){
	let today = new Date
	let month = today.getMonth()+1;
	let day = today.getDate();
	let nextDay = day+1
	if (month<10) month = "0"+month;
	if (day<10) day = "0"+day;
	if (nextDay<10) nextDay = "0"+nextDay;
	if (today.getFullYear()==[v[0],v[1],v[2],v[3]].join('') && month==[v[5],v[6]].join('')){
		if(day==[v[8],v[9]].join('')){
			return 'Today, '+[v[11],v[12],v[13],v[14],v[15]].join('');
		}
		else if(nextDay==[v[8],v[9]].join('')){
			return 'Tomorrow, '+[v[11],v[12],v[13],v[14],v[15]].join('');
		}
		else {
			return [v[0],v[1],v[2],v[3],v[4],v[5],v[6],v[7],v[8],v[9],v[10],v[11],v[12],v[13],v[14],v[15]].join('');
		} 
	}
}

function displayTemp(value,degrees){
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

function displayPres(value){
	return Math.round(value)+' hPa';
}

function displayWeather(obj){
	const el = document.createElement("div");
	el.setAttribute("class", "tile");
	el.innerHTML = `
		<h3>${obj.city}<!--, ${obj.country}--></h3>
		<div class="first">
			${displayTime(obj.first[0])} <br> ${displayTemp(obj.first[1],'C')}, ${displayPres(obj.first[2])}, ${obj.first[3]}
		</div>
		<div class="second">
			${displayTime(obj.second[0])} <br> ${displayTemp(obj.second[1],'F')} <br> ${displayPres(obj.second[2])} <br> ${obj.second[3]}
		</div>
		<div class="third">
			${displayTime(obj.third[0])} <br> ${displayTemp(obj.third[1],'C')} <br> ${displayPres(obj.third[2])} <br> ${obj.third[3]}
		</div>
		<div class="fourth">
			${displayTime(obj.fourth[0])} <br> ${displayTemp(obj.fourth[1],'F')} <br> ${displayPres(obj.fourth[2])} <br> ${obj.fourth[3]}
		</div>
		<div style="clear:both;">
		</div>
	`;
	const div = document.querySelector("body");
	div.appendChild(el);
}
