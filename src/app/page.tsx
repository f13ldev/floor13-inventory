import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await db.item.findMany({
    orderBy: { createdAt: "desc" },
    include: { transactions: true },
  });

  // Portfolio value: sum of acquired costs minus disposed costs
  let totalAcquiredCost = 0;
  let totalDisposedValue = 0;
  for (const item of items) {
    for (const tx of item.transactions) {
      if (tx.kind === "acquired" && tx.cost != null) totalAcquiredCost += tx.cost;
      if (tx.kind === "disposed" && tx.cost != null) totalDisposedValue += tx.cost;
    }
  }
  const portfolioValue = totalAcquiredCost - totalDisposedValue;

  // Category stats
  const categoryCounts: Record<string, number> = {};
  for (const item of items) {
    const key = item.category ?? "Uncategorized";
    categoryCounts[key] = (categoryCounts[key] ?? 0) + 1;
  }
  const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  const recentItems = items.slice(0, 6);

  const formatCurrency = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Items tracked</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{items.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Portfolio value</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {items.length > 0 ? formatCurrency(portfolioValue) : "—"}
          </p>
          {totalAcquiredCost > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {formatCurrency(totalAcquiredCost)} acquired · {formatCurrency(totalDisposedValue)} disposed
            </p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{categoryEntries.length}</p>
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
        <div className="grid grid-cols-5 gap-6">
          {/* Category stats */}
          <div className="col-span-2">
            <h2 className="font-semibold text-gray-700 mb-3">By category</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {categoryEntries.map(([category, count], i) => (
                <div
                  key={category}
                  className={`flex items-center justify-between px-4 py-3 text-sm ${
                    i < categoryEntries.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <span className="text-gray-700">{category}</span>
                  <span className="text-gray-400 font-medium">
                    {count} item{count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently added */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700">Recently added</h2>
              <div className="flex items-center gap-3">
                <a
                  href="/api/export/csv"
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  ⬇ CSV
                </a>
                <Link href="/export/print" className="text-xs text-gray-500 hover:text-gray-800">
                  📄 PDF Report
                </Link>
                <Link href="/items" className="text-sm text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
            </div>
            <div className="space-y-2">
              {recentItems.map((item) => {
                const acquiredCost = item.transactions
                  .filter((t) => t.kind === "acquired" && t.cost != null)
                  .reduce((sum, t) => sum + (t.cost ?? 0), 0);
                return (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.category && (
                        <p className="text-sm text-gray-500 mt-0.5">{item.category}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {acquiredCost > 0 ? (
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(acquiredCost)}
                        </p>
                      ) : null}
                      <p className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
