# AGENTS.md

Welcome to **Feral to Kings**, a retro top-down SNES Legend of Zelda-style web adventure game built with TypeScript, HTML5 Canvas, and Vite.

This document serves as instructions and guidelines for AI agents working on this codebase.

---

## 🛠️ Technology Stack & Architecture

* **Language:** TypeScript 5+ (ES2020/ESNext)
* **Framework / Bundler:** Vite
* **Rendering:** HTML5 Canvas (1024x704px canvas resolution, 32x22 tiles per room at 32x32px per tile). Pixel smoothing is disabled (`imageSmoothingEnabled = false`) for crisp pixel art.
* **World Map:** 64x64 grid of procedural room screens (`src/world/worldMap.ts`).
* **Graphics:** Procedural pixel-art matrix generator (`src/graphics/spriteGenerator.ts`).

---

## 📁 Codebase Structure

```
.
├── index.html                  # Main HTML entry point with Canvas element
├── package.json                # Scripts: dev, build, preview
├── tsconfig.json               # TypeScript configuration
├── README.md                   # User documentation, controls, and scene renders
├── AGENTS.md                   # Guidelines for AI agents (this file)
└── src/
    ├── types.ts                # Global constants (TILE_SIZE, ROOM_COLS, etc.) and interfaces
    ├── main.ts                 # Main game loop, rendering pipeline, inputs, HUD & Inventory
    ├── entities/
    │   ├── player.ts           # Hero class (20 hearts, sword/armor stats, 25 traversal items)
    │   └── enemy.ts            # Enemy class (Slime, Bat, Skeleton, Archer, Boss & Tier scaling)
    ├── graphics/
    │   └── spriteGenerator.ts  # Pixel-matrix generator for sprites, tiles, and 25 item icons
    └── world/
        └── worldMap.ts         # 64x64 procedural world map generator & room state management
```

---

## 💻 Commands & Verifications

Agents modifying this codebase MUST ensure the build and type checking pass:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check & build production assets
npm run build
```

---

## 📏 Coding Standards & Conventions

1. **Pixel Art Crispness:** Keep `ctx.imageSmoothingEnabled = false` whenever canvas rendering context is used.
2. **Deterministic World Generation:** Keep seed-based pseudo-random generation in `worldMap.ts` so room layouts remain consistent per seed.
3. **Item Scaling & Inventory:** Ensure new traversal/combat items are added to `ITEM_LIST` in `src/entities/player.ts` and given a 16x16 pixel matrix icon in `spriteGenerator.ts`.
4. **Clean Imports:** Always use relative paths correctly (e.g., `import { ... } from '../types'` from inside subfolders).
5. **No `node_modules` in Git:** Always ensure `node_modules/` and build artifacts (`dist/`) are git-ignored.
