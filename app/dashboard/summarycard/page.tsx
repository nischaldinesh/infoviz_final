"use client";
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

interface DataPoint {
  age: number;
  cp: number;
  chol: number;
  thalach: number;
  num: number;
}

const SummaryVisualization = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const dataFiles = [
    { label: "Cleveland", path: "/data/processed.cleveland.csv" },
    { label: "Hungarian", path: "/data/processed.hungarian.csv" },
    { label: "Switzerland", path: "/data/processed.switzerland.csv" },
  ];
  const [selectedDataset, setSelectedDataset] = useState<string>(
    dataFiles[0].path
  );

  const [selectedCp, setSelectedCp] = useState<number>(1);

  const cholRanges = [
    { label: "Below 150", min: 0, max: 150 },
    { label: "150-200", min: 150, max: 200 },
    { label: "200-250", min: 200, max: 250 },
    { label: "250-300", min: 250, max: 300 },
    { label: "300-350", min: 300, max: 350 },
    { label: "350-400", min: 350, max: 400 },
  ];

  const [selectedCholRanges, setSelectedCholRanges] = useState<number[]>([
    0, 1, 2, 3, 4, 5,
  ]);

  const loadCSV = async (): Promise<void> => {
    const response = await fetch(selectedDataset);
    const csvText = await response.text();
    const parsed = Papa.parse<string[]>(csvText, {
      header: false,
      skipEmptyLines: true,
    });
    const parsedData: DataPoint[] = (parsed.data as string[][]).map(
      (row: string[]) => ({
        age: +row[0],
        cp: +row[2],
        chol: +row[4],
        thalach: +row[7],
        num: +row[13],
      })
    );
    setData(parsedData);
  };

  useEffect(() => {
    loadCSV();
  }, [selectedDataset]);

  const belongsToSelectedCholRange = (chol: number): boolean => {
    return selectedCholRanges.some(
      (i) => chol >= cholRanges[i].min && chol < cholRanges[i].max
    );
  };

  const filteredData = data.filter(
    (d) => d.cp === selectedCp && belongsToSelectedCholRange(d.chol)
  );

  const groupNo = filteredData.filter((d) => d.num === 0);
  const groupYes = filteredData.filter((d) => d.num === 1);

  const computeStats = (arr: DataPoint[]) => {
    const count = arr.length;
    const avgChol = count ? d3.mean(arr, (d) => d.chol) : NaN;
    const avgAge = count ? d3.mean(arr, (d) => d.age) : NaN;
    const avgThalach = count ? d3.mean(arr, (d) => d.thalach) : NaN;
    return {
      count,
      avgChol: avgChol ? avgChol.toFixed(1) : "N/A",
      avgAge: avgAge ? avgAge.toFixed(1) : "N/A",
      avgThalach: avgThalach ? avgThalach.toFixed(1) : "N/A",
    };
  };

  const statsNo = computeStats(groupNo);
  const statsYes = computeStats(groupYes);

  const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataset(e.target.value);
  };

  const handleCpChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCp(Number(e.target.value));
  };

  const handleCholCheckboxChange = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedCholRanges((prev) => [...prev, index]);
    } else {
      setSelectedCholRanges((prev) => prev.filter((i) => i !== index));
    }
  };

  return (
    <div className="p-10 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Data Summary Dashboard
      </h1>

      <div className="mb-6 flex flex-col md:flex-row items-center justify-center gap-6">
        <div>
          <label className="mr-2 font-medium text-lg">Select Dataset:</label>
          <select
            value={selectedDataset}
            onChange={handleDatasetChange}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200 transition"
          >
            {dataFiles.map((file) => (
              <option key={file.path} value={file.path}>
                {file.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2 font-medium text-lg">Chest Pain Type:</label>
          <select
            value={selectedCp}
            onChange={handleCpChange}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200 transition"
          >
            <option value={1}>Typical Angina</option>
            <option value={2}>Atypical Angina</option>
            <option value={3}>Non-anginal Pain</option>
            <option value={4}>Asymptomatic</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-medium text-lg">
            Cholesterol Ranges:
          </label>
          <div className="flex flex-wrap gap-2">
            {cholRanges.map((range, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCholRanges.includes(index)}
                  onChange={(e) =>
                    handleCholCheckboxChange(index, e.target.checked)
                  }
                  className="mr-1"
                />
                <span className="text-sm">{range.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Aggregated Metrics Comparison
        </h2>
        <div className="overflow-x-auto mx-auto max-w-4xl">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left font-bold">Group</th>
                <th className="px-4 py-2 text-left font-bold">Patient Count</th>
                <th className="px-4 py-2 text-left font-bold">
                  Avg. Cholesterol (mg/dL)
                </th>
                <th className="px-4 py-2 text-left font-bold">
                  Avg. Age (yrs)
                </th>
                <th className="px-4 py-2 text-left font-bold">
                  Avg. Max HR (bpm)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-100">
                <td className="px-4 py-2 font-bold text-blue-600">
                  No Heart Disease
                </td>
                <td className="px-4 py-2">{statsNo.count}</td>
                <td className="px-4 py-2">{statsNo.avgChol}</td>
                <td className="px-4 py-2">{statsNo.avgAge}</td>
                <td className="px-4 py-2">{statsNo.avgThalach}</td>
              </tr>
              <tr className="bg-red-100">
                <td className="px-4 py-2 font-bold text-red-600">
                  Heart Disease
                </td>
                <td className="px-4 py-2">{statsYes.count}</td>
                <td className="px-4 py-2">{statsYes.avgChol}</td>
                <td className="px-4 py-2">{statsYes.avgAge}</td>
                <td className="px-4 py-2">{statsYes.avgThalach}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <p className="font-bold">
            Total Patients (Matching Filters): {filteredData.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryVisualization;
