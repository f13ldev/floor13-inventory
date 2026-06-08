"use client";

import { useState } from "react";

export interface ItemForEstimate {
  name: string;
  category: string | null;
  upc: string | null;
  serialNumber: string | null;
  acquiredCost: number;
  acquiredYear: number | null;
}

interface Props {
  historicalCost: number;
  disposedValue: number;
  items: ItemForEstimate[];
}

type State = "idle" | "loading" | "done" | "error";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function PortfolioValueEstimate({ historicalCost, disposedValue, items }: Props) {
  const [state, setState] = useState<State>("idle");
  const [estimate, setEstimate] = useState<{ min: number; max: number; likely: number } | null>(
    null
  );

  const portfolioValue = historicalCost - disposedValue;
  const formatCurrency = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const getEstimate = async () => {
    if (items.length === 0) return;
    setState("loading");
    try {
      const res = await fetch("/api/ai/estimate-portfolio-value", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setEstimate(data.total);
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500">Portfolio value</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">
        {items.length > 0 ? formatCurrency(portfolioValue) : "—"}
      </p>
      {historicalCost > 0 && (
        <p className="text-xs text-gray-400 mt-1">
          {formatCurrency(historicalCost)} acquired · {formatCurrency(disposedValue)} disposed
        </p>
      )}

      {state === "idle" && items.length > 0 && (
        <button
          type="button"
          onClick={getEstimate}
          className="mt-3 text-xs text-blue-600 hover:text-blue-800 hover:underline"
        >
          ✦ Estimate fair value
        </button>
      )}

      {state === "loading" && (
        <p className="mt-3 text-xs text-gray-400 animate-pulse">Estimating…</p>
      )}

      {state === "done" && estimate && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-sm font-semibold text-gray-700">
            {fmt(estimate.min)}–{fmt(estimate.max)} est. fair value
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            AI estimate · based on training data, not live prices
          </p>
        </div>
      )}

      {state === "error" && (
        <p className="mt-3 text-xs text-red-500">
          Could not fetch estimate.{" "}
          <button type="button" onClick={getEstimate} className="underline">
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
