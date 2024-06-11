const apiKey = '9c69b45c207073d21abb63feb9e7deed';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

async function getWeather(city) {
  try {
    const response = await fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    if (response.ok) {
      displayWeather(data);
      getExtendedForecast(city);
      saveCity(city);
      loadRecentCities();
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError('Unable to fetch weather data.');
  }
}

async function getWeatherByLocation(lat, lon) {
  try {
    const response = await fetch(`${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    if (response.ok) {
      displayWeather(data);
      getExtendedForecast(data.name);
      saveCity(data.name);
      loadRecentCities();
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError('Unable to fetch weather data.');
  }
}

document.getElementById('search-button').addEventListener('click', () => {
  const city = document.getElementById('city-input').value;
  if (city) {
    getWeather(city);
  } else {
    showError('Please enter a city name.');
  }
});

document.getElementById('city-input').addEventListener('input', loadRecentCities);

if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    getWeatherByLocation(latitude, longitude);
  });
}

async function getExtendedForecast(city) {
  try {
    const response = await fetch(`${forecastApiUrl}?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    if (response.ok) {
      displayExtendedForecast(data);
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError('Unable to fetch extended forecast data.');
  }
}

function displayWeather(data) {
  const weatherContainer = document.getElementById('weather-container');
  weatherContainer.innerHTML = `
    <h2 class="text-2xl font-bold">${data.name}</h2>
    <p>Temperature: ${data.main.temp} °C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    <p>Weather: ${data.weather[0].description}</p>
    <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
  `;
}

function displayExtendedForecast(data) {
  const forecastContainer = document.getElementById('extended-forecast');
  forecastContainer.innerHTML = data.list.filter((item, index) => index % 8 === 0).map(item => `
    <div class="forecast-item p-4 border rounded">
      <p>${new Date(item.dt * 1000).toLocaleDateString()}</p>
      <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
      <p>Temp: ${item.main.temp} °C</p>
      <p>Wind: ${item.wind.speed} m/s</p>
      <p>Humidity: ${item.main.humidity}%</p>
    </div>
  `).join('');
}

function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem('recentCities', JSON.stringify(cities));
  }
}

function loadRecentCities() {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  const dropdown = document.getElementById('recent-cities-dropdown');
  if (cities.length > 0) {
    dropdown.classList.remove('hidden');
    dropdown.innerHTML = cities.map(city => `<option value="${city}">${city}</option>`).join('');
    dropdown.addEventListener('change', () => {
      if (dropdown.value) {
        getWeather(dropdown.value);
      }
    });
  } else {
    dropdown.classList.add('hidden');
  }
}

function showError(message) {
  const errorContainer = document.getElementById('error-message');
  errorContainer.textContent = message;
  errorContainer.classList.remove('hidden');
}