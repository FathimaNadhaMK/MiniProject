import React, { useEffect, useState } from "react";
import axios from "axios";

const Sightseeing = ({ lat, lon }) => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    if (lat && lon) {
      axios
        .get(`http://localhost:5000/api/sightseeing?lat=${lat}&lon=${lon}`)
        .then((response) => setPlaces(response.data))
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [lat, lon]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">കണ്ടെത്താൻ പുതിയ സ്ഥലങ്ങൾ</h2>
      <ul>
        {places.map((place, index) => (
          <li key={index} className="mb-2">
            <strong>{place.properties.name || "അജ്ഞാത സ്ഥലം"}</strong>
            <br />
            {place.properties.address_line2}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sightseeing;
