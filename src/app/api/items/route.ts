import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await db.item.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      transactions: { orderBy: { date: "desc" }, take: 1 },
      _count: { select: { transactions: true, attachments: true } },
    },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, category, color, upc, serialNumber, notes, transaction } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const item = await db.item.create({
    data: {
      name: name.trim(),
      category: category?.trim() || null,
      color: color?.trim() || null,
      upc: upc?.trim() || null,
      serialNumber: serialNumber?.trim() || null,
      notes: notes?.trim() || null,
      transactions: transaction
        ? {
            create: {
              kind: transaction.kind ?? "acquired",
              cost: transaction.cost ? Number(transaction.cost) : null,
              date: transaction.date ? new Date(transaction.date) : new Date(),
              notes: transaction.notes?.trim() || null,
            },
          }
        : undefined,
    },
    include: { transactions: true },
  });

  return NextResponse.json(item, { status: 201 });
}
