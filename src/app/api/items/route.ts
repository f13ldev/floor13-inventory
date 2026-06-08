import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const location = searchParams.get("location")?.trim();

  const conditions: Prisma.ItemWhereInput[] = [];

  if (q) {
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

  if (category) {
    conditions.push({ category: { equals: category, mode: "insensitive" } });
  }

  if (location) {
    conditions.push({ room: { equals: location, mode: "insensitive" } });
  }

  const where: Prisma.ItemWhereInput = conditions.length > 0 ? { AND: conditions } : {};

  const items = await db.item.findMany({
    where,
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
  const { name, category, color, upc, serialNumber, notes, room, box, shelf, warrantyEndsAt, expiresAt, transaction } = body;

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
      room: room?.trim() || null,
      box: box?.trim() || null,
      shelf: shelf?.trim() || null,
      warrantyEndsAt: warrantyEndsAt ? new Date(warrantyEndsAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
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
