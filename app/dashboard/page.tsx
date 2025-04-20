"use client";
import React, { useState } from "react";
import Papa from "papaparse";
import Link from "next/link";
import { useData } from "./DataContext";

const COLUMNS = [
  { key: "age", desc: "Age in years" },
  { key: "sex", desc: "Sex (1=male,0=female)" },
  { key: "cp", desc: "Chest pain type (1–4)" },
  { key: "trestbps", desc: "Resting BP (mm Hg)" },
  { key: "chol", desc: "Cholesterol (mg/dl)" },
  { key: "fbs", desc: "Fasting blood sugar >120 mg/dl" },
  { key: "restecg", desc: "Resting ECG result (0–2)" },
  { key: "thalach", desc: "Max heart rate achieved" },
  { key: "exang", desc: "Exercise angina (1=yes)" },
  { key: "oldpeak", desc: "ST depression vs rest" },
  { key: "slope", desc: "ST slope (1–3)" },
  { key: "ca", desc: "vessels colored by flouroscopy" },
  { key: "thal", desc: "Thallium test (3=normal,6=fixed,7=reversible)" },
  { key: "num", desc: "Heart disease severity (0–4)" },
];

export default function UploadPage() {
  const { setRawCsv } = useData();
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      setRawCsv(txt);
      const parsed = Papa.parse<string[]>(txt, { skipEmptyLines: true });
      const rows = parsed.data as string[][];
      const cleaned = rows
        .filter((r) => r.length === COLUMNS.length && !r.includes("?"))
        .map((r) => {
          const obj: Record<string, string> = {};
          COLUMNS.forEach(({ key }, i) => (obj[key] = r[i]));
          return obj;
        });
      setTableData(cleaned);
    });
  };

  const clearData = () => {
    setTableData([]);
    setRawCsv("");
  };

  const firstHalf = COLUMNS.slice(0, 7);
  const secondHalf = COLUMNS.slice(7);

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-8 mb-6">
        <div className="space-y-2">
          {firstHalf.map(({ key, desc }) => (
            <p key={key} className="text-sm text-gray-600">
              <span className="font-semibold">{key.toUpperCase()}</span>: {desc}
            </p>
          ))}
        </div>
        <div className="space-y-2">
          {secondHalf.map(({ key, desc }) => (
            <p key={key} className="text-sm text-gray-600">
              <span className="font-semibold">{key.toUpperCase()}</span>: {desc}
            </p>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
          Choose File
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="hidden"
          />
        </label>
        {tableData.length > 0 && (
          <button
            onClick={clearData}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Remove Data
          </button>
        )}
      </div>

      {tableData.length > 0 && (
        <>
          <div className="mt-2 max-h-[400px] overflow-auto border rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  {COLUMNS.map(({ key }) => (
                    <th
                      key={key}
                      className="px-4 py-2 text-left font-medium text-gray-700 whitespace-nowrap"
                    >
                      {key.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {COLUMNS.map(({ key }) => (
                      <td
                        key={key}
                        className="px-4 py-2 whitespace-nowrap text-sm"
                      >
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-center">
            <Link href="/dashboard/scatterplot">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Explore
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
