import React, { useState, useRef } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow, Autocomplete } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 100px)", // Adjusts to full height minus header
  minHeight: "500px", // Ensures minimum height
};

const defaultCenter = {
  lat: 45.5017, // Montreal latitude
  lng: -73.5673, // Montreal longitude
};

const Map = ({ markers }) => {
  const [selectedMural, setSelectedMural] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [searchBox, setSearchBox] = useState(null);

  const handleMapClick = () => {
    setSelectedMural(null); // Closes InfoWindow when clicking outside
  };

  const onSearchBoxLoad = (ref) => {
    setSearchBox(ref);
  };

  const onPlaceChanged = () => {
    if (searchBox) {
      const place = searchBox.getPlace();
      if (place.geometry) {
        setMapCenter({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Search Box */}
        <Autocomplete onLoad={onSearchBoxLoad} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder="Search for a location..."
            style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "300px",
              height: "40px",
              fontSize: "16px",
              padding: "5px 10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              outline: "none",
              zIndex: 10,
              background: "#fff",
            }}
          />
        </Autocomplete>

        {/* Map */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={12}
          onClick={handleMapClick}
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
      </div>
    </LoadScript>
  );
};

export default Map;
