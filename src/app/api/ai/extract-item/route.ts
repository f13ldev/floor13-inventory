import Anthropic from "@anthropic-ai/sdk";
import type { ImageBlockParam, TextBlockParam } from "@anthropic-ai/sdk/resources/messages";
import { NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a data extraction assistant. Given an image of a receipt, invoice, or purchase document, extract relevant item information and return it as JSON.

Return ONLY a JSON object with these fields (omit any field you cannot confidently determine):
{
  "name": "product name",
  "category": "product category (e.g. Electronics, Clothing, Tools)",
  "cost": 99.99,
  "date": "YYYY-MM-DD",
  "serialNumber": "serial or model number if visible",
  "notes": "store name or any other relevant purchase context"
}

Rules:
- "name" should be the specific product name, not the store name
- "cost" should be the final paid price as a number (no currency symbol)
- "date" should be the purchase date in YYYY-MM-DD format
- If multiple items appear, focus on the primary/most expensive item
- Return only the JSON object, no other text`;

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

const TEXT_BLOCK: TextBlockParam = {
  type: "text",
  text: "Extract the item information from this receipt or invoice.",
};

function buildImageBlock(base64: string, mimeType: string): ImageBlockParam {
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: mimeType as ImageMediaType,
      data: base64,
    },
  };
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "file must be under 5 MB" }, { status: 400 });
  }

  const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!imageTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "file must be an image (JPEG, PNG, GIF, or WebP)" },
      { status: 400 }
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [buildImageBlock(base64, file.type), TEXT_BLOCK],
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const extracted = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    return NextResponse.json(extracted);
  } catch {
    return NextResponse.json({ error: "Could not parse item data from receipt" }, { status: 422 });
  }
}
