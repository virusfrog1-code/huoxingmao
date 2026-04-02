import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowRight, Gamepad2, Image, Coins, ChevronDown, Zap, Globe, TrendingUp } from "lucide-react";

function GnarpHeroArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;

    const drawGnarp = (ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) => {
      const bob = Math.sin(t * 1.5) * 8;
      const y = cy + bob;

      // Outer glow ring
      const ringGrad = ctx.createRadialGradient(cx, y, 40, cx, y, 120);
      ringGrad.addColorStop(0, "rgba(0, 232, 122, 0.12)");
      ringGrad.addColorStop(1, "rgba(0, 232, 122, 0)");
      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.arc(cx, y, 120, 0, Math.PI * 2);
      ctx.fill();

      // Body shadow
      ctx.save();
      ctx.shadowBlur = 40;
      ctx.shadowColor = "#00e87a";

      // Body
      ctx.fillStyle = "#00e87a";
      ctx.beginPath();
      ctx.ellipse(cx, y + 10, 55, 62, 0, 0, Math.PI * 2);
      ctx.fill();

      // Belly
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.ellipse(cx, y + 18, 30, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Ears
      ctx.fillStyle = "#00e87a";
      ctx.shadowBlur = 0;
      [[-40, -55], [40, -55]].forEach(([dx, ey]) => {
        ctx.save();
        ctx.translate(cx + dx, y + ey);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-18, -28);
        ctx.lineTo(18, -28);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,200,200,0.3)";
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(-11, -24);
        ctx.lineTo(11, -24);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Head
      ctx.fillStyle = "#00e87a";
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#00e87a";
      ctx.beginPath();
      ctx.arc(cx, y - 30, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Eyes
      const blink = Math.sin(t * 0.3) > 0.97;
      ctx.fillStyle = "#050812";
      if (blink) {
        [-17, 17].forEach((dx) => {
          ctx.fillRect(cx + dx - 8, y - 42, 16, 4);
        });
      } else {
        [-17, 17].forEach((dx) => {
          ctx.beginPath();
          ctx.arc(cx + dx, y - 40, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.beginPath();
          ctx.arc(cx + dx + 3, y - 43, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#050812";
        });
      }

      // Nose
      ctx.fillStyle = "rgba(255, 180, 180, 0.8)";
      ctx.beginPath();
      ctx.arc(cx, y - 28, 5, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.strokeStyle = "#050812";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 10, y - 20);
      ctx.quadraticCurveTo(cx, y - 12, cx + 10, y - 20);
      ctx.stroke();

      // Arms
      const armSwing = Math.sin(t * 1.5) * 0.3;
      ctx.strokeStyle = "#00e87a";
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00e87a";
      ctx.beginPath();
      ctx.moveTo(cx - 48, y + 5);
      ctx.quadraticCurveTo(cx - 72, y + 5 + Math.sin(armSwing + 0.5) * 20, cx - 60, y + 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 48, y + 5);
      ctx.quadraticCurveTo(cx + 72, y + 5 + Math.sin(-armSwing + 0.5) * 20, cx + 60, y + 30);
      ctx.stroke();
      ctx.restore();

      // Legs
      ctx.lineWidth = 16;
      ctx.lineCap = "round";
      const legSwing = Math.sin(t * 1.5) * 8;
      [-18, 18].forEach((dx, i) => {
        const swing = i === 0 ? legSwing : -legSwing;
        ctx.beginPath();
        ctx.moveTo(cx + dx, y + 65);
        ctx.lineTo(cx + dx + swing, y + 100);
        ctx.stroke();
      });

      // Tail
      ctx.strokeStyle = "#00e87a";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#00e87a";
      ctx.beginPath();
      ctx.moveTo(cx + 45, y + 40);
      const tailCurl = Math.sin(t * 2) * 20;
      ctx.quadraticCurveTo(cx + 80 + tailCurl, y + 20, cx + 70, y - 10 + tailCurl);
      ctx.stroke();
      ctx.restore();

      // Token sparkles around
      const sparkles = [
        { angle: t * 0.8, r: 110, size: 12, color: "#ffd700" },
        { angle: t * 0.8 + 2.1, r: 130, size: 10, color: "#9b6dff" },
        { angle: t * 0.8 + 4.2, r: 105, size: 8, color: "#00e87a" },
      ];
      sparkles.forEach(({ angle, r, size, color }) => {
        const sx = cx + Math.cos(angle) * r;
        const sy = y + Math.sin(angle) * r * 0.5;
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, sy, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const t = frame.current * 0.04;
      drawGnarp(ctx, w / 2, h / 2 + 20, t);
      frame.current++;
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={340}
      height={340}
      className="w-full max-w-xs mx-auto"
      style={{ maxWidth: 320 }}
    />
  );
}

const stats = [
  { label: "全球猫奴", value: "128K+", icon: <Globe size={16} /> },
  { label: "Token 矿工", value: "42K+", icon: <Zap size={16} /> },
  { label: "市值目标", value: "$100M", icon: <TrendingUp size={16} /> },
];

export default function HomePage() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative z-10">
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-5">
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="badge badge-green mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce-subtle" />
                外星 Meme 项目 · 2026
              </div>

              <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] mb-5 tracking-tight">
                <span style={{ color: "#f5f5f7" }}>Gnarp</span>
                <br />
                <span className="gradient-text">Gnarp！</span>
              </h1>

              <p
                className="text-lg mb-3 font-medium"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                外星小猫来地球摸鱼啦～
              </p>
              <p
                className="text-sm leading-relaxed mb-8 max-w-md"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                来自 Gnarp 星球的外星猫猫，带着宇宙级别的摸鱼技术降临地球。
                玩平台跳跃游戏、挖 Gnarp Token、加入全球猫奴大军。
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/game"
                  className="btn-primary flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm"
                >
                  <Gamepad2 size={16} />
                  玩 Super Gnarp
                  <ArrowRight size={14} />
                </Link>
                <Link
                  to="/gallery"
                  className="btn-secondary flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm"
                >
                  <Image size={16} />
                  Meme 图库
                </Link>
                <Link
                  to="/token"
                  className="btn-outline flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm"
                >
                  <Coins size={16} />
                  $GNARP Token
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-10">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div
                      className="text-2xl font-black mb-0.5"
                      style={{ color: "#00e87a" }}
                    >
                      {s.value}
                    </div>
                    <div
                      className="text-xs flex items-center gap-1"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {s.icon}
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Gnarp art */}
            <div
              className={`flex justify-center transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="relative">
                {/* Glow backdrop */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl"
                  style={{
                    background: "radial-gradient(circle, rgba(0,232,122,0.2) 0%, rgba(155,109,255,0.1) 50%, transparent 70%)",
                    transform: "scale(1.4)",
                  }}
                />
                {/* NOTE: Replace the Canvas art below with your Gnarp image:
                    <img src="/assets/gnarp.png" alt="Gnarp" className="w-72 h-72 object-contain relative z-10" />
                    Place gnarp.png in artifacts/gnarp-meme-official/public/assets/ */}
                <GnarpHeroArt />
              </div>
            </div>
          </div>
        </div>

        <a
          href="#features"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce-subtle"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          <span className="text-xs">探索更多</span>
          <ChevronDown size={16} />
        </a>
      </section>

      {/* Ticker */}
      <div
        className="overflow-hidden py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="ticker-track">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="inline-flex items-center gap-6 px-8" style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, fontWeight: 600 }}>
              <span style={{ color: "#00e87a" }}>✦</span> GNARP GNARP
              <span style={{ color: "#00e87a" }}>✦</span> TOKEN TO THE MOON
              <span style={{ color: "#00e87a" }}>✦</span> SUPER GNARP GAME
              <span style={{ color: "#9b6dff" }}>✦</span> ALIEN CAT NATION
              <span style={{ color: "#ff4fa3" }}>✦</span> IDLE MINING
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">为什么选择 Gnarp</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "#f5f5f7" }}>
              外星摸鱼，<span className="gradient-text">人间至理</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "🎮",
                title: "Super Gnarp 游戏",
                desc: "完整横版平台跳跃游戏，踩敌人、收金币、解锁关卡。经典 Mario 玩法 + 宇宙主题。",
                accent: "#00e87a",
                cls: "",
              },
              {
                icon: "⛏️",
                title: "边玩边挖矿",
                desc: "游戏中收集的每枚 Token 都计入你的钱包。升级矿机，离线也能持续产出。",
                accent: "#9b6dff",
                cls: "card-purple",
              },
              {
                icon: "🌙",
                title: "$GNARP Token",
                desc: "即将登陆 DEX。总量 4.2 亿，40% 用于挖矿奖励，直接分配给游戏玩家。",
                accent: "#ff4fa3",
                cls: "card-pink",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`card ${f.cls} p-6`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${f.accent}18` }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: "#f5f5f7" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{f.desc}</p>
                <div
                  className="mt-4 text-xs font-semibold flex items-center gap-1"
                  style={{ color: f.accent }}
                >
                  了解更多 <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(0,232,122,0.08) 0%, rgba(155,109,255,0.08) 100%)",
              border: "1px solid rgba(0, 232, 122, 0.2)",
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: "radial-gradient(ellipse at 30% 50%, rgba(0,232,122,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(155,109,255,0.15) 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10">
              <p className="section-label mb-4">立即加入</p>
              <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight" style={{ color: "#f5f5f7" }}>
                加入 <span className="gradient-text">128,000+</span> 外星猫奴
              </h2>
              <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
                从现在开始挖矿，等 $GNARP 上线的时候你已经是矿主了。
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/game" className="btn-primary px-8 py-3.5 rounded-xl text-sm flex items-center gap-2">
                  <Gamepad2 size={16} /> 开始挖矿
                </Link>
                <a
                  href="https://twitter.com/Ricedmdq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline px-8 py-3.5 rounded-xl text-sm"
                >
                  关注 @Ricedmdq
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
