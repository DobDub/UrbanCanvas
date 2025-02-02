import React from "react";
import {
    Drawer,
    IconButton,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Autocomplete
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

// Import icons from assets folder
import muralsIcon from "../assets/murals.png";
import spnficoIcon from "../assets/spnfico.png";
import publicArtIcon from "../assets/publicart.png";
import libraryIcon from "../assets/libraryicon.png";
import museumIcon from "../assets/museumicon.png";
import churchIcon from "../assets/churchicon.png";
import theaterIcon from "../assets/theatericon.png";
import planetariumIcon from "../assets/planetariumicon.png";
import opIcon from "../assets/opicon.png";
import buildingIcon from "../assets/basicbuilding.png";

const FilterMenu = ({
    isOpen,
    onClose,
    filterArtist,
    setFilterArtist,
    filterYear,
    setFilterYear,
    filterArea,
    setFilterArea,
    uniqueYears,
    uniqueAreas,
    murals
}) => {
    const uniqueArtists = murals ? [...new Set(murals.map(mural => mural.details.artist))].sort() : [];

    return (
        <>
            <IconButton
                onClick={onClose}
                style={{ position: "fixed", top: 10, left: 10, zIndex: 1000 }}
            >
                <MenuIcon fontSize="large" />
            </IconButton>

            <Drawer anchor="left" open={isOpen} onClose={onClose}>
                <div style={{ width: 250, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2>Filters</h2>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </div>

                    {/* Autocomplete for Artist */}
                    <Autocomplete
                        value={filterArtist}
                        onChange={(event, newValue) => setFilterArtist(newValue || "")}
                        options={uniqueArtists}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search by Artist"
                                variant="outlined"
                                fullWidth
                                style={{ marginBottom: 20 }}
                            />
                        )}
                    />

                    <FormControl fullWidth style={{ marginBottom: 20 }}>
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            label="Year"
                        >
                            <MenuItem value="All">All Years</MenuItem>
                            {uniqueYears
                                .filter((year) => year >= 2000 && year <= 2025)
                                .map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth style={{ marginBottom: 20 }}>
                        <InputLabel>Area</InputLabel>
                        <Select
                            value={filterArea}
                            onChange={(e) => setFilterArea(e.target.value)}
                            label="Area"
                        >
                            <MenuItem value="All">All Areas</MenuItem>
                            {uniqueAreas.map(area => (
                                <MenuItem key={area} value={area}>{area}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Legend Section */}
                    <div style={{ marginTop: 30 }}>
                        <h3 style={{ marginBottom: 10 }}>Legend</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <LegendItem icon={muralsIcon} label="Murals" />
                            <LegendItem icon={publicArtIcon} label="Public Art" />
                            <LegendItem icon={libraryIcon} label="Library" />
                            <LegendItem icon={museumIcon} label="Museum" />
                            <LegendItem icon={churchIcon} label="Church" />
                            <LegendItem icon={theaterIcon} label="Theater" />
                            <LegendItem icon={planetariumIcon} label="Planetarium" />
                            <LegendItem icon={opIcon} label="Opera House" />
                            <LegendItem icon={buildingIcon} label="Historic Building" />
                        </div>
                    </div>
                </div>
            </Drawer>
        </>
    );
};

// Component for Legend Item
const LegendItem = ({ icon, label }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
        <img src={icon} alt={label} style={{ width: 25, height: 25, marginRight: 10 }} />
        <span>{label}</span>
    </div>
);

export default FilterMenu;
