# Floor13 Inventory

Personal inventory tracker — track everything you own, when you got it, what you paid, and where to find documentation.

## What it does

- **Items** — name, category, color, UPC/barcode, serial number, notes
- **Transactions** — acquired or disposed, cost, date
- **Attachments** — receipts, manuals, photos (links)

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | Prisma 5 + SQLite (local) |
| Styling | Tailwind CSS 4 |
| Lint/Format | Biome |
| Tests | Vitest |
| Package manager | pnpm 9 |

## Prerequisites

```
node --version   # ≥ 20
pnpm --version   # 9.7.1
```

Install pnpm if missing:

```bash
npm install -g pnpm@9.7.1
```

## Local dev setup

```bash
# 1. Clone and install
git clone <repo-url>
cd floor13-inventory
pnpm install

# 2. Copy env and run migrations
cp .env.example .env.local
pnpm db:migrate

# 3. Start dev server
pnpm dev
# → http://localhost:3000
```

## Scripts

```bash
pnpm dev           # Start dev server (http://localhost:3000)
pnpm db:migrate    # Apply pending Prisma migrations
pnpm db:studio     # Open Prisma Studio (visual DB browser)
pnpm typecheck     # TypeScript check
pnpm lint          # Biome lint
pnpm lint:fix      # Biome lint + autofix
pnpm test          # Vitest (all tests)
pnpm build         # Production build
```

All four checks (`typecheck`, `lint`, `test`, `build`) must pass before merging to `main`.

## Project layout

```
src/
  app/
    page.tsx              Item list (home)
    items/
      new/page.tsx        Create item form
      [id]/page.tsx       Item detail + transactions
    api/
      items/
        route.ts          GET (list), POST (create)
        [id]/route.ts     GET, PUT, DELETE
  lib/
    db.ts                 Prisma client singleton
  __tests__/
    items-api.test.ts     API smoke tests
prisma/
  schema.prisma           Item, Transaction, Attachment models
  migrations/             Applied migrations
.env.example              Required env vars template
```

## API

```
GET    /api/items          List all items
POST   /api/items          Create item (+ optional transaction)
GET    /api/items/:id      Get item with transactions & attachments
PUT    /api/items/:id      Update item fields
DELETE /api/items/:id      Delete item (cascades transactions + attachments)
```

## Roadmap

- [ ] Email parsing — ingest purchase emails to pre-populate item + transaction
- [ ] UPC/barcode scan — camera-based scan to auto-fill item details
- [ ] Photo recognition — photograph item to identify and populate fields
- [ ] Repair lookup — find parts and repair guides by serial/UPC
- [ ] Resale — marketplace price lookup and interested buyer matching
- [ ] Insurance — coverage recommendations based on inventory value

## Branching

- `main` — production-ready; CI required to merge
- feature branches: `feat/<name>`, `fix/<name>`
