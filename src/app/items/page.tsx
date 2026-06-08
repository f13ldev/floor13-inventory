import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { Suspense } from "react";
import { SearchBar } from "../search-bar";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { q?: string; category?: string; location?: string };
}

function buildWhere(params: Props["searchParams"]): Prisma.ItemWhereInput {
  const conditions: Prisma.ItemWhereInput[] = [];

  if (params.q?.trim()) {
    const q = params.q.trim();
    conditions.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { color: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { serialNumber: { contains: q, mode: "insensitive" } },
        { upc: { contains: q, mode: "insensitive" } },
        { room: { contains: q, mode: "insensitive" } },
        { box: { contains: q, mode: "insensitive" } },
        { shelf: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (params.category?.trim()) {
    conditions.push({ category: { equals: params.category.trim(), mode: "insensitive" } });
  }

  if (params.location?.trim()) {
    conditions.push({ room: { equals: params.location.trim(), mode: "insensitive" } });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

export default async function ItemsPage({ searchParams }: Props) {
  const where = buildWhere(searchParams);

  const [items, allCategories, allRooms] = await Promise.all([
    db.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        transactions: { orderBy: { date: "desc" }, take: 1 },
        _count: { select: { transactions: true } },
      },
    }),
    db.item.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    db.item.findMany({
      where: { room: { not: null } },
      select: { room: true },
      distinct: ["room"],
      orderBy: { room: "asc" },
    }),
  ]);

  const categories = allCategories.map((i) => i.category as string);
  const rooms = allRooms.map((i) => i.room as string);
  const isFiltered = !!(searchParams.q || searchParams.category || searchParams.location);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Items</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""}
            {isFiltered ? " matched" : " tracked"}
          </p>
        </div>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← Dashboard
        </Link>
      </div>

      <Suspense>
        <SearchBar categories={categories} rooms={rooms} />
      </Suspense>

      {items.length === 0 && !isFiltered ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-gray-600 mb-4">No items yet. Start tracking what you own.</p>
          <Link
            href="/items/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Add your first item
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-2xl mb-2">🔍</p>
          <p>No items match your search.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => {
            const lastTx = item.transactions[0];
            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                    {item.category && <span>{item.category}</span>}
                    {item.color && <span>{item.color}</span>}
                    {item.upc && <span className="font-mono">UPC: {item.upc}</span>}
                    {item.room && <span className="text-indigo-500">📍 {item.room}</span>}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500 shrink-0 ml-4">
                  {lastTx && (
                    <p className={lastTx.kind === "acquired" ? "text-green-600" : "text-red-500"}>
                      {lastTx.kind === "acquired" ? "Acquired" : "Disposed"}
                      {lastTx.cost != null && ` · $${lastTx.cost.toFixed(2)}`}
                    </p>
                  )}
                  <p>
                    {item._count.transactions} transaction
                    {item._count.transactions !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
