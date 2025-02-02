import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import "../assets/spnfico.png"; // Make sure the asset exists

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
  const [mapLoaded, setMapLoaded] = useState(false);

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

  // Helper function to get the icon for a marker.
  // It uses the Google API constructor only after the map is loaded.
  const getIcon = (mural) => {
    console.log("checking: ", mural)
    const iconMap = {
      theaters: require("../assets/theatericon.png"),
      sciencebuildings: require("../assets/planetariumicon.png"),
      "public-art": require("../assets/publicart.png"),
      museums: require("../assets/museumicon.png"),
      mural: require("../assets/murals.png"),
      churches: require("../assets/churchicon.png"),
      basicbuildings: require("../assets/basicbuilding.png"),
    };
    const iconUrl = iconMap[mural.type] || require("../assets/basicbuilding.png"); // Default to basicbuilding
    console.log("loaded mural: ", mural.type); // Debugging line to check type and icon loading
    if (
      mapLoaded &&
      window.google &&
      window.google.maps &&
      typeof window.google.maps.Size === "function"
    ) {
      return {
        url: iconUrl,
        scaledSize: new window.google.maps.Size(32, 32),
      };
    } else {
      return {
        url: iconUrl,
      };
    }
  };


  // Imperatively request directions only when tourMurals change.
  useEffect(() => {
    if (
      tourMurals.length >= 2 &&
      window.google &&
      typeof window.google.maps.DirectionsService === "function"
    ) {
      const directionsService = new window.google.maps.DirectionsService();

      const origin = {
        lat: tourMurals[0].lat,
        lng: tourMurals[0].lng,
      };
      const destination = {
        lat: tourMurals[tourMurals.length - 1].lat,
        lng: tourMurals[tourMurals.length - 1].lng,
      };
      const waypoints = tourMurals.slice(1, -1).map((mural) => ({
        location: { lat: mural.lat, lng: mural.lng },
        stopover: true,
      }));

      const request = {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.WALKING,
        optimizeWaypoints: true,
      };

      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          onDirectionsCalculated(result);
        } else {
          setDirections(null);
          onDirectionsCalculated(null);
        }
      });
    } else {
      // Clear directions if there aren’t enough murals.
      setDirections(null);
      onDirectionsCalculated(null);
    }
  }, [tourMurals, onDirectionsCalculated]);

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
          onLoad={() => setMapLoaded(true)}
        >
          {markers.map((mural) => (
            <Marker
              key={mural.id}
              position={{ lat: mural.lat, lng: mural.lng }}
              onClick={() => setSelectedMural(mural)}
              icon={getIcon(mural)}
            />
          ))}

          {directions && <DirectionsRenderer options={{ directions }} />}
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
                <strong>Artist:</strong>{" "}
                {selectedMural.details.artist || "Unknown"}
              </p>
              <p>
                <strong>Year:</strong> {selectedMural.year || "Unknown"}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {selectedMural.details.address || "No address available"}
              </p>
              <p>
                <strong>Material:</strong>{" "}
                {selectedMural.details.material || "Unknown"}
              </p>
              <p>
                <strong>Technique:</strong>{" "}
                {selectedMural.details.technique || "Unknown"}
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
                        cursor: "pointer",
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
                disabled={tourMurals.some((m) => m.id === selectedMural.id)}
              >
                {tourMurals.some((m) => m.id === selectedMural.id)
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
