import React from "react";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Papa from "papaparse";


const page = () => {
  const [data, setData] = useState([]);
  const ref = useRef<HTMLDivElement>(null);

  const loadcsv = async (path: string) => {
    const response = await fetch(path);
    const csvText = await response.text();
  
    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true,
    });
  
    const parsedData = parsed.data.map(row => ({
      restbps: +row[3],    
      chol: +row[4],       
      diag: +row[13]       
    }));
  
    setData(parsedData);
  };

  useEffect(() => {
    loadcsv("/processed.cleveland.csv");
  }, []);

  useEffect(() => {
    d3.select(ref.current).selectAll("*").remove();

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 20, left: 50 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right + 120)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    console.log(data.restbps);
    console.log(data.chol);

    // Initialize the X axis
    var x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.restbps))
      .range([0, width]);
    //.domain([0, 100]);

    svg.append("g").attr("transform", "translate(0," + height + ")")
      .transition().duration(1000).call(d3.axisBottom(x));

    // Initialize the Y axis
    var y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.chol))
      .range([height, 0]).nice();
      
    svg.append("g")
      .attr("class", "myYaxis").transition().duration(1000).call(d3.axisLeft(y));

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Add dots
    svg.append("g")
      .selectAll(".dot")
      .data(data)
      .enter()
      //.attr("class", "dot")
      .append("circle")
      .attr("cx", function (d) { return x(d.restbps); })
      .attr("cy", function (d) { return y(d.chol); })
      .attr("fill", d => colorScale(d.diag))
      .attr("r", 3)
      //.style("fill", "black")
      .style("opacity", 0.5)

      const dVals = Array.from(new Set(data.map(d => d.diag)));
      //console.log(dVals);
      //const keys = ["0", "1", "2", "3", "4"];

      const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, 20)`); // right of plot

      dVals.forEach((d, i) => {
      legend.append("circle")
        .attr("cx", 0)
        .attr("cy", i * 20)
        .attr("r", 5)
        .style("fill", colorScale(d));

      legend.append("text")
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
  )
};

export default page;
