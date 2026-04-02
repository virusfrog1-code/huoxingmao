import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  opacityDir: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars: Star[] = [];
    const particles: Particle[] = [];
    const colors = ["#39ff14", "#bf5fff", "#ff2d78", "#ffffff", "#00ffff"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random(),
        opacityDir: Math.random() > 0.5 ? 1 : -1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const spawnParticle = () => {
      const pawColors = ["#39ff14", "#bf5fff", "#ff2d78"];
      particles.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 2 + 1),
        life: 0,
        maxLife: 120 + Math.random() * 80,
        size: Math.random() * 8 + 4,
        color: pawColors[Math.floor(Math.random() * pawColors.length)],
      });
    };

    const drawPaw = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      const padPositions = [
        { dx: -size * 0.8, dy: -size * 1.1 },
        { dx: size * 0.8, dy: -size * 1.1 },
        { dx: -size * 1.3, dy: size * 0.1 },
        { dx: size * 1.3, dy: size * 0.1 },
      ];
      padPositions.forEach(({ dx, dy }) => {
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        star.opacity += star.opacityDir * 0.008;
        if (star.opacity >= 1 || star.opacity <= 0.1) star.opacityDir *= -1;
        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (frame % 30 === 0) spawnParticle();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = 1 - p.life / p.maxLife;
        drawPaw(ctx, p.x, p.y, p.size, p.color, alpha * 0.6);
      }

      frame++;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}
