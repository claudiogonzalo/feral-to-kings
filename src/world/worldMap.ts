import { ROOM_COLS, ROOM_ROWS, WORLD_GRID_SIZE } from '../types';

export enum TileType {
  GRASS = 0,
  DIRT = 1,
  WALL = 2,
  WATER = 3,
  TREE = 4,
  SIGN = 5,
  CHEST = 6,
  GATE = 7
}

export enum RoomType {
  SANCTUARY = 0,
  WILDERNESS = 1,
  CAMP = 2,
  RELIC_CHAMBER = 3,
  FALLEN_KINGDOM = 4
}

export interface LoreSign {
  x: number; // Tile x inside room
  y: number; // Tile y inside room
  text: string;
  read: boolean;
}

export interface RelicChest {
  x: number;
  y: number;
  opened: boolean;
  points: number;
}

export interface RoomData {
  gridX: number; // 0..63
  gridY: number; // 0..63
  roomType: RoomType;
  tiles: TileType[][]; // [row 0..21][col 0..31]
  isCampCleared: boolean;
  hasEnemies: boolean;
  loreSigns: LoreSign[];
  relics: RelicChest[];
  doors: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  };
}

// Lore text array depicting the fallen kingdom narrative
const FALLEN_KINGDOM_LORE = [
  "Here stood the Silver Citadel of Aethelgard, before the Great Corruption fell.",
  "The King's 25 sacred relics were sealed away when the dark beasts swarmed the gates.",
  "Legend speaks of a Champion carrying the Golden Armor and Astral Blade who shall cleanse the land.",
  "Beware the Shadow Curses: as your prowess rises beyond 5000 points, the fallen horde grows fiercer.",
  "To unseal the camp gates, vanquish every dark creature occupying the quadrant.",
  "The Ancient Flute resonates with sanctuary light; play it to warp back when cornered.",
  "Deep in the eastern swamps, the Mirror of Ether reveals pathways lost to time.",
  "The Kingdom fell not by sword, but by avarice. Seek the 25 items to restore balance."
];

// Simple Seeded Random for Deterministic World Generation
function pseudoRandom(seed: number) {
  let value = seed;
  return function() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export class WorldMap {
  public rooms: Map<string, RoomData> = new Map();
  private seed: number;

  constructor(seed: number = 1337) {
    this.seed = seed;
  }

  public getRoomKey(gx: number, gy: number): string {
    return `${gx},${gy}`;
  }

  public getRoom(gx: number, gy: number): RoomData {
    // Keep within world bounds
    const clampedX = Math.max(0, Math.min(WORLD_GRID_SIZE - 1, gx));
    const clampedY = Math.max(0, Math.min(WORLD_GRID_SIZE - 1, gy));
    const key = this.getRoomKey(clampedX, clampedY);

    if (!this.rooms.has(key)) {
      const room = this.generateRoom(clampedX, clampedY);
      this.rooms.set(key, room);
    }

    return this.rooms.get(key)!;
  }

  private generateRoom(gx: number, gy: number): RoomData {
    const rng = pseudoRandom(this.seed + gx * 1000 + gy);

    // Determine Room Type
    let roomType = RoomType.WILDERNESS;
    if (gx === 32 && gy === 32) {
      roomType = RoomType.SANCTUARY; // Starting point
    } else {
      const rVal = rng();
      if (rVal < 0.25) {
        roomType = RoomType.CAMP;
      } else if (rVal < 0.40) {
        roomType = RoomType.RELIC_CHAMBER;
      } else if (rVal < 0.55) {
        roomType = RoomType.FALLEN_KINGDOM;
      }
    }

    // Initialize tile grid
    const tiles: TileType[][] = [];
    const defaultFloor = roomType === RoomType.FALLEN_KINGDOM ? TileType.DIRT : TileType.GRASS;

    for (let r = 0; r < ROOM_ROWS; r++) {
      tiles[r] = [];
      for (let c = 0; c < ROOM_COLS; c++) {
        // Outer border walls
        if (r === 0 || r === ROOM_ROWS - 1 || c === 0 || c === ROOM_COLS - 1) {
          tiles[r][c] = TileType.WALL;
        } else {
          tiles[r][c] = defaultFloor;
        }
      }
    }

    // Door Openings in Wall Borders (3 tiles wide in the center of each wall)
    const midX = Math.floor(ROOM_COLS / 2);
    const midY = Math.floor(ROOM_ROWS / 2);

    const hasNorth = gy > 0;
    const hasSouth = gy < WORLD_GRID_SIZE - 1;
    const hasWest = gx > 0;
    const hasEast = gx < WORLD_GRID_SIZE - 1;

    if (hasNorth) {
      tiles[0][midX - 1] = defaultFloor;
      tiles[0][midX] = defaultFloor;
      tiles[0][midX + 1] = defaultFloor;
    }
    if (hasSouth) {
      tiles[ROOM_ROWS - 1][midX - 1] = defaultFloor;
      tiles[ROOM_ROWS - 1][midX] = defaultFloor;
      tiles[ROOM_ROWS - 1][midX + 1] = defaultFloor;
    }
    if (hasWest) {
      tiles[midY - 1][0] = defaultFloor;
      tiles[midY][0] = defaultFloor;
      tiles[midY + 1][0] = defaultFloor;
    }
    if (hasEast) {
      tiles[midY - 1][ROOM_COLS - 1] = defaultFloor;
      tiles[midY][ROOM_COLS - 1] = defaultFloor;
      tiles[midY + 1][ROOM_COLS - 1] = defaultFloor;
    }

    // Add Internal Obstacles based on Room Type
    const loreSigns: LoreSign[] = [];
    const relics: RelicChest[] = [];

    if (roomType === RoomType.WILDERNESS) {
      // Scatter trees and rocks
      const count = Math.floor(rng() * 15) + 10;
      for (let i = 0; i < count; i++) {
        const tr = Math.floor(rng() * (ROOM_ROWS - 4)) + 2;
        const tc = Math.floor(rng() * (ROOM_COLS - 4)) + 2;
        if (tiles[tr][tc] === defaultFloor) {
          tiles[tr][tc] = rng() < 0.6 ? TileType.TREE : TileType.WATER;
        }
      }
    } else if (roomType === RoomType.FALLEN_KINGDOM) {
      // Ruined stone structures & Lore Sign
      for (let r = 4; r < 8; r++) {
        for (let c = 6; c < 12; c++) {
          if (r === 4 || r === 7 || c === 6 || c === 11) {
            tiles[r][c] = TileType.WALL;
          }
        }
      }
      // Place Lore Sign
      const signText = FALLEN_KINGDOM_LORE[Math.floor(rng() * FALLEN_KINGDOM_LORE.length)];
      tiles[10][midX] = TileType.SIGN;
      loreSigns.push({ x: midX, y: 10, text: signText, read: false });
    } else if (roomType === RoomType.RELIC_CHAMBER) {
      // Water moat around central relic chest
      for (let r = 8; r <= 14; r++) {
        for (let c = 12; c <= 20; c++) {
          if (r === 8 || r === 14 || c === 12 || c === 20) {
            tiles[r][c] = TileType.WATER;
          }
        }
      }
      // Bridge over moat
      tiles[14][midX] = TileType.DIRT;
      tiles[midY][midX] = TileType.CHEST;
      relics.push({ x: midX, y: midY, opened: false, points: 1000 });
    } else if (roomType === RoomType.CAMP) {
      // Enemy camp structure
      for (let r = 5; r <= 17; r += 6) {
        for (let c = 8; c <= 24; c += 8) {
          tiles[r][c] = TileType.WALL;
        }
      }
    }

    return {
      gridX: gx,
      gridY: gy,
      roomType,
      tiles,
      isCampCleared: roomType !== RoomType.CAMP,
      hasEnemies: roomType === RoomType.CAMP || roomType === RoomType.WILDERNESS || roomType === RoomType.FALLEN_KINGDOM,
      loreSigns,
      relics,
      doors: {
        north: hasNorth,
        south: hasSouth,
        east: hasEast,
        west: hasWest
      }
    };
  }

  // Lock camp doors when player enters an uncleared camp room
  public setCampGatesLocked(room: RoomData, locked: boolean): void {
    const midX = Math.floor(ROOM_COLS / 2);
    const midY = Math.floor(ROOM_ROWS / 2);
    const gateType = locked ? TileType.GATE : (room.roomType === RoomType.FALLEN_KINGDOM ? TileType.DIRT : TileType.GRASS);

    if (room.doors.north) {
      room.tiles[0][midX - 1] = gateType;
      room.tiles[0][midX] = gateType;
      room.tiles[0][midX + 1] = gateType;
    }
    if (room.doors.south) {
      room.tiles[ROOM_ROWS - 1][midX - 1] = gateType;
      room.tiles[ROOM_ROWS - 1][midX] = gateType;
      room.tiles[ROOM_ROWS - 1][midX + 1] = gateType;
    }
    if (room.doors.west) {
      room.tiles[midY - 1][0] = gateType;
      room.tiles[midY][0] = gateType;
      room.tiles[midY + 1][0] = gateType;
    }
    if (room.doors.east) {
      room.tiles[midY - 1][ROOM_COLS - 1] = gateType;
      room.tiles[midY][ROOM_COLS - 1] = gateType;
      room.tiles[midY + 1][ROOM_COLS - 1] = gateType;
    }
  }
}
