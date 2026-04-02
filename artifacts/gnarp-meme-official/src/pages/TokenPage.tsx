import { useState } from "react";
import { TrendingUp, Zap, Users, Lock, ChevronRight, Coins, RefreshCcw, ArrowUpRight } from "lucide-react";
import { useStore, P2E_POOL_INITIAL } from "../store/useStore";

/* ---- Price data ---- */
const ALL_PRICE = Array.from({ length: 90 }, (_, i) => {
  const base = 0.000001;
  const g = Math.pow(1.048, i);
  const n = Math.sin(i * 0.8) * 0.12 + Math.sin(i * 1.9) * 0.06;
  return base * g * (1 + n);
});

/* ---- Mini chart (SVG) ---- */
function MiniChart({ data }: { data: number[] }) {
  const min = Math.min(...data), max = Math.max(...data);
  const norm = (v: number) => ((v - min) / (max - min || 1)) * 100;
  const W = 100, H = 60;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (norm(v) * H) / 100}`).join(" ");
  const fill = `${pts} ${W},${H} 0,${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00e87a" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#00e87a" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#chartGrad)" />
      <polyline points={pts} fill="none" stroke="#00e87a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Latest dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * W}
        cy={H - (norm(data[data.length - 1]) * H) / 100}
        r="2.5" fill="#00e87a" />
    </svg>
  );
}

/* ---- Donut chart for 3% fee ---- */
function FeeDonut() {
  // Total circumference for r=38: 2π×38 ≈ 238.76
  const C = 238.76;
  const slices = [
    { pct: 0.5,  color: "#00e87a", label: "1.5%", desc: "自动回购注池" },
    { pct: 0.333, color: "#9b6dff", label: "1%",  desc: "技术升级·营销" },
    { pct: 0.167, color: "#ff4fa3", label: "0.5%", desc: "社区空投·奖励" },
  ];
  let offset = 0;
  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative w-36 h-36 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {slices.map((s, i) => {
            const len = s.pct * C;
            const el = (
              <circle key={i} cx="50" cy="50" r="38" fill="none"
                stroke={s.color} strokeWidth="20"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset} />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs text-gray-400">总费率</div>
            <div className="text-2xl font-black text-white">3%</div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        {slices.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: s.color }} />
                {s.desc}
              </span>
              <span className="font-black" style={{ color: s.color }}>{s.label}</span>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${s.pct * 100}%`, background: s.color,
                boxShadow: `0 0 6px ${s.color}80`
              }} />
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-500 pt-1">每笔交易（买入/卖出/游戏内购）收取 3% 手续费，自动链上分配</p>
      </div>
    </div>
  );
}

export default function TokenPage() {
  const [range, setRange] = useState<"1H" | "24H" | "7D" | "30D">("7D");
  const [stakeTab, setStakeTab] = useState<"stake" | "unstake">("stake");
  const [stakeAmt, setStakeAmt] = useState("");
  const [unstakeAmt, setUnstakeAmt] = useState("");
  const { tokens, stakedTokens, stakeTokens, unstakeTokens, p2ePool, feesBoughtBack,
    getEnergyMaxPerStake, getDailyCapTokens } = useStore();

  const p2ePct  = Math.round((p2ePool / P2E_POOL_INITIAL) * 100);
  const latest  = ALL_PRICE[ALL_PRICE.length - 1];
  const first   = ALL_PRICE[0];
  const chg30   = ((latest - first) / first * 100).toFixed(1);
  const rangeData: Record<string, number[]> = {
    "1H": ALL_PRICE.slice(-4), "24H": ALL_PRICE.slice(-24),
    "7D": ALL_PRICE.slice(-52), "30D": ALL_PRICE,
  };

  // Preview staking effect
  const stakePreview  = Number(stakeAmt) || 0;
  const newStaked     = stakedTokens + stakePreview;
  const newEnergyMax  = Math.min(500, 100 + Math.floor(newStaked / 1000) * 20);
  const currentEMax   = getEnergyMaxPerStake();
  const newDailyCap   = 240 + Math.floor(newStaked / 100) * 5;
  const currentDaiyCap = getDailyCapTokens();

  return (
    <div className="min-h-screen pt-16 bg-[#050812]">

      {/* ====== HERO ====== */}
      <section className="relative overflow-hidden text-center py-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-neon-green/4 blur-[90px]" />
        </div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-neon-green tracking-widest uppercase border border-neon-green/25 rounded-full px-4 py-1.5 mb-6 bg-neon-green/8">
            PUMP.FUN FAIR LAUNCH · SOLANA
          </span>
          <h1 className="text-6xl md:text-8xl font-black mb-5 leading-none">
            <span className="text-white">$</span><span className="gradient-text">GNARP</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            外星舞步挖矿 · 边玩边赚 · Token 飞向月球
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2.5 bg-neon-green text-black font-black text-lg px-10 py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,232,122,0.35)]">
              🚀 Buy on Pump.fun
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
            <a href="#staking" className="inline-flex items-center gap-2.5 border border-neon-green/30 text-neon-green font-bold text-base px-8 py-4 rounded-2xl hover:bg-neon-green/8 transition-all">
              <Coins size={17} /> 质押赚收益
            </a>
          </div>
        </div>
      </section>

      {/* ====== STATS CARDS ====== */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "当前价格", value: `$${latest.toFixed(8)}`, sub: `+${chg30}% 30d ↑`, color: "text-neon-green", glowColor: "rgba(0,232,122,0.15)" },
            { label: "市值",     value: "$4.2M",  sub: "流通市值",     color: "text-purple-400", glowColor: "rgba(155,109,255,0.1)" },
            { label: "总供应量", value: "1,000M", sub: "固定上限 · 无增发", color: "text-pink-400", glowColor: "rgba(255,79,163,0.1)" },
            { label: "持有人",   value: "8,421",  sub: "独立钱包",     color: "text-yellow-400", glowColor: "rgba(255,215,0,0.1)" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-5 hover:-translate-y-0.5 transition-transform"
              style={{ boxShadow: `0 4px 24px ${s.glowColor}` }}>
              <div className="text-xs text-gray-500 mb-2">{s.label}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== PRICE CHART ====== */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto glass-card p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <TrendingUp size={16} className="text-neon-green" />
              <span className="font-bold text-white">价格走势</span>
              <span className="text-xs text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-full">+{chg30}%</span>
            </div>
            <div className="flex gap-1 bg-white/4 p-1 rounded-xl">
              {(["1H", "24H", "7D", "30D"] as const).map((r) => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === r ? "bg-neon-green text-black" : "text-gray-400 hover:text-white"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-52"><MiniChart data={rangeData[range]} /></div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Contract: <span className="text-gray-400 font-mono">GNARP...pump</span></span>
            <span>DEX: Raydium · Pump.fun</span>
          </div>
        </div>
      </section>

      {/* ====== PUMP.FUN FAIR LAUNCH ====== */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-neon-green mb-3 font-bold">FAIR LAUNCH</p>
            <h2 className="text-3xl md:text-4xl font-black gradient-text">Pump.fun 公平发射</h2>
            <p className="text-gray-400 text-sm mt-2">零预挖 · 100% 流动性锁定 · 全社区共建</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mb-6">
            {[
              { icon: "🎯", title: "零预挖 公平发射", col: "border-neon-green/30",
                desc: "所有代币通过 Pump.fun 平台公平发行，无私募、无预挖、无内部分配，100% 社区参与，开发者第一时间公开所有操作。" },
              { icon: "🔒", title: "流动性永久锁定", col: "border-purple-400/30",
                desc: "100% 流动性由 Pump.fun 自动创建并永久锁定，无地毯风险，开发者无法撤池，合约代码开源验证。" },
              { icon: "💰", title: "3.5 SOL 注入 P2E 池", col: "border-yellow-400/30",
                desc: "开发者首批用 3.5 SOL 买入约 1 亿 Gnarp，全部注入链上 P2E 奖励池，作为初始游戏奖励资金，0 保留。" },
            ].map((c) => (
              <div key={c.title} className={`glass-card p-6 border ${c.col} hover:-translate-y-1 transition-all`}>
                <div className="text-4xl mb-4">{c.icon}</div>
                <h3 className="font-black text-white mb-2">{c.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* P2E Pool banner */}
          <div className="glass-card p-6 border border-yellow-400/20 bg-gradient-to-r from-yellow-400/4 to-transparent mb-5">
            <div className="flex items-center justify-between flex-wrap gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={15} className="text-yellow-400" />
                  <span className="text-sm font-black text-yellow-400 uppercase tracking-wider">初始 P2E 奖励池 · 已注入并锁定</span>
                </div>
                <div className="text-4xl font-black text-white">{p2ePool.toLocaleString()} <span className="text-yellow-400 text-xl">GNARP</span></div>
                <div className="text-sm text-gray-400 mt-1.5">开发者 3.5 SOL 买入 1 亿 Gnarp 全数注入 · 玩游戏即时提取</div>
                <div className="text-xs text-gray-500 mt-1">已通过游戏发出: {(P2E_POOL_INITIAL - p2ePool).toLocaleString()} GNARP</div>
              </div>
              <div className="text-right min-w-[160px]">
                <div className="text-xs text-gray-500 mb-1">剩余比例</div>
                <div className="text-4xl font-black text-yellow-400">{p2ePct}%</div>
                <div className="w-44 h-2.5 bg-white/8 rounded-full overflow-hidden mt-2">
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${p2ePct}%`,
                    background: "linear-gradient(90deg,#ffd700,#ff8800)",
                    boxShadow: "0 0 10px #ffd700",
                  }} />
                </div>
                <div className="text-xs text-gray-500 mt-1.5">已回购: {Math.floor(feesBoughtBack).toLocaleString()} GNARP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 3% FEE DISTRIBUTION ====== */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-pink-400 mb-3 font-bold">TOKENOMICS</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              3% <span className="gradient-text">手续费分配</span>
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              买入 · 卖出 · 游戏内购买均收取 <strong className="text-white">3%</strong> 手续费，链上自动分配，透明可查
            </p>
          </div>
          <div className="glass-card p-8">
            <FeeDonut />
            <div className="mt-6 pt-5 border-t border-white/8 grid grid-cols-3 gap-4 text-center">
              {[
                { pct: "1.5%", label: "回购+注池", icon: "🔄", color: "#00e87a", desc: "持续买压" },
                { pct: "1%",   label: "技术+营销", icon: "⚡", color: "#9b6dff", desc: "生态发展" },
                { pct: "0.5%", label: "社区空投",  icon: "🎁", color: "#ff4fa3", desc: "奖励持有" },
              ].map((f) => (
                <div key={f.pct} className="py-3 px-2 rounded-xl bg-white/3 hover:bg-white/5 transition-all">
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <div className="text-xl font-black" style={{ color: f.color }}>{f.pct}</div>
                  <div className="text-xs text-gray-300 font-bold">{f.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== TOKEN DISTRIBUTION ====== */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-purple-400 mb-3 font-bold">DISTRIBUTION</p>
            <h2 className="text-3xl font-black text-white">代币 <span className="gradient-text">分配方案</span></h2>
          </div>
          <div className="glass-card p-6">
            <div className="space-y-5">
              {[
                { label: "🌐 Pump.fun 公平发射（社区）", pct: 90, color: "#00e87a", amount: "900,000,000 GNARP", note: "任何人均可参与" },
                { label: "🎮 P2E 游戏奖励池（已注入）",  pct: 10, color: "#ffd700", amount: "100,000,000 GNARP", note: "开发者 3.5 SOL 全数注入" },
              ].map((d) => (
                <div key={d.label}>
                  <div className="flex flex-wrap justify-between text-sm mb-2 gap-2">
                    <span className="text-gray-300 font-medium">{d.label}</span>
                    <div className="text-right">
                      <span className="font-black" style={{ color: d.color }}>{d.pct}%</span>
                      <span className="text-gray-500 ml-2 text-xs">{d.amount}</span>
                    </div>
                  </div>
                  <div className="h-3.5 bg-white/8 rounded-full overflow-hidden relative">
                    <div className="h-full rounded-full transition-all duration-700" style={{
                      width: `${d.pct}%`, background: d.color,
                      boxShadow: `0 0 10px ${d.color}50`,
                    }} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{d.note}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-xl bg-white/4 border border-white/8 flex items-start gap-3">
              <Lock size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-gray-400">
                开发者无任何保留份额 · 无私募 · 无团队解锁 · 100% 公平发行 ·
                合约已在 Pump.fun 公开验证 · 流动性永久锁定
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== STAKING PANEL ====== */}
      <section id="staking" className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-yellow-400 mb-3 font-bold">STAKING</p>
            <h2 className="text-3xl font-black text-white">质押 <span className="gradient-text">赚收益</span></h2>
            <p className="text-gray-400 text-sm mt-2">质押 GNARP → Energy 上限↑ + 每日产出上限↑ + 离线收益↑</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: stake/unstake form */}
            <div className="glass-card p-6">
              <h3 className="font-black text-white mb-5 flex items-center gap-2">
                <Users size={15} className="text-neon-green" /> 我的质押
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/4 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">钱包余额</div>
                  <div className="text-2xl font-black text-white">{tokens.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-0.5">GNARP</div>
                </div>
                <div className="bg-neon-green/8 rounded-xl p-4 border border-neon-green/20">
                  <div className="text-xs text-gray-400 mb-1">已质押</div>
                  <div className="text-2xl font-black text-neon-green">{stakedTokens.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-0.5">GNARP</div>
                </div>
              </div>

              <div className="flex gap-1 bg-white/4 p-1 rounded-xl mb-4">
                {(["stake", "unstake"] as const).map((t) => (
                  <button key={t} onClick={() => setStakeTab(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${stakeTab === t ? "bg-neon-green text-black" : "text-gray-400 hover:text-white"}`}>
                    {t === "stake" ? "质押" : "解除质押"}
                  </button>
                ))}
              </div>

              {stakeTab === "stake" ? (
                <div className="space-y-3">
                  <input type="number" placeholder="输入质押数量..."
                    value={stakeAmt} onChange={(e) => setStakeAmt(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-neon-green/50 transition-colors" />
                  <div className="flex gap-2">
                    {[25, 50, 100].map((p) => (
                      <button key={p} onClick={() => setStakeAmt(String(Math.floor(tokens * p / 100)))}
                        className="flex-1 py-2 rounded-xl bg-white/5 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all font-bold">
                        {p}%
                      </button>
                    ))}
                  </div>
                  {/* Preview */}
                  {stakePreview > 0 && (
                    <div className="bg-neon-green/6 border border-neon-green/20 rounded-xl p-3 text-xs space-y-1">
                      <div className="text-neon-green font-bold mb-1.5">质押预览效果</div>
                      <div className="flex justify-between text-gray-300">
                        <span>Energy 上限</span>
                        <span>{currentEMax} → <span className="text-neon-green font-bold">{newEnergyMax}</span></span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>每日产出上限</span>
                        <span>{currentDaiyCap} → <span className="text-neon-green font-bold">{newDailyCap}</span> Token</span>
                      </div>
                    </div>
                  )}
                  <button onClick={() => { stakeTokens(Number(stakeAmt)); setStakeAmt(""); }}
                    disabled={!stakeAmt || Number(stakeAmt) <= 0 || Number(stakeAmt) > tokens}
                    className="w-full py-3 rounded-xl bg-neon-green text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    质押 GNARP
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input type="number" placeholder="输入解除质押数量..."
                    value={unstakeAmt} onChange={(e) => setUnstakeAmt(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-pink-400/50 transition-colors" />
                  <button onClick={() => { unstakeTokens(Number(unstakeAmt)); setUnstakeAmt(""); }}
                    disabled={!unstakeAmt || Number(unstakeAmt) <= 0 || Number(unstakeAmt) > stakedTokens}
                    className="w-full py-3 rounded-xl bg-pink-400/20 text-pink-400 font-black text-sm hover:bg-pink-400/30 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    解除质押
                  </button>
                </div>
              )}
            </div>

            {/* Right: tier benefits */}
            <div className="glass-card p-6">
              <h3 className="font-black text-white mb-4 flex items-center gap-2">
                <ChevronRight size={15} className="text-yellow-400" /> 质押等级 & 收益
              </h3>
              <div className="space-y-2.5 mb-5">
                {[
                  { stake: "1,000",  icon: "⚡", e: "+20",  d: "+30",   c: "#6ee7b7" },
                  { stake: "5,000",  icon: "🔋", e: "+100", d: "+150",  c: "#00e87a" },
                  { stake: "10,000", icon: "🚀", e: "+200", d: "+250",  c: "#9b6dff" },
                  { stake: "50,000", icon: "🌙", e: "+400", d: "+500+", c: "#ff4fa3" },
                ].map((t) => {
                  const isActive = stakedTokens >= Number(t.stake.replace(",", ""));
                  return (
                    <div key={t.stake}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? "bg-neon-green/10 border border-neon-green/25" : "bg-white/3 border border-transparent"}`}>
                      <span className="text-xl">{t.icon}</span>
                      <div className="flex-1">
                        <div className="text-xs font-black" style={{ color: isActive ? t.c : "#9ca3af" }}>
                          质押 {t.stake} GNARP {isActive && <span className="text-neon-green ml-1">✓ 已激活</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Energy 上限 <span style={{ color: t.c }}>{t.e}</span> · 每日上限 <span style={{ color: t.c }}>{t.d}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 rounded-xl bg-yellow-400/8 border border-yellow-400/20 text-xs text-yellow-400 flex items-start gap-2">
                <span className="text-base">⚠️</span>
                当前为模拟质押 · 代币上链后将升级为 Solana 链上质押合约，所有数据完全迁移
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-neon-green/4 blur-[60px] rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/4 blur-[60px] rounded-full translate-x-1/2 translate-y-1/2" />
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black gradient-text mb-3">准备好了吗？</h3>
              <p className="text-gray-400 mb-8">加入外星猫奴大军，一起把 $GNARP 送上月球 🌙</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <a href="https://pump.fun" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-neon-green text-black font-black text-base px-10 py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,232,122,0.3)]">
                  🚀 立即购买 on Pump.fun <RefreshCcw size={15} />
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/20 text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-white/5 transition-all">
                  𝕏 关注官方推特
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
