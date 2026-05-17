# StockSense — Frontend

Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui + TypeScript.

## Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- The StockSense backend running locally on http://localhost:8000

## Setup

```bash
pnpm install

cp .env.example .env.local
# .env.local already points at the local backend by default
```

## Running

```bash
pnpm dev
```

Then open http://localhost:3000.

## Design language

Tokens (colors, typography, spacing, radii) are ported verbatim from the locked design exploration in `stocksense-design.html` and live in `src/app/globals.css` under the `@theme` directive. Treat that file as the canonical token source — change it there, not ad-hoc in components.

Display fonts: **Instrument Serif** (italic, big numbers + page titles), **Geist** (UI body), **Geist Mono** (data, SKUs, labels).
