import { Direction, Rect, TILE_SIZE } from '../types';

export enum EnemyType {
  SLIME = 'slime',
  BAT = 'bat',
  SKELETON = 'skeleton',
  ARCHER = 'archer',
  BOSS = 'boss'
}

export class Enemy {
  public x: number;
  public y: number;
  public type: EnemyType;
  public tier: number = 1; // 1, 2, or 3 based on secret point counter scaling
  public hp: number;
  public maxHp: number;
  public speed: number;
  public damage: number;
  public direction: Direction = 'down';
  public isDead: boolean = false;

  private moveTimer: number = 0;
  private shootTimer: number = 0;

  constructor(x: number, y: number, type: EnemyType, points: number) {
    this.x = x;
    this.y = y;
    this.type = type;

    // Calculate scaling tier based on secret point counter:
    // Starts scaling after 5000 points, increasing every 1000 points
    if (points >= 7000) {
      this.tier = 3;
    } else if (points >= 5000) {
      this.tier = 2;
    } else {
      this.tier = 1;
    }

    const tierMult = 1 + (this.tier - 1) * 0.5; // +50% HP/Dmg per tier

    switch (type) {
      case EnemyType.SLIME:
        this.maxHp = Math.floor(30 * tierMult);
        this.speed = 60 * tierMult;
        this.damage = 1 * tierMult;
        break;
      case EnemyType.BAT:
        this.maxHp = Math.floor(20 * tierMult);
        this.speed = 110 * tierMult;
        this.damage = 1 * tierMult;
        break;
      case EnemyType.SKELETON:
        this.maxHp = Math.floor(50 * tierMult);
        this.speed = 80 * tierMult;
        this.damage = 2 * tierMult;
        break;
      case EnemyType.ARCHER:
        this.maxHp = Math.floor(40 * tierMult);
        this.speed = 70 * tierMult;
        this.damage = 1.5 * tierMult;
        break;
      case EnemyType.BOSS:
        this.maxHp = Math.floor(200 * tierMult);
        this.speed = 50 * tierMult;
        this.damage = 3 * tierMult;
        break;
    }

    this.hp = this.maxHp;
  }

  public getRect(): Rect {
    return {
      x: this.x + 4,
      y: this.y + 4,
      w: TILE_SIZE - 8,
      h: TILE_SIZE - 8
    };
  }

  public update(dt: number, playerX: number, playerY: number): void {
    if (this.isDead) return;

    this.moveTimer -= dt;
    this.shootTimer -= dt;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // AI Behavior by Type
    if (this.type === EnemyType.BAT) {
      // Fast erratic chase
      if (dist < 300 && dist > 10) {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      }
    } else if (this.type === EnemyType.SLIME || this.type === EnemyType.SKELETON) {
      // Direct chase if player is close, else wander
      if (dist < 200 && dist > 10) {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      } else if (this.moveTimer <= 0) {
        this.moveTimer = 1.5 + Math.random();
        const dirs: Direction[] = ['up', 'down', 'left', 'right'];
        this.direction = dirs[Math.floor(Math.random() * dirs.length)];
      }
    } else if (this.type === EnemyType.ARCHER || this.type === EnemyType.BOSS) {
      // Keep distance and face player
      if (dist < 250 && dist > 120) {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      }
    }
  }

  public takeDamage(amount: number): boolean {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.isDead = true;
      return true; // Killed
    }
    return false;
  }
}
