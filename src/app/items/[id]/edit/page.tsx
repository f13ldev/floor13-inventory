"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Item {
  id: string;
  name: string;
  category: string | null;
  color: string | null;
  upc: string | null;
  serialNumber: string | null;
  notes: string | null;
  room: string | null;
  box: string | null;
  shelf: string | null;
  warrantyEndsAt: string | null;
  expiresAt: string | null;
}

function toDateInput(val: string | null): string {
  if (!val) return "";
  return new Date(val).toISOString().split("T")[0];
}

export default function EditItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/items/${params.id}`)
      .then((r) => r.json())
      .then(setItem);
  }, [params.id]);

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
      room: form.get("room") as string,
      box: form.get("box") as string,
      shelf: form.get("shelf") as string,
      warrantyEndsAt: (form.get("warrantyEndsAt") as string) || null,
      expiresAt: (form.get("expiresAt") as string) || null,
    };

    const res = await fetch(`/api/items/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push(`/items/${params.id}`);
    } else {
      const data = await res.json().catch(() => ({ error: "Failed to save" }));
      setError(data.error ?? "Failed to save");
      setSaving(false);
    }
  }

  if (!item) {
    return (
      <div className="max-w-xl mx-auto">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    );
  }

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Item</h1>

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
              defaultValue={item.name}
              className={inputCls}
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
                defaultValue={item.category ?? ""}
                placeholder="e.g. Electronics"
                className={inputCls}
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
                defaultValue={item.color ?? ""}
                placeholder="e.g. Black"
                className={inputCls}
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
                inputMode="numeric"
                defaultValue={item.upc ?? ""}
                placeholder="e.g. 027242920941"
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="serialNumber">
                Serial Number
              </label>
              <input
                id="serialNumber"
                name="serialNumber"
                type="text"
                defaultValue={item.serialNumber ?? ""}
                placeholder="e.g. SN123456"
                className={`${inputCls} font-mono`}
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
              defaultValue={item.notes ?? ""}
              placeholder="Any additional details…"
              className={inputCls}
            />
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Storage Location</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="room">
                Room
              </label>
              <input
                id="room"
                name="room"
                type="text"
                defaultValue={item.room ?? ""}
                placeholder="e.g. Garage"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="shelf">
                Shelf
              </label>
              <input
                id="shelf"
                name="shelf"
                type="text"
                defaultValue={item.shelf ?? ""}
                placeholder="e.g. Top shelf"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="box">
                Box / Container
              </label>
              <input
                id="box"
                name="box"
                type="text"
                defaultValue={item.box ?? ""}
                placeholder="e.g. Blue bin"
                className={inputCls}
              />
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Warranty &amp; Expiration</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="warrantyEndsAt">
                Warranty ends
              </label>
              <input
                id="warrantyEndsAt"
                name="warrantyEndsAt"
                type="date"
                defaultValue={toDateInput(item.warrantyEndsAt)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expiresAt">
                Expiration date
              </label>
              <input
                id="expiresAt"
                name="expiresAt"
                type="date"
                defaultValue={toDateInput(item.expiresAt)}
                className={inputCls}
              />
            </div>
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
            {saving ? "Saving…" : "Save Changes"}
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
