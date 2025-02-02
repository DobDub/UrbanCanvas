import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 45.5017, // Montreal latitude
  lng: -73.5673, // Montreal longitude
};

const MapComponent = ({ markers }) => {
  const [selectedMural, setSelectedMural] = useState(null);

  // Handle clicks outside the map
  const handleMapClick = () => {
    setSelectedMural(null); // Closes InfoWindow when clicking outside
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap 
        mapContainerStyle={containerStyle} 
        center={defaultCenter} 
        zoom={12}
        onClick={handleMapClick} // Closes InfoWindow when clicking anywhere on the map
      >
        
        {/* Murals Pins */}
        {markers.map((mural) => (
          <Marker
            key={mural.id}
            position={{ lat: mural.lat, lng: mural.lng }}
            onClick={() => setSelectedMural(mural)}
          />
        ))}

        {/* Info Window when a mural is clicked */}
        {selectedMural && (
          <InfoWindow
            position={{ lat: selectedMural.lat, lng: selectedMural.lng }}
            onCloseClick={() => setSelectedMural(null)}
          >
            <div>
              <h3>{selectedMural.name}</h3>
              <p><strong>Artist:</strong> {selectedMural.details.artist || "Unknown"}</p>
              <p><strong>Year:</strong> {selectedMural.details.year || "Unknown"}</p>
              <p><strong>Address:</strong> {selectedMural.details.address || "No address available"}</p>
              <p><strong>Material:</strong> {selectedMural.details.material || "Unknown"}</p>
              <p><strong>Technique:</strong> {selectedMural.details.technique || "Unknown"}</p>
            </div>
          </InfoWindow>
        )}

      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
