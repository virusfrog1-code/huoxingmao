import { useEffect, useRef, useState } from "react";
import { TrendingUp, Wallet, Rocket, Shield, Zap, Copy } from "lucide-react";

function PriceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const data = Array.from({ length: 60 }, (_, i) => {
      const base = 0.00042;
      const trend = i * 0.000005;
      const noise = (Math.random() - 0.4) * 0.00005;
      return base + trend + noise;
    });

    const min = Math.min(...data) * 0.98;
    const max = Math.max(...data) * 1.02;
    const range = max - min;

    const toY = (v: number) => h - ((v - min) / range) * h * 0.85 - h * 0.05;
    const toX = (i: number) => (i / (data.length - 1)) * w;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(57, 255, 20, 0.4)");
    grad.addColorStop(1, "rgba(57, 255, 20, 0.0)");

    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0]));
    data.forEach((v, i) => {
      if (i === 0) return;
      const cp1x = toX(i - 0.5);
      const cp1y = toY(data[i - 1]);
      ctx.bezierCurveTo(cp1x, cp1y, cp1x, toY(v), toX(i), toY(v));
    });

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0]));
    data.forEach((v, i) => {
      if (i === 0) return;
      const cp1x = toX(i - 0.5);
      const cp1y = toY(data[i - 1]);
      ctx.bezierCurveTo(cp1x, cp1y, cp1x, toY(v), toX(i), toY(v));
    });

    ctx.strokeStyle = "#39ff14";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#39ff14";
    ctx.shadowBlur = 8;
    ctx.stroke();

    const lastX = toX(data.length - 1);
    const lastY = toY(data[data.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#39ff14";
    ctx.shadowBlur = 15;
    ctx.fill();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      className="w-full rounded-xl"
      style={{ background: "rgba(57, 255, 20, 0.03)" }}
    />
  );
}

export default function TokenPage() {
  const [copied, setCopied] = useState(false);
  const contractAddr = "0xGN4RP...D4NC3";

  const copy = () => {
    navigator.clipboard.writeText(contractAddr).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokenomics = [
    { label: "挖矿奖励", pct: 40, color: "#39ff14" },
    { label: "社区空投", pct: 25, color: "#bf5fff" },
    { label: "流动性", pct: 20, color: "#ff2d78" },
    { label: "开发团队", pct: 10, color: "#00ffff" },
    { label: "营销推广", pct: 5, color: "#ffcc00" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-bold"
            style={{
              background: "rgba(57, 255, 20, 0.1)",
              border: "1px solid rgba(57, 255, 20, 0.3)",
              color: "#39ff14",
            }}
          >
            <Zap size={14} /> 即将上线 DEX
          </div>
          <h1
            className="text-4xl md:text-6xl font-black mb-4"
            style={{
              background: "linear-gradient(135deg, #39ff14, #ffcc00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Gnarp Token
          </h1>
          <p className="text-gray-400 text-lg">$GNARP — 外星舞步挖矿，Token 飞向月球</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "当前价格", value: "$0.00042", change: "+12.4%", up: true },
            { label: "24h 成交量", value: "$847K", change: "+56.8%", up: true },
            { label: "市值", value: "$4.2M", change: "+8.1%", up: true },
            { label: "总供应量", value: "420,000,000", change: "固定", up: true },
          ].map((stat, i) => (
            <div
              key={i}
              className="card-glow rounded-2xl p-4 text-center"
            >
              <div className="text-gray-500 text-xs mb-1">{stat.label}</div>
              <div className="text-xl font-black text-white">{stat.value}</div>
              <div
                className="text-xs font-bold mt-1"
                style={{ color: stat.up ? "#39ff14" : "#ff2d78" }}
              >
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        <div className="card-glow rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <TrendingUp size={20} style={{ color: "#39ff14" }} />
              价格走势（占位图）
            </h2>
            <div className="flex gap-2">
              {["1H", "24H", "7D", "1M"].map((t) => (
                <button
                  key={t}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                    t === "7D" ? "btn-neon-green" : "text-gray-500"
                  }`}
                  style={t !== "7D" ? { background: "rgba(255,255,255,0.05)" } : {}}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <PriceChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card-glow rounded-3xl p-6">
            <h2 className="text-xl font-black text-white mb-4">代币分配</h2>
            <div className="space-y-3">
              {tokenomics.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-gray-400 text-right flex-shrink-0">{item.label}</div>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${item.pct}%`,
                        background: item.color,
                        boxShadow: `0 0 8px ${item.color}`,
                      }}
                    />
                  </div>
                  <div className="text-xs font-bold w-8 flex-shrink-0" style={{ color: item.color }}>{item.pct}%</div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(57, 255, 20, 0.05)", border: "1px solid rgba(57, 255, 20, 0.2)" }}>
              <div className="text-xs text-gray-400 mb-2">合约地址（示例）</div>
              <div className="flex items-center gap-2">
                <code className="text-xs flex-1 truncate" style={{ color: "#39ff14" }}>{contractAddr}</code>
                <button onClick={copy} className="text-gray-400 hover:text-white transition-colors">
                  {copied ? "✓" : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-glow-purple rounded-2xl p-6">
              <h3 className="font-black text-white mb-3 flex items-center gap-2">
                <Wallet size={20} style={{ color: "#bf5fff" }} /> 连接钱包
              </h3>
              <p className="text-gray-400 text-sm mb-4">连接你的钱包，随时查看 Gnarp Token 余额和交易记录。</p>
              <button
                onClick={() => alert("钱包连接功能即将上线！敬请期待！Gnarp Gnarp！🐱")}
                className="w-full btn-neon-purple py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Wallet size={18} /> 连接 MetaMask（即将上线）
              </button>
              <button
                onClick={() => alert("钱包连接功能即将上线！敬请期待！Gnarp Gnarp！🐱")}
                className="w-full mt-2 py-3 rounded-xl font-bold text-sm text-gray-400 transition-all duration-200 hover:text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                WalletConnect
              </button>
            </div>

            <div className="card-glow-pink rounded-2xl p-6">
              <h3 className="font-black text-white mb-3 flex items-center gap-2">
                <Rocket size={20} style={{ color: "#ff2d78" }} /> 购买 $GNARP
              </h3>
              <p className="text-gray-400 text-sm mb-4">$GNARP 即将上线 Uniswap 和 Raydium，准备好你的钱包！</p>
              <button
                onClick={() => alert("交易所上线倒计时中！关注 @Ricedmdq 获取最新消息！")}
                className="w-full btn-neon-pink py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Rocket size={18} /> Buy $GNARP（即将上线）
              </button>
            </div>

            <div className="card-glow rounded-2xl p-4">
              <h3 className="font-black text-white mb-3 flex items-center gap-2">
                <Shield size={16} style={{ color: "#39ff14" }} /> 安全审计
              </h3>
              <div className="space-y-2">
                {[
                  { label: "合约审计", status: "进行中", color: "#ffcc00" },
                  { label: "流动性锁定", status: "已锁定 12 个月", color: "#39ff14" },
                  { label: "RugPull 保护", status: "已启用", color: "#39ff14" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="font-bold text-xs" style={{ color: item.color }}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
