/*
 * ============================================================
 *  Super Gnarp v3 — Phaser 3 Platform Jumper
 * ============================================================
 *
 * HOW TO REPLACE GNARP SPRITE:
 *   1. Place spritesheet at: public/assets/gnarp-sprite.png
 *      Frame: 96×96px, row0=idle(4f), row1=run(6f), row2=jump(3f)
 *   2. In BootScene.preload():
 *      this.load.spritesheet('gnarp','/assets/gnarp-sprite.png',{frameWidth:96,frameHeight:96});
 *   3. In GameScene, replace this.gnarpGfx canvas drawing with:
 *      this.gnarpSprite = this.add.sprite(cx, cy, 'gnarp');
 *      this.gnarpSprite.anims.play('idle');
 *
 * LEVELS 1-20 + ENDLESS:
 *   Themes: Office(1-5) → City(6-10) → Space(11-15) → Moon(16-20) → Endless(∞)
 *   Boss appears every 5th level
 *
 * CONTROLS:
 *   ← → / A D       — Move
 *   ↑ / W / Space   — Jump (double-jump on 2nd press)
 *   Shift / Z       — Dash (1-charge, 1.2s cooldown)
 * ============================================================
 */

import Phaser from "phaser";

const W = 800;
const H = 450;

const GRAVITY_Y   = 950;
const JUMP_VEL    = -530;
const DJUMP_VEL   = -460;
const RUN_VEL     = 270;
const DASH_VEL    = 620;
const DASH_DUR    = 180;
const DASH_CD     = 1200;
const TOKEN_BASE  = 50;
const ENEMY_SCORE = 120;

/* ---- Theme Definitions ---- */
interface Theme {
  name: string;
  bg: number;
  accent: number;
  groundColor: number;
}

const THEMES: Theme[] = [
  { name: "💼 办公室地狱",  bg: 0x07091a, accent: 0x00e87a, groundColor: 0x1a3320 },
  { name: "🏙 霓虹都市",    bg: 0x050614, accent: 0x9b6dff, groundColor: 0x1a1040 },
  { name: "🚀 太空站",      bg: 0x040810, accent: 0x00c2ff, groundColor: 0x0a1830 },
  { name: "🌙 月球基地",    bg: 0x060310, accent: 0xff4fa3, groundColor: 0x2a1020 },
];

/* ---- Procedural Level Generator ---- */
interface GenLevel {
  theme: Theme;
  worldW: number;
  flagX: number;
  isBossLevel: boolean;
  levelIdx: number;
}

function getTheme(levelIdx: number): Theme {
  if (levelIdx < 5)        return THEMES[0];
  else if (levelIdx < 10)  return THEMES[1];
  else if (levelIdx < 15)  return THEMES[2];
  else                     return THEMES[3];
}

function genLevel(levelIdx: number): GenLevel {
  const worldW = 2800 + levelIdx * 120;
  return {
    theme: getTheme(levelIdx),
    worldW,
    flagX: worldW - 200,
    isBossLevel: (levelIdx + 1) % 5 === 0,
    levelIdx,
  };
}

/* Seed-based random for reproducible levels */
class SeededRand {
  private s: number;
  constructor(seed: number) { this.s = seed; }
  next(): number {
    this.s = (this.s * 9301 + 49297) % 233280;
    return this.s / 233280;
  }
  between(lo: number, hi: number) { return Math.floor(this.next() * (hi - lo + 1)) + lo; }
  choice<T>(arr: T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
}

function buildLevelGeometry(lvl: GenLevel) {
  const rng = new SeededRand(lvl.levelIdx * 1337 + 7);
  const difficulty = Math.min(1, lvl.levelIdx / 19);

  // Ground segments
  const platforms: { x: number; y: number; w: number; glow: boolean }[] = [];
  // Main ground
  platforms.push({ x: 0, y: H - 40, w: 300, glow: false });
  platforms.push({ x: lvl.flagX - 100, y: H - 40, w: 350, glow: true });

  // Floating platforms — count and gap increase with difficulty
  const count = 12 + Math.floor(difficulty * 8);
  let cx = 320;
  for (let i = 0; i < count; i++) {
    const pw = rng.between(80, 160);
    const py = rng.between(120, H - 100);
    platforms.push({ x: cx, y: py, w: pw, glow: rng.next() > 0.65 });
    cx += pw + rng.between(80 + Math.floor(difficulty * 50), 160 + Math.floor(difficulty * 80));
    if (cx > lvl.flagX - 300) break;
  }

  // Tokens
  const tokens: { x: number; y: number }[] = [];
  platforms.forEach((p) => {
    if (p.y === H - 40) return;
    const count = Math.floor(p.w / 30);
    for (let i = 0; i < count; i++) {
      tokens.push({ x: p.x + 20 + i * 30, y: p.y - 30 });
    }
  });

  // Power-ups (one per 150px section)
  const powerups: { x: number; y: number; type: "mushroom" | "star" | "crystal" }[] = [];
  const types: ("mushroom" | "star" | "crystal")[] = ["mushroom", "star", "crystal"];
  platforms.filter(p => p.glow).forEach((p) => {
    powerups.push({ x: p.x + p.w / 2, y: p.y - 35, type: rng.choice(types) });
  });

  // Enemies
  const enemies: { x: number; y: number; type: "keyboard" | "boss" | "coffee" }[] = [];
  const enemyTypes: ("keyboard" | "boss" | "coffee")[] = ["keyboard", "boss", "coffee"];
  const enemyCount = 4 + Math.floor(difficulty * 8);
  for (let i = 0; i < enemyCount; i++) {
    enemies.push({
      x: 400 + i * Math.floor((lvl.flagX - 500) / enemyCount) + rng.between(-40, 40),
      y: H - 90,
      type: rng.choice(enemyTypes),
    });
  }

  // Boss on boss levels
  if (lvl.isBossLevel) {
    enemies.push({ x: lvl.flagX - 350, y: H - 100, type: "boss" });
  }

  return { platforms, tokens, powerups, enemies };
}

/* ================================================================
   CALLBACKS
   ================================================================ */
export interface GameCallbacks {
  onTokenCollect: (delta: number, combo: number) => void;
  onScoreUpdate: (score: number) => void;
  onLevelComplete: (level: number, tokens: number) => void;
  onGameOver: (score: number, tokens: number) => void;
  onHpUpdate: (hp: number) => void;
  onComboUpdate: (combo: number) => void;
  getDanceBonus: () => number;
}

/* ================================================================
   BOOT SCENE
   ================================================================ */
class BootScene extends Phaser.Scene {
  constructor() { super("Boot"); }
  preload() {
    // To use real sprite: this.load.spritesheet('gnarp','/assets/gnarp-sprite.png',{frameWidth:96,frameHeight:96});
  }
  create() { this.scene.start("Game", { level: 0, tokens: 0, score: 0, hp: 3, endless: false }); }
}

/* ================================================================
   GAME SCENE
   ================================================================ */
class GameScene extends Phaser.Scene {
  // Physics
  private gnarpBox!: Phaser.GameObjects.Rectangle;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private pickups!: Phaser.Physics.Arcade.StaticGroup;

  // Player state
  private canDoubleJump = true;
  private hasDoubleJumped = false;
  private invincible = false;
  private dashing = false;
  private dashCooldown = false;
  private mushActive = false;
  private starActive = false;
  private facingLeft = false;
  private running = false;

  // Combo
  private combo = 0;
  private lastTokenTime = 0;

  // Game state
  private levelIdx = 0;
  private isEndless = false;
  private score = 0;
  private sessionTokens = 0;
  private hp = 3;
  private frame = 0;
  private cb?: GameCallbacks;
  private enemyDir = new Map<Phaser.GameObjects.GameObject, number>();
  private endlessScrollX = 0;
  private endlessDifficulty = 1;
  private bossSpawned = false;

  // Graphics
  private gnarpGfx!: Phaser.GameObjects.Graphics;

  // HUD
  private scoreText!: Phaser.GameObjects.Text;
  private tokenText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private powerText!: Phaser.GameObjects.Text;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keyZ!: Phaser.Input.Keyboard.Key;

  // Touch
  private touchLeft = false;
  private touchRight = false;
  private touchJump = false;
  private touchDash = false;

  // Level data cache
  private lvlData!: GenLevel;
  private geometry!: ReturnType<typeof buildLevelGeometry>;
  private accent = 0x00e87a;

  constructor() { super("Game"); }

  setCallbacks(cb: GameCallbacks) { this.cb = cb; }

  init(data: { level?: number; tokens?: number; score?: number; hp?: number; endless?: boolean }) {
    this.levelIdx = data.level ?? 0;
    this.isEndless = data.endless ?? false;
    this.sessionTokens = data.tokens ?? 0;
    this.score = data.score ?? 0;
    this.hp = data.hp ?? 3;
    this.canDoubleJump = true;
    this.hasDoubleJumped = false;
    this.invincible = false;
    this.dashing = false;
    this.dashCooldown = false;
    this.mushActive = false;
    this.starActive = false;
    this.combo = 0;
    this.frame = 0;
    this.endlessScrollX = 0;
    this.endlessDifficulty = 1;
    this.bossSpawned = false;
    this.enemyDir.clear();

    if (this.isEndless) {
      this.lvlData = { theme: THEMES[3], worldW: 99999, flagX: 99999, isBossLevel: false, levelIdx: 99 };
    } else {
      this.lvlData = genLevel(this.levelIdx);
      this.geometry = buildLevelGeometry(this.lvlData);
    }
    this.accent = this.lvlData.theme.accent;
  }

  create() {
    const lvl = this.lvlData;
    this.cameras.main.setBackgroundColor(lvl.theme.bg);
    this.physics.world.setBounds(0, 0, lvl.worldW, H + 100);
    this.cameras.main.setBounds(0, 0, lvl.worldW, H);

    this.drawStarfield(lvl.worldW);
    this.buildLevel();
    this.buildPlayer();
    if (!this.isEndless) this.buildFlag();
    this.setupInput();
    this.buildHUD();
    this.buildTouchControls();
    this.cameras.main.startFollow(this.gnarpBox, true, 0.1, 0.1);
  }

  /* ---- Starfield ---- */
  private drawStarfield(worldW: number) {
    const bg = this.add.graphics().setDepth(-20);
    for (let i = 0; i < 300; i++) {
      const a = Phaser.Math.FloatBetween(0.1, 0.7);
      bg.fillStyle(0xffffff, a);
      bg.fillCircle(Phaser.Math.Between(0, worldW), Phaser.Math.Between(0, H), Phaser.Math.FloatBetween(0.3, 1.8));
    }
    for (let i = 0; i < 5; i++) {
      const ng = this.add.graphics().setDepth(-18).setAlpha(0.05);
      ng.fillStyle(this.accent, 1);
      ng.fillCircle(Phaser.Math.Between(300, worldW - 300), Phaser.Math.Between(30, H - 60), Phaser.Math.Between(70, 140));
    }
  }

  /* ---- Build Level Geometry ---- */
  private buildLevel() {
    this.platforms = this.physics.add.staticGroup();
    this.pickups = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();

    if (this.isEndless) {
      // Seed initial platforms for endless
      this.generateEndlessPlatforms(0, 2000);
    } else {
      const geo = this.geometry;
      geo.platforms.forEach((p) => this.addPlatform(p.x, p.y, p.w, p.glow));
      geo.tokens.forEach((t) => this.addPickup(t.x, t.y, "token"));
      geo.powerups.forEach((p) => this.addPickup(p.x, p.y, p.type));
      geo.enemies.forEach((e) => this.addEnemy(e.x, e.y, e.type));
    }

    // Enemy platform collision
    this.physics.add.collider(this.enemies, this.platforms, (e) => {
      const body = (e as any).body as Phaser.Physics.Arcade.Body;
      const dir = this.enemyDir.get(e as any) ?? 1;
      const nd = -dir;
      body.setVelocityX(75 * nd);
      this.enemyDir.set(e as any, nd);
    });
  }

  /* ---- Endless Platform Generator ---- */
  private generateEndlessPlatforms(fromX: number, toX: number) {
    const rng = new SeededRand(Math.floor(fromX / 100) * 31 + 7);
    this.addPlatform(0, H - 40, Math.min(toX, 400), false);
    let cx = Math.max(fromX, 260);
    while (cx < toX) {
      const pw = rng.between(90, 170);
      const py = rng.between(120, H - 100);
      const glow = rng.next() > 0.7;
      this.addPlatform(cx, py, pw, glow);
      // Token strip above platform
      for (let i = 0; i < Math.floor(pw / 35); i++) {
        this.addPickup(cx + 15 + i * 35, py - 35, "token");
      }
      if (glow && rng.next() > 0.5) {
        const ptype = rng.choice(["mushroom", "star", "crystal"] as const);
        this.addPickup(cx + pw / 2, py - 50, ptype);
      }
      if (rng.next() > 0.65) {
        const etype = rng.choice(["keyboard", "boss", "coffee"] as const);
        this.addEnemy(cx + pw / 2, H - 90, etype);
      }
      cx += pw + rng.between(90, 160 + this.endlessDifficulty * 30);
    }
    this.endlessScrollX = toX;
  }

  private addPlatform(x: number, y: number, w: number, glow: boolean) {
    const col = this.accent;
    const g = this.add.graphics().setPosition(x, y);
    g.fillStyle(col, glow ? 0.28 : 0.15);
    g.fillRect(0, 0, w, 30);
    g.lineStyle(1.5, col, glow ? 1 : 0.6);
    g.strokeRect(0, 0, w, 30);
    g.lineStyle(2, col, glow ? 0.85 : 0.35);
    g.lineBetween(0, 0, w, 0);
    const box = this.add.rectangle(x + w / 2, y + 15, w, 30, 0, 0);
    this.physics.add.existing(box, true);
    this.platforms.add(box);
  }

  private addPickup(x: number, y: number, type: "token" | "mushroom" | "star" | "crystal") {
    const g = this.add.graphics();
    this.drawPickupGfx(g, type, 0, 0);
    g.setPosition(x, y);
    const r = type === "token" ? 11 : 15;
    const circle = this.add.circle(x, y, r, 0, 0);
    this.physics.add.existing(circle, true);
    this.pickups.add(circle);
    (circle as any).__gfx = g;
    (circle as any).__type = type;
  }

  private addEnemy(x: number, y: number, type: "keyboard" | "boss" | "coffee") {
    const g = this.add.graphics().setPosition(x, y);
    this.drawEnemyGfx(g, type, 0, 0);
    const box = this.add.rectangle(x, y + 10, 44, 44, 0, 0);
    this.physics.add.existing(box);
    const body = (box as any).body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    body.setVelocityX(75);
    this.enemies.add(box);
    this.enemyDir.set(box, 1);
    (box as any).__gfx = g;
    (box as any).__type = type;
  }

  /* ---- Pickup Graphics ---- */
  private drawPickupGfx(g: Phaser.GameObjects.Graphics, type: string, x: number, y: number) {
    g.clear();
    if (type === "token") {
      g.fillStyle(0xffd700, 1);   g.fillCircle(x, y, 11);
      g.fillStyle(0xffef60, 0.6); g.fillCircle(x - 2, y - 3, 5);
      g.lineStyle(1.5, 0xdd8800, 0.9); g.strokeCircle(x, y, 11);
      g.fillStyle(0xff8800, 0.7); g.fillCircle(x, y, 5);
    } else if (type === "mushroom") {
      g.fillStyle(0x00e87a, 1);   g.fillCircle(x, y - 5, 14);
      g.fillStyle(0xffffff, 0.9); g.fillRect(x - 9, y - 2, 18, 12);
      g.fillStyle(0xffffff, 0.35); g.fillCircle(x - 5, y - 10, 4); g.fillCircle(x + 5, y - 10, 3);
      g.lineStyle(1.5, 0x00c060, 0.8); g.strokeCircle(x, y - 5, 14);
    } else if (type === "star") {
      g.fillStyle(0xffcc00, 1);   g.fillCircle(x, y, 13);
      g.fillStyle(0xffe866, 0.7); g.fillCircle(x - 2, y - 3, 6);
      g.lineStyle(2, 0xffaa00, 0.9); g.strokeCircle(x, y, 13);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        g.lineStyle(1.5, 0xffcc00, 0.45);
        g.lineBetween(x, y, x + Math.cos(a) * 18, y + Math.sin(a) * 18);
      }
    } else {
      g.fillStyle(0x00c2ff, 0.9); g.fillTriangle(x, y - 14, x - 10, y + 2, x + 10, y + 2);
      g.fillTriangle(x - 10, y + 2, x + 10, y + 2, x, y + 14);
      g.fillStyle(0x80e8ff, 0.5); g.fillTriangle(x, y - 14, x - 4, y - 2, x + 4, y - 2);
      g.lineStyle(1.5, 0x00a8e0, 0.9); g.strokeTriangle(x, y - 14, x - 10, y + 2, x + 10, y + 2);
    }
  }

  /* ---- Enemy Graphics ---- */
  private drawEnemyGfx(g: Phaser.GameObjects.Graphics, type: string, x: number, y: number) {
    g.clear();
    if (type === "keyboard") {
      g.fillStyle(0x1a1a44, 1); g.fillRect(x - 22, y - 16, 44, 26);
      g.lineStyle(1.5, 0x9b6dff, 0.9); g.strokeRect(x - 22, y - 16, 44, 26);
      for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
        g.fillStyle(0x9b6dff, 0.4); g.fillRect(x - 19 + c * 7, y - 12 + r * 11, 5, 8);
      }
      g.fillStyle(0xff4fa3, 1); g.fillCircle(x, y - 24, 7);
      g.fillStyle(0x050812, 1); g.fillCircle(x, y - 24, 3.5);
    } else if (type === "boss") {
      g.fillStyle(0x3d0066, 1); g.fillCircle(x, y - 18, 22);
      g.fillStyle(0x7a2ccc, 0.6); g.fillRect(x - 18, y + 2, 36, 24);
      g.fillStyle(0xff4fa3, 1); g.fillCircle(x - 8, y - 20, 5); g.fillCircle(x + 8, y - 20, 5);
      g.fillStyle(0xffffff, 0.9); g.fillCircle(x - 6, y - 22, 2.5); g.fillCircle(x + 10, y - 22, 2.5);
      g.fillStyle(0xffd700, 1);
      g.fillTriangle(x - 14, y - 38, x - 18, y - 30, x - 8, y - 33);
      g.fillTriangle(x, y - 42, x - 4, y - 33, x + 4, y - 33);
      g.fillTriangle(x + 14, y - 38, x + 18, y - 30, x + 8, y - 33);
    } else {
      g.fillStyle(0x6b3311, 1); g.fillRect(x - 13, y - 20, 26, 30);
      g.fillStyle(0xc0681a, 1); g.fillRect(x - 11, y - 18, 22, 9);
      g.lineStyle(2, 0xffffff, 0.4); g.lineBetween(x + 13, y - 11, x + 19, y - 7);
      g.fillStyle(0xff2222, 1); g.fillCircle(x - 6, y - 5, 4); g.fillCircle(x + 6, y - 5, 4);
    }
  }

  /* ---- Flag ---- */
  private buildFlag() {
    const { flagX } = this.lvlData;
    const g = this.add.graphics();
    g.lineStyle(3, this.accent, 1); g.lineBetween(0, 0, 0, -90);
    g.fillStyle(this.accent, 1); g.fillTriangle(0, -90, 34, -73, 0, -56);
    g.setPosition(flagX, H - 40);

    const box = this.add.rectangle(flagX + 5, H - 85, 44, 90, 0, 0);
    this.physics.add.existing(box, true);
    this.physics.add.overlap(this.gnarpBox as any, box as any, () => this.onLevelClear());
  }

  /* ---- Player ---- */
  private buildPlayer() {
    this.gnarpGfx = this.add.graphics().setDepth(10);
    this.gnarpBox = this.add.rectangle(100, H - 120, 36, 46, 0, 0);
    this.physics.add.existing(this.gnarpBox);
    const body = (this.gnarpBox as any).body as Phaser.Physics.Arcade.Body;
    body.setGravityY(GRAVITY_Y);
    body.setCollideWorldBounds(true);
    this.physics.add.collider(this.gnarpBox, this.platforms);
    this.physics.add.overlap(this.gnarpBox as any, this.pickups,
      (_g, p) => this.collectPickup(p as Phaser.GameObjects.Arc));
    this.physics.add.overlap(this.gnarpBox as any, this.enemies,
      (_g, e) => this.touchEnemy(e as Phaser.GameObjects.Rectangle));
  }

  /* ---- Input ---- */
  private setupInput() {
    if (!this.input.keyboard) return;
    this.cursors  = this.input.keyboard.createCursorKeys();
    this.keyW     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyZ     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  }

  /* ---- HUD ---- */
  private buildHUD() {
    const base = { fontFamily: "monospace" };
    this.scoreText = this.add.text(12, 12, "分数: 0",        { ...base, fontSize: "14px", color: "#00e87a" }).setScrollFactor(0).setDepth(20);
    this.tokenText = this.add.text(12, 32, "Token: 0",       { ...base, fontSize: "12px", color: "#ffd700" }).setScrollFactor(0).setDepth(20);
    this.hpText    = this.add.text(12, 52, "HP: ❤❤❤",      { ...base, fontSize: "12px", color: "#ff4fa3" }).setScrollFactor(0).setDepth(20);
    this.comboText = this.add.text(W / 2, 14, "",            { ...base, fontSize: "16px", color: "#ffcc00", fontStyle: "bold" }).setScrollFactor(0).setDepth(20).setOrigin(0.5, 0);
    this.levelText = this.add.text(W - 12, 14,
      this.isEndless ? "∞ Endless Moon" : `${this.levelIdx + 1}. ${this.lvlData.theme.name}`,
      { ...base, fontSize: "12px", color: `#${this.accent.toString(16).padStart(6, "0")}` })
      .setScrollFactor(0).setDepth(20).setOrigin(1, 0);
    this.powerText = this.add.text(W / 2, 36, "", { ...base, fontSize: "11px", color: "#00e87a" }).setScrollFactor(0).setDepth(20).setOrigin(0.5, 0);
  }

  /* ---- Touch Controls ---- */
  private buildTouchControls() {
    const s = { fontSize: "22px", backgroundColor: "rgba(0,232,122,0.15)", padding: { x: 14, y: 9 }, color: "#00e87a" };
    const btn = (x: number, y: number, label: string, d: () => void, u: () => void) => {
      const b = this.add.text(x, y, label, s).setScrollFactor(0).setDepth(25).setInteractive();
      b.on("pointerdown", d).on("pointerup", u).on("pointerout", u);
    };
    btn(36,  H - 70, "◀", () => { this.touchLeft = true; },  () => { this.touchLeft = false; });
    btn(106, H - 70, "▶", () => { this.touchRight = true; }, () => { this.touchRight = false; });
    btn(W - 120, H - 70, "🅰", () => { this.touchJump = true; }, () => { this.touchJump = false; });
    btn(W - 60,  H - 70, "💨", () => { this.touchDash = true; setTimeout(() => { this.touchDash = false; }, 100); }, () => {});
  }

  /* ================================================================
     UPDATE LOOP
     ================================================================ */
  update(time: number, _delta: number) {
    const body = (this.gnarpBox as any).body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    const onGround = body.blocked.down;
    const left  = this.cursors?.left?.isDown  || this.keyA?.isDown || this.touchLeft;
    const right = this.cursors?.right?.isDown || this.keyD?.isDown || this.touchRight;
    const jumpJust = Phaser.Input.Keyboard.JustDown(this.cursors?.up)
      || Phaser.Input.Keyboard.JustDown(this.keyW)
      || Phaser.Input.Keyboard.JustDown(this.keySpace)
      || this.touchJump;
    const dashJust = Phaser.Input.Keyboard.JustDown(this.keyShift)
      || Phaser.Input.Keyboard.JustDown(this.keyZ)
      || this.touchDash;
    this.touchJump = false;

    if (onGround) { this.hasDoubleJumped = false; this.canDoubleJump = true; }

    const speedMult = this.starActive ? 1.45 : 1;
    const jumpMult  = this.mushActive ? 1.18 : 1;

    if (!this.dashing) {
      if (left)       { body.setVelocityX(-RUN_VEL * speedMult); this.facingLeft = true;  this.running = true; }
      else if (right) { body.setVelocityX( RUN_VEL * speedMult); this.facingLeft = false; this.running = true; }
      else            { body.setVelocityX(0); this.running = false; }
    }

    if (jumpJust) {
      if (onGround) {
        body.setVelocityY(JUMP_VEL * jumpMult);
        this.hasDoubleJumped = false;
        this.spawnJumpParticles(body.x + 17, body.y + 44);
      } else if (this.canDoubleJump && !this.hasDoubleJumped) {
        body.setVelocityY(DJUMP_VEL * jumpMult);
        this.hasDoubleJumped = true;
        this.spawnDoubleJumpEffect(body.x + 17, body.y + 44);
      }
    }

    if (dashJust && !this.dashing && !this.dashCooldown) {
      this.dashing = true;
      this.dashCooldown = true;
      const dir = this.facingLeft ? -1 : 1;
      body.setVelocityX(DASH_VEL * dir);
      body.setVelocityY(body.velocity.y * 0.2);
      this.spawnDashEffect(body.x + 17, body.y + 22);
      this.time.delayedCall(DASH_DUR, () => { this.dashing = false; });
      this.time.delayedCall(DASH_CD,  () => { this.dashCooldown = false; });
    }

    /* Sync enemy graphics */
    this.enemies.getChildren().forEach((e) => {
      const box = e as Phaser.GameObjects.Rectangle;
      const ebody = (box as any).body as Phaser.Physics.Arcade.Body;
      const eg = (box as any).__gfx as Phaser.GameObjects.Graphics;
      if (!ebody || !eg) return;
      if (ebody.blocked.right || ebody.blocked.left) {
        const dir = this.enemyDir.get(box) ?? 1;
        const nd = -dir;
        ebody.setVelocityX(75 * nd);
        this.enemyDir.set(box, nd);
      }
      eg.setPosition(ebody.x + 22, ebody.y + 22);
    });

    /* Pickup bobbing */
    this.pickups.getChildren().forEach((p, i) => {
      const g = (p as any).__gfx as Phaser.GameObjects.Graphics;
      if (g) g.y += Math.sin((this.frame + i * 20) * 0.09) * 0.35;
    });

    /* Combo timeout */
    if (this.combo > 0 && time - this.lastTokenTime > 3000) {
      this.combo = 0;
      this.cb?.onComboUpdate(0);
      this.updateHUD();
    }

    /* Power-up label */
    this.powerText?.setText(this.mushActive ? "🍄 无敌中!" : this.starActive ? "⭐ 加速中!" : "");

    /* Endless: generate new terrain ahead */
    if (this.isEndless) {
      const camRight = this.cameras.main.scrollX + W + 300;
      if (camRight > this.endlessScrollX - 200) {
        this.generateEndlessPlatforms(this.endlessScrollX, this.endlessScrollX + 1200);
        this.endlessDifficulty = Math.min(8, this.endlessDifficulty + 0.3);
      }
      this.score += 1;
      if (this.score % 300 === 0) {
        this.cb?.onScoreUpdate(this.score);
        this.updateHUD();
      }
    }

    /* Fall off */
    if (body.y > H + 60) {
      this.hp = Math.max(0, this.hp - 1);
      this.cb?.onHpUpdate(this.hp);
      this.updateHUD();
      if (this.hp <= 0) { this.time.delayedCall(200, () => this.onGameOver()); return; }
      body.reset(120, H - 120);
    }

    /* Draw Gnarp */
    this.drawGnarp(body.x + 18, body.y + 22, this.frame, this.running, this.facingLeft,
      this.invincible, this.dashing, this.mushActive, this.starActive);
    this.frame++;
  }

  /* ================================================================
     GNARP 3D-STYLE DRAWING
     ================================================================ */
  private drawGnarp(cx: number, cy: number, frame: number, running: boolean, left: boolean,
    invinc: boolean, dash: boolean, mush: boolean, star: boolean) {
    const g = this.gnarpGfx;
    g.clear();
    const t = frame * 0.12;
    const bob  = running ? Math.sin(t * 5) * 2 : Math.sin(t) * 4;
    const leg  = running ? Math.sin(t * 5) * 12 : 0;
    const arm  = running ? Math.sin(t * 5 + 0.5) * 10 : Math.sin(t * 0.9) * 5;
    const blink = Math.sin(t * 0.28) > 0.94;
    const dashA = dash ? Math.sin(t * 30) * 0.3 + 0.7 : 1;
    g.setAlpha(invinc && !dash ? (Math.sin(t * 18) > 0 ? 0.4 : 1) : dashA);

    const bodyCol = mush ? 0x00ffaa : star ? 0xffcc44 : 0x00e87a;
    const glowCol = mush ? 0x00e87a : star ? 0xffaa00 : 0x00c060;

    // Outer glow
    g.fillStyle(bodyCol, 0.04); g.fillCircle(cx, cy + bob, 52);
    // Shadow
    g.fillStyle(0x000000, 0.18); g.fillEllipse(cx, cy + bob + 30, 44, 10);
    // Body
    g.fillStyle(bodyCol, 1);     g.fillEllipse(cx, cy + bob + 8, 36, 42);
    g.fillStyle(0xffffff, 0.13); g.fillEllipse(cx, cy + bob + 12, 20, 26);
    g.fillStyle(glowCol, 0.35);  g.fillEllipse(cx + 10, cy + bob + 6, 12, 30);
    // Head
    g.fillStyle(bodyCol, 1);     g.fillCircle(cx, cy + bob - 18, 22);
    g.fillStyle(0xffffff, 0.22); g.fillEllipse(cx - 4, cy + bob - 26, 14, 10);
    // Ears
    [[cx - 14, cy + bob - 36, cx - 20, cy + bob - 52, cx - 4, cy + bob - 47],
     [cx + 14, cy + bob - 36, cx + 20, cy + bob - 52, cx + 4, cy + bob - 47]].forEach(([x1, y1, x2, y2, x3, y3]) => {
      g.fillStyle(bodyCol, 1); g.fillTriangle(x1, y1, x2, y2, x3, y3);
      const ex1 = x1 + (x2 - x1) * 0.3, ey1 = y1 + (y2 - y1) * 0.3;
      const ex2 = x1 + (x2 - x1) * 0.8, ey2 = y1 + (y2 - y1) * 0.8;
      g.fillStyle(0xffbbbb, 0.3); g.fillTriangle(ex1, ey1, ex2, ey2, x3, y3);
    });
    // Eyes
    const ex = left ? -5 : 5;
    if (blink) {
      g.lineStyle(3, 0x050812, 1);
      g.lineBetween(cx + ex - 7, cy + bob - 20, cx + ex + 1, cy + bob - 20);
      g.lineBetween(cx + ex + 6, cy + bob - 20, cx + ex + 14, cy + bob - 20);
    } else {
      [[cx + ex - 3, cy + bob - 20], [cx + ex + 11, cy + bob - 20]].forEach(([px, py]) => {
        g.fillStyle(0x050812, 1); g.fillCircle(px, py, 5);
        g.fillStyle(mush ? 0x00e87a : star ? 0xffcc00 : 0x003300, 1); g.fillCircle(px, py, 3);
        g.fillStyle(0x050812, 1); g.fillCircle(px, py, 1.5);
        g.fillStyle(0xffffff, 0.9); g.fillCircle(px + 2, py - 2, 1.5);
      });
    }
    // Nose
    g.fillStyle(0xffaaaa, 0.9); g.fillCircle(cx + (left ? -2 : 2) + ex * 0.3, cy + bob - 10, 3);
    // Mouth
    g.lineStyle(2, 0x003300, 1);
    g.beginPath(); g.moveTo(cx + ex - 5, cy + bob - 5); g.lineTo(cx + ex, cy + bob - 1); g.lineTo(cx + ex + 5, cy + bob - 5); g.strokePath();
    // Arms
    g.lineStyle(9, bodyCol, 1);
    g.lineBetween(cx - 17, cy + bob, cx - 30, cy + bob + arm + 9);
    g.lineBetween(cx + 17, cy + bob, cx + 30, cy + bob - arm + 9);
    g.lineStyle(3, 0xffffff, 0.18); g.lineBetween(cx - 18, cy + bob, cx - 29, cy + bob + arm + 6);
    // Legs
    g.lineStyle(10, bodyCol, 1);
    g.lineBetween(cx - 8, cy + bob + 20, cx - 10 - leg, cy + bob + 36);
    g.lineBetween(cx + 8, cy + bob + 20, cx + 10 + leg, cy + bob + 36);
    g.fillStyle(bodyCol, 1); g.fillEllipse(cx - 10 - leg, cy + bob + 38, 14, 7); g.fillEllipse(cx + 10 + leg, cy + bob + 38, 14, 7);
    // Tail
    g.lineStyle(5, bodyCol, 0.9);
    const tailX = left ? cx + 16 : cx - 16;
    const tailDX = left ? 22 : -22;
    const curl = Math.sin(t * 2.2) * 12;
    g.beginPath(); g.moveTo(tailX, cy + bob + 10); g.lineTo(tailX + tailDX + curl, cy + bob - 8 + curl * 0.5); g.strokePath();
    // Auras
    if (star) { g.lineStyle(2, 0xffcc00, Math.sin(t * 8) * 0.3 + 0.5); g.strokeCircle(cx, cy + bob, 38); }
    if (mush) { g.fillStyle(0x00e87a, Math.sin(t * 6) * 0.06 + 0.06); g.fillCircle(cx, cy + bob, 48); }
    if (dash) {
      g.fillStyle(bodyCol, 0.25);
      const trailDir = left ? 1 : -1;
      for (let i = 1; i <= 3; i++) g.fillEllipse(cx + trailDir * i * 22, cy + bob, 36 - i * 8, 42 - i * 10);
    }
  }

  /* ================================================================
     COLLECT PICKUP
     ================================================================ */
  private collectPickup(pickup: Phaser.GameObjects.Arc) {
    const g = (pickup as any).__gfx as Phaser.GameObjects.Graphics;
    const type = (pickup as any).__type as string;
    g?.destroy();
    pickup.destroy();
    const body = (this.gnarpBox as any).body as Phaser.Physics.Arcade.Body;
    const px = body.x + 18, py = body.y;

    if (type === "token") {
      this.combo++;
      this.lastTokenTime = this.time.now;
      const comboMult = Math.min(this.combo, 8);
      const danceBonus = this.cb?.getDanceBonus() ?? 1;
      const starBonus = this.starActive ? 2 : 1;
      const earned = Math.floor(TOKEN_BASE * comboMult * danceBonus * starBonus);
      const scoreGain = TOKEN_BASE + this.combo * 20;
      this.score += scoreGain;
      this.sessionTokens++;
      this.cb?.onTokenCollect(earned, this.combo);
      this.cb?.onScoreUpdate(this.score);
      this.cb?.onComboUpdate(this.combo);
      this.spawnFloatText(px, py, `+${earned}`, this.combo >= 4 ? "#ffcc00" : "#ffd700");
      if (this.combo >= 3) this.spawnComboText(px, py - 20, `${this.combo}× COMBO!`);
      this.spawnTokenParticles(px, py);
    } else if (type === "mushroom") {
      this.mushActive = true; this.invincible = true;
      this.time.delayedCall(3200, () => { this.mushActive = false; this.invincible = false; });
      this.spawnFloatText(px, py, "🍄 无敌!", "#00e87a");
      this.cameras.main.shake(200, 0.003);
    } else if (type === "star") {
      this.starActive = true;
      this.time.delayedCall(4000, () => { this.starActive = false; });
      this.spawnFloatText(px, py, "⭐ 加速!", "#ffcc00");
      this.cameras.main.shake(200, 0.003);
    } else if (type === "crystal") {
      const bonus = 20 + this.combo * 5;
      this.cb?.onTokenCollect(bonus, this.combo);
      this.score += bonus * 3;
      this.cb?.onScoreUpdate(this.score);
      this.spawnFloatText(px, py, `💎 +${bonus}!`, "#00c2ff");
      this.cameras.main.shake(150, 0.002);
      this.spawnTokenParticles(px, py);
    }
    this.updateHUD();
  }

  /* ================================================================
     TOUCH ENEMY
     ================================================================ */
  private touchEnemy(enemy: Phaser.GameObjects.Rectangle) {
    if (this.invincible) return;
    const gnarpBody = (this.gnarpBox as any).body as Phaser.Physics.Arcade.Body;
    const enemyBody = (enemy as any).body as Phaser.Physics.Arcade.Body;

    if (gnarpBody.velocity.y > 10 && gnarpBody.y < enemyBody.y - 10) {
      gnarpBody.setVelocityY(JUMP_VEL * 0.65);
      this.score += ENEMY_SCORE + this.combo * 30;
      this.combo++;
      this.lastTokenTime = this.time.now;
      this.cb?.onScoreUpdate(this.score);
      this.cb?.onComboUpdate(this.combo);
      const eg = (enemy as any).__gfx as Phaser.GameObjects.Graphics;
      this.tweens.add({ targets: eg, alpha: 0, scaleX: 1.5, scaleY: 0, duration: 280, onComplete: () => eg?.destroy() });
      const ep = this.add.graphics().setDepth(15);
      ep.fillStyle(0xff4fa3, 0.5); ep.fillCircle(enemyBody.x + 22, enemyBody.y + 22, 24);
      this.tweens.add({ targets: ep, alpha: 0, scaleX: 2, scaleY: 2, duration: 350, onComplete: () => ep.destroy() });
      enemy.destroy();
      this.spawnFloatText(enemyBody.x + 22, enemyBody.y, `+${ENEMY_SCORE}!`, "#ff4fa3");
      this.cameras.main.shake(150, 0.004);
    } else {
      this.hp = Math.max(0, this.hp - 1);
      this.invincible = true;
      this.cb?.onHpUpdate(this.hp);
      gnarpBody.setVelocityX(gnarpBody.x < enemyBody.x ? -320 : 320);
      gnarpBody.setVelocityY(-240);
      this.cameras.main.shake(300, 0.006);
      this.time.delayedCall(1600, () => { if (!this.mushActive) this.invincible = false; });
      this.combo = 0;
      this.cb?.onComboUpdate(0);
      this.updateHUD();
      if (this.hp <= 0) this.time.delayedCall(400, () => this.onGameOver());
    }
  }

  /* ---- Particle Effects ---- */
  private spawnJumpParticles(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      const p = this.add.graphics().setDepth(8);
      p.fillStyle(0x00e87a, 0.6); p.fillCircle(x, y, 4);
      const angle = Math.PI + (i / 6) * Math.PI;
      this.tweens.add({ targets: p, x: p.x + Math.cos(angle) * 28, y: p.y + Math.sin(angle) * 18, alpha: 0, scaleX: 0.1, scaleY: 0.1, duration: 380, onComplete: () => p.destroy() });
    }
  }
  private spawnDoubleJumpEffect(x: number, y: number) {
    const p = this.add.graphics().setDepth(8);
    p.lineStyle(2.5, 0x00e87a, 0.8); p.strokeCircle(x, y, 10);
    this.tweens.add({ targets: p, scaleX: 3, scaleY: 3, alpha: 0, duration: 450, onComplete: () => p.destroy() });
  }
  private spawnDashEffect(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const p = this.add.graphics().setDepth(8);
      p.fillStyle(0x00e87a, 0.4); p.fillCircle(x, y + Phaser.Math.Between(-12, 12), 5);
      const dir = this.facingLeft ? 1 : -1;
      this.tweens.add({ targets: p, x: p.x + dir * Phaser.Math.Between(30, 80), alpha: 0, duration: 300, onComplete: () => p.destroy() });
    }
  }
  private spawnTokenParticles(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const p = this.add.graphics().setDepth(12);
      p.fillStyle(0xffd700, 0.9); p.fillCircle(x, y, 4);
      const angle = (i / 10) * Math.PI * 2;
      const speed = Phaser.Math.Between(40, 100);
      this.tweens.add({ targets: p, x: p.x + Math.cos(angle) * speed, y: p.y + Math.sin(angle) * speed, alpha: 0, scaleX: 0, scaleY: 0, duration: 500, onComplete: () => p.destroy() });
    }
  }
  private spawnFloatText(x: number, y: number, text: string, color: string) {
    const t = this.add.text(x, y, text, { fontSize: "16px", color, fontFamily: "monospace", fontStyle: "bold" }).setDepth(22).setOrigin(0.5, 1);
    this.tweens.add({ targets: t, y: y - 55, alpha: 0, duration: 1100, ease: "Power2", onComplete: () => t.destroy() });
  }
  private spawnComboText(x: number, y: number, text: string) {
    const cols = ["#ffcc00", "#ff8800", "#ff4fa3", "#00e87a"];
    const col = cols[Math.min(Math.floor(this.combo / 2), cols.length - 1)];
    const t = this.add.text(x, y, text, { fontSize: this.combo >= 6 ? "22px" : "17px", color: col, fontFamily: "monospace", fontStyle: "bold" }).setDepth(23).setOrigin(0.5, 1);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, scaleX: 1.4, scaleY: 1.4, duration: 1000, ease: "Back.easeOut", onComplete: () => t.destroy() });
  }

  /* ---- Level Complete / Game Over ---- */
  private onLevelClear() {
    this.physics.pause();
    const next = this.levelIdx + 1;
    this.cb?.onLevelComplete(this.levelIdx, this.sessionTokens);
    if (next < 20) {
      this.time.delayedCall(400, () =>
        this.scene.restart({ level: next, tokens: this.sessionTokens, score: this.score, hp: this.hp }));
    }
  }
  private onGameOver() {
    this.physics.pause();
    this.cb?.onGameOver(this.score, this.sessionTokens);
    this.scene.pause();
  }

  private updateHUD() {
    this.scoreText?.setText(`分数: ${this.score.toLocaleString()}`);
    this.tokenText?.setText(`Token: ${this.sessionTokens}`);
    this.hpText?.setText(`HP: ${"❤".repeat(Math.max(0, this.hp))}`);
    this.comboText?.setText(this.combo > 1 ? `× ${this.combo} COMBO` : "");
  }
}

/* ================================================================
   CREATE GAME
   ================================================================ */
export function createSuperGnarpGame(
  parent: string,
  callbacks: GameCallbacks,
  endless = false
): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: W, height: H, parent,
    backgroundColor: "#050812",
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scene: [BootScene, GameScene],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { activePointers: 4 },
  };

  const game = new Phaser.Game(config);

  const attachCb = () => {
    const gs = game.scene.getScene("Game") as GameScene | null;
    if (gs) {
      gs.setCallbacks(callbacks);
      if (endless) {
        gs.scene.restart({ level: 0, tokens: 0, score: 0, hp: 3, endless: true });
      }
    }
  };
  game.events.on(Phaser.Core.Events.READY, attachCb);
  setTimeout(attachCb, 500);

  return game;
}
