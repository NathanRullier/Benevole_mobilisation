import React from "react";
import { Container, Typography, Box, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const WorkshopsPage: React.FC = () => {
  return (
    <Container data-testid="workshop-list">
      <Typography variant="h4">Workshops</Typography>
      <Box data-testid="workshop-filters" sx={{ display: "flex", gap: 2, my: 2 }}>
        <TextField
          data-testid="search-workshops"
          placeholder="Search workshops..."
          variant="outlined"
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Region</InputLabel>
          <Select data-testid="filter-region" label="Region" defaultValue="">
            <MenuItem value="">All Regions</MenuItem>
            <MenuItem value="Montreal">Montreal</MenuItem>
            <MenuItem value="Quebec City">Quebec City</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Specialization</InputLabel>
          <Select data-testid="filter-specialization" label="Specialization" defaultValue="">
            <MenuItem value="">All Specializations</MenuItem>
            <MenuItem value="Employment Law">Employment Law</MenuItem>
            <MenuItem value="Corporate Law">Corporate Law</MenuItem>
          </Select>
        </FormControl>
        <TextField
          type="date"
          data-testid="filter-date"
          variant="outlined"
          size="small"
          InputLabelProps={{ shrink: true }}
          label="Date"
        />
      </Box>
    </Container>
  );
};

export default WorkshopsPage; 