import Phaser from "phaser";

export interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onComboChange: (combo: number, grade: string) => void;
  onGameOver: (finalScore: number, tokensEarned: number) => void;
  onTokenClaim: (tokens: number) => void;
}

const ARROW_COLORS: Record<string, number> = {
  left: 0x39ff14,
  up: 0xbf5fff,
  right: 0xff2d78,
  down: 0x00ffff,
};

const ARROW_KEYS: Record<string, string> = {
  left: "←",
  up: "↑",
  right: "→",
  down: "↓",
};

const ARROW_SYMBOLS: Record<string, string> = {
  left: "◄",
  up: "▲",
  right: "►",
  down: "▼",
};

interface Arrow {
  gameObj: Phaser.GameObjects.Text;
  direction: string;
  lane: number;
  y: number;
  speed: number;
  hit: boolean;
}

class DanceMinerScene extends Phaser.Scene {
  private arrows: Arrow[] = [];
  private score = 0;
  private combo = 0;
  private multiplier = 1;
  private tokensEarned = 0;
  private callbacks: GameCallbacks;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyBindings: Record<string, Phaser.Input.Keyboard.Key> = {};
  private laneX: number[] = [];
  private hitZoneY = 0;
  private gameRunning = true;
  private timeLeft = 60;
  private spawnTimer = 0;
  private spawnInterval = 900;
  private bpm = 128;
  private beat = 0;
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: number; text: string }> = [];
  private laneHighlight: Record<string, { timer: number; grade: string }> = {};
  private lastJudge = "";
  private judgeTimer = 0;
  private timerText?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
  private comboText?: Phaser.GameObjects.Text;
  private judgeText?: Phaser.GameObjects.Text;
  private tokenText?: Phaser.GameObjects.Text;
  private gnarpCat?: Phaser.GameObjects.Text;
  private gnarpAnim = 0;
  private danceBeat = 0;
  private isDesktop: boolean;

  constructor(callbacks: GameCallbacks) {
    super("DanceMiner");
    this.callbacks = callbacks;
    this.isDesktop = window.innerWidth >= 768;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.laneX = [w * 0.15, w * 0.38, w * 0.62, w * 0.85];
    this.hitZoneY = h - 100;

    this.add.rectangle(0, 0, w, h, 0x030611).setOrigin(0, 0);

    for (let i = 0; i < 100; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const size = Math.random() * 2 + 1;
      const alpha = Math.random() * 0.5 + 0.2;
      const colors = [0x39ff14, 0xbf5fff, 0xff2d78, 0xffffff];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const star = this.add.circle(x, y, size, color, alpha);
      this.tweens.add({
        targets: star,
        alpha: { from: alpha, to: 0.1 },
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
      });
    }

    const laneColors = [0x39ff14, 0xbf5fff, 0xff2d78, 0x00ffff];
    this.laneX.forEach((x, i) => {
      this.add.rectangle(x, h / 2, 2, h, laneColors[i], 0.15).setOrigin(0.5, 0.5);

      const hitCircle = this.add.circle(x, this.hitZoneY, 30, laneColors[i], 0.15);
      const hitBorder = this.add.circle(x, this.hitZoneY, 30, 0, 0);
      hitBorder.setStrokeStyle(2, laneColors[i], 0.6);

      const dirs = ["left", "up", "right", "down"];
      const label = this.add.text(x, this.hitZoneY, ARROW_SYMBOLS[dirs[i]], {
        fontSize: "24px",
        color: `#${laneColors[i].toString(16).padStart(6, "0")}`,
        fontFamily: "monospace",
        fontStyle: "bold",
      }).setOrigin(0.5, 0.5).setAlpha(0.4);

      const keyLabel = this.add.text(x, this.hitZoneY + 45, ARROW_KEYS[dirs[i]], {
        fontSize: "14px",
        color: "#666",
        fontFamily: "monospace",
      }).setOrigin(0.5, 0.5);
    });

    this.add.rectangle(0, this.hitZoneY, w, 2, 0xffffff, 0.1).setOrigin(0, 0.5);

    this.gnarpCat = this.add.text(w / 2, h / 2 - 30, "(=^･ω･^=)", {
      fontSize: "28px",
      color: "#39ff14",
      fontFamily: "monospace",
      fontStyle: "bold",
    }).setOrigin(0.5, 0.5);

    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "18px",
      color: "#39ff14",
      fontFamily: "monospace",
      fontStyle: "bold",
    }).setShadow(0, 0, "#39ff14", 8);

    this.comboText = this.add.text(16, 44, "", {
      fontSize: "15px",
      color: "#bf5fff",
      fontFamily: "monospace",
      fontStyle: "bold",
    }).setShadow(0, 0, "#bf5fff", 6);

    this.tokenText = this.add.text(16, 68, "Tokens: 0", {
      fontSize: "13px",
      color: "#ffcc00",
      fontFamily: "monospace",
    });

    this.timerText = this.add.text(w - 16, 16, "60s", {
      fontSize: "22px",
      color: "#ff2d78",
      fontFamily: "monospace",
      fontStyle: "bold",
    }).setOrigin(1, 0).setShadow(0, 0, "#ff2d78", 8);

    this.judgeText = this.add.text(w / 2, h / 2 + 30, "", {
      fontSize: "26px",
      fontFamily: "monospace",
      fontStyle: "bold",
    }).setOrigin(0.5, 0.5);

    this.cursors = this.input.keyboard!.createCursorKeys();
    const dirs = ["left", "up", "right", "down"];
    dirs.forEach((dir) => {
      const key = Phaser.Input.Keyboard.KeyCodes[dir.toUpperCase() as keyof typeof Phaser.Input.Keyboard.KeyCodes];
      this.keyBindings[dir] = this.input.keyboard!.addKey(key);
    });

    this.time.addEvent({
      delay: 1000,
      repeat: 59,
      callback: () => {
        if (!this.gameRunning) return;
        this.timeLeft--;
        this.timerText?.setText(`${this.timeLeft}s`);
        if (this.timeLeft <= 10) {
          this.timerText?.setStyle({ color: "#ff2d78", fontSize: "26px" });
        }
        if (this.timeLeft <= 0) {
          this.gameRunning = false;
          this.time.addEvent({
            delay: 500,
            callback: () => {
              this.callbacks.onGameOver(this.score, this.tokensEarned);
            },
          });
        }
      },
    });

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      const x = p.x;
      const laneWidth = this.cameras.main.width / 4;
      const laneIdx = Math.min(3, Math.floor(x / laneWidth));
      const dirs = ["left", "up", "right", "down"];
      this.checkHit(dirs[laneIdx]);
    });
  }

  checkHit(dir: string) {
    if (!this.gameRunning) return;

    const matching = this.arrows.filter(
      (a) => !a.hit && a.direction === dir && Math.abs(a.y - this.hitZoneY) < 80
    );

    if (matching.length === 0) {
      this.combo = 0;
      this.multiplier = 1;
      this.showJudge("Miss", "#666");
      this.callbacks.onComboChange(0, "miss");
      return;
    }

    const closest = matching.reduce((prev, curr) =>
      Math.abs(curr.y - this.hitZoneY) < Math.abs(prev.y - this.hitZoneY) ? curr : prev
    );

    const dist = Math.abs(closest.y - this.hitZoneY);
    closest.hit = true;
    closest.gameObj.destroy();

    let grade = "";
    let points = 0;
    let color = "";

    if (dist < 20) {
      grade = "PERFECT";
      points = 300;
      color = "#39ff14";
      this.combo++;
    } else if (dist < 45) {
      grade = "GREAT";
      points = 150;
      color = "#bf5fff";
      this.combo++;
    } else {
      grade = "GOOD";
      points = 60;
      color = "#ffcc00";
      this.combo++;
    }

    this.multiplier = 1 + Math.floor(this.combo / 10) * 0.5;
    const earned = Math.floor(points * this.multiplier);
    this.score += earned;
    this.tokensEarned = Math.floor(this.score / 1000);

    this.scoreText?.setText(`Score: ${this.score}`);
    this.tokenText?.setText(`Tokens: ${this.tokensEarned}`);
    this.comboText?.setText(this.combo > 1 ? `${this.combo}x Combo! (x${this.multiplier.toFixed(1)})` : "");

    this.showJudge(grade, color);
    this.spawnHitParticle(closest.lane, color, `+${earned}`);
    this.callbacks.onScoreChange(this.score);
    this.callbacks.onComboChange(this.combo, grade.toLowerCase());
    this.danceBeat = 8;
  }

  showJudge(text: string, color: string) {
    this.judgeText?.setText(text).setStyle({ color }).setAlpha(1);
    this.judgeTimer = 30;
  }

  spawnHitParticle(lane: number, color: string, text: string) {
    this.particles.push({
      x: this.laneX[lane],
      y: this.hitZoneY,
      vx: (Math.random() - 0.5) * 3,
      vy: -4 - Math.random() * 2,
      life: 40,
      color: parseInt(color.slice(1), 16),
      text,
    });
  }

  update(time: number, delta: number) {
    if (!this.gameRunning) return;

    const dirs = ["left", "up", "right", "down"];
    dirs.forEach((dir) => {
      if (Phaser.Input.Keyboard.JustDown(this.keyBindings[dir])) {
        this.checkHit(dir);
      }
    });

    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      const count = Math.random() < 0.3 ? 2 : 1;
      const usedLanes = new Set<number>();
      for (let i = 0; i < count; i++) {
        let lane = Math.floor(Math.random() * 4);
        if (usedLanes.has(lane)) lane = (lane + 1) % 4;
        usedLanes.add(lane);
        this.spawnArrow(dirs[lane], lane);
      }
      this.spawnInterval = Math.max(400, 900 - Math.floor(this.score / 2000) * 30);
    }

    this.beat += delta;
    const beatLen = (60 / this.bpm) * 1000;
    if (this.beat >= beatLen) {
      this.beat -= beatLen;
      this.gnarpAnim = (this.gnarpAnim + 1) % 4;
    }

    if (this.danceBeat > 0) {
      this.danceBeat--;
      const catFrames = ["(=^･ω･^=)", "(=^o^=)ﾉ", "(=^‥^=)", "(^･o･^)ﾉ"];
      this.gnarpCat?.setText(catFrames[this.gnarpAnim]);
      const scale = 1 + Math.sin(this.danceBeat * 0.5) * 0.2;
      this.gnarpCat?.setScale(scale);
    } else {
      const catFrames = ["(=^･ω･^=)", "(=^･ｪ･^=)", "(=^‥^=)", "(=ФωФ=)"];
      this.gnarpCat?.setText(catFrames[this.gnarpAnim]);
      this.gnarpCat?.setScale(1);
    }

    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i];
      if (a.hit) {
        this.arrows.splice(i, 1);
        continue;
      }
      const speed = (250 + this.score * 0.005) * (delta / 1000);
      a.y += speed;
      a.gameObj.y = a.y;

      if (a.y > this.hitZoneY + 80) {
        if (!a.hit) {
          this.combo = 0;
          this.multiplier = 1;
          this.callbacks.onComboChange(0, "miss");
        }
        a.gameObj.destroy();
        this.arrows.splice(i, 1);
      }
    }

    if (this.judgeTimer > 0) {
      this.judgeTimer--;
      this.judgeText?.setAlpha(this.judgeTimer / 30);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  spawnArrow(dir: string, lane: number) {
    const x = this.laneX[lane];
    const color = ARROW_COLORS[dir];
    const symbol = ARROW_SYMBOLS[dir];
    const hex = `#${color.toString(16).padStart(6, "0")}`;

    const text = this.add.text(x, -30, symbol, {
      fontSize: "32px",
      color: hex,
      fontFamily: "monospace",
      fontStyle: "bold",
    }).setOrigin(0.5, 0.5).setShadow(0, 0, hex, 10);

    this.arrows.push({ gameObj: text, direction: dir, lane, y: -30, speed: 280, hit: false });
  }
}

export function createDanceMinerGame(containerId: string, callbacks: GameCallbacks): Phaser.Game {
  const container = document.getElementById(containerId);
  const w = container?.clientWidth || 500;
  const h = Math.min(window.innerHeight * 0.65, 550);

  return new Phaser.Game({
    type: Phaser.AUTO,
    width: w,
    height: h,
    backgroundColor: "#030611",
    parent: containerId,
    scene: new DanceMinerScene(callbacks),
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    audio: { disableWebAudio: true },
  });
}
