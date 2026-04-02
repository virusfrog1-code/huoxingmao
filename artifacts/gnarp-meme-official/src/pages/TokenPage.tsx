import { useState } from "react";
import { TrendingUp, Zap, Users, BarChart2, Lock, ChevronRight, Coins, RefreshCcw } from "lucide-react";
import { useStore, P2E_POOL_INITIAL } from "../store/useStore";

const ALL_PRICE_DATA = Array.from({ length: 90 }, (_, i) => {
  const base = 0.000001;
  const growth = Math.pow(1.045, i);
  const noise = Math.sin(i * 0.8) * 0.12 + Math.sin(i * 1.7) * 0.06;
  return base * growth * (1 + noise);
});

function MiniChart({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const norm = (v: number) => ((v - min) / (max - min)) * 100;
  const W = 100, H = 60;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (norm(v) * H) / 100}`).join(" ");
  const fill = `${pts} ${W},${H} 0,${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00e87a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00e87a" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#cg)" />
      <polyline points={pts} fill="none" stroke="#00e87a" strokeWidth="1.5" />
    </svg>
  );
}

function FeeBar({ label, pct, color, amount }: { label: string; pct: string; color: string; amount: string }) {
  const numPct = parseFloat(pct);
  return (
    <div className="flex items-center gap-3">
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-300">{label}</span>
          <span className="font-bold" style={{ color }}>{pct}</span>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${numPct}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{amount}</div>
      </div>
    </div>
  );
}

export default function TokenPage() {
  const [range, setRange] = useState<"1H" | "24H" | "7D" | "30D">("7D");
  const [stakeTab, setStakeTab] = useState<"stake" | "unstake">("stake");
  const [stakeInput, setStakeInput] = useState("");
  const [unstakeInput, setUnstakeInput] = useState("");

  const { tokens, stakedTokens, stakeTokens, unstakeTokens, p2ePool, feesBoughtBack } = useStore();

  const p2ePct = Math.round((p2ePool / P2E_POOL_INITIAL) * 100);
  const latestPrice = ALL_PRICE_DATA[ALL_PRICE_DATA.length - 1];
  const firstPrice = ALL_PRICE_DATA[0];
  const change30d = ((latestPrice - firstPrice) / firstPrice * 100).toFixed(1);

  const rangeSlice: Record<string, number[]> = {
    "1H": ALL_PRICE_DATA.slice(-4),
    "24H": ALL_PRICE_DATA.slice(-24),
    "7D": ALL_PRICE_DATA.slice(-52),
    "30D": ALL_PRICE_DATA,
  };

  return (
    <div className="min-h-screen pt-16 bg-[#050812]">

      {/* Hero */}
      <section className="text-center py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-neon-green/4 blur-[80px]" />
        </div>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest text-neon-green mb-3 font-bold">GNARP TOKEN · PUMP.FUN FAIR LAUNCH</p>
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            <span className="text-white">$</span><span className="gradient-text">GNARP</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">外星舞步挖矿 · 边玩边赚 · Token 飞向月球</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2 text-base px-8 py-3 text-lg">
              🚀 Buy on Pump.fun
            </a>
            <a href="#staking" className="btn-secondary flex items-center gap-2 text-base px-8 py-3">
              <Coins size={16} /> 质押赚收益
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "当前价格", value: `$${latestPrice.toFixed(8)}`, sub: `+${change30d}% 30d`, color: "text-neon-green" },
            { label: "市值",     value: "$4.2M", sub: "流通市值",     color: "text-purple-400" },
            { label: "总供应量", value: "1,000M", sub: "固定上限 · 无增发", color: "text-pink-400" },
            { label: "持有人",   value: "8,421",  sub: "独立钱包",   color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-5">
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Price chart */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto glass-card p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-neon-green" />
              <span className="font-bold text-white text-sm">价格走势</span>
            </div>
            <div className="flex gap-1">
              {(["1H", "24H", "7D", "30D"] as const).map((r) => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${range === r ? "bg-neon-green text-black" : "text-gray-400 hover:text-white"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-48"><MiniChart data={rangeSlice[range]} /></div>
        </div>
      </section>

      {/* Pump.fun Fair Launch */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-neon-green mb-2">FAIR LAUNCH</p>
            <h2 className="text-3xl font-black gradient-text">Pump.fun 公平发射</h2>
            <p className="text-gray-400 text-sm mt-2">零预挖 · 100% 流动性锁定 · 社区共建</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mb-6">
            {[
              { icon: "🎯", title: "零预挖 公平发射", color: "border-neon-green/30",
                desc: "所有代币通过 Pump.fun 平台公平发行，无私募、无预挖、无内部分配，100% 社区参与。" },
              { icon: "🔒", title: "流动性永久锁定", color: "border-purple-500/30",
                desc: "100% 流动性由 Pump.fun 自动创建并永久锁定，无地毯风险，开发者无法撤池。" },
              { icon: "💰", title: "3.5 SOL 注入 P2E 池", color: "border-yellow-400/30",
                desc: "开发者首批用 3.5 SOL 买入约 1 亿 Gnarp，全部注入 P2E 奖励池作为初始游戏奖励。" },
            ].map((c) => (
              <div key={c.title} className={`glass-card p-6 border ${c.color}`}>
                <div className="text-4xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-white mb-2">{c.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* P2E Pool Banner */}
          <div className="glass-card p-6 border border-yellow-400/25 bg-yellow-400/4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">初始 P2E 奖励池 · 已注入</span>
                </div>
                <div className="text-4xl font-black text-white">
                  {p2ePool.toLocaleString()} <span className="text-yellow-400 text-xl">GNARP</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">开发者用 3.5 SOL 买入 1 亿 Gnarp 全数注入 · 玩游戏即时提取</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">池子剩余比例</div>
                <div className="text-3xl font-black text-yellow-400">{p2ePct}%</div>
                <div className="w-44 h-2.5 bg-white/8 rounded-full overflow-hidden mt-2">
                  <div className="h-full rounded-full" style={{
                    width: `${p2ePct}%`,
                    background: "linear-gradient(90deg,#ffd700,#ffaa00)",
                    boxShadow: "0 0 8px #ffd700"
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3% Fee Distribution */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-pink-400 mb-2">TOKENOMICS</p>
            <h2 className="text-3xl font-black text-white">3% <span className="gradient-text">手续费分配</span></h2>
            <p className="text-gray-400 text-sm mt-2">买入 · 卖出 · 游戏内购买均收取 3%，自动分配</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 space-y-5">
              <FeeBar label="🔄 自动回购 + 注入流动性池" pct="50%" color="#00e87a"
                amount={`已累计回购 ${Math.floor(feesBoughtBack).toLocaleString()} GNARP`} />
              <FeeBar label="⚡ 技术升级 + 市场营销"      pct="33%" color="#9b6dff"
                amount="持续运营与生态建设" />
              <FeeBar label="🎁 社区空投 + 额外奖励"      pct="17%" color="#ff4fa3"
                amount="不定期空投给持有人" />
            </div>
            <div className="glass-card p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-neon-green" /> 费用流向图
              </h3>
              <div className="flex justify-center mb-4">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#00e87a" strokeWidth="20"
                      strokeDasharray="119.4 238.8" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#9b6dff" strokeWidth="20"
                      strokeDasharray="78.8 238.8" strokeDashoffset="-119.4" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#ff4fa3" strokeWidth="20"
                      strokeDasharray="40.6 238.8" strokeDashoffset="-198.2" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-gray-400">费率</div>
                      <div className="text-2xl font-black text-white">3%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { color: "#00e87a", label: "回购注池", pct: "50%" },
                  { color: "#9b6dff", label: "营销运营", pct: "33%" },
                  { color: "#ff4fa3", label: "社区空投", pct: "17%" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-sm" style={{ background: f.color }} />
                    <span className="text-gray-400">{f.label}</span>
                    <span className="ml-auto font-bold" style={{ color: f.color }}>{f.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Token Distribution */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-purple-400 mb-2">DISTRIBUTION</p>
            <h2 className="text-3xl font-black text-white">代币 <span className="gradient-text">分配方案</span></h2>
          </div>
          <div className="glass-card p-6">
            <div className="space-y-4">
              {[
                { label: "🌐 Pump.fun 公平发射（社区）", pct: 90, color: "#00e87a", amount: "900,000,000 GNARP" },
                { label: "🎮 P2E 游戏奖励池（已注入）",  pct: 10, color: "#ffd700", amount: "100,000,000 GNARP" },
              ].map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">{d.label}</span>
                    <span className="font-bold" style={{ color: d.color }}>{d.pct}% · {d.amount}</span>
                  </div>
                  <div className="h-3 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${d.pct}%`, background: d.color,
                      boxShadow: `0 0 8px ${d.color}60`
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-3.5 rounded-xl bg-white/4 text-xs text-gray-400 flex items-start gap-2">
              <Lock size={12} className="mt-0.5 text-yellow-400 flex-shrink-0" />
              开发者无任何保留份额 · 无私募 · 无团队解锁 · 100% 公平发行 · 已在 Pump.fun 验证
            </div>
          </div>
        </div>
      </section>

      {/* Staking */}
      <section id="staking" className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-yellow-400 mb-2">STAKING</p>
            <h2 className="text-3xl font-black text-white">质押 <span className="gradient-text">赚收益</span></h2>
            <p className="text-gray-400 text-sm mt-2">质押 GNARP → 提升每日产出上限 + 获得更多 Energy</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Users size={15} className="text-neon-green" /> 我的质押
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-white/4 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">钱包余额</div>
                  <div className="text-xl font-black text-white">{tokens.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">GNARP</div>
                </div>
                <div className="bg-neon-green/8 rounded-xl p-4 border border-neon-green/20">
                  <div className="text-xs text-gray-400 mb-1">已质押</div>
                  <div className="text-xl font-black text-neon-green">{stakedTokens.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">GNARP</div>
                </div>
              </div>
              <div className="flex gap-1 mb-4 bg-white/4 p-1 rounded-xl">
                {(["stake", "unstake"] as const).map((t) => (
                  <button key={t} onClick={() => setStakeTab(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${stakeTab === t ? "bg-neon-green text-black" : "text-gray-400"}`}>
                    {t === "stake" ? "质押" : "解除质押"}
                  </button>
                ))}
              </div>
              {stakeTab === "stake" ? (
                <div className="space-y-3">
                  <input type="number" placeholder="输入质押数量..."
                    value={stakeInput} onChange={(e) => setStakeInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-neon-green/50" />
                  <div className="flex gap-2">
                    {[25, 50, 100].map((p) => (
                      <button key={p} onClick={() => setStakeInput(String(Math.floor(tokens * p / 100)))}
                        className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 hover:text-white">
                        {p}%
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { stakeTokens(Number(stakeInput)); setStakeInput(""); }}
                    disabled={!stakeInput || Number(stakeInput) <= 0 || Number(stakeInput) > tokens}
                    className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                    质押 GNARP
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input type="number" placeholder="输入解除质押数量..."
                    value={unstakeInput} onChange={(e) => setUnstakeInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-pink-400/50" />
                  <button onClick={() => { unstakeTokens(Number(unstakeInput)); setUnstakeInput(""); }}
                    disabled={!unstakeInput || Number(unstakeInput) <= 0 || Number(unstakeInput) > stakedTokens}
                    className="w-full py-2.5 rounded-xl bg-pink-400/20 text-pink-400 font-bold text-sm hover:bg-pink-400/30 disabled:opacity-40 disabled:cursor-not-allowed">
                    解除质押
                  </button>
                </div>
              )}
            </div>
            <div className="glass-card p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <ChevronRight size={15} className="text-yellow-400" /> 质押收益说明
              </h3>
              <div className="space-y-3 mb-5">
                {[
                  { stake: "1,000 GNARP",  bonus: "+20 Energy 上限 · +30 每日上限",    icon: "⚡" },
                  { stake: "5,000 GNARP",  bonus: "+100 Energy 上限 · +150 每日上限",  icon: "🔋" },
                  { stake: "10,000 GNARP", bonus: "+200 Energy 上限 · +250 每日上限",  icon: "🚀" },
                  { stake: "50,000 GNARP", bonus: "满级 Energy 500 · 每日上限封顶",   icon: "🌙" },
                ].map((s) => (
                  <div key={s.stake} className="flex items-center gap-3 p-3 rounded-xl bg-white/4">
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <div className="text-xs text-gray-300 font-bold">质押 {s.stake}</div>
                      <div className="text-xs text-neon-green">{s.bonus}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-yellow-400/8 border border-yellow-400/20 text-xs text-yellow-400">
                ⚠️ 当前为模拟质押系统 · 代币上链后将升级为链上质押合约
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto glass-card p-10 text-center">
          <h3 className="text-2xl font-black gradient-text mb-2">准备好了吗？</h3>
          <p className="text-gray-400 text-sm mb-6">加入外星猫奴大军，一起把 $GNARP 送上月球</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2 text-base px-8 py-3">
              🚀 立即购买 on Pump.fun <RefreshCcw size={14} />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2 text-base px-8 py-3">
              𝕏 关注官方推特
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
