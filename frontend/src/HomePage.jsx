import React, { useState, useEffect } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import Announcement from "./AnnouncementPage.jsx";
import LocalNews from "./LocalNews.jsx";

function Home() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("Fetching location...");
  const [searchLocation, setSearchLocation] = useState("");
  const [description, setDescription] = useState("");
  const [wikiInfo, setWikiInfo] = useState("Loading details...");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [trafficUrl, setTrafficUrl] = useState(null);
  const [adMedia, setAdMedia] = useState(null);
  const [adMediaType, setAdMediaType] = useState(null);

  const [adList, setAdList] = useState([]);

useEffect(() => {
  const storedAds = JSON.parse(localStorage.getItem("adList")) || [];
  setAdList(storedAds);
}, []);
  
useEffect(() => {
  const savedMedia = localStorage.getItem("adMedia");
  const savedType = localStorage.getItem("adMediaType");

  if (savedMedia) {
    setAdMedia(savedMedia);
    setAdMediaType(savedType);
  }
}, []);


  const API_KEY = "0ad52ee3b445ea638ccc1328cbe4fbbf";

  const fetchWeather = async (lat, lon) => {
    try {
      const WEATHER_API_KEY = "f723abe0388a4ebfa84133152250303";
      const weatherRes = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=no`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.current) {
        setWeather({
          temp: weatherData.current.temp_c,
          description: weatherData.current.condition.text,
          humidity: weatherData.current.humidity,
          windSpeed: weatherData.current.wind_kph,
          icon: weatherData.current.condition.icon,
        });
      } else {
        setWeather(null);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeather(null);
    }
  };

  const fetchWikiInfo = async (city) => {
    try {
      const wikiRes = await fetch(
        `https://ml.wikipedia.org/api/rest_v1/page/summary/${city}`
      );
      if (!wikiRes.ok) {
        throw new Error("Wikipedia page not found");
      }
      const wikiData = await wikiRes.json();

      if (wikiData.extract) {
        setWikiInfo(wikiData.extract);
      } else {
        setWikiInfo("ഈ സ്ഥലത്തിനായി വിവരങ്ങൾ ലഭ്യമല്ല.");
      }

      if (wikiData.thumbnail?.source) {
        setImage(wikiData.thumbnail.source);
      } else {
        setImage("https://via.placeholder.com/400?text=No+Image+Available");
      }
    } catch (error) {
      console.error("Error fetching Wikipedia info:", error);
      setWikiInfo("വിക്കിപീഡിയ വിവരങ്ങൾ ലഭ്യമാക്കാനായില്ല.");
      setImage("https://via.placeholder.com/400?text=No+Image+Available");
    }
  };

  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((data) => setTrafficUrl(data.trafficUrl))
      .catch((err) => {
        console.error("Config fetch error:", err);
        setTrafficUrl(null);
      });
  }, []);

  const fetchLocation = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();

      if (!data.address) {
        throw new Error("No address data found");
      }

      const microLocation =
        data.address.suburb ||
        data.address.neighbourhood ||
        data.address.residential ||
        data.address.city_district ||
        data.address.quarter ||
        data.address.town ||
        data.address.city ||
        data.address.village ||
        "Unknown Location";

      setLocation(microLocation);
      setDescription(`Welcome to ${microLocation}, a wonderful place to explore!`);

      fetchWikiInfo(microLocation);
      fetchWeather(lat, lon);
    } catch (error) {
      console.error("❌ Error fetching location:", error);
      setLocation("Location not found");
      setDescription("We couldn't fetch your location.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchLocation.trim() !== "") {
      setLocation(searchLocation);
      setDescription(`Welcome to ${searchLocation}, a wonderful place to explore!`);
      fetchWikiInfo(searchLocation);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          fetchLocation(latitude, longitude);
        },
        (error) => {
          console.error("❌ Geolocation error:", error);
          setLocation("Location access denied");
          setDescription("Please enable location access in browser settings.");
          setLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      setLocation("Geolocation not supported");
      setDescription("Your browser does not support geolocation.");
      setLoading(false);
    }
  }, []);

  return (
    <div className="home-container">
      {weather && (
        <div className="weather-container">
          <h2>🌦️ Current Weather</h2>
          <div className="weather-summary">
            <img src={weather.icon} alt="Weather Icon" />
            <p>
              {weather.temp}°C - {weather.description}
            </p>
          </div>
        </div>
      )}

      <div className="nav-bar">
        <button>🏠 Home</button>
        <button
          onClick={() =>
            navigate("/LocalNews", {
              state: { location, lat: coordinates.lat, lon: coordinates.lon },
            })
          }
        >
          📰 Local News
        </button>
        <button onClick={() => navigate("/Weather")}>🌦️ Weather</button>
        <button onClick={() => (window.location.href = "http://localhost:3000/")}>📍 Nearby Places</button>
        <button onClick={() => navigate("/Emergency")}>⚠️ Emergency Alerts</button>
        <button onClick={() => navigate("/AnnouncementPage")}>📢 Announcements</button>
        <button onClick={() => navigate("/Advertise")}>📺 Advertisements</button>
        <button onClick={() => {
          if (trafficUrl && location) {
            window.location.href = `${trafficUrl}?location=${encodeURIComponent(location)}&lat=${coordinates.lat}&lon=${coordinates.lon}`;
          }
        }}>📍 Traffic</button>
      </div>

      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search a location in Kerala"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
        </div>
        <div className="barr">
          <button onClick={handleSearch}>🔍</button>
        </div>
      </div>

      <div className="layout-container">
       

       <div className="ad-box">
  <h2>Advertisements</h2>
  {adList.length > 0 ? (
    adList.map((ad, index) => (
      <div key={index} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        {ad.mediaType === "video" ? (
          <video src={ad.media} controls width="100%" />
        ) : ad.mediaType === "image" ? (
          <img src={ad.media} alt={`Ad ${index + 1}`} style={{ width: "100%", height: "auto" }} />
        ) : (
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{ad.media}</p>
        )}
      </div>
    ))
  ) : (
    <p>Contact us to place your ad.</p>
  )}
</div>

        <div className="loc">
          {loading ? (
            <p className="loading-text">Fetching your location...</p>
          ) : (
            <>
              <h1 className="location-text">
                Hello, <span className="location-name">{location} 🌍</span>
              </h1>
              <p className="description">{description}</p>
              <p className="wiki-info">{wikiInfo}</p>
              {image && <img src={image} alt="Location" className="location-image" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;