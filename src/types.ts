// Game Constants and Types

export const TILE_SIZE = 32; // 32x32 pixels per tile
export const ROOM_COLS = 32; // 32 tiles wide
export const ROOM_ROWS = 22; // 22 tiles high
export const CANVAS_WIDTH = ROOM_COLS * TILE_SIZE; // 1024 px
export const CANVAS_HEIGHT = ROOM_ROWS * TILE_SIZE; // 704 px

export const WORLD_GRID_SIZE = 64; // 64x64 grid of rooms

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
