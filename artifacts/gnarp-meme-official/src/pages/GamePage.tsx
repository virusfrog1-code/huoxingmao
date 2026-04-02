import { useEffect, useRef, useState, useCallback } from "react";
import { createSuperGnarpGame } from "../game/SuperGnarpGame";
import {
  useStore, UPGRADE_COSTS, UPGRADE_NAMES, UPGRADE_ICONS, UPGRADE_DESCS, P2E_POOL_INITIAL, DAILY_FREE_PLAYS,
} from "../store/useStore";
import type { MinerUpgrades } from "../store/useStore";
import { Zap, TrendingUp, ShoppingBag, Trophy, RefreshCw, Gamepad2, Clock, Coins, Infinity } from "lucide-react";
import type Phaser from "phaser";

type Tab = "mine" | "shop" | "rank";
type Mode = "story" | "endless";

export default function GamePage() {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);

  const {
    tokens, upgrades, leaderboard, energy, maxEnergy, freePlaysUsed,
    p2ePool, feesBoughtBack, stakedTokens,
    addTokens, buyUpgrade, addScore, addToLeaderboard,
    getMiningRatePerHour, getDailyCapTokens, getTodayEarned,
    calculateOfflineEarnings, simulateFee, useFreePla,
    setHighestLevel, setEndlessBest,
  } = useStore();

  const [tab, setTab] = useState<Tab>("mine");
  const [mode, setMode] = useState<Mode>("story");
  const [score, setScore] = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hp, setHp] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [levelWin, setLevelWin] = useState<number | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [canPlay, setCanPlay] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const miningRate   = getMiningRatePerHour();
  const dailyCap     = getDailyCapTokens();
  const todayEarned  = getTodayEarned();
  const capPct       = Math.min(100, Math.round((todayEarned / dailyCap) * 100));
  const p2ePct       = Math.round((p2ePool / P2E_POOL_INITIAL) * 100);
  const energyPct    = Math.round((energy / maxEnergy) * 100);
  const freePlaysLeft = Math.max(0, DAILY_FREE_PLAYS - freePlaysUsed);

  const getDanceBonus = useCallback(() => 1 + upgrades.dance * 0.3, [upgrades.dance]);

  /* ---- Boot Phaser ---- */
  const startGame = useCallback((endless: boolean) => {
    // Check if player can play
    const allowed = useFreePla();
    if (!allowed) {
      setCanPlay(false);
      return;
    }
    setCanPlay(true);
    calculateOfflineEarnings();

    if (phaserRef.current) {
      phaserRef.current.destroy(true);
      phaserRef.current = null;
    }
    setGameOver(false);
    setScore(0);
    setSessionTokens(0);
    setCombo(0);
    setHp(3);
    setGameStarted(true);

    setTimeout(() => {
      if (!gameRef.current) return;
      phaserRef.current = createSuperGnarpGame("gnarp-canvas", {
        onTokenCollect: (delta) => {
          // Simulate 3% fee on token earnings
          const net = Math.floor(delta * 0.97);
          simulateFee(delta);
          addTokens(net);
          setSessionTokens((t) => t + net);
        },
        onScoreUpdate: (s) => setScore(s),
        onLevelComplete: (lv, tok) => {
          setCurrentLevel(lv + 1);
          setLevelWin(lv);
          setSessionTokens(tok);
          setHighestLevel(lv + 1);
          setTimeout(() => setLevelWin(null), 2800);
        },
        onGameOver: (s, tok) => {
          addScore(s);
          setSessionTokens(tok);
          setGameOver(true);
          addToLeaderboard(endless ? "Endless" : "You", s, tok);
          if (endless) setEndlessBest(s);
        },
        onHpUpdate: (h) => setHp(h),
        onComboUpdate: (c) => setCombo(c),
        getDanceBonus,
      }, endless);
    }, 120);
  }, [getDanceBonus]);

  useEffect(() => {
    calculateOfflineEarnings();
    return () => {
      phaserRef.current?.destroy(true);
      phaserRef.current = null;
    };
  }, []);

  /* ---- Shop ---- */
  const handleBuy = (item: keyof MinerUpgrades) => {
    const level = upgrades[item];
    if (level >= 5) return;
    const cost = UPGRADE_COSTS[item][level];
    buyUpgrade(item, cost);
  };

  const UpgradeCard = ({ item }: { item: keyof MinerUpgrades }) => {
    const level = upgrades[item];
    const cost = level < 5 ? UPGRADE_COSTS[item][level] : null;
    const canAfford = cost !== null && tokens >= cost;
    const maxed = level >= 5;
    return (
      <div className={`glass-card p-4 transition-all duration-200 ${!maxed && canAfford ? "border-neon-green/40" : "border-white/8"}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{UPGRADE_ICONS[item]}</span>
            <div>
              <div className="text-sm font-bold text-white">{UPGRADE_NAMES[item]}</div>
              <div className="text-xs text-gray-400 leading-tight">{UPGRADE_DESCS[item]}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < level ? "bg-neon-green shadow-[0_0_6px_#00e87a]" : "bg-white/10"}`} />
          ))}
          <span className="text-xs text-gray-400 ml-1">Lv.{level}/5</span>
        </div>
        <button
          onClick={() => handleBuy(item)}
          disabled={maxed || !canAfford}
          className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${maxed ? "bg-neon-green/20 text-neon-green cursor-default" : canAfford ? "bg-neon-green text-black hover:brightness-110 active:scale-95" : "bg-white/5 text-gray-500 cursor-not-allowed"}`}
        >
          {maxed ? "✓ 已满级" : `🪙 ${cost?.toLocaleString()} $GNARP`}
        </button>
      </div>
    );
  };

  const LEVEL_THEMES = [
    "💼 办公室地狱", "💼 办公室·深夜", "💼 办公室·逃跑", "💼 打工末日", "💼 BOSS战①",
    "🏙 霓虹都市",   "🏙 赛博街头",    "🏙 地下通道",    "🏙 摩天楼顶",   "🏙 BOSS战②",
    "🚀 太空站",     "🚀 失重走廊",    "🚀 陨石带",      "🚀 星云穿越",   "🚀 BOSS战③",
    "🌙 月球基地",   "🌙 月球矿洞",    "🌙 暗面月球",    "🌙 月球终点站", "🌙 最终BOSS",
  ];

  return (
    <div className="min-h-screen pt-16 bg-[#050812]">
      {/* Header */}
      <div className="px-6 pt-6 pb-3 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black">
            <span className="text-neon-green">Super</span>{" "}
            <span className="gradient-text">Gnarp</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">20关主线 + ∞无限模式 · 踩敌人 · 收金币 · 挖 Token</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode selector */}
          <div className="glass-card p-1 flex gap-1 rounded-xl">
            <button onClick={() => setMode("story")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "story" ? "bg-neon-green text-black" : "text-gray-400"}`}>
              🗺 主线 20关
            </button>
            <button onClick={() => setMode("endless")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "endless" ? "bg-purple-500 text-white" : "text-gray-400"}`}>
              <Infinity size={12} className="inline mr-1" />Endless
            </button>
          </div>
          <button onClick={() => startGame(mode === "endless")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${mode === "endless" ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" : "glass-card text-gray-300 hover:text-white"}`}>
            <RefreshCw size={13} /> {gameStarted ? "重开" : "开始"}
          </button>
        </div>
      </div>

      {/* Play gate — out of plays */}
      {!canPlay && (
        <div className="mx-6 mb-4 glass-card p-4 border border-pink-400/30 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div className="flex-1">
            <div className="text-sm font-bold text-pink-400">今日免费局数已用完</div>
            <div className="text-xs text-gray-400">还剩 Energy {energy}/{maxEnergy} · 每局消耗 10 Energy · 质押更多 GNARP 提升上限</div>
          </div>
          <button onClick={() => startGame(mode === "endless")} disabled={energy < 10}
            className="btn-primary text-xs px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed">
            用 10⚡ 开始
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 px-4 pb-8">
        {/* ---- Game Canvas ---- */}
        <div className="flex-1 min-w-0 relative">
          {!gameStarted ? (
            /* Start screen */
            <div className="rounded-xl border border-neon-green/20 bg-[#050812] flex items-center justify-center"
              style={{ aspectRatio: "16/9" }}>
              <div className="text-center px-8">
                <div className="text-6xl mb-4">🐱</div>
                <h2 className="text-2xl font-black gradient-text mb-2">
                  {mode === "endless" ? "∞ Endless Moon Mode" : "Super Gnarp 主线"}
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  {mode === "endless" ? "无限模式 · 随机生成关卡 · 越来越难 · 刷高分" : `20 个关卡 · 办公室→城市→太空→月球 · 每5关一个BOSS`}
                </p>
                <div className="text-xs text-gray-500 mb-6 space-y-1">
                  <div>今日免费局: <span className="text-neon-green font-bold">{freePlaysLeft} 次</span> 剩余</div>
                  <div>Energy: <span className="text-yellow-400 font-bold">{energy}/{maxEnergy}</span>（额外局 10 Energy/次）</div>
                </div>
                <button onClick={() => startGame(mode === "endless")} className="btn-primary px-10 py-3 text-base">
                  🚀 开始游戏
                </button>
              </div>
            </div>
          ) : (
            <div id="gnarp-canvas" ref={gameRef}
              className="rounded-xl overflow-hidden border border-neon-green/20 shadow-[0_0_30px_rgba(0,232,122,0.08)] bg-[#050812]"
              style={{ aspectRatio: "16/9", width: "100%" }} />
          )}

          {/* Game Over overlay */}
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/78 backdrop-blur-md">
              <div className="text-center px-8 py-8 glass-card max-w-sm">
                <div className="text-5xl mb-3">😿</div>
                <h2 className="text-xl font-black text-pink-400 mb-1">
                  {mode === "endless" ? "Endless 结束！" : "Game Over"}
                </h2>
                <div className="text-gray-300 text-sm mb-1 space-y-1">
                  <div>分数 <span className="text-neon-green font-bold">{score.toLocaleString()}</span></div>
                  <div>收集 Token <span className="text-yellow-400 font-bold">{sessionTokens}</span>（已扣 3% 手续费）</div>
                  {mode === "story" && <div>到达关卡 <span className="text-purple-400 font-bold">{currentLevel + 1} / 20</span></div>}
                </div>
                <div className="text-xs text-gray-500 mb-4">分享到 X，召唤更多猫奴！</div>
                <div className="flex gap-2">
                  <button onClick={() => startGame(mode === "endless")} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <RefreshCw size={14} /> 再来
                  </button>
                  <a href={`https://x.com/intent/tweet?text=我在 Super Gnarp 得了 ${score.toLocaleString()} 分，收集了 ${sessionTokens} $GNARP！🐱🚀 #Gnarp #SolanaMeme`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm no-underline">
                    𝕏 分享
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Level Win toast */}
          {levelWin !== null && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 glass-card px-6 py-3 text-sm font-bold text-neon-green border border-neon-green/40 animate-bounce z-30 whitespace-nowrap">
              🎉 {LEVEL_THEMES[levelWin]} 通关！
            </div>
          )}

          {/* Controls hint */}
          <div className="mt-2 text-center text-xs text-gray-500 space-x-3">
            <span>← → 移动</span>
            <span>↑/W/Space 跳跃</span>
            <span>再按 二段跳</span>
            <span>Shift/Z 冲刺</span>
            <span className="text-pink-400">从头顶踩死敌人</span>
          </div>
        </div>

        {/* ---- Sidebar ---- */}
        <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-3">

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass-card p-3 text-center">
              <Gamepad2 size={15} className="text-neon-green mx-auto mb-1" />
              <div className="text-xs text-gray-400">分数</div>
              <div className="font-bold text-white text-sm leading-tight">{score > 999 ? `${(score / 1000).toFixed(1)}K` : score}</div>
            </div>
            <div className="glass-card p-3 text-center">
              <span className="text-lg block leading-tight">🪙</span>
              <div className="text-xs text-gray-400">Token</div>
              <div className="font-bold text-yellow-400 text-sm leading-tight">{sessionTokens}</div>
            </div>
            <div className="glass-card p-3 text-center">
              <span className="text-base block leading-tight">{"❤".repeat(Math.max(0, hp))}</span>
              <div className="text-xs text-gray-400 mt-0.5">生命</div>
            </div>
          </div>

          {/* Combo */}
          {combo >= 2 && (
            <div className={`glass-card p-2.5 text-center border ${combo >= 6 ? "border-pink-400/50" : "border-yellow-400/30"} animate-pulse`}>
              <span className={`font-black text-base ${combo >= 6 ? "text-pink-400" : combo >= 4 ? "text-orange-400" : "text-yellow-400"}`}>
                {combo >= 8 ? "🔥 ULTRA" : combo >= 6 ? "⚡ MEGA" : combo >= 4 ? "💥 SUPER" : "✨"} ×{combo} COMBO
              </span>
            </div>
          )}

          {/* Tabs */}
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
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={13} className="text-neon-green" />
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">钱包总余额</span>
                </div>
                <div className="text-2xl font-black text-neon-green">{tokens.toLocaleString()}</div>
                <div className="text-xs text-gray-500">$GNARP Token</div>
                {stakedTokens > 0 && (
                  <div className="text-xs text-yellow-400 mt-1">质押中: {stakedTokens.toLocaleString()}</div>
                )}
              </div>

              {/* P2E Pool */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap size={11} /> P2E 奖励池
                  </span>
                  <span className="text-xs text-yellow-400 font-bold">{p2ePct}%</span>
                </div>
                <div className="text-sm font-black text-white">{p2ePool.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mb-2">GNARP 剩余</div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p2ePct}%`, background: "linear-gradient(90deg,#ffd700,#ffaa00)", boxShadow: "0 0 6px #ffd700" }} />
                </div>
                <div className="text-xs text-gray-500 mt-1.5">已回购: {Math.floor(feesBoughtBack)} GNARP</div>
              </div>

              {/* Energy */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap size={11} /> Energy
                  </span>
                  <span className="text-xs text-purple-400 font-bold">{energy}/{maxEnergy}</span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${energyPct}%`, background: energyPct > 30 ? "linear-gradient(90deg,#9b6dff,#00c2ff)" : "#ff4fa3", boxShadow: "0 0 6px #9b6dff" }} />
                </div>
                <div className="text-xs text-gray-400 flex justify-between">
                  <span>今日免费局: <span className="text-neon-green font-bold">{freePlaysLeft}</span>/{DAILY_FREE_PLAYS}</span>
                  <span>额外局: <span className="text-yellow-400 font-bold">10⚡</span>/次</span>
                </div>
              </div>

              {/* Mining rate */}
              <div className="glass-card p-4 space-y-2">
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">挖矿数据</div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1"><Clock size={11} /> 每小时产出</span>
                  <span className="font-bold text-white">{miningRate.toFixed(1)} <span className="text-neon-green text-xs">Token</span></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1"><Coins size={11} /> 今日已产出</span>
                  <span className="font-bold text-white">{todayEarned} <span className="text-gray-500 text-xs">/ {dailyCap}</span></span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>今日进度</span><span>{capPct}%</span></div>
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${capPct}%`,
                      background: capPct > 80 ? "#ff4fa3" : "linear-gradient(90deg,#00e87a,#9b6dff)",
                      boxShadow: `0 0 6px ${capPct > 80 ? "#ff4fa3" : "#00e87a"}`,
                    }} />
                  </div>
                  {capPct >= 100 && <div className="text-xs text-pink-400 mt-1 text-center">今日已达上限 · 明日重置</div>}
                </div>
              </div>

              <button onClick={() => setTab("shop")} className="w-full py-2 rounded-xl bg-neon-green/10 text-neon-green text-xs font-bold hover:bg-neon-green/20 transition-all flex items-center justify-center gap-1.5">
                <ShoppingBag size={12} /> 购买升级 · 提升产出
              </button>
            </div>
          )}

          {/* ===== SHOP TAB ===== */}
          {tab === "shop" && (
            <div className="space-y-2.5">
              <div className="glass-card p-3 flex items-center gap-2">
                <span className="text-yellow-400 font-black">🪙</span>
                <span className="text-xs text-gray-400">余额：</span>
                <span className="text-yellow-400 font-bold">{tokens.toLocaleString()} $GNARP</span>
                <span className="ml-auto text-xs text-gray-500">购买收 3% 手续费</span>
              </div>
              {(["antenna", "fan", "dance"] as (keyof MinerUpgrades)[]).map((item) => (
                <UpgradeCard key={item} item={item} />
              ))}
              <div className="text-xs text-gray-500 text-center pt-1">升级永久有效 · 玩游戏赚 Token → 买装备 → 更高产出</div>
            </div>
          )}

          {/* ===== RANK TAB ===== */}
          {tab === "rank" && (
            <div className="glass-card p-3 space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={14} className="text-yellow-400" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">今日挖矿王 TOP</span>
              </div>
              {leaderboard.slice(0, 12).map((e, i) => (
                <div key={e.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${i < 3 ? "bg-neon-green/8" : "hover:bg-white/3"}`}>
                  <span className={`text-xs font-black w-5 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-gray-500"}`}>
                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}`}
                  </span>
                  <span className="text-xs text-gray-200 flex-1 truncate">{e.name}</span>
                  <span className="text-xs text-yellow-400 font-bold">{e.tokens}🪙</span>
                  <span className="text-xs text-neon-green">{e.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
