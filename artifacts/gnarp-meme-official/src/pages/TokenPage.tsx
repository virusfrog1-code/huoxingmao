import { useEffect, useRef, useState } from "react";
import { TrendingUp, Wallet, Rocket, Shield, Copy, Check, ArrowRight, Zap } from "lucide-react";

function MiniChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const w = c.width; const h = c.height;

    const data = Array.from({ length: 80 }, (_, i) => {
      const trend = i * 0.0002;
      const wave = Math.sin(i * 0.4) * 0.00008 + Math.sin(i * 0.15) * 0.00012;
      const noise = (Math.random() - 0.45) * 0.00003;
      return Math.max(0.00030, 0.00035 + trend + wave + noise);
    });

    const min = Math.min(...data) * 0.97;
    const max = Math.max(...data) * 1.03;
    const toY = (v: number) => h - ((v - min) / (max - min)) * h * 0.82 - h * 0.06;
    const toX = (i: number) => (i / (data.length - 1)) * w;

    ctx.clearRect(0, 0, w, h);

    // Fill gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(0, 232, 122, 0.25)");
    grad.addColorStop(1, "rgba(0, 232, 122, 0)");

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0]));
    for (let i = 1; i < data.length; i++) {
      const px = toX(i - 1); const py = toY(data[i - 1]);
      const cx1 = (px + toX(i)) / 2; const cx2 = cx1;
      ctx.bezierCurveTo(cx1, py, cx2, toY(data[i]), toX(i), toY(data[i]));
    }
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0]));
    for (let i = 1; i < data.length; i++) {
      const px = toX(i - 1); const py = toY(data[i - 1]);
      const cx1 = (px + toX(i)) / 2;
      ctx.bezierCurveTo(cx1, py, cx1, toY(data[i]), toX(i), toY(data[i]));
    }
    ctx.strokeStyle = "#00e87a"; ctx.lineWidth = 2;
    ctx.shadowColor = "#00e87a"; ctx.shadowBlur = 8; ctx.stroke();

    // Dot
    const lx = toX(data.length - 1); const ly = toY(data[data.length - 1]);
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#00e87a"; ctx.shadowBlur = 16; ctx.fill();
  }, []);

  return <canvas ref={ref} width={600} height={160} className="w-full rounded-xl" style={{ background: "rgba(0,232,122,0.02)" }} />;
}

const tokenomics = [
  { label: "挖矿奖励", pct: 40, color: "#00e87a" },
  { label: "社区空投", pct: 25, color: "#9b6dff" },
  { label: "流动性池", pct: 20, color: "#ff4fa3" },
  { label: "开发团队", pct: 10, color: "#00c2ff" },
  { label: "营销推广", pct: 5, color: "#ffd700" },
];

const roadmap = [
  { q: "Q1 2026", items: ["Super Gnarp 游戏上线", "挖矿系统 v1", "社区建设 10K+"], done: true },
  { q: "Q2 2026", items: ["$GNARP Token 发行", "DEX 上线 (Raydium)", "游戏更新 v2"], done: false },
  { q: "Q3 2026", items: ["CEX 上线谈判", "NFT 系列发布", "DAO 治理启动"], done: false },
  { q: "Q4 2026", items: ["Gnarp 元宇宙", "跨链扩展", "月球 🌙"], done: false },
];

export default function TokenPage() {
  const [copied, setCopied] = useState(false);
  const ca = "0xGN4RP...4Moon";
  const copy = () => { navigator.clipboard.writeText(ca).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="relative z-10 min-h-screen pt-28 pb-20 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 animate-fade-up">
          <p className="section-label mb-4">Gnarp Token</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            <span style={{ color: "#f5f5f7" }}>$</span><span className="gradient-text-green">GNARP</span>
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            外星舞步挖矿 · 边玩边赚 · Token 飞向月球
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "当前价格", value: "$0.00042", sub: "+12.4% 24h", color: "#00e87a" },
            { label: "市值", value: "$4.2M", sub: "流通市值", color: "#9b6dff" },
            { label: "总供应", value: "420M", sub: "固定上限", color: "#ff4fa3" },
            { label: "持有人", value: "8,421", sub: "独立钱包", color: "#ffd700" },
          ].map((s, i) => (
            <div key={i} className="card p-5">
              <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
              <div className="text-xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-base flex items-center gap-2" style={{ color: "#f5f5f7" }}>
              <TrendingUp size={18} style={{ color: "#00e87a" }} /> 价格走势
            </h2>
            <div className="flex gap-2">
              {["1H","24H","7D","30D"].map((t) => (
                <button
                  key={t}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${t === "7D" ? "btn-primary" : "btn-outline"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <MiniChart />
          <div className="flex items-center justify-between mt-3 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>过去 7 天</span>
            <span style={{ color: "#00e87a" }}>▲ +28.6%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tokenomics */}
          <div className="card p-6">
            <h2 className="font-black text-base mb-5" style={{ color: "#f5f5f7" }}>代币分配</h2>
            <div className="space-y-3">
              {tokenomics.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs w-20 text-right flex-shrink-0" style={{ color: "rgba(255,255,255,0.5)" }}>{t.label}</div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${t.pct}%`, background: t.color, boxShadow: `0 0 8px ${t.color}88` }}
                    />
                  </div>
                  <span className="text-xs font-bold w-8 flex-shrink-0" style={{ color: t.color }}>{t.pct}%</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.12)" }}>
              <div className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>合约地址（占位）</div>
              <div className="flex items-center gap-2">
                <code className="text-xs flex-1 truncate" style={{ color: "#00e87a" }}>{ca}</code>
                <button onClick={copy} className="flex-shrink-0 transition-colors" style={{ color: copied ? "#00e87a" : "rgba(255,255,255,0.3)" }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Buy + Connect */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-black text-sm mb-1.5 flex items-center gap-2" style={{ color: "#f5f5f7" }}>
                <Wallet size={16} style={{ color: "#9b6dff" }} /> 连接钱包
              </h3>
              <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                连接你的钱包，随时查看 Token 余额和交易记录
              </p>
              <div className="space-y-2">
                {["MetaMask", "WalletConnect", "Phantom"].map((w) => (
                  <button
                    key={w}
                    onClick={() => alert(`${w} 连接功能即将上线！关注 @Ricedmdq 获取上线通知`)}
                    className="w-full btn-outline py-2.5 rounded-xl text-xs text-left px-4 flex items-center justify-between"
                  >
                    <span>{w}</span>
                    <ArrowRight size={12} style={{ opacity: 0.4 }} />
                  </button>
                ))}
              </div>
            </div>

            <div
              className="card p-6"
              style={{ background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.15)" }}
            >
              <h3 className="font-black text-sm mb-1.5 flex items-center gap-2" style={{ color: "#f5f5f7" }}>
                <Rocket size={16} style={{ color: "#00e87a" }} /> 购买 $GNARP
              </h3>
              <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                $GNARP 即将上线 Raydium 和 Uniswap，敬请期待
              </p>
              <button
                onClick={() => alert("DEX 上线倒计时中！关注 @Ricedmdq 第一时间获取通知")}
                className="w-full btn-primary py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <Rocket size={15} /> Buy $GNARP · 即将上线
              </button>
            </div>

            <div className="card p-4">
              <h3 className="font-black text-xs mb-3 flex items-center gap-2" style={{ color: "#f5f5f7" }}>
                <Shield size={14} style={{ color: "#00e87a" }} /> 安全信息
              </h3>
              {[
                { l: "智能合约审计", s: "进行中", c: "#ffd700" },
                { l: "流动性锁定", s: "12 个月", c: "#00e87a" },
                { l: "Mint 权限", s: "已销毁", c: "#00e87a" },
              ].map((r, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>{r.l}</span>
                  <span className="font-semibold" style={{ color: r.c }}>{r.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <div className="card p-6">
          <h2 className="font-black text-base mb-6 flex items-center gap-2" style={{ color: "#f5f5f7" }}>
            <Zap size={18} style={{ color: "#00e87a" }} /> 路线图
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmap.map((r, i) => (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{
                  background: r.done ? "rgba(0,232,122,0.06)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${r.done ? "rgba(0,232,122,0.2)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: r.done ? "rgba(0,232,122,0.2)" : "rgba(255,255,255,0.06)",
                      color: r.done ? "#00e87a" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {r.q}
                  </span>
                  {r.done && <span style={{ color: "#00e87a", fontSize: 12 }}>✓</span>}
                </div>
                <ul className="space-y-1.5">
                  {r.items.map((item, j) => (
                    <li key={j} className="text-xs flex items-start gap-1.5" style={{ color: r.done ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)" }}>
                      <span style={{ color: r.done ? "#00e87a" : "rgba(255,255,255,0.2)", flexShrink: 0 }}>·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
