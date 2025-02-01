import React, { useState, useEffect } from "react";
import MapComponent from "./components/Map";
import FilterMenu from "./components/FilterMenu";

function App() {
  const [murals, setMurals] = useState([]);
  const [filteredMurals, setFilteredMurals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Filter states
  const [filterArtist, setFilterArtist] = useState(""); // Changed from filterName
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
          name: mural.name,
          lat: parseFloat(mural.latitude),
          lng: parseFloat(mural.longitude),
          year: mural.year,
          area: mural.area,
          details: {
            artist: mural.artist, // Now used for filtering
            address: mural.address,
            material: mural.material,
            technique: mural.technique
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
  }, [filterArtist, filterYear, filterArea, murals]); // Changed dependency

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

  if (loading) return <div>Loading murals...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <FilterMenu
        isOpen={isMenuOpen}
        onClose={setIsMenuOpen}
        filterArtist={filterArtist}  // Changed props
        setFilterArtist={setFilterArtist}  // Changed props
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        filterArea={filterArea}
        setFilterArea={setFilterArea}
        uniqueYears={uniqueYears}
        uniqueAreas={uniqueAreas}
      />

      <h1 style={{ textAlign: "center", marginTop: 60 }}>Montreal Art Murals</h1>
      <MapComponent markers={filteredMurals} />

      {filteredMurals.length === 0 && (
        <div style={{ textAlign: "center", padding: 20 }}>
          No murals found matching the current filters
        </div>
      )}
    </div>
  );
}

export default App;