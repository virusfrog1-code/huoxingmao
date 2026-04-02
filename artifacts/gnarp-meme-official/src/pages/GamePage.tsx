import { useEffect, useRef, useState, useCallback } from "react";
import { createSuperGnarpGame } from "../game/SuperGnarpGame";
import {
  useStore, UPGRADE_COSTS, UPGRADE_NAMES, UPGRADE_ICONS, UPGRADE_DESCS,
  P2E_POOL_INITIAL, DAILY_FREE_PLAYS,
} from "../store/useStore";
import type { MinerUpgrades } from "../store/useStore";
import {
  Zap, TrendingUp, ShoppingBag, Trophy, RefreshCw, Gamepad2, Clock,
  Coins, Infinity as InfinityIcon, Share2, ChevronRight,
} from "lucide-react";
import type Phaser from "phaser";

type Tab = "mine" | "shop" | "rank";
type Mode = "story" | "endless";

/* Settlement data collected at game end */
interface Settlement {
  score: number;
  tokensGross: number;   // before fee
  feeTaken: number;      // 3% of gross
  tokensNet: number;     // after fee
  level: number;
  endless: boolean;
}

export default function GamePage() {
  const gameRef    = useRef<HTMLDivElement>(null);
  const phaserRef  = useRef<Phaser.Game | null>(null);

  const {
    tokens, upgrades, leaderboard,
    energy, maxEnergy, freePlaysUsed,
    p2ePool, feesBoughtBack, stakedTokens,
    addTokens, buyUpgrade, addScore, addToLeaderboard,
    getMiningRatePerHour, getDailyCapTokens, getTodayEarned,
    calculateOfflineEarnings, simulateFee, useFreePla,
    setHighestLevel, setEndlessBest,
  } = useStore();

  const [tab, setTab]               = useState<Tab>("mine");
  const [mode, setMode]             = useState<Mode>("story");
  const [score, setScore]           = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [combo, setCombo]           = useState(0);
  const [hp, setHp]                 = useState(3);
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [levelWin, setLevelWin]     = useState<number | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameStarted, setGameStarted]   = useState(false);
  const [noPlays, setNoPlays]       = useState(false);

  /* Derived economy values */
  const miningRate   = getMiningRatePerHour();
  const dailyCap     = getDailyCapTokens();
  const todayEarned  = getTodayEarned();
  const capPct       = Math.min(100, Math.round((todayEarned / dailyCap) * 100));
  const p2ePct       = Math.round((p2ePool / P2E_POOL_INITIAL) * 100);
  const energyPct    = Math.round((energy / maxEnergy) * 100);
  const freePlaysLeft = Math.max(0, DAILY_FREE_PLAYS - freePlaysUsed);

  const getDanceBonus = useCallback(() => 1 + upgrades.dance * 0.3, [upgrades.dance]);

  /* ---- Start / restart game ---- */
  const startGame = useCallback((endless: boolean) => {
    const allowed = useFreePla();
    if (!allowed) { setNoPlays(true); return; }
    setNoPlays(false);
    calculateOfflineEarnings();

    phaserRef.current?.destroy(true);
    phaserRef.current = null;

    setSettlement(null);
    setScore(0);
    setSessionTokens(0);
    setCombo(0);
    setHp(3);
    setCurrentLevel(0);
    setGameStarted(true);

    setTimeout(() => {
      if (!gameRef.current) return;
      phaserRef.current = createSuperGnarpGame("gnarp-canvas", {
        onTokenCollect: (delta) => {
          const fee = Math.floor(delta * 0.03);
          const net = delta - fee;
          simulateFee(delta);
          addTokens(net);
          setSessionTokens((t) => t + net);
        },
        onScoreUpdate: (s) => setScore(s),
        onLevelComplete: (lv, tok) => {
          setCurrentLevel(lv + 1);
          setLevelWin(lv);
          setHighestLevel(lv + 1);
          setSessionTokens(tok);
          setTimeout(() => setLevelWin(null), 2800);
        },
        onGameOver: (s, tok) => {
          addScore(s);
          addToLeaderboard(endless ? "Endless You" : "You", s, tok);
          if (endless) setEndlessBest(s);
          const fee = Math.floor(tok * 0.03);
          setSettlement({ score: s, tokensGross: tok, feeTaken: fee, tokensNet: tok - fee, level: currentLevel, endless });
          setSessionTokens(tok);
        },
        onHpUpdate: (h) => setHp(h),
        onComboUpdate: (c) => setCombo(c),
        getDanceBonus,
      }, endless);
    }, 100);
  }, [getDanceBonus, currentLevel]);

  useEffect(() => {
    calculateOfflineEarnings();
    return () => { phaserRef.current?.destroy(true); phaserRef.current = null; };
  }, []);

  /* ---- Buy upgrade ---- */
  const handleBuy = (item: keyof MinerUpgrades) => {
    const level = upgrades[item];
    if (level >= 5) return;
    buyUpgrade(item, UPGRADE_COSTS[item][level]);
  };

  const UpgradeCard = ({ item }: { item: keyof MinerUpgrades }) => {
    const level = upgrades[item];
    const cost = level < 5 ? UPGRADE_COSTS[item][level] : null;
    const canAfford = cost !== null && tokens >= cost;
    const maxed = level >= 5;
    return (
      <div className={`glass-card p-4 transition-all ${!maxed && canAfford ? "border-neon-green/35" : "border-white/8"}`}>
        <div className="flex items-start gap-2.5 mb-3">
          <span className="text-xl">{UPGRADE_ICONS[item]}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-white">{UPGRADE_NAMES[item]}</div>
            <div className="text-xs text-gray-400 leading-tight">{UPGRADE_DESCS[item]}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < level ? "bg-neon-green shadow-[0_0_5px_#00e87a]" : "bg-white/10"}`} />
          ))}
          <span className="text-xs text-gray-500 ml-1 shrink-0">Lv{level}/5</span>
        </div>
        <button onClick={() => handleBuy(item)} disabled={maxed || !canAfford}
          className={`w-full py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${maxed ? "bg-neon-green/15 text-neon-green cursor-default" : canAfford ? "bg-neon-green text-black hover:brightness-110" : "bg-white/5 text-gray-500 cursor-not-allowed"}`}>
          {maxed ? "✓ 已满级" : `🪙 ${cost?.toLocaleString()}`}
        </button>
      </div>
    );
  };

  const LEVEL_NAMES = [
    "办公室地狱①","办公室·深夜②","办公室·逃跑③","打工末日④","💀 BOSS战①",
    "霓虹都市⑥","赛博街头⑦","地下通道⑧","摩天楼顶⑨","💀 BOSS战②",
    "太空站⑪","失重走廊⑫","陨石带⑬","星云穿越⑭","💀 BOSS战③",
    "月球基地⑯","月球矿洞⑰","暗面月球⑱","月球终点⑲","💀 最终BOSS",
  ];

  const shareText = settlement
    ? encodeURIComponent(
        `我在 Super Gnarp ${settlement.endless ? "Endless 模式" : `第 ${settlement.level} 关`} 得了 ${settlement.score.toLocaleString()} 分，赚了 ${settlement.tokensNet} $GNARP！🐱🚀 #Gnarp #SolanaMeme`
      )
    : "";

  return (
    <div className="min-h-screen pt-16 bg-[#050812]">

      {/* Header */}
      <div className="px-6 pt-6 pb-3 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black">
            <span className="text-neon-green">Super</span> <span className="gradient-text">Gnarp</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">20 关主线 + ∞ 无限模式 · 踩敌人 · 挖 Token</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="glass-card p-1 flex gap-1 rounded-xl">
            <button onClick={() => setMode("story")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "story" ? "bg-neon-green text-black" : "text-gray-400 hover:text-white"}`}>
              🗺 主线 20关
            </button>
            <button onClick={() => setMode("endless")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${mode === "endless" ? "bg-purple-500 text-white" : "text-gray-400 hover:text-white"}`}>
              <InfinityIcon size={11} /> Endless
            </button>
          </div>
          <button onClick={() => startGame(mode === "endless")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${mode === "endless" ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30" : "glass-card text-gray-300 hover:text-white"}`}>
            <RefreshCw size={12} /> {gameStarted ? "重开" : "开始"}
          </button>
        </div>
      </div>

      {/* No plays warning */}
      {noPlays && (
        <div className="mx-6 mb-3 glass-card p-4 border border-pink-400/30 flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">⚡</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-pink-400">今日免费局数已用完</div>
            <div className="text-xs text-gray-400">Energy {energy}/{maxEnergy} · 额外局需消耗 10 Energy · 质押更多 GNARP 提升上限</div>
          </div>
          <button onClick={() => startGame(mode === "endless")} disabled={energy < 10}
            className="btn-primary text-xs px-4 py-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
            10⚡ 开始
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 px-4 pb-8">

        {/* ======== GAME CANVAS ======== */}
        <div className="flex-1 min-w-0 relative">

          {/* Start screen */}
          {!gameStarted && (
            <div className="rounded-xl border border-white/10 bg-[#060a1a] flex items-center justify-center"
              style={{ aspectRatio: "16/9" }}>
              <div className="text-center px-8 py-10 max-w-lg">
                <div className="text-7xl mb-5">🐱</div>
                <h2 className={`text-2xl font-black mb-2 ${mode === "endless" ? "text-purple-300" : "gradient-text"}`}>
                  {mode === "endless" ? "∞ Endless Moon Mode" : "Super Gnarp 主线"}
                </h2>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  {mode === "endless"
                    ? "随机无限生成关卡 · 难度持续上升 · 看你能坚持多久！"
                    : "20 个关卡 · 办公室 → 霓虹都市 → 太空站 → 月球基地 · 每 5 关出现 BOSS"}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="bg-white/4 rounded-xl p-3">
                    <div className="text-neon-green font-black text-lg">{freePlaysLeft}</div>
                    <div className="text-gray-400 text-xs">今日免费局剩余</div>
                  </div>
                  <div className="bg-white/4 rounded-xl p-3">
                    <div className="text-purple-400 font-black text-lg">{energy}<span className="text-sm text-gray-400">/{maxEnergy}</span></div>
                    <div className="text-gray-400 text-xs">Energy（额外局 10/次）</div>
                  </div>
                </div>
                <button onClick={() => startGame(mode === "endless")}
                  className={`w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 shadow-[0_0_20px_rgba(0,232,122,0.3)] ${mode === "endless" ? "bg-purple-500 text-white hover:bg-purple-400" : "bg-neon-green text-black hover:brightness-110"}`}>
                  🚀 开始游戏
                </button>
                <div className="mt-4 text-xs text-gray-600 space-x-2">
                  <span>← → 移动</span><span>↑ 跳跃</span><span>二段跳</span><span>Shift 冲刺</span>
                </div>
              </div>
            </div>
          )}

          {/* Live game canvas */}
          {gameStarted && (
            <div id="gnarp-canvas" ref={gameRef}
              className="rounded-xl overflow-hidden border border-neon-green/20 shadow-[0_0_30px_rgba(0,232,122,0.07)] bg-[#050812]"
              style={{ aspectRatio: "16/9", width: "100%" }} />
          )}

          {/* ===== SETTLEMENT OVERLAY ===== */}
          {settlement && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/82 backdrop-blur-lg z-20">
              <div className="text-center px-8 py-8 glass-card max-w-sm w-full mx-4 border border-neon-green/20">
                <div className="text-5xl mb-3">{settlement.score > 10000 ? "🏆" : "😺"}</div>
                <h2 className="text-xl font-black mb-1"
                  style={{ color: settlement.endless ? "#9b6dff" : "#00e87a" }}>
                  {settlement.endless ? "Endless 结束！" : "关卡结算！"}
                </h2>
                <div className="text-sm text-gray-400 mb-5">
                  {settlement.endless ? "无限模式" : `到达第 ${settlement.level} 关 / 20`}
                </div>

                {/* Score & token breakdown */}
                <div className="space-y-2.5 mb-6 text-sm">
                  <div className="flex justify-between items-center py-2.5 px-4 bg-white/4 rounded-xl">
                    <span className="text-gray-400 flex items-center gap-1.5"><Gamepad2 size={13} /> 本局分数</span>
                    <span className="font-black text-neon-green">{settlement.score.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 px-4 bg-yellow-400/6 rounded-xl border border-yellow-400/15">
                    <span className="text-gray-400 flex items-center gap-1.5">🪙 收集 Token（总）</span>
                    <span className="font-black text-yellow-400">+{settlement.tokensGross}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 px-4 bg-pink-400/5 rounded-xl">
                    <span className="text-gray-400 flex items-center gap-1.5 text-xs">
                      <span className="text-pink-400">3%</span> 手续费（自动回购）
                    </span>
                    <span className="font-bold text-pink-400 text-xs">-{settlement.feeTaken}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-neon-green/8 rounded-xl border border-neon-green/25">
                    <span className="text-white font-bold flex items-center gap-1.5">✅ 净得 GNARP</span>
                    <span className="font-black text-neon-green text-lg">+{settlement.tokensNet}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => { setSettlement(null); startGame(settlement.endless); }}
                    className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-sm">
                    <RefreshCw size={13} /> 再来
                  </button>
                  <a href={`https://x.com/intent/tweet?text=${shareText}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm no-underline">
                    <Share2 size={13} /> 分享 𝕏
                  </a>
                </div>
                <button onClick={() => setSettlement(null)}
                  className="mt-3 w-full py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  继续浏览 →
                </button>
              </div>
            </div>
          )}

          {/* Level win toast */}
          {levelWin !== null && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 glass-card px-6 py-2.5 text-sm font-black text-neon-green border border-neon-green/40 animate-bounce z-30 whitespace-nowrap shadow-[0_0_20px_rgba(0,232,122,0.3)]">
              🎉 {LEVEL_NAMES[levelWin]} 通关！
            </div>
          )}

          {/* Combo bar */}
          {combo >= 2 && gameStarted && !settlement && (
            <div className="absolute top-14 right-4 z-10">
              <div className={`glass-card px-4 py-2 text-sm font-black border ${combo >= 6 ? "border-pink-400/60 text-pink-400" : combo >= 4 ? "border-orange-400/50 text-orange-400" : "border-yellow-400/40 text-yellow-400"}`}>
                {combo >= 8 ? "🔥 ULTRA" : combo >= 6 ? "⚡ MEGA" : combo >= 4 ? "💥 SUPER" : "✨"} ×{combo}
              </div>
            </div>
          )}

          {/* Controls hint */}
          <div className="mt-2 text-center text-xs text-gray-600 space-x-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>← → 移动</span>
            <span>↑/W/Space 跳跃</span>
            <span>再按 二段跳</span>
            <span>Shift/Z 冲刺</span>
            <span className="text-pink-400/60">从头顶踩死敌人</span>
            <span className="text-neon-green/60 border-l border-white/10 pl-3">🎵 游戏右上角 = 音乐开关</span>
          </div>
        </div>

        {/* ======== SIDEBAR ======== */}
        <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-3">

          {/* Live stats strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass-card p-3 text-center">
              <Gamepad2 size={14} className="text-neon-green mx-auto mb-0.5" />
              <div className="text-xs text-gray-500">分数</div>
              <div className="font-black text-white text-sm leading-tight">
                {score > 9999 ? `${(score / 1000).toFixed(1)}K` : score}
              </div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="text-base leading-none mb-0.5">🪙</div>
              <div className="text-xs text-gray-500">Token</div>
              <div className="font-black text-yellow-400 text-sm">{sessionTokens}</div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="text-base leading-none mb-0.5">
                {"❤".repeat(Math.max(0, hp))}
              </div>
              <div className="text-xs text-gray-500">HP</div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="glass-card p-1 flex rounded-xl">
            {(["mine", "shop", "rank"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t ? "bg-neon-green text-black" : "text-gray-400 hover:text-white"}`}>
                {t === "mine" ? "⛏ 矿站" : t === "shop" ? "🛒 升级" : "🏆 排行"}
              </button>
            ))}
          </div>

          {/* ===== MINE TAB ===== */}
          {tab === "mine" && (
            <div className="space-y-2.5">

              {/* Wallet */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={12} className="text-neon-green" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">钱包总余额</span>
                </div>
                <div className="text-2xl font-black text-neon-green">{tokens.toLocaleString()}</div>
                <div className="text-xs text-gray-500">$GNARP</div>
                {stakedTokens > 0 && (
                  <div className="mt-1.5 text-xs text-yellow-400 flex items-center gap-1">
                    <span>🔒</span> 质押中 {stakedTokens.toLocaleString()} GNARP
                  </div>
                )}
              </div>

              {/* P2E Pool */}
              <div className="glass-card p-4 border border-yellow-400/15">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 uppercase tracking-wider">
                    <Zap size={11} /> P2E 奖励池
                  </div>
                  <span className="text-xs font-black text-yellow-400">{p2ePct}%</span>
                </div>
                <div className="text-sm font-black text-white">{(p2ePool / 1_000_000).toFixed(2)}M GNARP</div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mt-2 mb-1.5">
                  <div className="h-full rounded-full" style={{ width: `${p2ePct}%`, background: "linear-gradient(90deg,#ffd700,#ff8800)", boxShadow: "0 0 6px #ffd700" }} />
                </div>
                <div className="text-xs text-gray-500">已回购: <span className="text-neon-green font-bold">{Math.floor(feesBoughtBack).toLocaleString()}</span> GNARP</div>
              </div>

              {/* Energy */}
              <div className="glass-card p-4 border border-purple-400/15">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider">
                    <Zap size={11} /> Energy
                  </div>
                  <span className="text-xs font-black text-purple-400">{energy}/{maxEnergy}</span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${energyPct}%`,
                    background: energyPct > 30 ? "linear-gradient(90deg,#9b6dff,#00c2ff)" : "#ff4fa3",
                    boxShadow: "0 0 6px #9b6dff",
                  }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>免费局 <span className="text-neon-green font-bold">{freePlaysLeft}</span>/{DAILY_FREE_PLAYS}</span>
                  <span>额外局 <span className="text-yellow-400 font-bold">10⚡</span></span>
                </div>
              </div>

              {/* Mining rate */}
              <div className="glass-card p-4 space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">挖矿数据</div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1"><Clock size={11} /> 每小时</span>
                  <span className="font-bold text-white">{miningRate.toFixed(1)} <span className="text-neon-green text-xs">Token</span></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1"><Coins size={11} /> 今日已产</span>
                  <span className="font-bold text-white">{todayEarned}<span className="text-gray-500 text-xs">/{dailyCap}</span></span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1"><span>今日进度</span><span>{capPct}%</span></div>
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${capPct}%`,
                      background: capPct > 80 ? "#ff4fa3" : "linear-gradient(90deg,#00e87a,#9b6dff)",
                      boxShadow: `0 0 5px ${capPct > 80 ? "#ff4fa3" : "#00e87a"}`,
                    }} />
                  </div>
                  {capPct >= 100 && <div className="text-xs text-pink-400 mt-1 text-center">今日已达上限 · 明日重置</div>}
                </div>
              </div>

              <button onClick={() => setTab("shop")}
                className="w-full py-2.5 rounded-xl bg-neon-green/8 text-neon-green text-xs font-bold hover:bg-neon-green/15 transition-all flex items-center justify-center gap-1.5">
                <ShoppingBag size={12} /> 买装备提升产出 <ChevronRight size={11} />
              </button>
            </div>
          )}

          {/* ===== SHOP TAB ===== */}
          {tab === "shop" && (
            <div className="space-y-2.5">
              <div className="glass-card p-3 flex items-center gap-2 text-sm">
                <span className="text-yellow-400">🪙</span>
                <span className="text-gray-400 text-xs">余额</span>
                <span className="text-yellow-400 font-black">{tokens.toLocaleString()}</span>
                <span className="ml-auto text-xs text-gray-600">买入扣 3% 手续费</span>
              </div>
              <div className="text-xs text-gray-600 px-1">
                升级永久有效 · 游戏赚 Token → 买装备 → 提升产出循环
              </div>
              {(["antenna", "fan", "dance"] as (keyof MinerUpgrades)[]).map((item) => (
                <UpgradeCard key={item} item={item} />
              ))}
            </div>
          )}

          {/* ===== RANK TAB ===== */}
          {tab === "rank" && (
            <div className="glass-card p-3 space-y-1.5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={13} className="text-yellow-400" />
                <span className="text-xs font-black text-gray-300 uppercase tracking-wider">挖矿王 TOP</span>
              </div>
              {leaderboard.slice(0, 12).map((e, i) => (
                <div key={e.id}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ${i < 3 ? "bg-neon-green/8 border border-neon-green/15" : "hover:bg-white/3"} transition-colors`}>
                  <span className={`text-xs font-black w-5 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-gray-600"}`}>
                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}`}
                  </span>
                  <span className="text-xs text-gray-200 flex-1 truncate">{e.name}</span>
                  <span className="text-xs text-yellow-400 font-bold">{e.tokens}🪙</span>
                  <span className="text-xs text-neon-green font-bold">{e.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
