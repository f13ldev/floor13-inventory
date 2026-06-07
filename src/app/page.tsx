import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await db.item.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      transactions: { orderBy: { date: "desc" }, take: 1 },
      _count: { select: { transactions: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Items</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
      </div>

      {items.length === 0 ? (
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
                  <div className="flex gap-3 mt-1 text-sm text-gray-500">
                    {item.category && <span>{item.category}</span>}
                    {item.color && <span>{item.color}</span>}
                    {item.upc && <span className="font-mono">UPC: {item.upc}</span>}
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
