import React from "react";
import MapComponent from "./components/Map";

const murals = [
  { name: "Mural 1", lat: 45.508, lng: -73.555 },
  { name: "Mural 2", lat: 45.515, lng: -73.560 },
];

function App() {
  return (
    <div>
      <h1>Montreal Art Murals</h1>
      <MapComponent markers={murals} />
    </div>
  );
}

export default App;
