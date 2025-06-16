import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const getParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    location: params.get('location'),
    lat: parseFloat(params.get('lat')),
    lon: parseFloat(params.get('lon')),
  };
};


const Project = () => {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [phone, setPhone] = useState('');
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [trafficDescription, setTrafficDescription] = useState('');

  useEffect(() => {
    const { lat, lon } = getParams();
    if (lat && lon) {
      setLocation({ lat, lng: lon });
    } else {
      alert('No location data received from Home page.');
    }
  }, []);
  

  useEffect(() => {
    if (location) {
      window.initMap = function () {
        const map = new window.google.maps.Map(mapRef.current, {
          center: location,
          zoom: 14,
        });

        const trafficLayer = new window.google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        const randomDelay = Math.floor(Math.random() * 600);
        if (randomDelay < 60) {
          setTrafficDescription('Traffic is light. Smooth travel expected!');
        } else if (randomDelay < 300) {
          setTrafficDescription('Moderate traffic detected. Slight delays possible.');
        } else {
          setTrafficDescription('Heavy traffic detected! You will receive an SMS alert.');
          if (phone) {
            axios.post('http://localhost:5000/send-sms', {
              phone,
              message: 'Heavy traffic detected on your saved route. Please plan accordingly.',
            });
          }
        }
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC9lj2-CNi9pXZ5wledyyWLQjiAN7gq54A&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [location, phone]);

  const handleSaveRoute = () => {
    if (source && destination) {
      setSavedRoutes([...savedRoutes, { source, destination }]);
      alert(`Route saved: ${source} to ${destination}`);
      setSource('');
      setDestination('');
    } else {
      alert('Please enter both source and destination.');
    }
  };

  const handleClearRoutes = () => {
    setSavedRoutes([]);
  };

  const handleSavePhoneNumber = () => {
    if (phone) {
      alert(`Phone number saved: ${phone}`);
      setPhone('');
    } else {
      alert('Please enter a phone number.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
    <h1 style={{ textAlign: 'center' }}>Local Stream</h1>
    <h2 style={{ textAlign: 'center' }}>Live Traffic Updates with SMS Alerts</h2>
    
  
      <div style={{ display: 'flex', marginTop: '20px' }}>
        <div style={{ flex: 2, marginRight: '20px' }}>
          <div
            ref={mapRef}
            style={{ width: '100%', height: '500px', marginTop: '20px' }}
          ></div>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Enter Route:</h3>
          <input
            type="text"
            placeholder="Source location"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={{ padding: '8px', width: '90%', marginBottom: '10px' }}
          />
          <input
            type="text"
            placeholder="Destination location"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{ padding: '8px', width: '90%', marginBottom: '10px' }}
          />
          <button
            onClick={handleSaveRoute}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              marginBottom: '20px',
              cursor: 'pointer',
            }}
          >
            Save Route
          </button>

          <h3>Enter your phone number for SMS alerts:</h3>
          <input
            type="text"
            placeholder="Phone Number (+91xxxxxxxxxx)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ padding: '8px', width: '90%', margin: '10px 0' }}
          />
          <button
            onClick={handleSavePhoneNumber}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              marginBottom: '20px',
              cursor: 'pointer',
            }}
          >
            Save Phone Number
          </button>
          <p style={{ fontSize: '14px' }}>SMS will be sent when heavy traffic is detected.</p>

          <h4>Traffic Status:</h4>
          <p>{trafficDescription || 'Loading traffic info...'}</p>

          <h4>Saved Routes:</h4>
          {savedRoutes.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedRoutes.map((route, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '10px 15px',
                      border: '1px solid #ccc',
                      borderRadius: '10px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                      {route.source} ➡ {route.destination}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleClearRoutes}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  marginTop: '15px',
                  cursor: 'pointer',
                }}
              >
                Clear Saved Routes
              </button>
            </>
          ) : (
            <p>No routes saved yet.</p>
          )}

          
    {location ? (
      <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
        Current Location: Latitude {location.lat.toFixed(4)}, Longitude {location.lng.toFixed(4)}
      </p>
    ) : (
      <p style={{ textAlign: 'center', fontStyle: 'italic' }}>Loading location...</p>
    )}
        </div>
      </div>
    </div>
  );
};

export default Project;
