/*
 * ============================================================
 *  Super Gnarp — Phaser 3 Mario-Style Platformer
 * ============================================================
 *
 * HOW TO REPLACE GNARP SPRITE:
 *   Place a spritesheet at:  public/assets/gnarp-sprite.png
 *   Update SPRITE_CONFIG below (frameWidth/frameHeight)
 *   Change `this.gnarpDrawn = true;` to `false;` to use the real sprite
 *
 * LEVEL DESIGN:
 *   Each level is a JSON object in LEVELS array.
 *   platforms = [{x, y, w}], enemies = [{x, y, type}], tokens = [{x, y}]
 * ============================================================
 */

import Phaser from "phaser";

/* ---- Config ---- */
const W = 800;
const H = 450;
const GRAVITY = 900;
const JUMP_VEL = -520;
const DOUBLE_JUMP_VEL = -440;
const RUN_VEL = 260;
const TOKEN_SCORE = 50;
const ENEMY_SCORE = 100;

/* ---- Level Data ---- */
interface PlatformData { x: number; y: number; w: number; color?: number }
interface EnemyData { x: number; y: number; type: "keyboard" | "boss" | "coffee" }
interface TokenData { x: number; y: number }
interface LevelData {
  name: string;
  bg: number;
  platforms: PlatformData[];
  enemies: EnemyData[];
  tokens: TokenData[];
  flagX: number;
}

const LEVELS: LevelData[] = [
  {
    name: "办公室地狱",
    bg: 0x0a0e1e,
    flagX: 2700,
    platforms: [
      { x: 0, y: H - 40, w: 3000 },
      { x: 250, y: 340, w: 140 },
      { x: 450, y: 280, w: 100 },
      { x: 620, y: 230, w: 120 },
      { x: 800, y: 310, w: 100 },
      { x: 960, y: 260, w: 130 },
      { x: 1150, y: 200, w: 150 },
      { x: 1350, y: 310, w: 120 },
      { x: 1500, y: 230, w: 110 },
      { x: 1700, y: 170, w: 140 },
      { x: 1900, y: 280, w: 100 },
      { x: 2100, y: 220, w: 130 },
      { x: 2300, y: 300, w: 120 },
      { x: 2500, y: 240, w: 150 },
    ],
    tokens: [
      ...[300, 480, 660, 840, 1000, 1180, 1380, 1530, 1740].map((x, i) => ({ x, y: 200 - (i % 3) * 20 })),
      ...[1900, 2000, 2100, 2200, 2350, 2550].map(x => ({ x, y: 300 })),
    ],
    enemies: [
      { x: 400, y: H - 90, type: "keyboard" },
      { x: 700, y: H - 90, type: "coffee" },
      { x: 1100, y: H - 90, type: "keyboard" },
      { x: 1600, y: H - 90, type: "boss" },
      { x: 2000, y: H - 90, type: "keyboard" },
      { x: 2400, y: H - 90, type: "coffee" },
    ],
  },
  {
    name: "太空站",
    bg: 0x050812,
    flagX: 2900,
    platforms: [
      { x: 0, y: H - 40, w: 600 },
      { x: 700, y: 360, w: 120 },
      { x: 900, y: 310, w: 100 },
      { x: 1050, y: H - 40, w: 200 },
      { x: 1300, y: 260, w: 150 },
      { x: 1550, y: 340, w: 120 },
      { x: 1750, y: 280, w: 140 },
      { x: 2000, y: 220, w: 130 },
      { x: 2200, y: H - 40, w: 200 },
      { x: 2500, y: 280, w: 160 },
      { x: 2750, y: H - 40, w: 400, color: 0x1a0a2e },
    ],
    tokens: Array.from({ length: 18 }, (_, i) => ({ x: 600 + i * 130, y: 200 + Math.sin(i) * 80 })),
    enemies: [
      { x: 850, y: H - 90, type: "keyboard" },
      { x: 1450, y: H - 90, type: "boss" },
      { x: 2100, y: H - 90, type: "coffee" },
      { x: 2600, y: 200, type: "keyboard" },
    ],
  },
  {
    name: "月球基地",
    bg: 0x08050f,
    flagX: 2800,
    platforms: [
      { x: 0, y: H - 40, w: 300 },
      { x: 380, y: 340, w: 100 },
      { x: 540, y: 260, w: 120 },
      { x: 720, y: 310, w: 90 },
      { x: 900, y: 210, w: 130 },
      { x: 1100, y: 160, w: 140 },
      { x: 1320, y: 280, w: 100 },
      { x: 1520, y: 200, w: 120 },
      { x: 1750, y: 300, w: 140 },
      { x: 2000, y: 230, w: 120 },
      { x: 2200, y: 350, w: 90 },
      { x: 2400, y: H - 40, w: 700, color: 0x1a0a2e },
    ],
    tokens: Array.from({ length: 22 }, (_, i) => ({ x: 300 + i * 115, y: 150 + Math.sin(i * 0.8) * 70 })),
    enemies: [
      { x: 650, y: H - 90, type: "boss" },
      { x: 1000, y: H - 90, type: "keyboard" },
      { x: 1500, y: H - 90, type: "coffee" },
      { x: 1900, y: H - 90, type: "boss" },
      { x: 2300, y: H - 90, type: "keyboard" },
    ],
  },
];

/* ---- Callbacks for React integration ---- */
export interface GameCallbacks {
  onTokenCollect: (total: number) => void;
  onScoreUpdate: (score: number) => void;
  onLevelComplete: (level: number, tokens: number) => void;
  onGameOver: (score: number, tokens: number) => void;
  onHpUpdate: (hp: number) => void;
}

/* ================================================================
   BOOT SCENE
   ================================================================ */
class BootScene extends Phaser.Scene {
  constructor() { super("Boot"); }
  preload() {
    // NOTE: When you have a real Gnarp spritesheet, uncomment:
    // this.load.spritesheet('gnarp', '/assets/gnarp-sprite.png', { frameWidth: 64, frameHeight: 64 });
    // this.load.audio('bgm', '/assets/bgm.mp3');
    // this.load.audio('jump', '/assets/jump.wav');
    // this.load.audio('coin', '/assets/coin.wav');
  }
  create() { this.scene.start("Game", { level: 0, tokens: 0, score: 0, hp: 3 }); }
}

/* ================================================================
   MAIN GAME SCENE
   ================================================================ */
class GameScene extends Phaser.Scene {
  private gnarp!: Phaser.GameObjects.Graphics & { body?: Phaser.Physics.Arcade.Body };
  private gnarpSprite!: Phaser.Physics.Arcade.Sprite | null;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private tokenGroup!: Phaser.Physics.Arcade.StaticGroup;
  private flag!: Phaser.GameObjects.Graphics;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private jumpKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  private canDoubleJump = true;
  private hasDoubleJumped = false;
  private invincible = false;
  private levelData!: LevelData;
  private levelIdx = 0;
  private score = 0;
  private totalTokens = 0;
  private hp = 3;
  private cb?: GameCallbacks;

  private scoreText!: Phaser.GameObjects.Text;
  private tokenText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private controlsText!: Phaser.GameObjects.Text;

  private enemyDir = new Map<Phaser.GameObjects.GameObject, number>();
  private gnarpGraphics!: Phaser.GameObjects.Graphics;
  private frame = 0;
  private running = false;
  private facingLeft = false;

  // Touch controls
  private touchLeft = false;
  private touchRight = false;
  private touchJump = false;

  constructor() { super("Game"); }

  setCallbacks(cb: GameCallbacks) { this.cb = cb; }

  init(data: { level?: number; tokens?: number; score?: number; hp?: number }) {
    this.levelIdx = data.level ?? 0;
    this.totalTokens = data.tokens ?? 0;
    this.score = data.score ?? 0;
    this.hp = data.hp ?? 3;
    this.levelData = LEVELS[this.levelIdx];
    this.canDoubleJump = true;
    this.hasDoubleJumped = false;
    this.invincible = false;
  }

  create() {
    const level = this.levelData;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.cameras.main.setBackgroundColor(level.bg);
    this.physics.world.setBounds(0, 0, 3200, height);
    this.cameras.main.setBounds(0, 0, 3200, height);

    // Draw space background
    const bg = this.add.graphics();
    bg.setDepth(-10);
    // Stars
    for (let i = 0; i < 200; i++) {
      const sx = Phaser.Math.Between(0, 3200);
      const sy = Phaser.Math.Between(0, height);
      const br = Phaser.Math.FloatBetween(0.2, 0.8);
      bg.fillStyle(0xffffff, br);
      bg.fillCircle(sx, sy, Phaser.Math.FloatBetween(0.5, 1.5));
    }
    // Nebula
    for (let i = 0; i < 8; i++) {
      const nx = Phaser.Math.Between(200, 2800);
      const ny = Phaser.Math.Between(50, height - 100);
      const grad = this.add.graphics().setDepth(-9).setAlpha(0.04);
      grad.fillStyle(0x00e87a, 1);
      grad.fillCircle(nx, ny, Phaser.Math.Between(60, 120));
    }

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    level.platforms.forEach((p) => {
      const pg = this.add.graphics();
      const col = p.color ?? 0x00e87a;
      pg.fillStyle(col, 0.25);
      pg.fillRect(0, 0, p.w, 30);
      pg.lineStyle(1, col, 0.8);
      pg.strokeRect(0, 0, p.w, 30);
      // Glow top edge
      pg.lineStyle(2, col, 0.6);
      pg.lineBetween(0, 0, p.w, 0);
      pg.setPosition(p.x, p.y);

      const rect = this.add.rectangle(p.x + p.w / 2, p.y + 15, p.w, 30, 0x000000, 0);
      this.physics.add.existing(rect, true);
      this.platforms.add(rect);
    });

    // Tokens (collectibles)
    this.tokenGroup = this.physics.add.staticGroup();
    level.tokens.forEach((t) => {
      const tg = this.add.graphics();
      this.drawToken(tg, 0, 0);
      tg.setPosition(t.x, t.y);
      const circle = this.add.circle(t.x, t.y, 12, 0x000000, 0);
      this.physics.add.existing(circle, true);
      this.tokenGroup.add(circle);
      (circle as any).__graphics = tg;
    });

    // Enemies
    this.enemies = this.physics.add.group();
    level.enemies.forEach((e) => {
      const eg = this.add.graphics();
      this.drawEnemy(eg, e.type, 0, 0);
      eg.setPosition(e.x, e.y);
      const box = this.add.rectangle(e.x, e.y + 15, 40, 40, 0x000000, 0);
      this.physics.add.existing(box);
      const body = (box as any).body as Phaser.Physics.Arcade.Body;
      body.setCollideWorldBounds(false);
      body.setVelocityX(80);
      this.enemies.add(box);
      this.enemyDir.set(box, 1);
      (box as any).__graphics = eg;
      (box as any).__type = e.type;
    });

    // Flag
    this.flag = this.add.graphics();
    this.flag.lineStyle(3, 0x00e87a, 1);
    this.flag.lineBetween(0, 0, 0, -80);
    this.flag.fillStyle(0x00e87a, 1);
    this.flag.fillTriangle(0, -80, 30, -65, 0, -50);
    this.flag.setPosition(level.flagX, H - 40);

    // Flag hitbox
    const flagBox = this.add.rectangle(level.flagX, H - 80, 30, 80, 0, 0);
    this.physics.add.existing(flagBox, true);

    // Gnarp player (drawn graphics-based)
    this.gnarpGraphics = this.add.graphics();
    this.gnarpGraphics.setDepth(10);

    const gnarpBox = this.add.rectangle(120, H - 100, 34, 44, 0x000000, 0);
    this.physics.add.existing(gnarpBox);
    const gnarpBody = (gnarpBox as any).body as Phaser.Physics.Arcade.Body;
    gnarpBody.setGravityY(GRAVITY);
    gnarpBody.setCollideWorldBounds(true);
    (this.gnarp as any) = gnarpBox;

    // Collisions
    this.physics.add.collider(gnarpBox, this.platforms);
    this.physics.add.overlap(gnarpBox, this.tokenGroup, (_g, token) => this.collectToken(token as Phaser.GameObjects.Rectangle));
    this.physics.add.overlap(gnarpBox, flagBox as any, () => this.nextLevel());
    this.physics.add.overlap(gnarpBox, this.enemies, (_g, enemy) => this.hitEnemy(gnarpBox, enemy as Phaser.GameObjects.Rectangle));

    // Platform collider for enemies
    this.physics.add.collider(this.enemies, this.platforms, (_e, _p) => {
      const body = (_e as any).body as Phaser.Physics.Arcade.Body;
      const dir = this.enemyDir.get(_e as any) ?? 1;
      body.setVelocityX(-80 * dir);
      this.enemyDir.set(_e as any, -dir);
    });

    // Camera
    this.cameras.main.startFollow(gnarpBox, true, 0.1, 0.1);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // HUD
    this.scoreText = this.add.text(12, 12, `分数: ${this.score}`, {
      fontSize: "15px", color: "#00e87a", fontFamily: "monospace",
    }).setScrollFactor(0).setDepth(20);

    this.tokenText = this.add.text(12, 32, `Token: ${this.totalTokens}`, {
      fontSize: "13px", color: "#ffd700", fontFamily: "monospace",
    }).setScrollFactor(0).setDepth(20);

    this.hpText = this.add.text(12, 52, `HP: ${"❤".repeat(this.hp)}`, {
      fontSize: "13px", color: "#ff4fa3", fontFamily: "monospace",
    }).setScrollFactor(0).setDepth(20);

    this.levelText = this.add.text(width / 2, 12, `${this.levelIdx + 1}. ${level.name}`, {
      fontSize: "14px", color: "#9b6dff", fontFamily: "monospace",
    }).setScrollFactor(0).setDepth(20).setOrigin(0.5, 0);

    this.controlsText = this.add.text(width - 12, height - 12,
      "←→ 移动  ↑/W/Space 跳跃  二段跳：再按一次",
      { fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }
    ).setScrollFactor(0).setDepth(20).setOrigin(1, 1);

    // Mobile virtual controls
    this.createTouchControls(width, height);
  }

  private createTouchControls(w: number, h: number) {
    const btnStyle = { fontSize: "22px", backgroundColor: "rgba(0,232,122,0.15)", padding: { x: 16, y: 10 }, color: "#00e87a" };

    const leftBtn = this.add.text(40, h - 70, "◀", btnStyle).setScrollFactor(0).setDepth(25).setInteractive();
    const rightBtn = this.add.text(110, h - 70, "▶", btnStyle).setScrollFactor(0).setDepth(25).setInteractive();
    const jumpBtn = this.add.text(w - 70, h - 70, "🅰", { ...btnStyle, fontSize: "24px", color: "#ff4fa3" }).setScrollFactor(0).setDepth(25).setInteractive();

    leftBtn.on("pointerdown", () => { this.touchLeft = true; });
    leftBtn.on("pointerup", () => { this.touchLeft = false; });
    leftBtn.on("pointerout", () => { this.touchLeft = false; });

    rightBtn.on("pointerdown", () => { this.touchRight = true; });
    rightBtn.on("pointerup", () => { this.touchRight = false; });
    rightBtn.on("pointerout", () => { this.touchRight = false; });

    jumpBtn.on("pointerdown", () => { this.touchJump = true; });
    jumpBtn.on("pointerup", () => { this.touchJump = false; });
  }

  private drawGnarp(frame: number, running: boolean, facingLeft: boolean) {
    const g = this.gnarpGraphics;
    const body = (this.gnarp as any).body as Phaser.Physics.Arcade.Body;
    const cx = body.x + 17;
    const cy = body.y + 22;
    g.clear();

    const t = frame * 0.12;
    const bob = running ? Math.sin(t * 4) * 2 : Math.sin(t) * 3;
    const legSwing = running ? Math.sin(t * 5) * 10 : 0;
    const armSwing = running ? Math.sin(t * 5 + 0.5) * 8 : Math.sin(t * 0.8) * 4;

    g.setAlpha(this.invincible ? (Math.sin(t * 20) > 0 ? 0.4 : 1) : 1);

    // Glow
    g.fillStyle(0x00e87a, 0.04);
    g.fillCircle(cx, cy + bob, 40);

    // Body
    g.fillStyle(0x00e87a, 1);
    g.fillEllipse(cx, cy + bob + 8, 34, 38);

    // Belly
    g.fillStyle(0xffffff, 0.12);
    g.fillEllipse(cx, cy + bob + 12, 18, 22);

    // Head
    g.fillStyle(0x00e87a, 1);
    g.fillCircle(cx + (facingLeft ? -1 : 1), cy + bob - 16, 20);

    // Ears
    g.fillStyle(0x00e87a, 1);
    g.fillTriangle(cx - 14, cy + bob - 28, cx - 22, cy + bob - 44, cx - 4, cy + bob - 38);
    g.fillTriangle(cx + 14, cy + bob - 28, cx + 22, cy + bob - 44, cx + 4, cy + bob - 38);
    g.fillStyle(0xffbbbb, 0.35);
    g.fillTriangle(cx - 13, cy + bob - 30, cx - 19, cy + bob - 42, cx - 5, cy + bob - 37);
    g.fillTriangle(cx + 13, cy + bob - 30, cx + 19, cy + bob - 42, cx + 5, cy + bob - 37);

    // Eyes
    const ex = facingLeft ? -5 : 5;
    g.fillStyle(0x050812, 1);
    g.fillCircle(cx + ex - 6, cy + bob - 18, 4.5);
    g.fillCircle(cx + ex + 6, cy + bob - 18, 4.5);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(cx + ex - 4, cy + bob - 20, 1.5);
    g.fillCircle(cx + ex + 8, cy + bob - 20, 1.5);

    // Nose
    g.fillStyle(0xffaaaa, 0.8);
    g.fillCircle(cx + (facingLeft ? -2 : 2), cy + bob - 11, 2.5);

    // Arms
    g.lineStyle(8, 0x00e87a, 1);
    g.lineBetween(cx - 16, cy + bob, cx - 28, cy + bob + armSwing + 8);
    g.lineBetween(cx + 16, cy + bob, cx + 28, cy + bob - armSwing + 8);

    // Legs
    g.lineStyle(9, 0x00e87a, 1);
    g.lineBetween(cx - 8, cy + bob + 18, cx - 10 - legSwing, cy + bob + 35);
    g.lineBetween(cx + 8, cy + bob + 18, cx + 10 + legSwing, cy + bob + 35);

    // Tail
    g.lineStyle(5, 0x00e87a, 0.9);
    const tailX = facingLeft ? cx + 16 : cx - 16;
    const curl = Math.sin(t * 2) * 10;
    g.beginPath();
    g.moveTo(tailX, cy + bob + 10);
    // Simple arc tail
    g.lineTo(tailX + (facingLeft ? 20 : -20) + curl, cy + bob - 5);
  }

  private drawToken(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0xffd700, 1);
    g.fillCircle(x, y, 10);
    g.fillStyle(0xffee44, 1);
    g.fillCircle(x - 2, y - 2, 5);
    g.lineStyle(1.5, 0xffa500, 0.8);
    g.strokeCircle(x, y, 10);
    // Center dot
    g.fillStyle(0xff8800, 0.9);
    g.fillCircle(x, y, 4);
  }

  private drawEnemy(g: Phaser.GameObjects.Graphics, type: string, x: number, y: number) {
    if (type === "keyboard") {
      // Keyboard enemy
      g.fillStyle(0x333366, 1);
      g.fillRect(x - 20, y - 14, 40, 24);
      g.lineStyle(1, 0x9b6dff, 0.8);
      g.strokeRect(x - 20, y - 14, 40, 24);
      // Keys
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 5; c++) {
          g.fillStyle(0x9b6dff, 0.5);
          g.fillRect(x - 18 + c * 8, y - 10 + r * 10, 6, 7);
        }
      }
      // Eye
      g.fillStyle(0xff4fa3, 1);
      g.fillCircle(x, y - 20, 6);
      g.fillStyle(0x050812, 1);
      g.fillCircle(x, y - 20, 3);
    } else if (type === "boss") {
      // Boss head enemy
      g.fillStyle(0x4a0080, 1);
      g.fillCircle(x, y - 15, 20);
      g.fillStyle(0x9b6dff, 0.6);
      g.fillRect(x - 16, y, 32, 22);
      // Boss eyes
      g.fillStyle(0xff4fa3, 1);
      g.fillCircle(x - 7, y - 17, 4);
      g.fillCircle(x + 7, y - 17, 4);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 6, y - 18, 2);
      g.fillCircle(x + 8, y - 18, 2);
      // Crown
      g.fillStyle(0xffd700, 1);
      g.fillTriangle(x - 12, y - 34, x - 16, y - 28, x - 8, y - 30);
      g.fillTriangle(x, y - 38, x - 4, y - 30, x + 4, y - 30);
      g.fillTriangle(x + 12, y - 34, x + 16, y - 28, x + 8, y - 30);
    } else {
      // Coffee cup enemy
      g.fillStyle(0x8b4513, 1);
      g.fillRect(x - 12, y - 18, 24, 28);
      g.fillStyle(0xc8651a, 1);
      g.fillRect(x - 10, y - 16, 20, 8);
      g.lineStyle(2, 0xffffff, 0.5);
      g.lineBetween(x + 12, y - 10, x + 18, y - 6);
      // Angry eyes
      g.fillStyle(0xff0000, 1);
      g.fillCircle(x - 5, y - 6, 3);
      g.fillCircle(x + 5, y - 6, 3);
    }
  }

  private collectToken(token: Phaser.GameObjects.Rectangle) {
    const graphics = (token as any).__graphics as Phaser.GameObjects.Graphics;
    graphics?.destroy();
    token.destroy();
    this.totalTokens++;
    this.score += TOKEN_SCORE;
    this.updateHUD();
    this.cb?.onTokenCollect(this.totalTokens);
    this.cb?.onScoreUpdate(this.score);

    // Particle effect
    const body = (this.gnarp as any).body as Phaser.Physics.Arcade.Body;
    const tx = body.x + 17; const ty = body.y + 22;
    for (let i = 0; i < 8; i++) {
      const p = this.add.graphics().setDepth(15);
      p.fillStyle(0xffd700, 1);
      p.fillCircle(tx, ty, 4);
      const angle = (i / 8) * Math.PI * 2;
      const speed = Phaser.Math.Between(60, 130);
      this.tweens.add({
        targets: p,
        x: tx + Math.cos(angle) * speed * 0.5,
        y: ty + Math.sin(angle) * speed * 0.5,
        alpha: 0,
        scaleX: 0, scaleY: 0,
        duration: 600,
        ease: "Power2",
        onComplete: () => p.destroy(),
      });
    }
  }

  private hitEnemy(gnarp: Phaser.GameObjects.Rectangle, enemy: Phaser.GameObjects.Rectangle) {
    if (this.invincible) return;
    const gnarpBody = (gnarp as any).body as Phaser.Physics.Arcade.Body;
    const enemyBody = (enemy as any).body as Phaser.Physics.Arcade.Body;

    // Stomp from above?
    if (gnarpBody.velocity.y > 20 && gnarpBody.y < enemyBody.y) {
      // Stomped! Kill enemy
      gnarpBody.setVelocityY(JUMP_VEL * 0.7);
      this.score += ENEMY_SCORE;
      this.updateHUD();
      this.cb?.onScoreUpdate(this.score);
      const eg = (enemy as any).__graphics as Phaser.GameObjects.Graphics;
      this.tweens.add({
        targets: eg,
        alpha: 0,
        scaleX: 0, scaleY: 0,
        duration: 300,
        onComplete: () => eg?.destroy(),
      });
      enemy.destroy();

      // Stomp flash
      const flash = this.add.graphics().setDepth(15);
      flash.fillStyle(0xff4fa3, 0.6);
      flash.fillCircle(enemyBody.x + 20, enemyBody.y + 20, 20);
      this.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() });
    } else {
      // Take damage
      this.hp = Math.max(0, this.hp - 1);
      this.updateHUD();
      this.cb?.onHpUpdate(this.hp);
      this.invincible = true;

      // Knockback
      gnarpBody.setVelocityX(gnarpBody.x < enemyBody.x ? -300 : 300);
      gnarpBody.setVelocityY(-200);

      this.time.delayedCall(1800, () => { this.invincible = false; });

      if (this.hp <= 0) {
        this.time.delayedCall(400, () => this.gameOver());
      }
    }
  }

  private nextLevel() {
    this.cb?.onLevelComplete(this.levelIdx, this.totalTokens);
    const nextIdx = this.levelIdx + 1;
    if (nextIdx < LEVELS.length) {
      this.scene.restart({ level: nextIdx, tokens: this.totalTokens, score: this.score, hp: this.hp });
    } else {
      this.showWin();
    }
  }

  private gameOver() {
    this.physics.pause();
    this.cb?.onGameOver(this.score, this.totalTokens);
    this.scene.pause();
  }

  private showWin() {
    this.physics.pause();
    this.cb?.onLevelComplete(3, this.totalTokens);
    this.scene.pause();
  }

  private updateHUD() {
    this.scoreText?.setText(`分数: ${this.score}`);
    this.tokenText?.setText(`Token: ${this.totalTokens}`);
    this.hpText?.setText(`HP: ${"❤".repeat(Math.max(0, this.hp))}`);
  }

  update() {
    const gnarpBody = (this.gnarp as any).body as Phaser.Physics.Arcade.Body;
    if (!gnarpBody) return;

    const onGround = gnarpBody.blocked.down;
    const left = this.cursors?.left?.isDown || this.wasd?.A?.isDown || this.touchLeft;
    const right = this.cursors?.right?.isDown || this.wasd?.D?.isDown || this.touchRight;
    const jumpPress = Phaser.Input.Keyboard.JustDown(this.cursors?.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd?.W) ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
      this.touchJump;

    if (onGround) {
      this.hasDoubleJumped = false;
      this.canDoubleJump = true;
    }

    // Move
    if (left) { gnarpBody.setVelocityX(-RUN_VEL); this.facingLeft = true; this.running = true; }
    else if (right) { gnarpBody.setVelocityX(RUN_VEL); this.facingLeft = false; this.running = true; }
    else { gnarpBody.setVelocityX(0); this.running = false; }

    // Jump / Double Jump
    if (jumpPress) {
      if (onGround) {
        gnarpBody.setVelocityY(JUMP_VEL);
        this.hasDoubleJumped = false;
      } else if (this.canDoubleJump && !this.hasDoubleJumped) {
        gnarpBody.setVelocityY(DOUBLE_JUMP_VEL);
        this.hasDoubleJumped = true;

        // Double jump sparkle
        const sparkle = this.add.graphics().setDepth(12);
        sparkle.fillStyle(0x00e87a, 0.6);
        sparkle.fillCircle(gnarpBody.x + 17, gnarpBody.y + 40, 14);
        this.tweens.add({ targets: sparkle, alpha: 0, y: sparkle.y + 30, duration: 500, onComplete: () => sparkle.destroy() });
      }
    }

    // Touch jump reset
    if (!this.touchJump) { /* handled by just-down logic above */ }

    // Enemy movement & sync graphics
    this.enemies.getChildren().forEach((e) => {
      const box = e as Phaser.GameObjects.Rectangle;
      const body = (box as any).body as Phaser.Physics.Arcade.Body;
      const eg = (box as any).__graphics as Phaser.GameObjects.Graphics;
      if (!body || !eg) return;

      if (body.blocked.right || body.blocked.left) {
        const dir = this.enemyDir.get(box) ?? 1;
        const nd = -dir;
        body.setVelocityX(80 * nd);
        this.enemyDir.set(box, nd);
      }
      eg.setPosition(body.x + 20, body.y + 20);
    });

    // Token bob animation
    this.tokenGroup.getChildren().forEach((t, i) => {
      const tg = (t as any).__graphics as Phaser.GameObjects.Graphics;
      if (tg) {
        tg.y += Math.sin((this.frame + i * 30) * 0.08) * 0.4;
      }
    });

    // Draw Gnarp
    this.drawGnarp(this.frame, this.running, this.facingLeft);
    this.frame++;

    // Fall off world?
    if (gnarpBody.y > H + 50) {
      this.hp = Math.max(0, this.hp - 1);
      this.updateHUD();
      if (this.hp <= 0) {
        this.gameOver();
      } else {
        gnarpBody.setPosition(120, H - 100);
        gnarpBody.setVelocity(0, 0);
      }
    }
  }
}

/* ================================================================
   CREATE PHASER GAME
   ================================================================ */
export function createSuperGnarpGame(parent: string, callbacks: GameCallbacks): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent,
    backgroundColor: "#050812",
    physics: {
      default: "arcade",
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: [BootScene, GameScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: { activePointers: 3 },
  };

  const game = new Phaser.Game(config);

  game.events.on(Phaser.Core.Events.READY, () => {
    const gs = game.scene.getScene("Game") as GameScene;
    if (gs) gs.setCallbacks(callbacks);
  });

  // Also patch via scene add events
  game.scene.scenes.forEach((s) => {
    if (s instanceof GameScene) s.setCallbacks(callbacks);
  });

  return game;
}
