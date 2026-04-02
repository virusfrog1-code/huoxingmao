import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  opacity: number; maxOpacity: number;
  color: string;
  life: number; maxLife: number;
  type: "star" | "dot";
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create static stars
    const starColors = ["#ffffff", "#e0ffe8", "#c8b8ff", "#ffffff", "#ffffff"];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: 0, vy: 0,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.1,
        maxOpacity: Math.random() * 0.6 + 0.2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 200,
        type: "star",
      });
    }

    // Subtle energy particles
    for (let i = 0; i < 20; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: 0,
        maxOpacity: Math.random() * 0.25 + 0.05,
        color: Math.random() > 0.5 ? "#00e87a" : "#9b6dff",
        life: 0,
        maxLife: 300 + Math.random() * 300,
        type: "dot",
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of stars) {
        p.life++;
        if (p.life > p.maxLife) {
          p.life = 0;
          if (p.type === "dot") {
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
          }
        }

        const progress = p.life / p.maxLife;
        const fade = progress < 0.2
          ? progress / 0.2
          : progress > 0.8
          ? (1 - progress) / 0.2
          : 1;

        p.opacity = p.maxOpacity * fade;
        p.x += p.vx;
        p.y += p.vy;

        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.type === "dot") {
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

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
    />
  );
}
