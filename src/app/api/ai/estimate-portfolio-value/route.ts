import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

interface ItemInput {
  name: string;
  category: string | null;
  upc: string | null;
  serialNumber: string | null;
  acquiredCost: number;
  acquiredYear: number | null;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { items }: { items: ItemInput[] } = await request.json();
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items array required" }, { status: 400 });
  }

  const itemLines = items
    .map((item, i) => {
      const parts = [item.name];
      if (item.category) parts.push(`(${item.category})`);
      if (item.upc) parts.push(`[UPC: ${item.upc}]`);
      if (item.serialNumber) parts.push(`[Model: ${item.serialNumber}]`);
      parts.push(`— original cost $${item.acquiredCost.toFixed(2)}`);
      if (item.acquiredYear) parts.push(`purchased ${item.acquiredYear}`);
      return `${i + 1}. ${parts.join(" ")}`;
    })
    .join("\n");

  const prompt = `You are a personal property appraiser estimating current secondhand market value.

For each item below, estimate what it would likely sell for today on eBay, Facebook Marketplace, or similar platforms. Account for typical depreciation, condition wear, and current market demand based on your training data.

Items:
${itemLines}

Return ONLY a JSON object — no extra text:
{
  "items": [
    { "index": 1, "min": 50, "max": 80, "likely": 65 },
    ...
  ]
}

All dollar amounts as plain numbers.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const result = JSON.parse(jsonMatch ? jsonMatch[0] : raw);

  const totalMin = result.items.reduce((s: number, i: { min: number }) => s + i.min, 0);
  const totalMax = result.items.reduce((s: number, i: { max: number }) => s + i.max, 0);
  const totalLikely = result.items.reduce((s: number, i: { likely: number }) => s + i.likely, 0);

  return NextResponse.json({
    items: result.items,
    total: {
      min: Math.round(totalMin),
      max: Math.round(totalMax),
      likely: Math.round(totalLikely),
    },
  });
}
