import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker, Autocomplete } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 45.5017, // Montreal latitude
  lng: -73.5673, // Montreal longitude
};

const MapComponent = ({ markers }) => {
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [searchLocation, setSearchLocation] = useState(defaultCenter);

  const onLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setSearchLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        map.panTo({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div style={{ position: "relative", width: "100%" }}>
        {/* Search Box */}
        <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder="Search for a location..."
            style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "300px",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              zIndex: "1000",
            }}
          />
        </Autocomplete>

        {/* Map */}
        <GoogleMap mapContainerStyle={containerStyle} center={searchLocation} zoom={12} onLoad={onLoad}>
          {markers.map((mural, index) => (
            <Marker key={index} position={{ lat: mural.lat, lng: mural.lng }} />
          ))}
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default MapComponent;
