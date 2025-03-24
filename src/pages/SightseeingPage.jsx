import React, { useState } from "react";
import Sightseeing from "../components/Sightseeing";

const SightseeingPage = () => {
  const [location, setLocation] = useState({ lat: null, lon: null });

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => console.error("Error getting location:", error)
    );
  };

  return (
    <div className="p-6">
      <button
        onClick={getUserLocation}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        എന്റെ സ്ഥാനം കണ്ടെത്തൂ
      </button>
      {location.lat && <Sightseeing lat={location.lat} lon={location.lon} />}
    </div>
  );
};

export default SightseeingPage;
