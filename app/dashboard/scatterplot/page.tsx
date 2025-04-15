"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Papa from "papaparse";

interface DataPoint {
  age: number;
  sex: number;
  restbps: number;
  chol: number;
  diag: number;
}

const Page = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const scatterRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const dataFiles = [
    { label: "Cleveland", path: "/data/processed.cleveland.csv" },
    { label: "Hungarian", path: "/data/processed.hungarian.csv" },
    { label: "Switzerland", path: "/data/processed.switzerland.csv" },
  ];

  const [selectedFile, setSelectedFile] = useState<string>(dataFiles[0].path);

  const loadcsv = async (path: string): Promise<void> => {
    const response = await fetch(path);
    const csvText = await response.text();

    const parsed = Papa.parse<string[]>(csvText, {
      header: false,
      skipEmptyLines: true,
    });

    const parsedData: DataPoint[] = (parsed.data as string[][]).map(
      (row: string[]) => ({
        age: +row[0],
        sex: +row[1],
        restbps: +row[3],
        chol: +row[4],
        diag: +row[13],
      })
    );

    setData(parsedData);
  };

  useEffect(() => {
    loadcsv(selectedFile);
  }, [selectedFile]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFile(event.target.value);
  };

  useEffect(() => {
    if (!data.length) return;

    d3.select(scatterRef.current).selectAll("*").remove();

    const margin = { top: 10, right: 30, bottom: 20, left: 50 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(scatterRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right + 120)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.restbps) as [number, number])
      .range([0, width]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
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

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(data.map((d) => d.diag.toString()))
      .range(d3.schemeCategory10);

    svg
      .append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d: DataPoint) => x(d.restbps))
      .attr("cy", (d: DataPoint) => y(d.chol))
      .attr("r", 3)
      .style("fill", (d: DataPoint) => colorScale(d.diag.toString()) || "black")
      .style("opacity", 0.5);

    const brush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("brush end", brushended);

    svg.append("g").attr("class", "brush").call(brush);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function brushended(event: any) {
      const selection = event.selection;
      let brushedData: DataPoint[] = [];
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection;
        brushedData = data.filter((d: DataPoint) => {
          const cx = x(d.restbps);
          const cy = y(d.chol);
          return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
        });
      } else {
        brushedData = data;
      }
      updatePie(brushedData);
      updateBar(brushedData);
    }

    updatePie(data);
    updateBar(data);

    function updatePie(filteredData: DataPoint[]) {
      d3.select(pieRef.current).selectAll("*").remove();

      const widthPie = 300,
        heightPie = 300,
        radius = Math.min(widthPie, heightPie) / 2;

      const svgPie = d3
        .select(pieRef.current)
        .append("svg")
        .attr("width", widthPie)
        .attr("height", heightPie)
        .append("g")
        .attr("transform", `translate(${widthPie / 2}, ${heightPie / 2})`);

      const sexCounts = d3.rollup(
        filteredData,
        (v: DataPoint[]) => v.length,
        (d: DataPoint) => d.sex
      );
      const pieData = Array.from(sexCounts, ([key, value]) => ({
        sex: key === 1 ? "Male" : "Female",
        count: value,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pieLayout = d3.pie<any>().value((d: any) => d.count);
      const data_ready = pieLayout(pieData);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const arc = d3.arc<any>().innerRadius(0).outerRadius(radius);
      const color = d3
        .scaleOrdinal<string>()
        .domain(pieData.map((d) => d.sex))
        .range(d3.schemeCategory10);

      svgPie
        .selectAll("path")
        .data(data_ready)
        .enter()
        .append("path")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("d", arc as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("fill", (d: any) => color(d.data.sex))
        .attr("stroke", "white")
        .style("stroke-width", "2px");

      svgPie
        .selectAll("text")
        .data(data_ready)
        .enter()
        .append("text")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .text((d: any) => `${d.data.sex}: ${d.data.count}`)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("transform", (d: any) => `translate(${arc.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "12px");
    }

    function updateBar(filteredData: DataPoint[]) {
      d3.select(barRef.current).selectAll("*").remove();

      const marginBar = { top: 20, right: 30, bottom: 40, left: 40 },
        widthBar = 400 - marginBar.left - marginBar.right,
        heightBar = 300 - marginBar.top - marginBar.bottom;

      const svgBar = d3
        .select(barRef.current)
        .append("svg")
        .attr("width", widthBar + marginBar.left + marginBar.right)
        .attr("height", heightBar + marginBar.top + marginBar.bottom)
        .append("g")
        .attr("transform", `translate(${marginBar.left}, ${marginBar.top})`);

      const bins = [0, 25, 35, 45, 55, 70, 100];

      const ageGroups = bins.slice(0, -1).map((_, i) => {
        const lower = bins[i];
        const upper = bins[i + 1];
        const count = filteredData.filter(
          (d: DataPoint) => d.age >= lower && d.age < upper
        ).length;
        return { range: `${lower}-${upper}`, count };
      });

      const xBar = d3
        .scaleBand<string>()
        .domain(ageGroups.map((d) => d.range))
        .range([0, widthBar])
        .padding(0.2);

      const yBar = d3
        .scaleLinear()
        .domain([0, d3.max(ageGroups, (d) => d.count) || 0])
        .nice()
        .range([heightBar, 0]);

      svgBar
        .append("g")
        .attr("transform", `translate(0, ${heightBar})`)
        .call(d3.axisBottom(xBar));

      svgBar.append("g").call(d3.axisLeft(yBar));

      svgBar
        .selectAll("rect")
        .data(ageGroups)
        .enter()
        .append("rect")
        .attr("x", (d) => xBar(d.range)!)
        .attr("y", (d) => yBar(d.count))
        .attr("width", xBar.bandwidth())
        .attr("height", (d) => heightBar - yBar(d.count))
        .attr("fill", d3.schemeCategory10[1]);

      svgBar
        .selectAll("text.count-label")
        .data(ageGroups)
        .enter()
        .append("text")
        .attr("class", "count-label")
        .attr("x", (d) => xBar(d.range)! + xBar.bandwidth() / 2)
        .attr("y", (d) => yBar(d.count) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text((d) => d.count);
    }
  }, [data]);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="mb-4">
        <label className="mr-2 font-medium">Select Data File:</label>
        <select
          value={selectedFile}
          onChange={handleSelectChange}
          className="border rounded p-2 focus:outline-none focus:ring focus:ring-blue-200 transition"
        >
          {dataFiles.map((file) => (
            <option key={file.path} value={file.path}>
              {file.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex">
        <div ref={scatterRef}></div>
        <div className="ml-8">
          <h2 className="text-xl font-bold mt-4">
            Sex Distribution (Pie Chart)
          </h2>
          <div ref={pieRef}></div>
          <h2 className="text-xl font-bold mt-4">
            Age Distribution (Bar Chart)
          </h2>
          <div ref={barRef}></div>
        </div>
      </div>
    </div>
  );
};

export default Page;
