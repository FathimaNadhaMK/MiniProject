import React, { useEffect, useState } from "react";
//import { requestNotificationPermission } from "./firebase-config";
//import { messaging } from "./firebase-config";
//import { onMessage } from "firebase/messaging";

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY; // Store API key in .env
const WEATHERAPI_KEY = import.meta.env.VITE_WEATHERAPI_KEY; // Store WeatherAPI key in .env

const requestNotificationPermission = () => {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notifications enabled!");
      } else {
        console.log("Notifications denied.");
      }
    });
  } else {
    console.log("This browser does not support notifications.");
  }
};

const App = () => {
  const [alert, setAlert] = useState("നിങ്ങളുടെ ലൊക്കേഷനിലുള്ള കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ നിരീക്ഷിക്കുന്നു...");
  const [rainChance, setRainChance] = useState(null);
  const [rainTime, setRainTime] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location error:", error);
          setAlert("⚠️ ലൊക്കേഷൻ ആക്സസ് നിരസിച്ചു. കാലാവസ്ഥാ മുന്നറിയിപ്പ് ലഭ്യമല്ല.");
        }
      );
    } else {
      setAlert("⚠️ ഈ ബ്രൗസറിൽ ജിയോളൊക്കേഷൻ പിന്തുണയ്ക്കുന്നില്ല.");
    }
  }, []);

  useEffect(() => {
    if (location.lat && location.lon) {
      fetchWeatherData(location.lat, location.lon);
      fetchWindSpeed(location.lat, location.lon);
    }
  }, [location]);

  useEffect(() => {
    if (typeof onMessage !== "undefined" && typeof messaging !== "undefined") {
      onMessage(messaging, (payload) => {
        console.log("Message received. ", payload);
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: payload.notification.icon,
        });
      });
    }
  }, []);

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      console.log("Weather Data:", data); // Debugging log

      if (data && data.list && data.list.length > 0) {
        const firstEntry = data.list[0]; // First forecast data
        setTemperature(firstEntry.main.temp);
        setHumidity(firstEntry.main.humidity);
        setAlert(null);

        const rainData = data.list.find((entry) => entry.rain);
        if (rainData) {
          const percentage = rainData.pop * 100;
          const rainTimeFormatted = new Date(rainData.dt * 1000).toLocaleTimeString("ml-IN", {
            hour: "2-digit",
            minute: "2-digit",
          });

          setRainChance(percentage);
          setRainTime(rainTimeFormatted);
          setTimeout(() => sendNotification(percentage, rainTimeFormatted), 100); // Ensure latest state
        } else {
          setAlert("✅ ഇന്ന് മഴയ്ക്ക സാധ്യതയില്ല.");
        }
      } else {
        setAlert("❌ കാലാവസ്ഥാ വിവരം ലഭിക്കുന്നതിൽ പിശക്.");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setAlert("❌ കാലാവസ്ഥാ വിവരം ലഭിക്കുന്നതിൽ പിശക്.");
    }
  };

  const fetchWindSpeed = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&aqi=no`
      );
      const data = await response.json();
      console.log("Wind Speed Data:", data); // Debugging log
      setWindSpeed(data.current.wind_kph);
    } catch (error) {
      console.error("Error fetching wind speed:", error);
    }
  };

  const sendNotification = (percentage, time) => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("☔ മഴ മുന്നറിയിപ്പ്!", {
            body: `☔ മഴ സാധ്യത: ${percentage}% | പ്രതീക്ഷിക്കുന്ന സമയം: ${time}`,
            icon: "https://cdn-icons-png.flaticon.com/512/2798/2798097.png",
          });
        }
      });
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🌤️ കാലാവസ്ഥാ അടിയന്തര മുന്നറിയിപ്പ്</h1>
      {alert && <div style={styles.alert}>{alert}</div>}

      <div style={styles.cardContainer}>
        {temperature !== null && (
          <div style={styles.card}>
            <h3>🌡️ താപനില | Temperature</h3>
            <p>{temperature}°C</p>
          </div>
        )}

        {humidity !== null && (
          <div style={styles.card}>
            <h3>💧 ആർദ്രത | Humidity</h3>
            <p>{humidity}%</p>
          </div>
        )}

        {windSpeed !== null && (
          <div style={styles.card}>
            <h3>🌬️ കാറ്റ് വേഗത | Wind Speed</h3>
            <p>{windSpeed} km/h</p>
          </div>
        )}
      </div>

      {rainChance !== null && rainTime !== null && (
        <div style={styles.rainCard}>
          <h2>☔ മഴ പ്രവചനം</h2>
          <p>🌧️ ഇന്ന് {rainChance}% മഴയ്ക്ക് സാധ്യത</p>
          <p>🕒 പ്രതീക്ഷിക്കുന്ന സമയം: {rainTime}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f0f8ff", minHeight: "100vh" },
  header: { fontSize: "28px", color: "#333", fontWeight: "bold" },
  alert: { color: "red", fontWeight: "bold", marginTop: "10px" },
  cardContainer: { display: "flex", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" },
  card: { backgroundColor: "#fff", padding: "15px", margin: "10px", borderRadius: "10px", boxShadow: "0px 4px 8px rgba(0,0,0,0.2)", width: "200px", textAlign: "center" },
  rainCard: { backgroundColor: "#ffe5b4", padding: "15px", marginTop: "20px", borderRadius: "10px", boxShadow: "0px 4px 8px rgba(0,0,0,0.2)", textAlign: "center" }
};

export default App;
