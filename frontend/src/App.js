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
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const formattedMurals = data.map(mural => ({
          id: mural.id || Math.random(), // Ensure unique keys
          name: mural.name,
          lat: parseFloat(mural.latitude),
          lng: parseFloat(mural.longitude),
          year: mural.year, // Keep year outside details for easier filtering
          area: mural.area,
          image: mural.image,
          details: {
            artist: mural.artist || "Unknown Artist",
            address: mural.address || "No Address Provided",
            material: mural.material || "Unknown",
            technique: mural.technique || "Unknown"
          }
        }));

        // Extract unique years and areas
        const years = [...new Set(formattedMurals.map(m => m.year))].sort();
        const areas = [...new Set(formattedMurals.map(m => m.area))].sort();

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
      filtered = filtered.filter(mural =>
        mural.details.artist.toLowerCase().includes(filterArtist.toLowerCase())
      );
    }

    if (filterYear !== "All") {
      filtered = filtered.filter(mural => mural.year === filterYear);
    }

    if (filterArea !== "All") {
      filtered = filtered.filter(mural => mural.area === filterArea);
    }

    setFilteredMurals(filtered);
  };

  if (loading) return <div className="loading">Loading murals...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      {/* Styled Header Section */}
      <div className="header">
        Montreal Art Murals
        <div className="header-subtext">Explore murals all around the city</div>
      </div>

      {/* Filter Menu */}
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
        murals={murals} // Pass murals to FilterMenu
      />

      {/* Map Component */}
      <div className="map-container">
        <MapComponent markers={filteredMurals} />
      </div>

      {/* No Murals Message */}
      {filteredMurals.length === 0 && (
        <div className="no-results">
          No murals found matching the current filters
        </div>
      )}
    </div>
  );
}

export default App;
