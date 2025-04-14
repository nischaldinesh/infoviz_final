"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Papa from "papaparse";

const Page = () => {
  const [data, setData] = useState<
    { restbps: number; chol: number; diag: number }[]
  >([]);
  const ref = useRef<HTMLDivElement>(null);

  const loadcsv = async (path: string) => {
    const response = await fetch(path);
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true,
    });

    const parsedData = (parsed.data as string[][]).map((row) => ({
      restbps: +row[3],
      chol: +row[4],
      diag: +row[13],
    }));

    setData(parsedData);
  };

  useEffect(() => {
    loadcsv("/processed.cleveland.csv");
  }, []);

  useEffect(() => {
    if (!data.length) return;

    d3.select(ref.current).selectAll("*").remove();

    const margin = { top: 10, right: 30, bottom: 20, left: 50 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right + 120)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.restbps) as [number, number])
      .range([0, width]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .transition()
      .duration(1000)
      .call(d3.axisBottom(x));

    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.chol) as [number, number])
      .range([height, 0])
      .nice();

    svg
      .append("g")
      .attr("class", "myYaxis")
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y));

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    svg
      .append("g")
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.restbps))
      .attr("cy", (d) => y(d.chol))
      .attr("fill", (d) => colorScale(d.diag.toString()))
      .attr("r", 3)
      .style("opacity", 0.5);

    const dVals = Array.from(new Set(data.map((d) => d.diag)));

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + 20}, 20)`);

    dVals.forEach((d, i) => {
      legend
        .append("circle")
        .attr("cx", 0)
        .attr("cy", i * 20)
        .attr("r", 5)
        .style("fill", colorScale(d.toString()));

      legend
        .append("text")
        .attr("x", 10)
        .attr("y", i * 20)
        .attr("dy", "0.32em")
        .style("font-size", "12px")
        .text(`Diagnosis: ${d}`);
    });
  }, [data]);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Scatterplot Page</h1>
      <div ref={ref}></div>
    </div>
  );
};

export default Page;
