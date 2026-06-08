import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddTransactionForm } from "./add-transaction-form";
import { UploadAttachmentForm } from "./upload-attachment-form";

export const dynamic = "force-dynamic";

function expirationBadge(date: Date) {
  const now = new Date();
  const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: "Expired", cls: "bg-red-100 text-red-700" };
  if (daysLeft <= 30)
    return { label: `Expires in ${daysLeft}d`, cls: "bg-orange-100 text-orange-700" };
  if (daysLeft <= 90)
    return { label: `Expires in ${daysLeft}d`, cls: "bg-yellow-100 text-yellow-700" };
  return null;
}

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

  const warrantyBadge = item.warrantyEndsAt ? expirationBadge(item.warrantyEndsAt) : null;
  const expiryBadge = item.expiresAt ? expirationBadge(item.expiresAt) : null;

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

        {(item.room || item.shelf || item.box) && (
          <div className="mt-4 flex items-center gap-2 text-sm bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <span className="text-blue-400">📍</span>
            <span className="text-blue-800 font-medium">
              {[item.room, item.shelf, item.box].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}

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
          {item.warrantyEndsAt && (
            <div>
              <span className="text-gray-500">Warranty ends</span>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-medium text-gray-900">
                  {new Date(item.warrantyEndsAt).toLocaleDateString()}
                </p>
                {warrantyBadge && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${warrantyBadge.cls}`}
                  >
                    {warrantyBadge.label}
                  </span>
                )}
              </div>
            </div>
          )}
          {item.expiresAt && (
            <div>
              <span className="text-gray-500">Expires</span>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-medium text-gray-900">
                  {new Date(item.expiresAt).toLocaleDateString()}
                </p>
                {expiryBadge && (
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${expiryBadge.cls}`}>
                    {expiryBadge.label}
                  </span>
                )}
              </div>
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
                        : tx.kind === "repaired"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tx.kind === "acquired"
                      ? "Acquired"
                      : tx.kind === "repaired"
                        ? "Repaired"
                        : "Disposed"}
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

        <AddTransactionForm itemId={item.id} />
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-gray-700 mb-3">
          Attachments ({item.attachments.length})
        </h2>

        {item.attachments.length > 0 && (
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
        )}

        {item.attachments.length === 0 && (
          <p className="text-sm text-gray-400">No attachments yet.</p>
        )}

        <UploadAttachmentForm itemId={item.id} />
      </section>
    </div>
  );
}
