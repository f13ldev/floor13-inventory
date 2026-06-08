"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddTransactionForm({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/items/${itemId}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: form.get("kind"),
        cost: form.get("cost") || null,
        date: form.get("date"),
        notes: form.get("notes"),
      }),
    });
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({ error: "Failed to save" }));
      setError(data.error ?? "Failed to save");
    }
    setSaving(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-sm text-blue-600 hover:underline"
      >
        + Add transaction
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 bg-white border border-gray-200 rounded-xl p-4 space-y-3"
    >
      <h3 className="font-medium text-gray-700 text-sm">New transaction</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="tx-kind">
            Type
          </label>
          <select
            id="tx-kind"
            name="kind"
            defaultValue="acquired"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="acquired">Acquired</option>
            <option value="repaired">Repaired</option>
            <option value="disposed">Sold / Disposed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="tx-cost">
            Amount ($)
          </label>
          <input
            id="tx-cost"
            name="cost"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="tx-date">
          Date
        </label>
        <input
          id="tx-date"
          name="date"
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="tx-notes">
          Notes
        </label>
        <input
          id="tx-notes"
          name="notes"
          type="text"
          placeholder="e.g. Repaired screen at uBreakiFix"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="px-4 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
