import { afterAll, beforeAll, describe, expect, it } from "vitest";

const BASE = "http://localhost:3000";

describe.skipIf(process.env.CI === "true")("items API smoke test", () => {
  let createdId: string;

  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Headphones",
        category: "Electronics",
        color: "Black",
        upc: "012345678901",
        transaction: { kind: "acquired", cost: 299.99 },
      }),
    });
    expect(res.status).toBe(201);
    const item = await res.json();
    createdId = item.id;
  });

  it("GET /api/items returns a list including the created item", async () => {
    const res = await fetch(`${BASE}/api/items`);
    expect(res.status).toBe(200);
    const items = await res.json();
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((i: { id: string }) => i.id === createdId)).toBe(true);
  });

  it("GET /api/items/:id returns the item with transactions", async () => {
    const res = await fetch(`${BASE}/api/items/${createdId}`);
    expect(res.status).toBe(200);
    const item = await res.json();
    expect(item.name).toBe("Test Headphones");
    expect(item.transactions).toHaveLength(1);
    expect(item.transactions[0].kind).toBe("acquired");
    expect(item.transactions[0].cost).toBe(299.99);
  });

  it("PUT /api/items/:id updates the item", async () => {
    const res = await fetch(`${BASE}/api/items/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color: "White" }),
    });
    expect(res.status).toBe(200);
    const updated = await res.json();
    expect(updated.color).toBe("White");
  });

  it("GET /api/items/:id returns 404 for unknown id", async () => {
    const res = await fetch(`${BASE}/api/items/nonexistent-id`);
    expect(res.status).toBe(404);
  });

  afterAll(async () => {
    await fetch(`${BASE}/api/items/${createdId}`, { method: "DELETE" });
  });
});
