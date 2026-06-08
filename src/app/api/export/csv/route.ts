import { db } from "@/lib/db";
import { NextResponse } from "next/server";

function csvCell(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const items = await db.item.findMany({
    orderBy: { name: "asc" },
    include: {
      transactions: { orderBy: { date: "asc" } },
      attachments: { orderBy: { createdAt: "asc" } },
    },
  });

  const header = [
    "Name",
    "Category",
    "Color",
    "UPC",
    "Serial Number",
    "Notes",
    "Acquired ($)",
    "Disposed ($)",
    "Net Value ($)",
    "Photo URLs",
    "Created",
  ].join(",");

  const rows = items.map((item) => {
    const acquired = item.transactions
      .filter((t) => t.kind === "acquired" && t.cost != null)
      .reduce((sum, t) => sum + (t.cost ?? 0), 0);

    const disposed = item.transactions
      .filter((t) => t.kind === "disposed" && t.cost != null)
      .reduce((sum, t) => sum + (t.cost ?? 0), 0);

    const photos = item.attachments
      .filter((a) => a.kind === "photo")
      .map((a) => a.url)
      .join(" | ");

    return [
      csvCell(item.name),
      csvCell(item.category),
      csvCell(item.color),
      csvCell(item.upc),
      csvCell(item.serialNumber),
      csvCell(item.notes),
      csvCell(acquired > 0 ? acquired.toFixed(2) : null),
      csvCell(disposed > 0 ? disposed.toFixed(2) : null),
      csvCell(acquired > 0 || disposed > 0 ? (acquired - disposed).toFixed(2) : null),
      csvCell(photos),
      csvCell(item.createdAt.toISOString().slice(0, 10)),
    ].join(",");
  });

  const csv = [header, ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="insurance-report-${date}.csv"`,
    },
  });
}
