# Feral to Kings - Top-Down SNES Adventure Game

A retro top-down adventure web game inspired by *The Legend of Zelda: A Link to the Past* for the SNES. Built with **TypeScript**, **HTML5 Canvas**, and **Vite**.

---

## 🚀 Play the Game
The local development server is running and accessible at:
👉 **[http://localhost:5173](http://localhost:5173)** (or **`http://127.0.0.1:5173`**)

To start the server manually:
```bash
npm install
npm run dev
```

To build for production:
```bash
npm run build
```

---

## 🎮 Controls

| Action | Key Binding |
| :--- | :--- |
| **Move Hero** | `W` / `A` / `S` / `D` or `Arrow Keys` |
| **Attack (Astral Blade)** | `J` or `Spacebar` |
| **Use Selected Item** | `K` |
| **Open / Close Inventory** | `I` |
| **Quick Select Item** | `1` - `9` |
| **Previous / Next Item** | `Q` / `E` |
| **Quick Save State** | `F5` |
| **Quick Load State** | `F9` |

---

## ✨ Features

* **32x22 Tile Resolution**: Double SNES resolution (1024x704px canvas) rendered with crisp pixelated smoothing disabled.
* **64x64 Procedural World Grid**: 4,096 interconnected rooms featuring Starting Sanctuary, Enemy Camps, Relic Chambers, and Fallen Kingdom Ruins.
* **20 Hearts & Best Gear**: Hero starts with 20 maximum hearts, Astral Blade (50 damage), and Golden Armor (50% damage reduction).
* **25 Traversal & Combat Items**: All 25 functional items available from the start in a 5x5 interactive overlay inventory menu (Hookshot, Bombs, Bow, Boomerang, Pegasus Boots, Lantern, Flippers, Megaton Hammer, Fire Wand, Ice Rod, Roc Feather, Power Bracelet, Shovel, Warp Flute, Lens of Truth, Invisibility Cape, Magnetic Glove, Grappling Whip, Gust Jar, Thunder Medallion, Quake Boots, Ether Mirror, Trick Slingshot, Elixir Flask, Relic Radar).
* **Enemy Camp Door Locking**: Entering an uncleared enemy camp seals all doors until every foe is vanquished, rewarding bomb credits and score points.
* **Point-Based Enemy Scaling**: Defeating enemies, clearing camps, finding relics, and reading lore signs increases your score. Past **5,000 points**, enemy difficulty scales every 1,000 points into higher tiers with upgraded HP, speed, damage, and visual palette swaps.
* **Fallen Kingdom Lore Signs**: Ancient stone signs scatter the overworld detailing the history of the fallen kingdom.
* **Save State System**: Instant LocalStorage slot quick save and quick load (`F5` / `F9`).
