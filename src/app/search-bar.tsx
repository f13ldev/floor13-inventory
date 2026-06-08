"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Props {
  categories: string[];
  rooms: string[];
}

export function SearchBar({ categories, rooms }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync query state if URL changes externally (e.g. browser back)
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function buildUpdatedParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    return params.toString();
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(`${pathname}?${buildUpdatedParams({ q: value })}`);
    }, 400);
  }

  function handleSelectChange(key: string, value: string) {
    router.push(`${pathname}?${buildUpdatedParams({ [key]: value })}`);
  }

  const hasFilters =
    !!searchParams.get("q") || !!searchParams.get("category") || !!searchParams.get("location");

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name, category, notes…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {categories.length > 0 && (
          <select
            value={searchParams.get("category") ?? ""}
            onChange={(e) => handleSelectChange("category", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        {rooms.length > 0 && (
          <select
            value={searchParams.get("location") ?? ""}
            onChange={(e) => handleSelectChange("location", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All locations</option>
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
