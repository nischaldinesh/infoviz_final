"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useData, DataPoint } from "../DataContext";

export default function Page() {
  const { data } = useData();
  const scatterRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data.length) return;

    d3.select(scatterRef.current).selectAll("*").remove();
    d3.select(pieRef.current).selectAll("*").remove();
    d3.select(barRef.current).selectAll("*").remove();

    const margin = { top: 10, right: 30, bottom: 50, left: 60 };
    const width = 460 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svgScatter = d3
      .select(scatterRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.restbps) as [number, number])
      .range([0, width])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.chol) as [number, number])
      .range([height, 0])
      .nice();

    svgScatter
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svgScatter.append("g").call(d3.axisLeft(yScale));

    svgScatter
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Resting Blood Pressure (mm Hg)");

    svgScatter
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Cholesterol (mg/dl)");

    const scatterColor = d3
      .scaleOrdinal<string>()
      .domain([...new Set(data.map((d) => d.diag.toString()))])
      .range(d3.schemeCategory10);

    svgScatter
      .append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.restbps))
      .attr("cy", (d) => yScale(d.chol))
      .attr("r", 4)
      .style("fill", (d) => scatterColor(d.diag.toString()))
      .style("opacity", 0.6);

    const brush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("brush end", (event) => {
        const sel = event.selection;
        const filtered = sel
          ? data.filter((d) => {
              const cx = xScale(d.restbps),
                cy = yScale(d.chol);
              return (
                cx >= sel[0][0] &&
                cx <= sel[1][0] &&
                cy >= sel[0][1] &&
                cy <= sel[1][1]
              );
            })
          : data;
        renderPie(filtered);
        renderBar(filtered);
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svgScatter.append("g").call(brush as any);

    renderPie(data);
    renderBar(data);

    function renderPie(dataset: DataPoint[]) {
      d3.select(pieRef.current).selectAll("*").remove();

      const size = 300;
      const legendHeight = 30;
      const radius = size / 2;

      const svgPie = d3
        .select(pieRef.current)
        .append("svg")
        .attr("width", size)
        .attr("height", size + legendHeight)
        .append("g")
        .attr("transform", `translate(${radius},${radius + legendHeight})`);

      const legend = svgPie
        .append("g")
        .attr(
          "transform",
          `translate(${-radius},${-radius - legendHeight + 5})`
        );

      ["Male", "Female"].forEach((sex, i) => {
        legend
          .append("rect")
          .attr("x", i * 100)
          .attr("y", 0)
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", d3.schemeCategory10[i]);
        legend
          .append("text")
          .attr("x", i * 100 + 15)
          .attr("y", 10)
          .attr("text-anchor", "start")
          .style("font-size", "12px")
          .text(sex);
      });

      const counts = d3.rollup(
        dataset,
        (v) => v.length,
        (d) => d.sex
      );
      const entries = Array.from(counts.entries());
      const total = d3.sum(entries, ([, v]) => v);
      const pieData = d3.pie<[number, number]>().value((d) => d[1])(entries);

      const slices = svgPie.append("g");

      const arcGen = d3
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .arc<any>()
        .innerRadius(0)
        .outerRadius(radius - 10);

      const pieColor = d3
        .scaleOrdinal<string>()
        .domain(["Male", "Female"])
        .range(d3.schemeCategory10);

      slices
        .selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("d", arcGen as any)
        .attr("fill", (d) => pieColor(d.data[0] === 1 ? "Male" : "Female"))
        .attr("stroke", "#fff")
        .style("stroke-width", "1px");

      slices
        .selectAll("text")
        .data(pieData)
        .enter()
        .append("text")
        .attr("transform", (d) => `translate(${arcGen.centroid(d)})`)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(
          (d) => `${d.data[1]} (${((d.data[1] / total) * 100).toFixed(0)}%)`
        );
    }

    function renderBar(dataset: DataPoint[]) {
      d3.select(barRef.current).selectAll("*").remove();

      const mb = { top: 20, right: 20, bottom: 50, left: 60 };
      const w = 400 - mb.left - mb.right;
      const h = 300 - mb.top - mb.bottom;

      const svgBar = d3
        .select(barRef.current)
        .append("svg")
        .attr("width", w + mb.left + mb.right)
        .attr("height", h + mb.top + mb.bottom)
        .append("g")
        .attr("transform", `translate(${mb.left},${mb.top})`);

      const bins = [25, 35, 45, 55, 70, 100];
      const groups = bins.slice(0, -1).map((_, i) => {
        const low = bins[i],
          high = bins[i + 1];
        return {
          range: `${low}-${high}`,
          count: dataset.filter((d) => d.age >= low && d.age < high).length,
        };
      });

      const xBand = d3
        .scaleBand<string>()
        .domain(groups.map((g) => g.range))
        .range([0, w])
        .padding(0.2);

      const yLin = d3
        .scaleLinear()
        .domain([0, d3.max(groups, (g) => g.count)!])
        .range([h, 0])
        .nice();

      svgBar
        .append("g")
        .attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(xBand));
      svgBar.append("g").call(d3.axisLeft(yLin));

      svgBar
        .append("text")
        .attr("x", w / 2)
        .attr("y", h + mb.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Age Range");

      svgBar
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -h / 2)
        .attr("y", -mb.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Count");

      svgBar
        .selectAll("rect")
        .data(groups)
        .enter()
        .append("rect")
        .attr("x", (d) => xBand(d.range)!)
        .attr("y", (d) => yLin(d.count))
        .attr("width", xBand.bandwidth())
        .attr("height", (d) => h - yLin(d.count))
        .attr("fill", d3.schemeCategory10[2]);

      svgBar
        .selectAll("text.count")
        .data(groups)
        .enter()
        .append("text")
        .attr("x", (d) => xBand(d.range)! + xBand.bandwidth() / 2)
        .attr("y", (d) => yLin(d.count) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text((d) => d.count.toString());
    }
  }, [data]);

  if (!data.length) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>No data uploaded. Please upload a CSV via the sidebar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-4 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold">BP vs Cholesterol</h2>
        <div ref={scatterRef}></div>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold">Sex Distribution</h2>
          <div ref={pieRef}></div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold">Age Distribution</h2>
          <div ref={barRef}></div>
        </div>
      </div>
    </div>
  );
}
