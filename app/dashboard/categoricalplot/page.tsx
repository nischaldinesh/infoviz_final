/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Slider, Typography } from "@mui/material";
import * as d3 from "d3";

// AgeSlider Component
const AgeSlider = ({
  ageRange,
  setAgeRange,
}: {
  ageRange: [number, number];
  setAgeRange: React.Dispatch<React.SetStateAction<[number, number]>>;
}) => {
  const handleChange = (_: Event, newValue: number | number[]) => {
    setAgeRange(newValue as [number, number]);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography
        variant="subtitle1"
        style={{ marginBottom: "10px", fontWeight: "bold" }}
      >
        Age Range: {ageRange[0]} - {ageRange[1]}
      </Typography>
      <Slider
        value={ageRange}
        onChange={handleChange}
        min={20}
        max={70}
        step={1}
        orientation="vertical"
        valueLabelDisplay="auto"
        style={{ height: "300px" }}
      />
    </div>
  );
};

// HeartDiseaseChart Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HeartDiseaseChart = ({ data }: { data: any[] }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedCPs, setSelectedCPs] = useState<number[]>([1, 2, 3, 4]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 900;
    const height = 500;
    const margin = { top: 40, right: 120, bottom: 60, left: 80 };

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d: any) => d.thalach) as [number, number])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 4])
      .range([height - margin.bottom, margin.top]);

    const colorScale = d3
      .scaleOrdinal<number, string>()
      .domain([1, 2, 3, 4])
      .range(["red", "blue", "green", "purple"]);

    const groupedData = d3
      .groups(data, (d: any) => d.cp)
      .filter(([cp]) => selectedCPs.includes(+cp));

    const areaGenerator = d3
      .area<any>()
      .x((d) => xScale(d.thalach))
      .y0(yScale(0))
      .y1((d) => yScale(d.num))
      .curve(d3.curveBasis);

    // Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(10)
          .tickFormat((d) => (d as number).toFixed(0))
      )
      .selectAll("text")
      .style("font-size", "14px");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .style("font-size", "14px");

    // Area Paths
    groupedData.forEach(([cp, values]) => {
      svg
        .append("path")
        .datum(values.sort((a: any, b: any) => a.thalach - b.thalach))
        .attr("fill", colorScale(+cp))
        .attr("opacity", 0.5)
        .attr("d", areaGenerator);
    });

    // Legend
    const cpNames: Record<number, string> = {
      1: "Typical Angina",
      2: "Atypical Angina",
      3: "Non-Anginal Pain",
      4: "Asymptomatic",
    };

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 220}, 50)`);

    Object.entries(cpNames).forEach(([cp, name], i) => {
      const cpNum = +cp;

      legend
        .append("circle")
        .attr("cx", 10)
        .attr("cy", i * 35)
        .attr("r", 7)
        .attr(
          "fill",
          selectedCPs.includes(cpNum) ? colorScale(cpNum) : "#D3D3D3"
        )
        .attr("cursor", "pointer")
        .on("click", () => {
          setSelectedCPs((prev) =>
            prev.includes(cpNum)
              ? prev.filter((c) => c !== cpNum)
              : [...prev, cpNum]
          );
        });

      legend
        .append("text")
        .attr("x", 30)
        .attr("y", i * 35 + 5)
        .text(name)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .attr("alignment-baseline", "middle")
        .attr("cursor", "pointer")
        .on("click", () => {
          setSelectedCPs((prev) =>
            prev.includes(cpNum)
              ? prev.filter((c) => c !== cpNum)
              : [...prev, cpNum]
          );
        });
    });

    // Axis Labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("Max Heart Rate");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("Heart Disease Severity (0–4)");
  }, [data, selectedCPs]);

  return <svg ref={svgRef} width={900} height={500}></svg>;
};

// Page Component
const Page = () => {
  const [ageRange, setAgeRange] = useState<[number, number]>([30, 60]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);

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

    const parseCSV = (text: string) =>
      text
        .trim()
        .split("\n")
        .map((line) => {
          const values = line.split(",");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const row: any = {};
          columnNames.forEach((col, idx) => {
            row[col] = +values[idx];
          });
          return row;
        });

    d3.text("/data/processed.cleveland.csv").then((clevelandText) => {
      const cleveland = parseCSV(clevelandText);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = (d: any) =>
        !isNaN(d.age) &&
        !isNaN(d.cp) &&
        !isNaN(d.thalach) &&
        !isNaN(d.num) &&
        [1, 2, 3, 4].includes(d.cp) &&
        d.num >= 0 &&
        d.num <= 4;

      setData(cleveland.filter(isValid));
    });
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Heart Disease Severity vs. Max Heart Rate by Chest Pain Type
      </Typography>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "40px",
          paddingTop: "30px",
        }}
      >
        <HeartDiseaseChart
          data={data.filter(
            (d) => d.age >= ageRange[0] && d.age <= ageRange[1]
          )}
        />
        <AgeSlider ageRange={ageRange} setAgeRange={setAgeRange} />
      </div>
    </div>
  );
};

export default Page;
