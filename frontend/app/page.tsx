"use client";

import { useState } from "react";
import ChartForm from "@/components/ChartForm";
import ChartDisplay from "@/components/ChartDisplay";
import { ChartResponse } from "@/types/chart";

export default function Home() {
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-surface p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
            Human Design Chart Generator
          </h1>
          <p className="text-secondary text-lg">
            Discover your unique design
          </p>
        </header>

        {!chartData ? (
          <div className="max-w-2xl mx-auto">
             <ChartForm
              onSuccess={setChartData}
              onError={setError}
            />
          </div>
        ) : (
          <ChartDisplay
            data={chartData}
            onReset={() => {
              setChartData(null);
              setError(null);
            }}
          />
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-50 border border-error/20 rounded-lg flex items-center space-x-3 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-error font-medium">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
