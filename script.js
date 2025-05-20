// OpenWeather API key
const apiKey = "8fa6861c182d5e7aa3319847acf4b698";
const city = "Kukatpally";

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

    updateWindInfo(data.wind.speed, data.wind.deg);
    estimateUVIndex(
        data.weather[0].id,
        data.dt,
        lat,
        lon,
        data.sys.sunrise,
        data.sys.sunset
    );
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
          icon: forecast.weather[0].icon,
          temps: [],
        };
      }

      // Add this interval's temp to the day's collection
      dailyForecasts[day].temps.push(forecast.main.temp);
    });
    // Get forecast cards container
    const forecastCards = document.querySelectorAll(".forecast-card");

    // Process daily forecasts (API returns data in 3-hour increments)
    let dayIndex = 0;
    const processedDays = new Set();

    for (let i = 0; i < data.list.length && dayIndex < 5; i++) {
      const forecast = data.list[i];
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "long" });

      if (!processedDays.has(day)) {
        processedDays.add(day);

        // Update the card with forecast data
        if (forecastCards[dayIndex]) {
          const card = forecastCards[dayIndex];
          const minTemp = Math.min(...dailyForecasts[day].temps);
          const maxTemp = Math.max(...dailyForecasts[day].temps);
          card.querySelector(".forecast-day").textContent = day;
          card.querySelector(
            ".forecast-icon"
          ).src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
          card.querySelector(".forecast-temp-low").textContent = `${Math.round(
            Math.round(minTemp)
          )}°`;
          card.querySelector(".forecast-temp-high").textContent = `${Math.round(
            Math.round(maxTemp)
          )}°`;
        }

        dayIndex++;
      }
    }
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}

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
    if (aqi === 1) {
      aqiText = "Good";
      aqiColor = "bg-green-500";
      aqiWidth = "20%";
    } else if (aqi === 2) {
      aqiText = "Fair";
      aqiColor = "bg-yellow-300";
      aqiWidth = "40%";
    } else if (aqi === 3) {
      aqiText = "Moderate";
      aqiColor = "bg-orange-400";
      aqiWidth = "60%";
    } else if (aqi === 4) {
      aqiText = "Poor";
      aqiColor = "bg-red-500";
      aqiWidth = "80%";
    } else {
      aqiText = "Very Poor";
      aqiColor = "bg-purple-700";
      aqiWidth = "100%";
    }
    document.getElementById("aqi-value").textContent = aqi;
    document.getElementById("aqi-text").textContent = aqiText;
    document.getElementById(
      "aqi-bar"
    ).className = `${aqiColor} h-2.5 rounded-full`;
    document.getElementById("aqi-bar").style.width = aqiWidth;
  } catch (error) {
    console.error("Error fetching air quality:", error);
  }
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
  console.log("Wind direction index:", index);
  document.getElementById("wind-direction").textContent = directions[index];

  // Update wind direction icon rotation
  document.getElementById(
    "wind-arrow"
  ).style.transform = `rotate(${degree}deg)`;
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

// Estimate UV Index based on weather conditions
function estimateUVIndex(weatherId, currentTime, lat, lon, sunrise, sunset) {
  // Check if it's nighttime
  if (currentTime < sunrise || currentTime > sunset) {
    document.getElementById("uv-value").textContent = "0";
    document.getElementById("uv-text").textContent = "Low";
    document.getElementById("uv-bar").style.width = "0%";
    document.getElementById("uv-bar").className =
      "bg-green-500 h-2.5 rounded-full";
    return;
  }

  // Base UV on weather conditions
  let uvIndex = 0;

  // Clear sky = higher UV
  if (weatherId >= 800) {
    uvIndex = 8.5;
  }
  // Partly cloudy = medium UV
  else if (weatherId >= 801 && weatherId <= 803) {
    uvIndex = 5.5;
  }
  // Overcast = low UV
  else if (weatherId === 804) {
    uvIndex = 2.5;
  }
  // Rain/snow/fog = very low UV
  else {
    uvIndex = 1.5;
  }
  const hour = new Date(currentTime * 1000).getHours();

  // Display UV Index
  console.log("Calculated UV index:", uvIndex);
  document.getElementById("uv-value").textContent = uvIndex.toFixed(1);

  let uvText, uvBarWidth, uvBarColor;

  if (uvIndex < 3) {
    uvText = "Low";
    uvBarWidth = "20%";
    uvBarColor = "bg-green-500";
  } else if (uvIndex < 6) {
    uvText = "Moderate";
    uvBarWidth = "40%";
    uvBarColor = "bg-yellow-500";
  } else if (uvIndex < 8) {
    uvText = "High";
    uvBarWidth = "60%";
    uvBarColor = "bg-orange-500";
  } else if (uvIndex < 11) {
    uvText = "Very High";
    uvBarWidth = "80%";
    uvBarColor = "bg-red-500";
  } else {
    uvText = "Extreme";
    uvBarWidth = "100%";
    uvBarColor = "bg-purple-500";
  }

  document.getElementById("uv-text").textContent = uvText;
  document.getElementById("uv-bar").style.width = uvBarWidth;
  document.getElementById(
    "uv-bar"
  ).className = `${uvBarColor} h-2.5 rounded-full`;
}
// Initialize when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  fetchWeather();
  fetchForecast();
});
