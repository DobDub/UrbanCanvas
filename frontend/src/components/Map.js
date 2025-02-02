import React, { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer
} from "@react-google-maps/api";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import "../assets/spnfico.png"
const containerStyle = {
  width: "100%",
  height: "calc(100vh - 100px)",
  minHeight: "500px",
};

const defaultCenter = {
  lat: 45.5017,
  lng: -73.5673,
};

const Map = ({ markers, tourMurals, addToTour, onDirectionsCalculated }) => {
  const [selectedMural, setSelectedMural] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [searchBox, setSearchBox] = useState(null);
  const [directions, setDirections] = useState(null);

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
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
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

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={12}
          onClick={() => setSelectedMural(null)}
        >
          {markers.map((mural) => (
            <Marker
              key={mural.id}
              position={{ lat: mural.lat, lng: mural.lng }}
              onClick={() => setSelectedMural(mural)}
              icon={
                window.google
                  ? {
                    url: require(mural.type === "mural" ? "../assets/spnfico.png" : "../assets/publicart.png"),
                    scaledSize: new window.google.maps.Size(32, 32), // Adjust size as needed
                  }
                  : undefined
              }
            />

          ))}

          {tourMurals.length >= 2 && (
            <>
              <DirectionsService
                options={{
                  destination: {
                    lat: tourMurals[tourMurals.length - 1].lat,
                    lng: tourMurals[tourMurals.length - 1].lng
                  },
                  origin: {
                    lat: tourMurals[0].lat,
                    lng: tourMurals[0].lng
                  },
                  waypoints: tourMurals.slice(1, -1).map(mural => ({
                    location: { lat: mural.lat, lng: mural.lng },
                    stopover: true,
                  })),
                  travelMode: 'WALKING',
                  optimizeWaypoints: true,
                }}
                callback={(result, status) => {
                  if (status === 'OK') {
                    setDirections(result);
                    onDirectionsCalculated(result);
                  } else {
                    onDirectionsCalculated(null);
                  }
                }}
              />
              {directions && <DirectionsRenderer options={{ directions }} />}
            </>
          )}
        </GoogleMap>

        {selectedMural && (
          <Dialog
            open={Boolean(selectedMural)}
            onClose={() => setSelectedMural(null)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>{selectedMural.name}</DialogTitle>
            <DialogContent dividers>
              <p>
                <strong>Artist:</strong> {selectedMural.details.artist || "Unknown"}
              </p>
              <p>
                <strong>Year:</strong> {selectedMural.year || "Unknown"}
              </p>
              <p>
                <strong>Address:</strong> {selectedMural.details.address || "No address available"}
              </p>
              <p>
                <strong>Material:</strong> {selectedMural.details.material || "Unknown"}
              </p>
              <p>
                <strong>Technique:</strong> {selectedMural.details.technique || "Unknown"}
              </p>
              <div style={{ marginTop: "10px" }}>
                {selectedMural.image ? (
                  <a
                    href={selectedMural.image}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={selectedMural.image}
                      alt={selectedMural.name}
                      style={{
                        width: "100%",
                        maxHeight: "400px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginTop: "10px",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
                        cursor: "pointer"
                      }}
                    />
                  </a>
                ) : (
                  "No image available"
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => addToTour(selectedMural)}
                color="primary"
                disabled={tourMurals.some(m => m.id === selectedMural.id)}
              >
                {tourMurals.some(m => m.id === selectedMural.id)
                  ? "Added to Tour"
                  : "Add to Tour"}
              </Button>
              <Button onClick={() => setSelectedMural(null)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    </LoadScript>
  );
};

export default Map;