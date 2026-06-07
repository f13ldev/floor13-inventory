import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await db.item.findUnique({
    where: { id: params.id },
    include: {
      transactions: { orderBy: { date: "desc" } },
      attachments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!item) notFound();

  const acquiredTotal = item.transactions
    .filter((t) => t.kind === "acquired" && t.cost != null)
    .reduce((sum, t) => sum + (t.cost ?? 0), 0);

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
          ← All items
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
          <Link
            href={`/items/${item.id}/edit`}
            className="text-sm text-blue-600 hover:underline shrink-0 ml-4"
          >
            Edit
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {item.category && (
            <div>
              <span className="text-gray-500">Category</span>
              <p className="font-medium text-gray-900">{item.category}</p>
            </div>
          )}
          {item.color && (
            <div>
              <span className="text-gray-500">Color</span>
              <p className="font-medium text-gray-900">{item.color}</p>
            </div>
          )}
          {item.upc && (
            <div>
              <span className="text-gray-500">UPC</span>
              <p className="font-mono font-medium text-gray-900">{item.upc}</p>
            </div>
          )}
          {item.serialNumber && (
            <div>
              <span className="text-gray-500">Serial</span>
              <p className="font-mono font-medium text-gray-900">{item.serialNumber}</p>
            </div>
          )}
          {acquiredTotal > 0 && (
            <div>
              <span className="text-gray-500">Total paid</span>
              <p className="font-medium text-gray-900">${acquiredTotal.toFixed(2)}</p>
            </div>
          )}
        </div>

        {item.notes && (
          <p className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{item.notes}</p>
        )}
      </div>

      <section>
        <h2 className="font-semibold text-gray-700 mb-3">
          Transactions ({item.transactions.length})
        </h2>

        {item.transactions.length === 0 ? (
          <p className="text-sm text-gray-400">No transactions recorded.</p>
        ) : (
          <div className="space-y-2">
            {item.transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between text-sm"
              >
                <div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${
                      tx.kind === "acquired"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tx.kind === "acquired" ? "Acquired" : "Disposed"}
                  </span>
                  {tx.notes && <span className="text-gray-600">{tx.notes}</span>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  {tx.cost != null && (
                    <p className="font-medium text-gray-900">${tx.cost.toFixed(2)}</p>
                  )}
                  <p className="text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {item.attachments.length > 0 && (
        <section className="mt-6">
          <h2 className="font-semibold text-gray-700 mb-3">
            Attachments ({item.attachments.length})
          </h2>
          <div className="space-y-2">
            {item.attachments.map((a) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 text-sm hover:border-blue-300"
              >
                <span className="text-gray-400">📎</span>
                <span className="text-gray-700">{a.name}</span>
                <span className="text-gray-400 text-xs ml-auto">{a.kind}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
