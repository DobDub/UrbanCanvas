import React, { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete
} from "@react-google-maps/api";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

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
    // Optionally close the dialog if you want to close it when clicking the map
    // setSelectedMural(null);
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
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
    >
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
          {/* Murals Markers */}
          {markers.map((mural) => (
            <Marker
              key={mural.id}
              position={{ lat: mural.lat, lng: mural.lng }}
              onClick={() => setSelectedMural(mural)}
            />
          ))}
        </GoogleMap>

        {/* Dialog for a large view with the mural info */}
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
                <strong>Year:</strong> {selectedMural.details.year || "Unknown"}
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
                  // Wrap the image in an anchor tag to open the full image in a new tab
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
              <Button onClick={() => setSelectedMural(null)} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    </LoadScript>
  );
};

export default Map;
