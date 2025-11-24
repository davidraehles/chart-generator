"use client";

import { useState } from "react";
import ChartForm from "@/components/ChartForm";
import ChartDisplay from "@/components/ChartDisplay";
import { ChartResponse } from "@/types/chart";

export default function Home() {
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary text-center mb-8">
          Human Design Chart Generator
        </h1>

        {!chartData ? (
          <ChartForm
            onSuccess={setChartData}
            onError={setError}
          />
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
          <div className="mt-4 p-4 bg-red-50 border border-error rounded-lg">
            <p className="text-error">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
