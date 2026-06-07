import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const item = await db.item.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await request.json();
  const { kind, cost, date, notes } = body;

  if (!kind || !["acquired", "disposed"].includes(kind)) {
    return NextResponse.json({ error: "kind must be 'acquired' or 'disposed'" }, { status: 400 });
  }

  const transaction = await db.transaction.create({
    data: {
      itemId: params.id,
      kind,
      cost: cost != null && cost !== "" ? Number(cost) : null,
      date: date ? new Date(date) : new Date(),
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
