// app/dashboard/DataContext.tsx
"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import * as d3 from "d3";

export interface DataPoint {
  age: number;
  sex: number;
  restbps: number;
  chol: number;
  diag: number;
}

type ContextType = {
  data: DataPoint[];
  rawCsv: string;
  setRawCsv: (csv: string) => void;
};

const DataContext = createContext<ContextType>({
  data: [],
  rawCsv: "",
  setRawCsv: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [rawCsv, setRawCsvString] = useState<string>("");

  const setRawCsv = (csv: string) => {
    setRawCsvString(csv);

    const rows = d3.csvParseRows(csv);

    const numericRows = rows.map((r) =>
      r.map((v) => (v === "?" || v.trim() === "" ? NaN : +v))
    );

    const clean = numericRows.filter(
      (r) => r.length >= 14 && !r.some((x) => isNaN(x))
    );

    const points: DataPoint[] = clean.map((r) => ({
      age: r[0],
      sex: r[1],
      restbps: r[3],
      chol: r[4],
      diag: r[13],
    }));

    setData(points);
  };

  return (
    <DataContext.Provider value={{ data, rawCsv, setRawCsv }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
