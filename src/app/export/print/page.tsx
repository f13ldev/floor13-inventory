import { db } from "@/lib/db";
import Link from "next/link";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

export default async function PrintPage() {
  const items = await db.item.findMany({
    orderBy: { name: "asc" },
    include: {
      transactions: { orderBy: { date: "asc" } },
      attachments: { orderBy: { createdAt: "asc" } },
    },
  });

  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const grandTotal = items.reduce((sum, item) => {
    const acquired = item.transactions
      .filter((t) => t.kind === "acquired" && t.cost != null)
      .reduce((s, t) => s + (t.cost ?? 0), 0);
    const disposed = item.transactions
      .filter((t) => t.kind === "disposed" && t.cost != null)
      .reduce((s, t) => s + (t.cost ?? 0), 0);
    return sum + (acquired - disposed);
  }, 0);

  return (
    <>
      {/* Hide the nav bar when printing */}
      <style>{"@media print { nav { display: none !important; } }"}</style>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 print:mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Insurance Inventory Report</h1>
            <p className="text-gray-500 mt-1">Generated {reportDate}</p>
            <p className="text-gray-500 text-sm mt-0.5">
              {items.length} item{items.length !== 1 ? "s" : ""} · Total net value:{" "}
              <span className="font-semibold text-gray-800">${grandTotal.toFixed(2)}</span>
            </p>
          </div>
          <div className="flex gap-3 print:hidden">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2">
              ← Back
            </Link>
            <PrintButton />
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-20">No items to report.</p>
        ) : (
          <div className="space-y-8">
            {items.map((item) => {
              const acquired = item.transactions
                .filter((t) => t.kind === "acquired" && t.cost != null)
                .reduce((s, t) => s + (t.cost ?? 0), 0);
              const disposed = item.transactions
                .filter((t) => t.kind === "disposed" && t.cost != null)
                .reduce((s, t) => s + (t.cost ?? 0), 0);
              const net = acquired - disposed;
              const photos = item.attachments.filter((a) => a.kind === "photo");
              const otherAttachments = item.attachments.filter((a) => a.kind !== "photo");

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-5 bg-white break-inside-avoid"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>

                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                        {item.category && (
                          <div>
                            <span className="text-gray-500">Category</span>
                            <p className="font-medium text-gray-800">{item.category}</p>
                          </div>
                        )}
                        {item.color && (
                          <div>
                            <span className="text-gray-500">Color</span>
                            <p className="font-medium text-gray-800">{item.color}</p>
                          </div>
                        )}
                        {item.upc && (
                          <div>
                            <span className="text-gray-500">UPC</span>
                            <p className="font-mono font-medium text-gray-800">{item.upc}</p>
                          </div>
                        )}
                        {item.serialNumber && (
                          <div>
                            <span className="text-gray-500">Serial #</span>
                            <p className="font-mono font-medium text-gray-800">
                              {item.serialNumber}
                            </p>
                          </div>
                        )}
                        {acquired > 0 && (
                          <div>
                            <span className="text-gray-500">Acquired</span>
                            <p className="font-medium text-gray-800">${acquired.toFixed(2)}</p>
                          </div>
                        )}
                        {disposed > 0 && (
                          <div>
                            <span className="text-gray-500">Disposed</span>
                            <p className="font-medium text-gray-800">${disposed.toFixed(2)}</p>
                          </div>
                        )}
                        {(acquired > 0 || disposed > 0) && (
                          <div>
                            <span className="text-gray-500">Net Value</span>
                            <p className="font-semibold text-gray-900">${net.toFixed(2)}</p>
                          </div>
                        )}
                      </div>

                      {item.notes && (
                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          {item.notes}
                        </p>
                      )}

                      {item.transactions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Transaction History
                          </p>
                          <div className="space-y-1">
                            {item.transactions.map((tx) => (
                              <div key={tx.id} className="flex items-center gap-2 text-sm">
                                <span
                                  className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                                    tx.kind === "acquired"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {tx.kind === "acquired" ? "Acquired" : "Disposed"}
                                </span>
                                {tx.cost != null && (
                                  <span className="text-gray-700 font-medium">
                                    ${tx.cost.toFixed(2)}
                                  </span>
                                )}
                                <span className="text-gray-400">
                                  {new Date(tx.date).toLocaleDateString()}
                                </span>
                                {tx.notes && (
                                  <span className="text-gray-500 truncate">{tx.notes}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {otherAttachments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Documents
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {otherAttachments.map((a) => (
                              <a
                                key={a.id}
                                href={a.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline print:hidden"
                              >
                                {a.name} ({a.kind})
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Photos on the right */}
                    {photos.length > 0 && (
                      <div className="flex flex-col gap-2 shrink-0">
                        {photos.slice(0, 3).map((photo) => (
                          <img
                            key={photo.id}
                            src={photo.url}
                            alt={photo.name}
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                        {photos.length > 3 && (
                          <p className="text-xs text-gray-400 text-center">
                            +{photos.length - 3} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-200 text-sm text-gray-400 print:mt-8">
          <p>
            Floor13 Inventory · {reportDate} · {items.length} item
            {items.length !== 1 ? "s" : ""} · Total net value ${grandTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </>
  );
}
