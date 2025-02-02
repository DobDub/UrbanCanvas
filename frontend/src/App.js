import React, { useState, useEffect } from "react";
import MapComponent from "./components/Map";
import FilterMenu from "./components/FilterMenu";
import "./App.css";

function App() {
  const [murals, setMurals] = useState([]);
  const [filteredMurals, setFilteredMurals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tourMurals, setTourMurals] = useState([]);
  const [tourDirections, setTourDirections] = useState(null);

  // Filter states
  const [filterArtist, setFilterArtist] = useState("");
  const [filterYear, setFilterYear] = useState("All");
  const [filterArea, setFilterArea] = useState("All");
  const [uniqueYears, setUniqueYears] = useState([]);
  const [uniqueAreas, setUniqueAreas] = useState([]);

  useEffect(() => {
    const fetchMurals = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/murals");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const formattedMurals = data.map((mural) => ({
          id: mural.id || Math.random(),
          // Fallback to "Unnamed Mural" if name is missing or empty
          name: mural.name && mural.name.trim() ? mural.name : "Unnamed Mural",
          lat: parseFloat(mural.latitude),
          lng: parseFloat(mural.longitude),
          year: mural.year,
          area: mural.area,
          image: mural.image,
          type: mural.type,
          details: {
            artist: mural.artist || "Unknown Artist",
            address: mural.address || "No Address Provided",
            material: mural.material || "Unknown",
            technique: mural.technique || "Unknown",
          },
        }));

        const years = [...new Set(formattedMurals.map((m) => m.year))].sort();
        const areas = [...new Set(formattedMurals.map((m) => m.area))].sort();

        setMurals(formattedMurals);
        setFilteredMurals(formattedMurals);
        setUniqueYears(years);
        setUniqueAreas(areas);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMurals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterArtist, filterYear, filterArea, murals]);

  const applyFilters = () => {
    let filtered = murals;

    if (filterArtist) {
      filtered = filtered.filter((mural) =>
        mural.details.artist.toLowerCase().includes(filterArtist.toLowerCase())
      );
    }

    if (filterYear !== "All") {
      filtered = filtered.filter((mural) => mural.year === filterYear);
    }

    if (filterArea !== "All") {
      filtered = filtered.filter((mural) => mural.area === filterArea);
    }

    setFilteredMurals(filtered);
  };

  const addToTour = (mural) => {
    setTourMurals((prev) => {
      if (prev.some((m) => m.id === mural.id)) return prev;
      console.log("Adding mural to tour:", mural); // Debug log
      return [...prev, mural];
    });
  };

  // Helper function to generate a Google Maps directions URL.
  const generateGoogleMapsUrl = () => {
    if (tourMurals.length < 2) return "";
    const origin = `${tourMurals[0].lat},${tourMurals[0].lng}`;
    const destination = `${tourMurals[tourMurals.length - 1].lat},${tourMurals[tourMurals.length - 1].lng}`;
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
    if (tourMurals.length > 2) {
      const waypoints = tourMurals
        .slice(1, tourMurals.length - 1)
        .map((m) => `${m.lat},${m.lng}`)
        .join("|");
      url += `&waypoints=${encodeURIComponent(waypoints)}`;
    }
    return url;
  };

  // Helper function to generate a string representation of the tour path.
  // If the mural name is "Unnamed Mural", it falls back to using the artist's name.
  const generatePathString = () => {
    if (tourMurals.length === 0) return "";
    return tourMurals
      .map((m) => {
        // Use mural name if available and not "Unnamed Mural", otherwise use artist name.
        if (m.name === "Unnamed Mural") {
          return m.details.artist && m.details.artist.trim()
            ? m.details.artist
            : "Unknown Artist";
        }
        return m.name;
      })
      .join(" → ");
  };

  if (loading) return <div className="loading">Loading murals...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <div className="header">
        Montreal Art Murals
        <div className="header-subtext">
          Explore murals all around the city
        </div>
      </div>

      <FilterMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(!isMenuOpen)}
        filterArtist={filterArtist}
        setFilterArtist={setFilterArtist}
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        filterArea={filterArea}
        setFilterArea={setFilterArea}
        uniqueYears={uniqueYears}
        uniqueAreas={uniqueAreas}
        murals={murals}
      />

      <div className="map-container">
        <MapComponent
          markers={filteredMurals}
          tourMurals={tourMurals}
          addToTour={addToTour}
          onDirectionsCalculated={setTourDirections}
        />
      </div>

      {tourMurals.length > 0 && (
        <div className="tour-section">
          <h3>Your Tour ({tourMurals.length} murals)</h3>
          <button onClick={() => setTourMurals([])}>Clear Tour</button>

          {tourDirections?.routes?.[0] && (
            <div className="route-info">
              <p>
                Total Distance:{" "}
                {(
                  tourDirections.routes[0].legs.reduce(
                    (sum, leg) => sum + leg.distance.value,
                    0
                  ) / 1000
                ).toFixed(2)}{" "}
                km
              </p>
              <p>
                Estimated Time:{" "}
                {Math.round(
                  tourDirections.routes[0].legs.reduce(
                    (sum, leg) => sum + leg.duration.value,
                    0
                  ) / 60
                )}{" "}
                minutes
              </p>
              <p>
                <strong>Path:</strong> {generatePathString()}
              </p>
              <p>
                <a
                  href={generateGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Full Route in Google Maps
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {filteredMurals.length === 0 && (
        <div className="no-results">
          No murals found matching the current filters
        </div>
      )}
    </div>
  );
}

export default App;
