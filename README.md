# حسابداری میوه‌فروشی

Offline accounting for a single fruit seller, as an **installable PWA** that runs the same on Android phones and computers. The seller enters **one total per day** (purchases, sales, expenses); the app computes daily, weekly, monthly and all-time profit, and keeps an **accounts book** for customers and suppliers who buy/sell on credit.

**All data stays on the device**: SQLite (WASM) runs in the browser and stores its file in the origin-private file system (OPFS). Nothing is sent to a server; the host only serves the static app files. Moving data between devices = backup file (Settings → download / restore).

Next.js 16 static export · SQLite WASM (`opfs-sahpool`) · TanStack Query · Persian/RTL · tomans · Jalali dates.

## Scripts (pnpm)

| Command | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Static export to `out/` + offline service worker |
| `pnpm deploy` | Build + deploy to Cloudflare Workers (see below) |
| `pnpm preview` | Serve `out/` locally like a static host (http://localhost:4173) |
| `pnpm typecheck` · `pnpm lint` · `pnpm test` | Checks (lint also enforces the architecture) |

`pnpm build` = copy SQLite WASM into `public/sqlite` → `next build` → flatten segment files (Windows bug workaround) → generate `out/sw.js` precaching every file.

## Deploying

`out/` is a plain static site served by Cloudflare Workers Static Assets. The custom domain `mivehhesab.ir` is attached to the Worker `mivehhesabb`. HTTPS is required for installation and on-device storage.

```powershell
pnpm deploy   # build + deploy to Cloudflare Workers
```

`pnpm deploy` = `pnpm build` (static export to `out/`) → `wrangler deploy` (uploads to Cloudflare). First run requires `npx wrangler login` (browser OAuth).

For a sub-path (e.g. GitHub Pages `/<repo>`), build with `NEXT_PUBLIC_BASE_PATH=/<repo>`. Serve `sw.js` with `Cache-Control: no-cache` so updates are noticed (already configured in `public/_headers`).

Storage is per origin (scheme + host + port): each address has its own separate data.

## Architecture

```
src/
├─ app/          routes only: static pages that render a module's screen
├─ modules/
│  ├─ daybook/   daily totals: purchases, sales, itemized expenses
│  ├─ accounts/  customers & suppliers with credit, entries, balances
│  ├─ reports/   dashboard, weekly / monthly / all-time totals
│  └─ settings/  backup / restore, storage status, install
│     each module:
│     ├─ domain/     pure logic + tests (no React, no DB)   → public: domain/index.ts
│     ├─ data/       repository(db): SQL against the Db interface, tested on Node SQLite
│     ├─ hooks.ts    TanStack Query queries + mutations (zod-validated)
│     ├─ ui/         components and screens
│     └─ index.ts    public: screens + hooks
├─ platform/
│  ├─ db/        Db interface, worker client, migrations, <DbProvider>, Node test adapter
│  └─ pwa/       service worker registration + update banner, install prompt
└─ shared/       ui primitives, components, lib (money, digits, date), config
public/db-worker.js   SQLite worker (plain JS, loads public/sqlite/*)
scripts/              build helpers (sqlite copy, service worker, icons, preview server)
```

Rules (enforced by ESLint `no-restricted-imports`):

- `app → modules → platform → shared`; `shared` depends on nothing else.
- Other modules are reachable only via `@/modules/<name>` or `@/modules/<name>/domain`.
- `domain/` never imports React, Next, the database or TanStack.
- Money is integer tomans (`Toman`), days are `"YYYY-MM-DD"` keys (`DayKey`); Jalali is display/grouping only.
- Profit = sales − purchases − expenses. A party's balance = Σ debts − Σ payments.
- Schema changes: append to `src/platform/db/migrations.ts` (tracked in `PRAGMA user_version`; restored older backups are upgraded automatically).
