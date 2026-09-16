import { Player, ITEM_LIST } from './entities/player';
import { WorldMap, RoomData, TileType, RoomType } from './world/worldMap';
import { Enemy, EnemyType } from './entities/enemy';
import { Sprites, initSprites } from './graphics/spriteGenerator';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, ROOM_COLS, ROOM_ROWS } from './types';

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  isEnemy: boolean;
  damage: number;
  color: string;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private worldMap: WorldMap;
  private player: Player;
  private currentRoom: RoomData;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];

  // Controls
  private keys: Record<string, boolean> = {};
  private showInventory: boolean = false;
  private activeMessage: string = '';
  private messageTimer: number = 0;

  private lastTime: number = 0;

  constructor() {
    initSprites();

    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.worldMap = new WorldMap(1337);
    this.player = new Player(15 * TILE_SIZE, 10 * TILE_SIZE);

    // Start at Sanctuary (32, 32)
    this.currentRoom = this.worldMap.getRoom(32, 32);

    this.setupInputs();
    this.spawnRoomEnemies();

    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const maxW = window.innerWidth - 20;
    const maxH = window.innerHeight - 60;
    const scale = Math.min(maxW / CANVAS_WIDTH, maxH / CANVAS_HEIGHT, 1.2);
    this.canvas.style.width = `${Math.floor(CANVAS_WIDTH * scale)}px`;
    this.canvas.style.height = `${Math.floor(CANVAS_HEIGHT * scale)}px`;
  }

  private setupInputs(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      // Single trigger keys
      if (e.key.toLowerCase() === 'i') {
        this.showInventory = !this.showInventory;
      } else if (e.key === 'f5') {
        e.preventDefault();
        this.saveState(1);
      } else if (e.key === 'f9') {
        e.preventDefault();
        this.loadState(1);
      } else if (e.key.toLowerCase() === 'q') {
        this.player.prevItem();
      } else if (e.key.toLowerCase() === 'e') {
        this.player.nextItem();
      } else if (e.key.toLowerCase() === 'j' || e.key === ' ') {
        this.playerAttack();
      } else if (e.key.toLowerCase() === 'k') {
        this.useActiveItem();
      } else if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key) - 1;
        if (num < ITEM_LIST.length) {
          this.player.selectedItemIndex = num;
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  private spawnRoomEnemies(): void {
    this.enemies = [];
    if (!this.currentRoom.hasEnemies || this.currentRoom.isCampCleared) return;

    const count = this.currentRoom.roomType === RoomType.CAMP ? 8 : 4;
    const enemyTypes = [EnemyType.SLIME, EnemyType.BAT, EnemyType.SKELETON, EnemyType.ARCHER];
    if (this.currentRoom.roomType === RoomType.CAMP) {
      enemyTypes.push(EnemyType.BOSS);
    }

    for (let i = 0; i < count; i++) {
      const ex = (Math.floor(Math.random() * (ROOM_COLS - 6)) + 3) * TILE_SIZE;
      const ey = (Math.floor(Math.random() * (ROOM_ROWS - 6)) + 3) * TILE_SIZE;
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      this.enemies.push(new Enemy(ex, ey, type, this.player.points));
    }

    if (this.currentRoom.roomType === RoomType.CAMP && this.enemies.length > 0) {
      this.worldMap.setCampGatesLocked(this.currentRoom, true);
      this.showMessage('Enemy Camp Locked! Vanquish all foes to unseal gates.');
    }
  }

  public start(): void {
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  private loop(currentTime: number): void {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.showInventory) {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame((time) => this.loop(time));
  }

  private update(dt: number): void {
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
    }

    // Player Movement
    let dx = 0;
    let dy = 0;

    if (this.keys['w'] || this.keys['arrowup']) { dy -= 1; this.player.direction = 'up'; }
    if (this.keys['s'] || this.keys['arrowdown']) { dy += 1; this.player.direction = 'down'; }
    if (this.keys['a'] || this.keys['arrowleft']) { dx -= 1; this.player.direction = 'left'; }
    if (this.keys['d'] || this.keys['arrowright']) { dx += 1; this.player.direction = 'right'; }

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    const newX = this.player.x + dx * this.player.speed * dt;
    const newY = this.player.y + dy * this.player.speed * dt;

    // Tile Collision check
    if (!this.checkTileCollision(newX, this.player.y)) {
      this.player.x = newX;
    }
    if (!this.checkTileCollision(this.player.x, newY)) {
      this.player.y = newY;
    }

    this.player.update(dt);

    // Screen Room Transitions
    if (this.player.x < 0 && this.currentRoom.doors.west) {
      this.changeRoom(this.currentRoom.gridX - 1, this.currentRoom.gridY, (ROOM_COLS - 2) * TILE_SIZE, this.player.y);
    } else if (this.player.x > (ROOM_COLS - 1) * TILE_SIZE && this.currentRoom.doors.east) {
      this.changeRoom(this.currentRoom.gridX + 1, this.currentRoom.gridY, TILE_SIZE, this.player.y);
    } else if (this.player.y < 0 && this.currentRoom.doors.north) {
      this.changeRoom(this.currentRoom.gridX, this.currentRoom.gridY - 1, this.player.x, (ROOM_ROWS - 2) * TILE_SIZE);
    } else if (this.player.y > (ROOM_ROWS - 1) * TILE_SIZE && this.currentRoom.doors.south) {
      this.changeRoom(this.currentRoom.gridX, this.currentRoom.gridY + 1, this.player.x, TILE_SIZE);
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, this.player.x, this.player.y);

      // Check collision with player
      const pr = this.player.getRect();
      const er = e.getRect();
      if (pr.x < er.x + er.w && pr.x + pr.w > er.x && pr.y < er.y + er.h && pr.y + pr.h > er.y) {
        this.player.takeDamage(e.damage);
      }
    }

    // Check if Camp is Cleared
    if (this.currentRoom.roomType === RoomType.CAMP && !this.currentRoom.isCampCleared && this.enemies.length === 0) {
      this.currentRoom.isCampCleared = true;
      this.worldMap.setCampGatesLocked(this.currentRoom, false);
      this.player.points += 1500;
      this.player.bombCredits += 5;
      this.showMessage('Camp Cleared! Gates Unsealed (+1500 Pts, +5 Bomb Credits)');
    }

    // Interaction with Lore Signs & Chests
    this.checkInteractions();

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Hit enemies
      if (!p.isEnemy) {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          const er = e.getRect();
          if (p.x >= er.x && p.x <= er.x + er.w && p.y >= er.y && p.y <= er.y + er.h) {
            const killed = e.takeDamage(p.damage);
            if (killed) {
              this.enemies.splice(j, 1);
              this.player.points += 200 * e.tier;
            }
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  private checkTileCollision(x: number, y: number): boolean {
    const margin = 6;
    const points = [
      { x: x + margin, y: y + margin },
      { x: x + TILE_SIZE - margin, y: y + margin },
      { x: x + margin, y: y + TILE_SIZE - margin },
      { x: x + TILE_SIZE - margin, y: y + TILE_SIZE - margin }
    ];

    for (const p of points) {
      const c = Math.floor(p.x / TILE_SIZE);
      const r = Math.floor(p.y / TILE_SIZE);

      if (r < 0 || r >= ROOM_ROWS || c < 0 || c >= ROOM_COLS) return true;

      const tile = this.currentRoom.tiles[r][c];
      if (tile === TileType.WALL || tile === TileType.GATE) {
        return true;
      }
      if (tile === TileType.WATER && this.player.selectedItemIndex !== 6) { // Flippers allow water
        return true;
      }
    }

    return false;
  }

  private changeRoom(gx: number, gy: number, px: number, py: number): void {
    this.currentRoom = this.worldMap.getRoom(gx, gy);
    this.player.x = px;
    this.player.y = py;
    this.projectiles = [];
    this.spawnRoomEnemies();
  }

  private playerAttack(): void {
    if (this.player.isAttacking) return;
    this.player.isAttacking = true;
    this.player.attackTimer = 0.25;

    // Calculate attack hitbox
    let ax = this.player.x;
    let ay = this.player.y;
    const reach = 40;

    if (this.player.direction === 'up') ay -= reach;
    if (this.player.direction === 'down') ay += reach;
    if (this.player.direction === 'left') ax -= reach;
    if (this.player.direction === 'right') ax += reach;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const er = e.getRect();
      if (ax < er.x + er.w && ax + TILE_SIZE > er.x && ay < er.y + er.h && ay + TILE_SIZE > er.y) {
        const killed = e.takeDamage(this.player.swordPower);
        if (killed) {
          this.enemies.splice(i, 1);
          this.player.points += 250 * e.tier;
        }
      }
    }
  }

  private useActiveItem(): void {
    const item = this.player.getSelectedItem();
    if (this.player.itemCooldown > 0) return;
    this.player.itemCooldown = 0.4;

    let vx = 0;
    let vy = 0;
    const speed = 400;
    if (this.player.direction === 'up') vy = -speed;
    if (this.player.direction === 'down') vy = speed;
    if (this.player.direction === 'left') vx = -speed;
    if (this.player.direction === 'right') vx = speed;

    switch (item.id) {
      case 2: // Bombs
        if (this.player.bombCredits > 0) {
          this.player.bombCredits--;
          // Clear all nearby enemies
          for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].takeDamage(100);
            if (this.enemies[i].isDead) this.enemies.splice(i, 1);
          }
          this.showMessage('BOMB DETONATED! Screen cleared!');
        } else {
          this.showMessage('Out of bomb credits! Clear enemy camps to earn more.');
        }
        break;
      case 14: // Warp Flute
        this.changeRoom(32, 32, 15 * TILE_SIZE, 10 * TILE_SIZE);
        this.showMessage('Warped back to Sanctuary (32, 32)!');
        break;
      case 24: // Elixir Flask
        this.player.heal(10);
        this.showMessage('Elixir Consumed! +10 Hearts restored.');
        break;
      default:
        // Projectile weapons (Bow, Fire Wand, Ice Rod, etc.)
        this.projectiles.push({
          x: this.player.x + 12,
          y: this.player.y + 12,
          vx: vx || speed,
          vy,
          life: 1.2,
          isEnemy: false,
          damage: 40,
          color: item.id === 9 ? '#ef4444' : item.id === 10 ? '#38bdf8' : '#facc15'
        });
        break;
    }
  }

  private checkInteractions(): void {
    const tileC = Math.floor((this.player.x + 16) / TILE_SIZE);
    const tileR = Math.floor((this.player.y + 16) / TILE_SIZE);

    // Lore Signs
    for (const sign of this.currentRoom.loreSigns) {
      if (Math.abs(sign.x - tileC) <= 1 && Math.abs(sign.y - tileR) <= 1) {
        if (!sign.read) {
          sign.read = true;
          this.player.points += 250;
        }
        this.showMessage(`LORE: "${sign.text}"`);
      }
    }

    // Relic Chests
    for (const chest of this.currentRoom.relics) {
      if (!chest.opened && Math.abs(chest.x - tileC) <= 1 && Math.abs(chest.y - tileR) <= 1) {
        chest.opened = true;
        this.player.points += chest.points;
        this.currentRoom.tiles[chest.y][chest.x] = TileType.DIRT;
        this.showMessage(`ANCIENT RELIC DISCOVERED! (+${chest.points} Points)`);
      }
    }
  }

  private showMessage(msg: string): void {
    this.activeMessage = msg;
    this.messageTimer = 3.5;
  }

  private saveState(slot: number = 1): void {
    const data = {
      player: {
        x: this.player.x,
        y: this.player.y,
        currentHearts: this.player.currentHearts,
        points: this.player.points,
        bombCredits: this.player.bombCredits,
        selectedItemIndex: this.player.selectedItemIndex
      },
      room: {
        gridX: this.currentRoom.gridX,
        gridY: this.currentRoom.gridY
      }
    };
    localStorage.setItem(`feral_save_slot_${slot}`, JSON.stringify(data));
    this.showMessage(`Game Saved to Slot ${slot}!`);
  }

  private loadState(slot: number = 1): void {
    const raw = localStorage.getItem(`feral_save_slot_${slot}`);
    if (!raw) {
      this.showMessage(`No Save Found in Slot ${slot}`);
      return;
    }
    const data = JSON.parse(raw);
    this.player.x = data.player.x;
    this.player.y = data.player.y;
    this.player.currentHearts = data.player.currentHearts;
    this.player.points = data.player.points;
    this.player.bombCredits = data.player.bombCredits;
    this.player.selectedItemIndex = data.player.selectedItemIndex;

    this.changeRoom(data.room.gridX, data.room.gridY, data.player.x, data.player.y);
    this.showMessage(`Game Loaded from Slot ${slot}!`);
  }

  private render(): void {
    // Clear Background
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Render Tiles
    for (let r = 0; r < ROOM_ROWS; r++) {
      for (let c = 0; c < ROOM_COLS; c++) {
        const t = this.currentRoom.tiles[r][c];
        let spriteKey = 'tile_grass';

        if (t === TileType.DIRT) spriteKey = 'tile_dirt';
        else if (t === TileType.WALL) spriteKey = 'tile_wall';
        else if (t === TileType.WATER) spriteKey = 'tile_water';
        else if (t === TileType.TREE) spriteKey = 'tile_tree';
        else if (t === TileType.SIGN) spriteKey = 'tile_sign';
        else if (t === TileType.CHEST) spriteKey = 'tile_chest';
        else if (t === TileType.GATE) spriteKey = 'tile_gate';

        if (Sprites[spriteKey]) {
          this.ctx.drawImage(Sprites[spriteKey], c * TILE_SIZE, r * TILE_SIZE);
        }
      }
    }

    // Render Enemies
    for (const e of this.enemies) {
      const key = `enemy_${e.type}_${e.tier}`;
      if (Sprites[key]) {
        this.ctx.drawImage(Sprites[key], e.x, e.y);
      }
    }

    // Render Player
    const playerKey = `player_${this.player.direction}`;
    if (Sprites[playerKey]) {
      this.ctx.drawImage(Sprites[playerKey], this.player.x, this.player.y - this.player.jumpHeight);
    }

    // Render Projectiles
    for (const p of this.projectiles) {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Render HUD
    this.renderHUD();

    // Render Active Message Banner
    if (this.messageTimer > 0) {
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      this.ctx.fillRect(100, CANVAS_HEIGHT - 70, CANVAS_WIDTH - 200, 40);
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.strokeRect(100, CANVAS_HEIGHT - 70, CANVAS_WIDTH - 200, 40);

      this.ctx.fillStyle = '#f8fafc';
      this.ctx.font = '14px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.activeMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 45);
    }

    // Render Inventory Overlay
    if (this.showInventory) {
      this.renderInventoryMenu();
    }
  }

  private renderHUD(): void {
    // HUD Top Bar Container
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, 48);
    this.ctx.strokeStyle = '#334155';
    this.ctx.strokeRect(0, 0, CANVAS_WIDTH, 48);

    // Hearts (20 Max)
    const hearts = Math.ceil(this.player.currentHearts);
    for (let i = 0; i < 20; i++) {
      const hx = 12 + (i % 10) * 18;
      const hy = i < 10 ? 8 : 26;
      this.ctx.fillStyle = i < hearts ? '#ef4444' : '#475569';
      this.ctx.fillRect(hx, hy, 14, 14);
    }

    // Active Item
    const item = this.player.getSelectedItem();
    const itemSprite = Sprites[`item_${item.id}`];
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(220, 6, 36, 36);
    this.ctx.strokeStyle = '#facc15';
    this.ctx.strokeRect(220, 6, 36, 36);
    if (itemSprite) {
      this.ctx.drawImage(itemSprite, 222, 8);
    }

    // Info Stats
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Item [K]: ${item.name}`, 265, 20);
    this.ctx.fillText(`Bombs: ${this.player.bombCredits}`, 265, 36);

    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Points: ${this.player.points}`, CANVAS_WIDTH - 15, 20);
    this.ctx.fillText(`Room: (${this.currentRoom.gridX}, ${this.currentRoom.gridY})`, CANVAS_WIDTH - 15, 36);
  }

  private renderInventoryMenu(): void {
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    this.ctx.fillRect(100, 80, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 160);
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(100, 80, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 160);

    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = '20px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('25 TRAVERSAL ITEMS INVENTORY', CANVAS_WIDTH / 2, 120);

    // 5x5 Grid of Items
    const startX = 160;
    const startY = 150;
    const cellSize = 54;

    for (let i = 0; i < ITEM_LIST.length; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const cx = startX + col * (cellSize + 20);
      const cy = startY + row * (cellSize + 15);

      const isSelected = i === this.player.selectedItemIndex;

      this.ctx.fillStyle = isSelected ? '#3b82f6' : '#1e293b';
      this.ctx.fillRect(cx, cy, cellSize, cellSize);
      this.ctx.strokeStyle = isSelected ? '#facc15' : '#475569';
      this.ctx.lineWidth = isSelected ? 3 : 1;
      this.ctx.strokeRect(cx, cy, cellSize, cellSize);

      const sprite = Sprites[`item_${i + 1}`];
      if (sprite) {
        this.ctx.drawImage(sprite, cx + 11, cy + 11);
      }

      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${i + 1}`, cx + 8, cy + 12);
    }

    // Selected item detail text
    const active = this.player.getSelectedItem();
    this.ctx.fillStyle = '#facc15';
    this.ctx.font = '16px monospace';
    this.ctx.fillText(`${active.id}. ${active.name}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120);

    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(active.description, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);

    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Press [I] to Close Inventory | [1-9] or [Q/E] to Select Item', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 160);
  }
}

// Start Game
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.start();
});
