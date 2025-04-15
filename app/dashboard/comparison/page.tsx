"use client";
import React, { useEffect, useState } from "react";
import Papa from "papaparse";

interface DataPoint {
  age: number;
  sex: number;
  cp: number;
  restbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalach: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
  num: number;
}

const StatsPage = () => {
  const [data, setData] = useState<DataPoint[]>([]);
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
        cp: +row[2],
        restbps: +row[3],
        chol: +row[4],
        fbs: +row[5],
        restecg: +row[6],
        thalach: +row[7],
        exang: +row[8],
        oldpeak: +row[9],
        slope: +row[10],
        ca: +row[11],
        thal: +row[12],
        num: +row[13],
      })
    );

    setData(parsedData);
  };

  useEffect(() => {
    loadcsv(selectedFile);
  }, [selectedFile]);

  const cpLabels: { [key: number]: string } = {
    1: "Typical angina",
    2: "Atypical angina",
    3: "Non-anginal pain",
    4: "Asymptomatic",
  };

  const chestPainStats = React.useMemo(() => {
    const counts = data.reduce((acc: { [key: number]: number }, d) => {
      acc[d.cp] = (acc[d.cp] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map((key) => {
      const cp = parseInt(key);
      return {
        cp,
        label: cpLabels[cp] || `Type ${cp}`,
        count: counts[cp],
      };
    });
  }, [data]);

  const ageStats = React.useMemo(() => {
    const bins = [0, 25, 35, 45, 55, 70, 100];
    return bins.slice(0, -1).map((_, i) => {
      const lower = bins[i];
      const upper = bins[i + 1];
      const group = data.filter((d) => d.age >= lower && d.age < upper);
      const avgChol =
        group.length > 0
          ? (group.reduce((sum, d) => sum + d.chol, 0) / group.length).toFixed(
              1
            )
          : "N/A";
      return {
        range: `${lower}-${upper}`,
        avgChol,
        count: group.length,
      };
    });
  }, [data]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFile(event.target.value);
  };

  return (
    <div className="p-10 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Statistics Dashboard
      </h1>

      <div className="mb-8 flex justify-center items-center">
        <label className="mr-3 font-medium text-lg">Select Data File:</label>
        <select
          value={selectedFile}
          onChange={handleSelectChange}
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200 transition"
        >
          {dataFiles.map((file) => (
            <option key={file.path} value={file.path}>
              {file.label}
            </option>
          ))}
        </select>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Chest Pain Type Counts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {chestPainStats.map((stat) => (
            <div
              key={stat.cp}
              className="border border-gray-200 p-6 rounded-lg shadow-lg bg-white"
            >
              <h3 className="text-xl font-bold text-blue-600 mb-2">
                {stat.label}
              </h3>
              <p className="text-lg font-extrabold text-gray-800">
                Count: {stat.count}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Average Cholesterol by Age Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ageStats.map((stat, index) => (
            <div
              key={index}
              className="border border-gray-200 p-6 rounded-lg shadow-lg bg-white"
            >
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Age {stat.range}
              </h3>
              <p className="text-lg font-extrabold text-gray-800">
                Avg. Cholesterol: {stat.avgChol}
              </p>
              <p className="text-lg font-extrabold text-gray-800 mt-1">
                Count: {stat.count}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StatsPage;
