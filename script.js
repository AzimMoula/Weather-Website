// OpenWeather API key
const apiKey = "8fa6861c182d5e7aa3319847acf4b698";
let city = "Hyderabad";

// Function to fetch current weather
async function fetchWeather() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();

    // Update current weather
    document.getElementById("temp").textContent = Math.round(data.main.temp);
    document.getElementById("condition").textContent = data.weather[0].main;
    document.getElementById("description").textContent =
      data.weather[0].description;
    document.getElementById("location").textContent = data.name;
    document.getElementById(
      "weather-icon"
    ).src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    const lat = data.coord.lat;
    const lon = data.coord.lon;

    updateHumidity(data.main.humidity);
    updateWindInfo(data.wind.speed, data.wind.deg);
    fetchAirQuality(lat, lon);
    updateSunriseSunset(data.sys.sunrise, data.sys.sunset);
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}

// Function to fetch 5-day forecast
async function fetchForecast() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();

    const dailyForecasts = {};
    data.list.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "long" });

      if (!dailyForecasts[day]) {
        dailyForecasts[day] = {
          day,
          icon: forecast.weather[0].icon,
          temps: [],
        };
      }

      // Add this interval's temp to the day's collection
      dailyForecasts[day].temps.push(forecast.main.temp);
    });

    // Get first 5 days and update cards
    const forecasts = Object.values(dailyForecasts).slice(1, 6);
    const cards = document.querySelectorAll(".forecast-card");

    forecasts.forEach((forecast, index) => {
      if (cards[index]) {
        const minTemp = Math.round(Math.min(...forecast.temps));
        const maxTemp = Math.round(Math.max(...forecast.temps));

        cards[index].querySelector(".forecast-day").textContent = forecast.day;
        cards[index].querySelector(
          ".forecast-icon"
        ).src = `https://openweathermap.org/img/wn/${forecast.icon}@2x.png`;
        cards[index].querySelector(
          ".forecast-temp-low"
        ).textContent = `${minTemp}°`;
        cards[index].querySelector(
          ".forecast-temp-high"
        ).textContent = `${maxTemp}°`;
      }
    });
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}

// Update humidity information
function updateHumidity(humidity) {
  document.getElementById("humidity-value").textContent = `${humidity}`;

  // Set the bar width based on humidity percentage
  document.getElementById("humidity-bar").style.width = `${humidity}%`;

  // Change bar color based on humidity levels
  let color, text;
  if (humidity < 30) {
    color = "bg-yellow-500";
    text = "Low"; // Low humidity
  } else if (humidity < 65) {
    color = "bg-green-400";
    text = "Comfortable"; // Comfortable humidity
  } else {
    color = "bg-blue-500";
    text = "High"; // High humidity
  }
  document.getElementById(
    "humidity-bar"
  ).className = `${color} h-2.5 rounded-full transition-all duration-300`;
  document.getElementById("humidity-text").textContent = text;
}

// Update Wind Information
function updateWindInfo(speed, degree) {
  // Convert m/s to km/h
  const speedKmh = Math.round(speed * 3.6);
  document.getElementById("wind-speed").textContent = speedKmh;

  // Convert wind degree to direction
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degree / 22.5) % 16;
  console.log("Wind direction index:", degree, index);
  document.getElementById("wind-direction").textContent = directions[index];

  // Update wind direction icon rotation
  document.getElementById(
    "wind-arrow"
  ).style.transform = `rotate(${degree}deg)`;
  document.getElementById("wind-arrow").style.transition = `transform 0.3s`;
}

// Call this function with the humidity value from your API
// For example: updateHumidity(data.main.humidity);
// Get air quality data
async function fetchAirQuality(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    const data = await response.json();

    // Air Quality Index (1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor)
    const aqi = data.list[0].main.aqi;
    let aqiText = "";
    let aqiColor = "";
    let aqiWidth = "";
    switch (aqi) {
      case 1:
        aqiText = "Good";
        aqiColor = "bg-green-500";
        aqiWidth = "20%";
        break;
      case 2:
        aqiText = "Fair";
        aqiColor = "bg-yellow-300";
        aqiWidth = "40%";
        break;
      case 3:
        aqiText = "Moderate";
        aqiColor = "bg-orange-400";
        aqiWidth = "60%";
        break;
      case 4:
        aqiText = "Poor";
        aqiColor = "bg-red-500";
        aqiWidth = "80%";
        break;
      case 5:
        aqiText = "Very Poor";
        aqiColor = "bg-purple-700";
        aqiWidth = "100%";
        break;
      default:
        aqiText = "Good";
        aqiColor = "bg-green-500";
        aqiWidth = "0%";
        break;
    }
    document.getElementById("aqi-value").textContent = aqi;
    document.getElementById("aqi-text").textContent = aqiText;
    document.getElementById(
      "aqi-bar"
    ).className = `${aqiColor}  h-2.5 rounded-full transition-all duration-300`;
    document.getElementById("aqi-bar").style.width = aqiWidth;
  } catch (error) {
    console.error("Error fetching air quality:", error);
  }
}

// Update Sunrise and Sunset times
function updateSunriseSunset(sunrise, sunset) {
  const sunriseTime = new Date(sunrise * 1000);
  const sunsetTime = new Date(sunset * 1000);

  document.getElementById("sunrise").textContent =
    sunriseTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  document.getElementById("sunset").textContent = sunsetTime.toLocaleTimeString(
    "en-US",
    { hour: "2-digit", minute: "2-digit" }
  );
}

// Search functionality
function performSearch() {
  const query = searchInput.value.trim();
  if (query.length > 0) {
    // Call your weather API with the city name
    city = cityName;
    fetchWeather();
    fetchForecast();

    searchInput.value = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchWeather();
  fetchForecast();
});
