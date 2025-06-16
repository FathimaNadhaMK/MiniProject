import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Weather.css";

const API_KEY = " f723abe0388a4ebfa84133152250303"; // Replace with your actual WeatherAPI key

function Weather() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState(null);
  
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "ml",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
  }, []);
  
  

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
    }
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      // Fetch current weather
      const weatherRes = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no`
      );
      const weatherData = await weatherRes.json();

      // Fetch 5-day forecast
      const forecastRes = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=5&aqi=no&alerts=no`
      );
      const forecastData = await forecastRes.json();

      setWeather({
        city: weatherData.location.name,
        temp: weatherData.current.temp_c, // Celsius temperature
        description: weatherData.current.condition.text, // Weather condition
        humidity: weatherData.current.humidity, // Humidity
        windSpeed: weatherData.current.wind_kph, // Wind speed in km/h
        icon: weatherData.current.condition.icon, // Weather icon
      });

      // Extract daily forecast
      const dailyForecast = forecastData.forecast.forecastday.map((day) => ({
        date: day.date,
        temp: day.day.avgtemp_c, // Average temperature
        description: day.day.condition.text, // Weather condition
        icon: day.day.condition.icon, // Weather icon
      }));

      setForecast(dailyForecast);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  return (
    <div className="weather-page">
      <div
  id="google_translate_element"
  style={{
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 1000
  }}
></div>

      <h1>🌤️ Weather Report {weather?.city && `for ${weather.city}`}</h1>

      {weather ? (
        <>
          <div className="weather-info">
            <img className="weather-icon" src={weather.icon} alt="Weather Icon" />
            <p><strong>Temperature:</strong> {weather.temp}°C</p>
            <p><strong>Condition:</strong> {weather.description}</p>
            <p><strong>Humidity:</strong> {weather.humidity}%</p>
            <p><strong>Wind Speed:</strong> {weather.windSpeed} km/h</p>
          </div>

          <h2>📅 3-Day Forecast</h2>
          <div className="forecast-container">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <p><strong>{day.date}</strong></p>
                <img src={day.icon} alt="Forecast Icon" className="forecast-icon" />
                <p>{day.description}</p>
                <p><strong>{day.temp}°C</strong></p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Loading weather data...</p>
      )}

      <button className="back-button" onClick={() => navigate("/home")}>🏠</button>
    </div>
  );
}

export default Weather;
