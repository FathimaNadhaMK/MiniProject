import React, { useEffect, useRef } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';

const TomTomMap = () => {
  const mapElement = useRef();

  useEffect(() => {
    const map = tt.map({
      key: 'YA0mTMWWMLEC6ok0EAxYTuckPGrWxkN0',   // Replace with your actual TomTom API key
      container: mapElement.current,
      center: [76.52, 9.96],        // Replace with your location or user’s current location
      zoom: 12,
      stylesVisibility: {
        trafficFlow: true,          // This will show live traffic flow on the map
      },
    });

    return () => map.remove();
  }, []);

  return (
    <div ref={mapElement} style={{ width: '100%', height: '500px', marginBottom: '20px' }}></div>
  );
};

export default TomTomMap;
