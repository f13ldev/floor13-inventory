import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { upc: string } }) {
  const { upc } = params;

  // UPC/EAN is 6–14 digits
  if (!/^\d{6,14}$/.test(upc)) {
    return NextResponse.json({ error: "invalid barcode" }, { status: 400 });
  }

  // 1. Open Food Facts — free, no key, great coverage for food/grocery
  try {
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${upc}.json`, {
      next: { revalidate: 3600 },
    });
    if (offRes.ok) {
      const data = await offRes.json();
      if (data.status === 1 && data.product?.product_name) {
        const p = data.product;
        const productName: string = p.product_name || p.product_name_en || "";
        const brand: string = p.brands?.split(",")[0]?.trim() ?? "";
        const rawCategory: string =
          p.categories_tags?.[0]?.replace(/^en:/, "").replace(/-/g, " ") ?? "";
        const name =
          brand && !productName.toLowerCase().startsWith(brand.toLowerCase())
            ? `${brand} ${productName}`
            : productName;
        return NextResponse.json({ name: name.trim(), category: rawCategory || null });
      }
    }
  } catch {
    // network error — fall through
  }

  // 2. Fallback: barcode.monster — free, no key, broader non-food coverage
  try {
    const bmRes = await fetch(`https://barcode.monster/api/${upc}`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (bmRes.ok) {
      const data = await bmRes.json();
      if (data.description) {
        return NextResponse.json({
          name: data.description as string,
          category: (data.category as string) || null,
        });
      }
    }
  } catch {
    // network error — fall through
  }

  return NextResponse.json({ error: "not found" }, { status: 404 });
}
