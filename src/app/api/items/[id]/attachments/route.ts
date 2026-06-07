import { db } from "@/lib/db";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const item = await db.item.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const kind = (formData.get("kind") as string) || "other";

  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (!["receipt", "manual", "photo", "other"].includes(kind)) {
    return NextResponse.json({ error: "invalid kind" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "file must be under 10 MB" }, { status: 400 });
  }

  const blob = await put(`items/${params.id}/${file.name}`, file, { access: "public" });

  const attachment = await db.attachment.create({
    data: {
      itemId: params.id,
      name: file.name,
      url: blob.url,
      kind,
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}
