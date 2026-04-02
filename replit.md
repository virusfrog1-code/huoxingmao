# Gnarp Meme Official

## Project Overview

Gnarp 外星小猫 Meme 官方网站 — 节奏挖矿小游戏、Meme 图库、社区、Gnarp Token 页面。

## Key Artifacts

- **gnarp-meme-official** (`artifacts/gnarp-meme-official/`) — Main website at `/`
  - React 19 + Vite + TypeScript + Tailwind CSS v4
  - Phaser 3 Dance Miner game
  - Zustand global state (Token, leaderboard, upgrades)
  - React Router v6 — 6 pages
  - PWA (manifest + sw.js)
  - Deep space theme: neon green (#39ff14) + pink-purple gradient

## Pages

- `/` — Hero with dancing cats canvas animation
- `/lore` — Gnarp origin timeline
- `/gallery` — Meme grid with like/download/share to X
- `/community` — @Ricedmdq X feed + submission form
- `/token` — Gnarp Token info + price chart (placeholder)
- `/game` — Phaser 3 Dance Miner with mining station sidebar

## Game Architecture

- `src/game/DanceMinerGame.ts` — Phaser 3 scene: 4-lane rhythm game
- `src/store/useStore.ts` — Zustand store with persist middleware (tokens, upgrades, leaderboard, offline mining)
- Upgrade system: antenna (auto-produce), dance (reward multiplier), fan (offline production)

---

# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
