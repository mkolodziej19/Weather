async function apiCall(city = 'London'){
    let apiSite = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=8a615664a0840a23b03c4418f16b9b13`;
    let response = await fetch(apiSite);
    let data = await response.json().then(data => data.name);
    return data;
}

let weatherData = apiCall().then(data => console.log(data))

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





























