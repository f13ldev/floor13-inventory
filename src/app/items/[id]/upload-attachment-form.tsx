"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function UploadAttachmentForm({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setUploading(true);
    setError(null);

    const data = new FormData();
    data.append("file", file);
    data.append("kind", (form.elements.namedItem("kind") as HTMLSelectElement).value);

    const res = await fetch(`/api/items/${itemId}/attachments`, {
      method: "POST",
      body: data,
    });

    if (res.ok) {
      setOpen(false);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({ error: "Upload failed" }));
      setError(body.error ?? "Upload failed");
    }
    setUploading(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-sm text-blue-600 hover:underline"
      >
        + Upload attachment
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 bg-white border border-gray-200 rounded-xl p-4 space-y-3"
    >
      <h3 className="font-medium text-gray-700 text-sm">Upload attachment</h3>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="att-file">
          File <span className="text-red-500">*</span>
        </label>
        <input
          id="att-file"
          name="file"
          type="file"
          ref={fileRef}
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-sm file:text-gray-700 hover:file:bg-gray-200"
        />
        <p className="text-xs text-gray-400 mt-1">Images, PDF, or documents — max 10 MB</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="att-kind">
          Type
        </label>
        <select
          id="att-kind"
          name="kind"
          defaultValue="receipt"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="receipt">Receipt</option>
          <option value="photo">Photo</option>
          <option value="manual">Manual / Warranty</option>
          <option value="other">Other</option>
        </select>
      </div>

      {error && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={uploading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {uploading ? "Uploading…" : "Upload"}
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
