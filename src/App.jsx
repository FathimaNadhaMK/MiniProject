import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./signup";  // Ensure filename matches case-sensitive imports
import Login from "./Login";
import Home from "./HomePage";
import NearbyPlacesMap from "./NearbyPlacesMap";
import Weather from "./Weather";
import LocalNews from "./LocalNews";
import AnnouncementPage from "./AnnouncementPage";
import Emergency from "./Emergency";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
      <Route path="/home" element={<Home />} />
      <Route path="/map" element={<NearbyPlacesMap />} />
      <Route path="/weather" element={<Weather />} />
      <Route path="/LocalNews" element={<LocalNews />} />
      <Route path="/AnnouncementPage" element={<AnnouncementPage />} />
      <Route path="/emergency" element={<Emergency />} />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;
