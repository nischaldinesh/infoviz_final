"use client";

import React, { useEffect, useState } from "react";
import {
  Typography,
  Select,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Box,
  Paper,
} from "@mui/material";
import * as d3 from "d3";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

const ageGroups = ["20-29", "30-39", "40-49", "50-59", "60-69", "70-79"];

const Page = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [sexFilter, setSexFilter] = useState<string>("all");

  useEffect(() => {
    const columnNames = [
      "age",
      "sex",
      "cp",
      "trestbps",
      "chol",
      "fbs",
      "restecg",
      "thalach",
      "exang",
      "oldpeak",
      "slope",
      "ca",
      "thal",
      "num",
    ];

    d3.text("/data/processed.cleveland.csv").then((text) => {
      const rows = text
        .trim()
        .split("\n")
        .map((line) => {
          const values = line.split(",").map((v) => +v);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const obj: any = {};
          columnNames.forEach((col, idx) => {
            obj[col] = values[idx];
          });
          return obj;
        });
      setData(rows);
    });
  }, []);

  const filteredData = data.filter((d) => {
    if (sexFilter === "all") return true;
    return sexFilter === "male" ? d.sex === 1 : d.sex === 0;
  });

  const getAgeGroup = (age: number) => {
    const idx = Math.floor((age - 20) / 10);
    return ageGroups[idx] || "70+";
  };

  // build sorted avgCholByAge
  const avgCholByAge = ageGroups.map((group) => {
    const vals = filteredData.filter((d) => getAgeGroup(d.age) === group);
    return {
      ageGroup: group,
      avgChol: d3.mean(vals, (d) => d.chol) || 0,
    };
  });

  // build sorted avgSeverityByAgeAndSex
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const avgSeverityByAgeAndSex = ageGroups.map((group) => {
    const groupData = filteredData.filter((d) => getAgeGroup(d.age) === group);
    const maleAvg =
      d3.mean(
        groupData.filter((d) => d.sex === 1),
        (d) => d.num
      ) || 0;
    const femaleAvg =
      d3.mean(
        groupData.filter((d) => d.sex === 0),
        (d) => d.num
      ) || 0;
    return {
      ageGroup: group,
      male: maleAvg,
      female: femaleAvg,
    };
  });

  const riskFactors = [
    { key: "fbs", label: "Fasting Blood Sugar > 120" },
    { key: "exang", label: "Exercise-induced Angina" },
    { key: "cp", label: "Chest Pain Type 4" },
    { key: "chol", label: "Cholesterol > 240" },
  ];
  const riskCounts = riskFactors.map(({ key, label }) => {
    const count = filteredData.filter((d) => {
      if (key === "fbs" || key === "exang") return d[key] === 1;
      if (key === "cp") return d.cp === 4;
      return d.chol > 240;
    }).length;
    return { factor: label, count };
  });

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Age & Sex Patterns in Heart Disease: Cholesterol Levels and Key Risk
        Factors
      </Typography>

      <FormControl variant="outlined" sx={{ mb: 3, width: 250 }} size="small">
        <InputLabel id="sex-filter-label">Filter by Sex</InputLabel>
        <Select
          labelId="sex-filter-label"
          label="Filter by Sex"
          value={sexFilter}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setSexFilter(e.target.value)}
          sx={{ borderRadius: 1 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
        </Select>
      </FormControl>

      <Grid spacing={5}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Avg Cholesterol by Age Group
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={avgCholByAge}>
                <XAxis dataKey="ageGroup" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    Math.round(value),
                    name,
                  ]}
                />
                <CartesianGrid stroke="#ccc" />
                <Line
                  type="monotone"
                  dataKey="avgChol"
                  stroke="#ff7300"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Risk Factors
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskCounts} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="factor" width={220} />
                <Tooltip />
                <CartesianGrid stroke="#ccc" />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Page;
