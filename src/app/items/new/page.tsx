"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewItemPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name") as string,
      category: form.get("category") as string,
      color: form.get("color") as string,
      upc: form.get("upc") as string,
      serialNumber: form.get("serialNumber") as string,
      notes: form.get("notes") as string,
      transaction: {
        kind: form.get("txKind") as string,
        cost: form.get("txCost") as string,
        date: form.get("txDate") as string,
        notes: form.get("txNotes") as string,
      },
    };

    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const item = await res.json();
      router.push(`/items/${item.id}`);
    } else {
      const data = await res.json().catch(() => ({ error: "Failed to save" }));
      setError(data.error ?? "Failed to save");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Item</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Item Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              type="text"
              placeholder="e.g. Sony WH-1000XM5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                placeholder="e.g. Electronics"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="color">
                Color
              </label>
              <input
                id="color"
                name="color"
                type="text"
                placeholder="e.g. Black"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="upc">
                UPC / Barcode
              </label>
              <input
                id="upc"
                name="upc"
                type="text"
                placeholder="e.g. 027242920941"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="serialNumber"
              >
                Serial Number
              </label>
              <input
                id="serialNumber"
                name="serialNumber"
                type="text"
                placeholder="e.g. SN123456"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any additional details…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Acquisition / Disposal</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="txKind">
                Type
              </label>
              <select
                id="txKind"
                name="txKind"
                defaultValue="acquired"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="acquired">Acquired</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="txCost">
                Cost ($)
              </label>
              <input
                id="txCost"
                name="txCost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="txDate">
              Date
            </label>
            <input
              id="txDate"
              name="txDate"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="txNotes">
              Transaction notes
            </label>
            <input
              id="txNotes"
              name="txNotes"
              type="text"
              placeholder="e.g. Bought at Best Buy"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {saving ? "Saving…" : "Save Item"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
