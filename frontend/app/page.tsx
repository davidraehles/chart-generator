"use client";

import { useState } from "react";
import ChartForm from "@/components/ChartForm";
import ChartDisplay from "@/components/ChartDisplay";
import { ChartRequest, ChartResponse } from "@/types/chart";

export default function Home() {
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const [inputData, setInputData] = useState<ChartRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col" style={{ background: "#FFFFFF" }}>
      <div className="max-w-2xl mx-auto">
        {!chartData ? (
          <ChartForm
            onSuccess={setChartData}
            onError={setError}
            onRequest={setInputData}
          />
        ) : (
          <ChartDisplay
            data={chartData}
            inputData={inputData}
            onReset={() => {
              setChartData(null);
              setInputData(null);
              setError(null);
            }}
          />
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-4 px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-100 transition-colors"
            >
              OK
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="mt-16 pb-6 text-center" style={{ borderTop: "0.5px solid #E8E3DC", paddingTop: "20px" }}>
        <p className="text-xs" style={{ color: "#C4BEB8" }}>
          <a href="https://www.stupperich.de" target="_blank" rel="noopener noreferrer"
            className="hover:underline" style={{ color: "#C4BEB8" }}>
            stupperich.de
          </a>
          {" · "}
          <a href="https://www.stupperich.de/impressum" target="_blank" rel="noopener noreferrer"
            className="hover:underline" style={{ color: "#C4BEB8" }}>
            Impressum
          </a>
          {" · "}
          <a href="https://www.stupperich.de/datenschutz" target="_blank" rel="noopener noreferrer"
            className="hover:underline" style={{ color: "#C4BEB8" }}>
            Datenschutz
          </a>
        </p>
      </footer>
    </main>
  );
}
