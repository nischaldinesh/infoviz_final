"use client";

import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";
import { useData } from "../DataContext";

interface DataPoint {
  age: number;
  cp: number;
  chol: number;
  thalach: number;
  num: number;
}

export default function SummaryVisualization() {
  const { rawCsv } = useData();
  const [data, setData] = useState<DataPoint[]>([]);

  const [selectedCp, setSelectedCp] = useState<number>(1);
  const cholRanges = [
    { label: "Below 150", min: 0, max: 150 },
    { label: "150–200", min: 150, max: 200 },
    { label: "200–250", min: 200, max: 250 },
    { label: "250–300", min: 250, max: 300 },
    { label: "300–350", min: 300, max: 350 },
    { label: "350–400", min: 350, max: 400 },
  ];
  const [selectedCholRanges, setSelectedCholRanges] = useState<number[]>([
    0, 1, 2, 3, 4, 5,
  ]);

  useEffect(() => {
    if (!rawCsv) {
      setData([]);
      return;
    }
    const parsed = Papa.parse<string[]>(rawCsv, {
      header: false,
      skipEmptyLines: true,
    });
    const asData: DataPoint[] = (parsed.data as string[][]).map((row) => ({
      age: +row[0],
      cp: +row[2],
      chol: +row[4],
      thalach: +row[7],
      num: +row[13],
    }));
    setData(asData);
  }, [rawCsv]);

  const inSelectedChol = (c: number) =>
    selectedCholRanges.some(
      (i) => c >= cholRanges[i].min && c < cholRanges[i].max
    );

  const filtered = data.filter(
    (d) => d.cp === selectedCp && inSelectedChol(d.chol)
  );
  const noDisease = filtered.filter((d) => d.num === 0);
  const yesDisease = filtered.filter((d) => d.num === 1);

  const compute = (arr: DataPoint[]) => {
    const cnt = arr.length;
    return {
      count: cnt,
      avgChol: cnt ? d3.mean(arr, (d) => d.chol)!.toFixed(1) : "N/A",
      avgAge: cnt ? d3.mean(arr, (d) => d.age)!.toFixed(1) : "N/A",
      avgThalach: cnt ? d3.mean(arr, (d) => d.thalach)!.toFixed(1) : "N/A",
    };
  };
  const statsNo = compute(noDisease);
  const statsYes = compute(yesDisease);

  if (!rawCsv) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Upload a CSV to see the summary
        </h2>
        <p className="text-gray-600">
          Use the “Upload Your CSV” control in the sidebar to load your data.
        </p>
      </div>
    );
  }

  return (
    <div className="p-10 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Data Summary Dashboard
      </h1>

      <div className="mb-6 flex flex-col md:flex-row items-center justify-center gap-6">
        <div>
          <label className="mr-2 font-medium text-lg">Chest Pain Type:</label>
          <select
            value={selectedCp}
            onChange={(e) => setSelectedCp(+e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200 transition"
          >
            <option value={1}>Typical Angina</option>
            <option value={2}>Atypical Angina</option>
            <option value={3}>Non‑anginal Pain</option>
            <option value={4}>Asymptomatic</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-lg">
            Cholesterol Ranges:
          </label>
          <div className="flex flex-wrap gap-2">
            {cholRanges.map((r, i) => (
              <label key={i} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCholRanges.includes(i)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedCholRanges((prev) =>
                      checked ? [...prev, i] : prev.filter((x) => x !== i)
                    );
                  }}
                  className="mr-1"
                />
                <span className="text-sm">{r.label}</span>
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
                  Avg. Chol (mg/dL)
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
            Total Patients (Matching Filters): {filtered.length}
          </p>
        </div>
      </div>
    </div>
  );
}
