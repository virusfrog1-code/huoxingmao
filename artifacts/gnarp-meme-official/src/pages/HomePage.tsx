import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Gamepad2, Image, Coins, Zap, Star, Rocket } from "lucide-react";

function GnarpDanceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const drawCat = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation: number, bounceY: number) => {
      ctx.save();
      ctx.translate(x, y + bounceY);
      ctx.rotate(rotation);

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-size * 0.7, -size * 0.7);
      ctx.lineTo(-size * 0.3, -size * 1.2);
      ctx.lineTo(0.1, -size * 0.8);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(size * 0.7, -size * 0.7);
      ctx.lineTo(size * 0.3, -size * 1.2);
      ctx.lineTo(-0.1, -size * 0.8);
      ctx.fill();

      ctx.fillStyle = "#030611";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(-size * 0.3, -size * 0.1, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.3, -size * 0.1, size * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color === "#39ff14" ? "#ff2d78" : "#39ff14";
      ctx.fillStyle = "#ff9de2";
      ctx.beginPath();
      ctx.arc(0, size * 0.1, size * 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#fff9";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
      [-size * 0.6, -size * 0.3, size * 0.3, size * 0.6].forEach((wx) => {
        ctx.beginPath();
        ctx.moveTo(wx, size * 0.1);
        ctx.lineTo(wx + (wx < 0 ? -size * 0.5 : size * 0.5), size * 0.1);
        ctx.stroke();
      });

      ctx.restore();
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const t = frame.current * 0.05;

      const cats = [
        {
          x: w * 0.2,
          y: h * 0.5,
          size: 40,
          color: "#39ff14",
          rot: Math.sin(t + 0) * 0.3,
          bounce: Math.sin(t * 2 + 0) * 20,
        },
        {
          x: w * 0.5,
          y: h * 0.45,
          size: 55,
          color: "#bf5fff",
          rot: Math.sin(t + 1) * 0.4,
          bounce: Math.sin(t * 2 + 1) * 25,
        },
        {
          x: w * 0.8,
          y: h * 0.5,
          size: 40,
          color: "#ff2d78",
          rot: Math.sin(t + 2) * 0.3,
          bounce: Math.sin(t * 2 + 2) * 20,
        },
      ];

      cats.forEach((cat) => {
        drawCat(ctx, cat.x, cat.y, cat.size, cat.color, cat.rot, cat.bounce);
      });

      frame.current++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      className="w-full max-w-2xl"
      style={{ maxHeight: 200 }}
    />
  );
}

export default function HomePage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-4 relative z-10">
      <div
        className={`text-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="mb-4">
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
            style={{
              background: "rgba(57, 255, 20, 0.15)",
              color: "#39ff14",
              border: "1px solid #39ff1466",
              boxShadow: "0 0 10px #39ff1430",
            }}
          >
            <Zap size={10} className="inline mr-1" />
            全球最萌外星 Meme
          </span>
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 leading-tight"
          style={{
            background: "linear-gradient(135deg, #39ff14 0%, #bf5fff 50%, #ff2d78 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
          }}
        >
          Gnarp Gnarp！
        </h1>

        <h2
          className="text-lg sm:text-xl md:text-2xl font-bold mb-6"
          style={{ color: "#bf5fff", textShadow: "0 0 10px #bf5fff66" }}
        >
          外星小猫来地球摸鱼啦～
        </h2>

        <div className="mb-8">
          <GnarpDanceCanvas />
        </div>

        <p
          className="text-base sm:text-lg mb-8 max-w-lg mx-auto"
          style={{ color: "#a0a0c0" }}
        >
          来自外太空 Gnarp 星球的神秘猫猫，带着洗脑舞步降落地球，要在地球上挖最多的 Token！
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/game"
            className="btn-neon-green flex items-center gap-2 px-8 py-4 rounded-xl font-black text-lg"
          >
            <Gamepad2 size={22} />
            玩小游戏
          </Link>
          <Link
            to="/gallery"
            className="btn-neon-purple flex items-center gap-2 px-8 py-4 rounded-xl font-black text-lg"
          >
            <Image size={22} />
            二创投稿
          </Link>
          <Link
            to="/token"
            className="btn-neon-pink flex items-center gap-2 px-8 py-4 rounded-xl font-black text-lg"
          >
            <Coins size={22} />
            Gnarp Token
          </Link>
        </div>
      </div>

      <div className="mt-20 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
        {[
          {
            icon: <Rocket size={32} style={{ color: "#39ff14" }} />,
            title: "节奏挖矿",
            desc: "跟随洗脑BGM节奏，完美连击赚取 Gnarp Token！",
            color: "#39ff14",
          },
          {
            icon: <Star size={32} style={{ color: "#bf5fff" }} />,
            title: "全球排行",
            desc: "和全球 Gnarp 粉丝争夺挖矿冠军，登上名人堂！",
            color: "#bf5fff",
          },
          {
            icon: <Coins size={32} style={{ color: "#ff2d78" }} />,
            title: "Token 升级",
            desc: "用 Token 升级矿机，开启离线挖矿，躺赚不停！",
            color: "#ff2d78",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="card-glow rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 cursor-default"
            style={{
              animationDelay: `${i * 0.2}s`,
              border: `1px solid ${item.color}44`,
              boxShadow: `0 0 20px ${item.color}22`,
            }}
          >
            <div className="flex justify-center mb-4">{item.icon}</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: item.color }}>
              {item.title}
            </h3>
            <p className="text-sm" style={{ color: "#8888aa" }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mt-16 w-full overflow-hidden"
        style={{ borderTop: "1px solid rgba(57, 255, 20, 0.2)", borderBottom: "1px solid rgba(57, 255, 20, 0.2)", padding: "10px 0" }}
      >
        <div
          className="animate-marquee whitespace-nowrap"
          style={{ color: "#39ff1488", fontSize: "14px", fontWeight: "bold" }}
        >
          {Array.from({ length: 8 }, (_, i) =>
            <span key={i} className="mx-8">🐱 Gnarp Gnarp！ ✦ Token To The Moon ✦ 外星小猫来地球摸鱼啦 ✦ Dance &amp; Mine ✦ Gnarp Nation ✦</span>
          )}
        </div>
      </div>
    </div>
  );
}
