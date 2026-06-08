"use client";

import { useRef, useState } from "react";

export interface ExtractedItem {
  name?: string;
  category?: string;
  cost?: number;
  date?: string;
  serialNumber?: string;
  notes?: string;
}

interface Props {
  onExtracted: (data: ExtractedItem) => void;
}

export function ReceiptExtractor({ onExtracted }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setState("loading");
    setErrorMsg(null);

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/ai/extract-item", { method: "POST", body });
    const data = await res.json();

    if (!res.ok) {
      setState("error");
      setErrorMsg(data.error ?? "Extraction failed");
      return;
    }

    setState("done");
    onExtracted(data as ExtractedItem);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">🧾</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-900">Start from a receipt or invoice</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Upload a photo or PDF — we'll pre-fill the form for you.
          </p>

          {state === "loading" ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-700">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
              Extracting item details…
            </div>
          ) : state === "done" ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
              <span>✓</span>
              <span>Form pre-filled — review and adjust below.</span>
              <button
                type="button"
                onClick={() => setState("idle")}
                className="ml-auto text-xs text-blue-600 hover:underline"
              >
                Try another
              </button>
            </div>
          ) : (
            <label className="mt-3 inline-flex items-center gap-2 cursor-pointer">
              <span className="bg-white border border-blue-300 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                Choose file
              </span>
              <span className="text-xs text-blue-500">JPEG, PNG, GIF, or WebP · max 5 MB</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFile}
                className="sr-only"
              />
            </label>
          )}

          {state === "error" && errorMsg && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
