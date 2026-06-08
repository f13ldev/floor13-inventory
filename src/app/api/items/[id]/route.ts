import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await db.item.findUnique({
    where: { id: params.id },
    include: {
      transactions: { orderBy: { date: "desc" } },
      attachments: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { name, category, color, upc, serialNumber, notes, room, box, shelf, warrantyEndsAt, expiresAt } = body;

  if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
    return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
  }

  const item = await db.item.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category: category?.trim() || null }),
      ...(color !== undefined && { color: color?.trim() || null }),
      ...(upc !== undefined && { upc: upc?.trim() || null }),
      ...(serialNumber !== undefined && { serialNumber: serialNumber?.trim() || null }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
      ...(room !== undefined && { room: room?.trim() || null }),
      ...(box !== undefined && { box: box?.trim() || null }),
      ...(shelf !== undefined && { shelf: shelf?.trim() || null }),
      ...(warrantyEndsAt !== undefined && { warrantyEndsAt: warrantyEndsAt ? new Date(warrantyEndsAt) : null }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
    },
    include: { transactions: true },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await db.item.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
