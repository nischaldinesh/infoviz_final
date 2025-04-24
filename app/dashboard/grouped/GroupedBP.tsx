"use client";
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export interface GroupedBPProps {
  data: Array<{
    age: number;
    sex: number;
    restbps: number;
    chol: number;
    thalach: number;
    diag: number;
  }>;
  feature: "Cholesterol" | "Resting Blood Pressure" | "Maximum Heart Rate";
}

export default function GroupedBP({ data, feature }: GroupedBPProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const container = d3.select(ref.current);
    container.selectAll("*").remove();

    // 1) transform
    const transformed = data.map((d) => ({
      ageGroup: `${Math.floor(d.age / 10) * 10}-${
        Math.floor(d.age / 10) * 10 + 9
      }`,
      gender: d.sex,
      feature:
        feature === "Cholesterol"
          ? d.chol
          : feature === "Resting Blood Pressure"
          ? d.restbps
          : d.thalach,
      diagnosis: d.diag,
    }));

    // 2) rollup & flatten
    const roll = d3.rollup(
      transformed,
      (vs) => ({
        avgFeature: d3.mean(vs, (v) => v.feature)!,
        avgDiagnosis: d3.mean(vs, (v) => v.diagnosis)!,
      }),
      (d) => d.gender,
      (d) => d.ageGroup
    );
    const flat = Array.from(roll, ([gender, ageMap]) =>
      Array.from(ageMap, ([ageGroup, vals]) => ({
        gender,
        ageGroup,
        avgFeature: vals.avgFeature,
        avgDiagnosis: vals.avgDiagnosis,
      }))
    ).flat();

    // 3) compute ageGroups and groupedData
    const ageGroups = Array.from(new Set(flat.map((d) => d.ageGroup))).sort();
    const grouped: [string, typeof flat][] = ageGroups.map((ag) => [
      ag,
      flat.filter((d) => d.ageGroup === ag),
    ]);

    // 4) dimensions
    const margin = { top: 10, right: 30, bottom: 100, left: 50 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // 5) svg
    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 6) x axis
    const x = d3
      .scaleBand<string>()
      .domain(ageGroups)
      .range([0, width])
      .padding(0.2);
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // 7) y axis
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(flat, (d) => d.avgFeature)!])
      .nice()
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // 8) gender color mapping
    const genderColor = (gender: number) =>
      gender === 1
        ? "#1f77b4" /* male: blue */
        : "#ff7f0e"; /* female: orange */

    // 9) subgroup x
    const genders = Array.from(new Set(flat.map((d) => d.gender)));
    const xSub = d3
      .scaleBand<number>()
      .domain(genders)
      .range([0, x.bandwidth()])
      .padding(0.05);

    // 10) bars
    const barGroups = svg
      .selectAll("g.bar-group")
      .data(grouped)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", ([ageGroup]) => `translate(${x(ageGroup)!},0)`);

    barGroups
      .selectAll("rect")
      .data(([, vals]) => vals)
      .enter()
      .append("rect")
      .attr("x", (d) => xSub(d.gender)!)
      .attr("y", (d) => y(d.avgFeature))
      .attr("width", xSub.bandwidth())
      .attr("height", (d) => height - y(d.avgFeature))
      .attr("fill", (d) => genderColor(d.gender));

    // 11) bar labels
    barGroups
      .selectAll("text.label")
      .data(([, vals]) => vals)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => xSub(d.gender)! + xSub.bandwidth() / 2)
      .attr("y", (d) => y(d.avgFeature) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text((d) => (d.gender === 0 ? "Female" : "Male"));
  }, [data, feature]);

  return <div ref={ref} />;
}
