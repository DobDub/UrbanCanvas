import React from "react";
import {
    Drawer,
    IconButton,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const FilterMenu = ({
    isOpen,
    onClose,
    filterArtist,  // Changed from filterName
    setFilterArtist,  // Changed from setFilterName
    filterYear,
    setFilterYear,
    filterArea,
    setFilterArea,
    uniqueYears,
    uniqueAreas
}) => {
    return (
        <>
            <IconButton
                onClick={() => onClose(true)}
                style={{ position: "fixed", top: 10, left: 10, zIndex: 1000 }}
            >
                <MenuIcon fontSize="large" />
            </IconButton>

            <Drawer anchor="left" open={isOpen} onClose={() => onClose(false)}>
                <div style={{ width: 250, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2>Filters</h2>
                        <IconButton onClick={() => onClose(false)}>
                            <CloseIcon />
                        </IconButton>
                    </div>

                    {/* Changed to search by artist */}
                    <TextField
                        label="Search by Artist"
                        variant="outlined"
                        fullWidth
                        value={filterArtist}
                        onChange={(e) => setFilterArtist(e.target.value)}
                        style={{ marginBottom: 20 }}
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
                </div>
            </Drawer>
        </>
    );
};

export default FilterMenu;