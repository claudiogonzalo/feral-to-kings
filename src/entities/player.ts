import { Direction, Rect } from '../types';

export interface ItemDef {
  id: number;
  name: string;
  description: string;
}

export const ITEM_LIST: ItemDef[] = [
  { id: 1, name: 'Hookshot', description: 'Pulls across gaps and stuns distant enemies.' },
  { id: 2, name: 'Bombs', description: 'Destroys cracked walls, camp barricades & clears clusters.' },
  { id: 3, name: 'Bow & Arrows', description: 'Fires fast long-range arrows across the room.' },
  { id: 4, name: 'Boomerang', description: 'Curves through enemies and retrieves far items.' },
  { id: 5, name: 'Pegasus Boots', description: 'High-speed charging dash that crushes obstacles.' },
  { id: 6, name: 'Lantern', description: 'Emits a fiery burst around player.' },
  { id: 7, name: 'Flippers', description: 'Allows swimming across deep water without drowning.' },
  { id: 8, name: 'Megaton Hammer', description: 'Smashes ground stakes and stuns all nearby enemies.' },
  { id: 9, name: 'Fire Wand', description: 'Launches bouncing fireballs across the screen.' },
  { id: 10, name: 'Ice Rod', description: 'Shoots freezing ice beams that immobilize targets.' },
  { id: 11, name: 'Roc Feather / Cape', description: 'Leaps over pit chasms and water channels.' },
  { id: 12, name: 'Power Bracelet', description: 'Lifts and hurls stone boulders.' },
  { id: 13, name: 'Shovel', description: 'Digs soft soil for hidden score relics and credits.' },
  { id: 14, name: 'Warp Flute', description: 'Plays ancient melody to teleport back to Sanctuary (32,32).' },
  { id: 15, name: 'Lens of Truth', description: 'Reveals hidden traps, secrets, and enemy weak points.' },
  { id: 16, name: 'Invisibility Cape', description: 'Grants temporary invincibility and stealth.' },
  { id: 17, name: 'Magnetic Glove', description: 'Attracts items and pulls player toward iron posts.' },
  { id: 18, name: 'Grappling Whip', description: 'Swings across wide gaps and disarms enemies.' },
  { id: 19, name: 'Gust Jar', description: 'Creates a wind vacuum pushing away enemies.' },
  { id: 20, name: 'Thunder Medallion', description: 'Calls down lightning striking all room enemies.' },
  { id: 21, name: 'Quake Boots', description: 'Causes ground earthquakes knocking down enemies.' },
  { id: 22, name: 'Ether Mirror', description: 'Phases out enemy attacks briefly.' },
  { id: 23, name: 'Trick Slingshot', description: 'Fires 3-way scatter seed shot.' },
  { id: 24, name: 'Elixir Flask', description: 'Restores health instantly.' },
  { id: 25, name: 'Relic Radar', description: 'Scans room for uncollected relics and lore signs.' }
];

export class Player {
  public x: number;
  public y: number;
  public speed: number = 220; // Pixels per sec
  public direction: Direction = 'down';

  // Stats
  public maxHearts: number = 20;
  public currentHearts: number = 20;
  public swordPower: number = 50; // Astral Blade (Best Sword)
  public armorDefense: number = 0.5; // Golden Armor (50% damage reduction)
  public points: number = 0;
  public bombCredits: number = 10;

  // Active Selected Item (1 to 25)
  public selectedItemIndex: number = 0;

  // Action states
  public isAttacking: boolean = false;
  public attackTimer: number = 0;
  public invulnerableTimer: number = 0;
  public itemCooldown: number = 0;
  public isDashing: boolean = false;
  public isJumping: boolean = false;
  public jumpHeight: number = 0;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
  }

  public getRect(): Rect {
    return {
      x: this.x + 4,
      y: this.y + 8,
      w: 24,
      h: 24
    };
  }

  public update(dt: number): void {
    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    if (this.itemCooldown > 0) {
      this.itemCooldown -= dt;
    }

    if (this.isJumping) {
      this.jumpHeight += 300 * dt;
      if (this.jumpHeight > 30) {
        this.isJumping = false;
        this.jumpHeight = 0;
      }
    }
  }

  public takeDamage(amount: number): void {
    if (this.invulnerableTimer > 0) return;
    const finalDamage = Math.max(0.5, amount * this.armorDefense);
    this.currentHearts = Math.max(0, this.currentHearts - finalDamage);
    this.invulnerableTimer = 1.0; // 1 sec invulnerability
  }

  public heal(amount: number): void {
    this.currentHearts = Math.min(this.maxHearts, this.currentHearts + amount);
  }

  public getSelectedItem(): ItemDef {
    return ITEM_LIST[this.selectedItemIndex];
  }

  public nextItem(): void {
    this.selectedItemIndex = (this.selectedItemIndex + 1) % ITEM_LIST.length;
  }

  public prevItem(): void {
    this.selectedItemIndex = (this.selectedItemIndex - 1 + ITEM_LIST.length) % ITEM_LIST.length;
  }
}
