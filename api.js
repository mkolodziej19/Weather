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
                return info;
            });
            break;
        case '2':
            //Each 3 hour timestamp weather access
            weatherData = await forecastWeatherCall(city, country).then(data =>{
				let currTime = data.list[0].dt_txt;
				currTime = parseInt(currTime[11] + currTime[12]);
				let i = 13 - currTime/3;
                let info = {
					city: data.city.name,
					country: data.city.country,
					first: [data.list[i].dt_txt, data.list[i].main.temp, data.list[i].main.pressure, data.list[i].weather[0].description],
					second: [data.list[i + 8].dt_txt, data.list[i + 8].main.temp, data.list[i + 8].main.pressure, data.list[i + 8].weather[0].description],
					third: [data.list[i + 16].dt_txt, data.list[i + 16].main.temp, data.list[i + 16].main.pressure, data.list[i + 16].weather[0].description],
					fourth: [data.list[i + 24].dt_txt, data.list[i + 24].main.temp, data.list[i + 24].main.pressure, data.list[i + 24].weather[0].description]
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

//Weather display functions
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
      return Math.round(value-273.15)+'°C';
		case 'F':
			return Math.round((9/5)*(value-273.15)+32)+'°F'; // wzór na podstawie Wikipedii, ale tam był tylko przelicznik z C.
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
//	el.id = "myDiv";
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

//Search bar 
const endpoint = 'https://raw.githubusercontent.com/mkolodziej19/Weather/master/city.list.min.json';
//Przed wysłaniem zmienić powyższą linijkę na poniższą.
// const endpoint = 'city.list.min.json';

let citiesAll = [];
let cities = []

async function filtering(){
	await fetch(endpoint)
		.then(blob => blob.json())
		.then(data => citiesAll.push(...data));
	cities = citiesAll.filter(place => place.country==="PL");
	//console.log(cities);
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
		return `
			<li>
				<span class="name">${place.name}</span> 
				<span class="country">${place.country}</span>
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
		clickAdding(); // 
	} 
	else {
		suggestions.innerHTML='<li style="color:#d00;">No results</li>';
	}
}

const searchInput = document.querySelector('.search');
const suggestions = document.querySelector('.suggestions');

//searchInput.addEventListener('change', displayMatches);
searchInput.addEventListener('keyup', displayMatches);

//Get arguments from clicked elements
function clickAdding(){
	li = suggestions.querySelectorAll('li');
	li.forEach(item => item.addEventListener('click', getCity));
}

function getCity(e){
	let city = e.currentTarget.getElementsByClassName('name');
	city = city[0].innerText;
	let country = e.currentTarget.getElementsByClassName('country');
	country = country[0].innerText;
	console.log(e);
	console.log(country);
	weatherCheck(city, country).then(obj => displayWeather(obj));
	searchInput.value = "";
	li = suggestions.querySelectorAll('li');
	li.forEach(item => suggestions.removeChild(item));
}
