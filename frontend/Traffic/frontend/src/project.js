import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrafficStatus = () => {
  const [trafficMessage, setTrafficMessage] = useState("Fetching traffic data...");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const trafficData = await fetchTrafficData(latitude, longitude);
      setTrafficMessage(trafficData);
    }, () => {
      setTrafficMessage("Unable to access location.");
    });
  }, []);

  const fetchTrafficData = async (lat, lng) => {
    try {
      const apiKey = 'YA0mTMWWMLEC6ok0EAxYTuckPGrWxkN0';  // Replace with your TomTom API Key
      const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point=${lat},${lng}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.flowSegmentData) {
        const speed = data.flowSegmentData.currentSpeed;
        const freeFlowSpeed = data.flowSegmentData.freeFlowSpeed;
        if (speed < freeFlowSpeed * 0.7) {
          return "Heavy traffic near your current location.";
        } else if (speed < freeFlowSpeed * 0.9) {
          return "Moderate traffic near your current location.";
        } else {
          return "Traffic is smooth near your location.";
        }
      } else {
        return "No traffic data available.";
      }
    } catch (error) {
      return "Error fetching traffic data.";
    }
  };

  return (
    <div>
      <h4>Live Traffic Status (Based on your current location):</h4>
      <p>{trafficMessage}</p>
    </div>
  );
};

const LocalStreamApp = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savedRoutes, setSavedRoutes] = useState([]);

  const handleSaveRoute = () => {
    if (source && destination) {
      setSavedRoutes([...savedRoutes, { source, destination }]);
      setSource('');
      setDestination('');
    }
  };

  const handleSavePhoneNumber = async () => {
    try {
      await axios.post('http://localhost:5000/save-phone', { phoneNumber });
      alert("Phone number saved for SMS alerts!");
      setPhoneNumber('');
    } catch (error) {
      console.error("Error saving phone number:", error);
      alert("Failed to save phone number.");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">Local Stream</h1>
      <h2 className="text-xl text-center mb-6">Live Traffic Updates with SMS Alerts (TomTom API)</h2>

      {/* Optional: Instead of Google iframe, you can add TomTom map embed later */}

      <TrafficStatus />

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Enter Route:</h3>
        <input
          type="text"
          placeholder="Source location"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Destination location"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        />
        <button
          onClick={handleSaveRoute}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Route
        </button>

        <h3 className="text-lg font-semibold mt-6 mb-2">Enter your phone number for SMS alerts:</h3>
        <input
          type="text"
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        />
        <button
          onClick={handleSavePhoneNumber}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save Phone Number
        </button>

        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-2">Saved Routes:</h4>
          {savedRoutes.length > 0 ? (
            <ul>
              {savedRoutes.map((route, index) => (
                <li key={index} className="border p-2 rounded mb-1">
                  {route.source} ➡ {route.destination}
                </li>
              ))}
            </ul>
          ) : (
            <p>No routes saved yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalStreamApp;
