// Procedural Pixel Art Generator for SNES Style Top-Down Graphics

export interface SpriteMap {
  [key: string]: HTMLCanvasElement;
}

// Utility to render pixel matrix string arrays to canvas
// '.' = transparent, letters/numbers map to color hex strings
export function createPixelSprite(
  matrix: string[],
  palette: Record<string, string>,
  scale: number = 2
): HTMLCanvasElement {
  const height = matrix.length;
  const width = matrix[0].length;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const char = matrix[r][c];
      if (char !== '.' && palette[char]) {
        ctx.fillStyle = palette[char];
        ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    }
  }

  return canvas;
}

// Global cached sprite registry
export const Sprites: SpriteMap = {};

export function initSprites(): void {
  // --- PLAYER SPRITES ---
  // Palette: H=Hair(Gold), S=Skin, A=Armor(Gold/Blue), C=Cape(Red), B=Boots(Brown), O=Outline/Black, W=White, G=Gem/Eye
  const heroPalette: Record<string, string> = {
    'O': '#0f172a', // Outline
    'H': '#f59e0b', // Blonde Hair
    'S': '#fed7aa', // Skin
    'A': '#2563eb', // Best Armor Royal Blue
    'G': '#facc15', // Armor Gold Trim
    'R': '#dc2626', // Cape / Belt
    'B': '#78350f', // Boots
    'W': '#ffffff', // Eyes/Highlights
    'M': '#38bdf8', // Best Sword Silver/Blue Light
  };

  const heroDown = [
    "..OOOOOO..",
    ".OHHHHHHO.",
    ".OHHHHHHO.",
    ".OSSSSSSO.",
    ".OSWOSWO..",
    "OASASASA..",
    "OAAAAAAAAO",
    "OAGAGGGAO.",
    "OAGAGGGAO.",
    ".OARRAAO..",
    ".OABBAAO..",
    "..OB..BO.."
  ];

  const heroUp = [
    "..OOOOOO..",
    ".OHHHHHHO.",
    ".OHHHHHHO.",
    ".OHHHHHHO.",
    ".OHHHHHHO.",
    "OAAAAAAAAO",
    "OAAAAAAAAO",
    "OAGAGGGAO.",
    "OAGAGGGAO.",
    ".OARRAAO..",
    ".OABBAAO..",
    "..OB..BO.."
  ];

  const heroLeft = [
    "..OOOOO...",
    ".OHHHHH...",
    ".OSSSHH...",
    ".OSWOSH...",
    "OAAAAAA...",
    "OAGAGAA...",
    "OAGAGAA...",
    ".OARR...O.",
    ".OABBAAAO.",
    "..OB...BO."
  ];

  const heroRight = [
    "...OOOOO..",
    "...HHHHHO.",
    "...HHSSSO.",
    "...HSWOSO.",
    "...AAAAAAO",
    "...AAGAGAO",
    "...AAGAGAO",
    ".O...RRAO.",
    ".OAAABBAO.",
    ".OB...BO.."
  ];

  Sprites['player_down'] = createPixelSprite(heroDown, heroPalette, 3);
  Sprites['player_up'] = createPixelSprite(heroUp, heroPalette, 3);
  Sprites['player_left'] = createPixelSprite(heroLeft, heroPalette, 3);
  Sprites['player_right'] = createPixelSprite(heroRight, heroPalette, 3);

  // --- TILES (32x32, 16x16 matrix scaled x2) ---
  // Palette using single-character keys for createPixelSprite
  const tilePalette: Record<string, string> = {
    'g': '#15803d', 'G': '#16a34a', 'h': '#22c55e', // Grass (g, G, h)
    'd': '#78350f', 'D': '#92400e', 'p': '#b45309', // Dirt/Path (d, D, p)
    'w': '#1e40af', 'W': '#2563eb', 'b': '#60a5fa', // Water (w, W, b)
    'r': '#334155', 'R': '#475569', 'k': '#64748b', // Rock/Wall (r, R, k)
    't': '#14532d', 'T': '#166534', 'm': '#854d0e', // Trees (t, T, m)
    's': '#e2e8f0', 'S': '#94a3b8', 'a': '#f59e0b', // Sign / Relic (s, S, a)
    'e': '#7f1d1d', 'E': '#b91c1c', 'x': '#ef4444', // Door/Camp Lock (e, E, x)
    'c': '#eab308', 'C': '#ca8a04', 'j': '#a16207', // Gold Chest (c, C, j)
  };

  // Grass Tile
  const grassMat = [
    "gggggggggggggggg",
    "gGggggGggggGgggg",
    "gGhgggGhgggGhggg",
    "gggggggggggggggg",
    "gggGgggggGgggggg",
    "gggGhggggGhggggg",
    "gggggggggggggggg",
    "gGgggggGgggggGgg",
    "gGhggggGhggggGhg",
    "gggggggggggggggg",
    "ggggGgggggGggggg",
    "ggggGhggggGhgggg",
    "gggggggggggggggg",
    "gGggggGggggGgggg",
    "gGhgggGhgggGhggg",
    "gggggggggggggggg"
  ];
  Sprites['tile_grass'] = createPixelSprite(grassMat, tilePalette, 2);

  // Tree Tile
  const treeMat = [
    "....tttttt....",
    "..tTTTTTTt..",
    ".tTmTTTTmTt.",
    ".tTmTTTTmTt.",
    "tTTTTTTTTTTt",
    "tTTTTTTTTTTt",
    "tTTTTTTTTTTt",
    ".tTTTTTTTTt.",
    "..tTTTTTTt..",
    "....tttt....",
    "......mmmm......",
    "......mmmm......",
    "......mmmm......",
    "......mmmm......",
    ".....mmmmm.....",
    "....mmmmmm...."
  ];
  Sprites['tile_tree'] = createPixelSprite(treeMat, tilePalette, 2);

  // Rock Wall Tile
  const rockMat = [
    "rrrrrrrrrrrrrrrr",
    "rRRRRrrRRRRRRRrr",
    "rRkkRrRkkkkkRrr",
    "rRkkRrRkkkkkRrr",
    "rrrrrrrrrrrrrrrr",
    "rRRRRRRRrrRRRRrr",
    "rRkkkkkRrRkkRrr",
    "rRkkkkkRrRkkRrr",
    "rrrrrrrrrrrrrrrr",
    "rRRRRrrRRRRRRRrr",
    "rRkkRrRkkkkkRrr",
    "rRkkRrRkkkkkRrr",
    "rrrrrrrrrrrrrrrr",
    "rRRRRRRRrrRRRRrr",
    "rRkkkkkRrRkkRrr",
    "rrrrrrrrrrrrrrrr"
  ];
  Sprites['tile_wall'] = createPixelSprite(rockMat, tilePalette, 2);

  // Water Tile
  const waterMat = [
    "wwwwwwwwwwwwwwww",
    "wWWWwwwwwWWWwwww",
    "wWBWwwwwwWBWwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwWWWwwwwwWWWw",
    "wwwwWBWwwwwwWBWw",
    "wwwwwwwwwwwwwwww",
    "wWWWwwwwwWWWwwww",
    "wWBWwwwwwWBWwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwWWWwwwwwWWWw",
    "wwwwWBWwwwwwWBWw",
    "wwwwwwwwwwwwwwww",
    "wWWWwwwwwWWWwwww",
    "wWBWwwwwwWBWwwww",
    "wwwwwwwwwwwwwwww"
  ];
  Sprites['tile_water'] = createPixelSprite(waterMat, tilePalette, 2);

  // Dirt/Floor Tile
  const dirtMat = [
    "dddddddddddddddd",
    "dDddddDddddDdddd",
    "dDptttdDptttdDpt",
    "dddddddddddddddd",
    "ddddDdddddDddddd",
    "ddddDpddddDpdddd",
    "dddddddddddddddd",
    "dDdddddDdddddDdd",
    "dDpttttDpttttDpt",
    "dddddddddddddddd",
    "ddddDdddddDddddd",
    "ddddDpddddDpdddd",
    "dddddddddddddddd",
    "dDddddDddddDdddd",
    "dDptttdDptttdDpt",
    "dddddddddddddddd"
  ];
  Sprites['tile_dirt'] = createPixelSprite(dirtMat, tilePalette, 2);

  // Lore Sign
  const signMat = [
    "................",
    "...sssss........",
    "..sSSSSs........",
    "..sSaaSs........",
    "..sSaaSs........",
    "..sSSSSs........",
    "...sssss........",
    "......ss........",
    "......ss........",
    "......ss........",
    "......ss........",
    "................",
    "................",
    "................",
    "................",
    "................"
  ];
  Sprites['tile_sign'] = createPixelSprite(signMat, tilePalette, 2);

  // Relic Chest
  const chestMat = [
    "................",
    "..cccccc........",
    ".cCCCCCCc.......",
    ".cCaaaCCc.......",
    ".cCaaaCCc.......",
    ".cCCCCCCc.......",
    ".ccccccc........",
    ".cjjjjjjc.......",
    ".cjjjjjjc.......",
    ".ccccccc........",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ];
  Sprites['tile_chest'] = createPixelSprite(chestMat, tilePalette, 2);

  // Locked Camp Gate / Barrier
  const gateMat = [
    "eeeeeeeeeeeeeeee",
    "eEEeeEEeeEEeeEEe",
    "eEEeeEEeeEEeeEEe",
    "exxeeXXeexxeeXXe",
    "exxeeXXeexxeeXXe",
    "eeeeeeeeeeeeeeee",
    "eEEeeEEeeEEeeEEe",
    "eEEeeEEeeEEeeEEe",
    "exxeeXXeexxeeXXe",
    "exxeeXXeexxeeXXe",
    "eeeeeeeeeeeeeeee",
    "eEEeeEEeeEEeeEEe",
    "eEEeeEEeeEEeeEEe",
    "exxeeXXeexxeeXXe",
    "exxeeXXeexxeeXXe",
    "eeeeeeeeeeeeeeee"
  ];
  Sprites['tile_gate'] = createPixelSprite(gateMat, tilePalette, 2);

  // Helper to generate dynamic enemy matrices based on tier colors
  initEnemySprites();

  // Helper to generate all 25 item icons
  initItemIcons();
}

function initEnemySprites(): void {
  // Base Enemy Templates: Slime, Skeleton, Bat, Archer, Boss
  const slimeMat = [
    "....OOOO....",
    "..OOSSSSOO..",
    ".OSSSSSSSSO.",
    "OSSWOSSWSSSO",
    "OSSWOSSWSSSO",
    "OSSSSSSSSSSO",
    ".OSSSSSSSSO.",
    "..OOOOOOOO.."
  ];

  const batMat = [
    "O..O....O..O",
    "OO.OO..OO.OO",
    ".OOOOOOOOOO.",
    "..OWOWOWOW..",
    "..OOOOOOOO..",
    "...OOOOOO...",
    "....OOOO....",
    ".....OO....."
  ];

  const skeletonMat = [
    "..OOOOOO..",
    ".OWWWWWWO.",
    ".OWOWOWWO.",
    ".OWWWWWWO.",
    "..OOOOOO..",
    "..OWWWWO..",
    ".OOWWWWOO.",
    "OO.OOOO.OO",
    "O..OOOO..O",
    "...OWWO...",
    "..OOWWOO..",
    "..OO..OO.."
  ];

  const archerMat = [
    "..OOOOOO..",
    ".OHHHHHHO.",
    ".OSWOSWO..",
    ".OSSSSSSO.",
    ".OAAAAAAO.",
    "O.AAGGA.OO",
    ".OAAGGAO.O",
    "..OAAAAO..",
    "..OABBAO..",
    "..OB..BO.."
  ];

  const bossMat = [
    "...OOOOOOOO...",
    "..ORRRRRRRRO..",
    ".ORRWWWWWRRO.",
    ".ORWOWWOWRRO.",
    "ORRRWWWWWRRRO",
    "ORRRRRRRRRRRO",
    ".ORRRRRRRRRO.",
    "O.OAAAAAAO.O",
    "O.OAGGGGAO.O",
    ".OOAGGGGAOO.",
    "..OAAAAAAO..",
    "..OABBBBAO..",
    "..OB....BO.."
  ];

  // Scale factor 3x for clear high-contrast visibility
  // Tier 1 (Green / Light Blue)
  Sprites['enemy_slime_1'] = createPixelSprite(slimeMat, { 'O': '#0f172a', 'S': '#22c55e', 'W': '#ffffff' }, 3);
  Sprites['enemy_bat_1'] = createPixelSprite(batMat, { 'O': '#0f172a', 'W': '#38bdf8' }, 3);
  Sprites['enemy_skeleton_1'] = createPixelSprite(skeletonMat, { 'O': '#0f172a', 'W': '#f8fafc' }, 3);
  Sprites['enemy_archer_1'] = createPixelSprite(archerMat, { 'O': '#0f172a', 'H': '#1e293b', 'S': '#fed7aa', 'W': '#fff', 'A': '#16a34a', 'G': '#facc15', 'B': '#78350f' }, 3);
  Sprites['enemy_boss_1'] = createPixelSprite(bossMat, { 'O': '#0f172a', 'R': '#dc2626', 'W': '#fff', 'A': '#7c3aed', 'G': '#facc15', 'B': '#1e293b' }, 3);

  // Tier 2 (Red / Flame)
  Sprites['enemy_slime_2'] = createPixelSprite(slimeMat, { 'O': '#0f172a', 'S': '#ef4444', 'W': '#ffffff' }, 3);
  Sprites['enemy_bat_2'] = createPixelSprite(batMat, { 'O': '#0f172a', 'W': '#fca5a5' }, 3);
  Sprites['enemy_skeleton_2'] = createPixelSprite(skeletonMat, { 'O': '#0f172a', 'W': '#fecaca' }, 3);
  Sprites['enemy_archer_2'] = createPixelSprite(archerMat, { 'O': '#0f172a', 'H': '#1e293b', 'S': '#fed7aa', 'W': '#fff', 'A': '#dc2626', 'G': '#facc15', 'B': '#78350f' }, 3);
  Sprites['enemy_boss_2'] = createPixelSprite(bossMat, { 'O': '#0f172a', 'R': '#b91c1c', 'W': '#fff', 'A': '#ea580c', 'G': '#facc15', 'B': '#1e293b' }, 3);

  // Tier 3+ (Shadow / Golden Purple)
  Sprites['enemy_slime_3'] = createPixelSprite(slimeMat, { 'O': '#0f172a', 'S': '#8b5cf6', 'W': '#facc15' }, 3);
  Sprites['enemy_bat_3'] = createPixelSprite(batMat, { 'O': '#0f172a', 'W': '#c084fc' }, 3);
  Sprites['enemy_skeleton_3'] = createPixelSprite(skeletonMat, { 'O': '#0f172a', 'W': '#a855f7' }, 3);
  Sprites['enemy_archer_3'] = createPixelSprite(archerMat, { 'O': '#0f172a', 'H': '#1e293b', 'S': '#fed7aa', 'W': '#fff', 'A': '#581c87', 'G': '#facc15', 'B': '#78350f' }, 3);
  Sprites['enemy_boss_3'] = createPixelSprite(bossMat, { 'O': '#0f172a', 'R': '#4c1d95', 'W': '#fff', 'A': '#09090b', 'G': '#ef4444', 'B': '#1e293b' }, 3);
}

function initItemIcons(): void {
  const itemPalette: Record<string, string> = {
    'O': '#0f172a', 'W': '#ffffff', 'G': '#facc15', 'R': '#ef4444',
    'B': '#3b82f6', 'P': '#a855f7', 'N': '#78350f', 'S': '#94a3b8',
    'I': '#38bdf8', 'E': '#22c55e', 'D': '#475569'
  };

  // 16x16 icon templates for each of the 25 items
  const itemMatrices: Record<string, string[]> = {
    // 1. Hookshot
    'item_1': [
      "................",
      "...SS...........",
      "..SSSS..........",
      "..S..SS.........",
      ".....SSS........",
      "......SSS.......",
      ".......NNN......",
      "........NNN.....",
      ".........NNN....",
      "..........NNN...",
      "...........NN...",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 2. Bombs
    'item_2': [
      ".........GG.....",
      "........RR......",
      ".......DD.......",
      ".....DDDDDD.....",
      "....DDDDDDDD....",
      "...DDDDDDDDDD...",
      "..DDDDDDWWDDDD..",
      "..DDDDDDWWDDDD..",
      "..DDDDDDDDDDDD..",
      "...DDDDDDDDDD...",
      "....DDDDDDDD....",
      ".....DDDDDD.....",
      "................",
      "................",
      "................",
      "................"
    ],
    // 3. Bow & Arrows
    'item_3': [
      "....N...........",
      "...N.W..........",
      "..N...W.SSS.....",
      ".N.....W.SSS....",
      ".N......W.SSS...",
      ".N.......W......",
      "..N.......W.....",
      "...N.......W....",
      "....N...........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 4. Boomerang
    'item_4': [
      "....GGGG........",
      "...GG..GG.......",
      "..GG....GG......",
      ".GG......GG.....",
      ".GG.............",
      "..GG............",
      "...GG...........",
      "....GG..........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 5. Pegasus Boots
    'item_5': [
      ".......WW.......",
      "......WW........",
      ".....WW.RRRR....",
      "....WW.RRRRRR...",
      ".......RRRRRR...",
      ".......RRRRRR...",
      ".......BBBBBB...",
      "......BBBBBBBB..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 6. Lantern
    'item_6': [
      ".......GG.......",
      "......S..S......",
      ".....SGGGGS.....",
      ".....SGGGGS.....",
      ".....SGGGGS.....",
      "......S..S......",
      "......SSSS......",
      ".......SS.......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 7. Flippers
    'item_7': [
      "..BB......BB....",
      ".BBBB....BBBB...",
      ".BBBB....BBBB...",
      "..BBBB..BBBB....",
      "...BBBBBBBB.....",
      "....BBBBBB......",
      ".....BBBB.......",
      "......BB........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 8. Megaton Hammer
    'item_8': [
      "...SSSSSS.......",
      "..SSSSSSSS......",
      "..SSSSSSSS......",
      "...SSSSSS.......",
      ".....NN.........",
      "......NN........",
      ".......NN.......",
      "........NN......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 9. Fire Wand
    'item_9': [
      ".......RR.......",
      "......RRRR......",
      ".....RRGGGR.....",
      "......RRRR......",
      ".......NN.......",
      "......NN........",
      ".....NN.........",
      "....NN..........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 10. Ice Rod
    'item_10': [
      ".......II.......",
      "......IIII......",
      ".....IIWWII.....",
      "......IIII......",
      ".......NN.......",
      "......NN........",
      ".....NN.........",
      "....NN..........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 11. Roc's Feather / Cape
    'item_11': [
      ".......WW.......",
      "......WWWW......",
      ".....WWWWWW.....",
      "....WWWBWWWW....",
      "...WWWB..WWWW...",
      "..WWWB....WWWW..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 12. Power Bracelet
    'item_12': [
      ".....GGGGGG.....",
      "....GGGGGGGG....",
      "...GG..RR..GG...",
      "...GG..RR..GG...",
      "....GGGGGGGG....",
      ".....GGGGGG.....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 13. Shovel
    'item_13': [
      ".....SSSS.......",
      "....SSSSSS......",
      "....SSSSSS......",
      ".....SSSS.......",
      "......NN........",
      ".......NN.......",
      "........NN......",
      ".........NN.....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 14. Warp Flute
    'item_14': [
      "....GGGGGG......",
      "...GG....GG.....",
      "...GG..G..GG....",
      "....GG.G..GG....",
      ".....GGGGGG.....",
      ".......GG.......",
      ".......GG.......",
      ".......GG.......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 15. Lens of Truth
    'item_15': [
      ".....GGGGGG.....",
      "...GGIIIIIIGG...",
      "..GGIIRRRRIIGG..",
      "..GGIIRRRRIIGG..",
      "...GGIIIIIIGG...",
      ".....GGGGGG.....",
      ".......NN.......",
      "......NN........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 16. Invisibility Cape
    'item_16': [
      "......PPPP......",
      ".....PPWWPP.....",
      "....PPPPPPPP....",
      "...PPPP..PPPP...",
      "..PPPP....PPPP..",
      ".PPPP......PPPP.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 17. Magnetic Glove
    'item_17': [
      "...RR......BB...",
      "...RR......BB...",
      "...RR......BB...",
      "...RRRRRRRRRR...",
      "....RRRRRRRR....",
      ".....RRRRRR.....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 18. Grappling Whip
    'item_18': [
      ".....NNNN.......",
      "....NN..NN......",
      "....NN...NN.....",
      ".....NNNNNN.....",
      "........NN......",
      "........NN......",
      "........NN......",
      "........SS......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 19. Gust Jar
    'item_19': [
      ".......GG.......",
      "......GGGG......",
      ".....GGIIGG.....",
      "....GGIIIIGG....",
      "....GGIIIIGG....",
      ".....GGGGGG.....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 20. Thunder Medallion
    'item_20': [
      ".....GGGGGG.....",
      "...GGGGGGGGGG...",
      "..GGGGGGGGGGGG..",
      "..GGGGGGWGGGGG..",
      "..GGGGGWGGGGGG..",
      "...GGGGGGGGGG...",
      ".....GGGGGG.....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 21. Quake Boots
    'item_21': [
      "......DDDD......",
      ".....DDDDDD.....",
      ".....DDDDDD.....",
      ".....DD..DD.....",
      "....DD....DD....",
      "...DDDD..DDDD...",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 22. Ether Mirror
    'item_22': [
      ".....SGGGGS.....",
      "....SGIIIIIG....",
      "...SGIIWWIIIG...",
      "...SGIIWWIIIG...",
      "....SGIIIIIG....",
      ".....SGGGGS.....",
      ".......SS.......",
      ".......SS.......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 23. Trick Slingshot
    'item_23': [
      "...N........N...",
      "....N......N....",
      ".....N....N.....",
      "......NNNN......",
      ".......NN.......",
      ".......NN.......",
      ".......NN.......",
      ".......NN.......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 24. Elixir Flask
    'item_24': [
      ".......SS.......",
      "......SSSS......",
      ".....EEEEEE.....",
      "....EEEEEEEE....",
      "....EEWWEEEE....",
      "....EEEEEEEE....",
      ".....EEEEEE.....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ],
    // 25. Relic Radar
    'item_25': [
      ".....GGGGGG.....",
      "...GG......GG...",
      "..GG..GGGG..GG..",
      "..GG..GRRG..GG..",
      "...GG......GG...",
      ".....GGGGGG.....",
      ".......NN.......",
      ".......NN.......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  };

  for (let i = 1; i <= 25; i++) {
    const key = `item_${i}`;
    if (itemMatrices[key]) {
      Sprites[key] = createPixelSprite(itemMatrices[key], itemPalette, 2);
    }
  }
}
