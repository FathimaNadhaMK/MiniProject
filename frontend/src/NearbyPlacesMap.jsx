import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const places = [
  { name: "College", lat: 9.938, lng: 76.267 },
  { name: "School", lat: 9.940, lng: 76.269 },
  { name: "Tea Shop", lat: 9.936, lng: 76.265 },
  { name: "Café", lat: 9.937, lng: 76.268 },
  { name: "Restaurant", lat: 9.939, lng: 76.266 },
  { name: "Barber Shop", lat: 9.941, lng: 76.270 },
];

const NearbyPlacesMap = () => {
  return (
    <MapContainer center={[9.938, 76.267]} zoom={15} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {places.map((place, index) => (
        <Marker key={index} position={[place.lat, place.lng]}>
          <Popup>{place.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default NearbyPlacesMap;
