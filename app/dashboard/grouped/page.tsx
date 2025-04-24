/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Typography,
} from "@mui/material";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useData } from "../DataContext";
import GroupedBP, { GroupedBPProps } from "./GroupedBP";

export default function Page() {
  const { data, setRawCsv } = useData();
  const [feature, setFeature] =
    useState<GroupedBPProps["feature"]>("Cholesterol");

  useEffect(() => {
    fetch("/data/processed.cleveland.csv")
      .then((res) => res.text())
      .then((csv) => setRawCsv(csv));
  }, [setRawCsv]);

  const handleChange = (e: SelectChangeEvent) => {
    setFeature(e.target.value as GroupedBPProps["feature"]);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Grouped Blood Pressure & Cholesterol
      </Typography>

      <FormControl
        variant="outlined"
        size="small"
        sx={{ mb: 3, minWidth: 240 }}
      >
        <InputLabel id="feature-select-label">Feature</InputLabel>
        <Select
          labelId="feature-select-label"
          id="feature-select"
          value={feature}
          label="Feature"
          onChange={handleChange}
        >
          <MenuItem value="Cholesterol">Cholesterol</MenuItem>
          <MenuItem value="Resting Blood Pressure">
            Resting Blood Pressure
          </MenuItem>
          <MenuItem value="Maximum Heart Rate">Maximum Heart Rate</MenuItem>
        </Select>
      </FormControl>

      <GroupedBP data={data as any} feature={feature} />
    </Box>
  );
}
