import { useEffect, useRef, useState, useCallback } from "react";
import { createSuperGnarpGame } from "../game/SuperGnarpGame";
import {
  useStore, UPGRADE_COSTS, UPGRADE_NAMES, UPGRADE_ICONS, UPGRADE_DESCS,
} from "../store/useStore";
import type { MinerUpgrades } from "../store/useStore";
import { Zap, TrendingUp, ShoppingBag, Trophy, RefreshCw, Gamepad2, Clock, Coins } from "lucide-react";
import type Phaser from "phaser";

type Tab = "mine" | "shop" | "rank";

export default function GamePage() {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);

  const {
    tokens, upgrades, leaderboard,
    addTokens, buyUpgrade, addScore, addToLeaderboard,
    getMiningRatePerHour, getDailyCapTokens, getTodayEarned, calculateOfflineEarnings,
  } = useStore();

  const [tab, setTab] = useState<Tab>("mine");
  const [score, setScore] = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hp, setHp] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [levelWin, setLevelWin] = useState<number | null>(null);

  // Token economy
  const miningRate = getMiningRatePerHour();
  const dailyCap = getDailyCapTokens();
  const todayEarned = getTodayEarned();
  const capPct = Math.min(100, Math.round((todayEarned / dailyCap) * 100));

  // Dance bonus
  const getDanceBonus = useCallback(() => 1 + upgrades.dance * 0.3, [upgrades.dance]);

  /* ---- Boot Phaser ---- */
  useEffect(() => {
    calculateOfflineEarnings();

    if (!gameRef.current || phaserRef.current) return;

    phaserRef.current = createSuperGnarpGame("gnarp-canvas", {
      onTokenCollect: (delta, cb) => {
        addTokens(delta);
        setSessionTokens((t) => t + delta);
        setCombo(cb);
      },
      onScoreUpdate: (s) => setScore(s),
      onLevelComplete: (lv, tok) => {
        setLevelWin(lv);
        setSessionTokens(tok);
        setTimeout(() => setLevelWin(null), 2800);
      },
      onGameOver: (s, tok) => {
        addScore(s);
        setSessionTokens(tok);
        setGameOver(true);
      },
      onHpUpdate: (h) => setHp(h),
      onComboUpdate: (c) => setCombo(c),
      getDanceBonus,
    });

    return () => {
      phaserRef.current?.destroy(true);
      phaserRef.current = null;
    };
  }, []);

  const restartGame = () => {
    if (phaserRef.current) {
      phaserRef.current.destroy(true);
      phaserRef.current = null;
    }
    setGameOver(false);
    setScore(0);
    setSessionTokens(0);
    setCombo(0);
    setHp(3);
    setTimeout(() => {
      if (!gameRef.current) return;
      phaserRef.current = createSuperGnarpGame("gnarp-canvas", {
        onTokenCollect: (delta, cb) => {
          addTokens(delta);
          setSessionTokens((t) => t + delta);
          setCombo(cb);
        },
        onScoreUpdate: (s) => setScore(s),
        onLevelComplete: (lv, tok) => {
          setLevelWin(lv);
          setSessionTokens(tok);
          setTimeout(() => setLevelWin(null), 2800);
        },
        onGameOver: (s, tok) => {
          addScore(s);
          setSessionTokens(tok);
          setGameOver(true);
          addToLeaderboard("You", s, tok);
        },
        onHpUpdate: (h) => setHp(h),
        onComboUpdate: (c) => setCombo(c),
        getDanceBonus,
      });
    }, 120);
  };

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
              <div className="text-xs text-gray-400">{UPGRADE_DESCS[item]}</div>
            </div>
          </div>
        </div>
        {/* Level dots */}
        <div className="flex items-center gap-1.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${i < level ? "bg-neon-green shadow-[0_0_6px_#00e87a]" : "bg-white/10"}`}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">Lv.{level}/5</span>
        </div>
        <button
          onClick={() => handleBuy(item)}
          disabled={maxed || !canAfford}
          className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
            maxed
              ? "bg-neon-green/20 text-neon-green cursor-default"
              : canAfford
              ? "bg-neon-green text-black hover:brightness-110 active:scale-95"
              : "bg-white/5 text-gray-500 cursor-not-allowed"
          }`}
        >
          {maxed ? "✓ 已满级" : `🪙 ${cost?.toLocaleString()} $GNARP`}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-16 bg-[#050812]">
      {/* Header */}
      <div className="px-6 pt-6 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">
            <span className="text-neon-green">Super</span>{" "}
            <span className="gradient-text">Gnarp</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">横版平台跳跃 · 踩敌人 · 收金币 · 挖 Token · 3 个关卡</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={restartGame} className="glass-card px-3 py-2 text-xs text-gray-300 hover:text-white flex items-center gap-1.5">
            <RefreshCw size={13} /> 重开
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 px-4 pb-8">
        {/* ---- Game Canvas ---- */}
        <div className="flex-1 min-w-0 relative">
          <div
            id="gnarp-canvas"
            ref={gameRef}
            className="rounded-xl overflow-hidden border border-neon-green/20 shadow-[0_0_30px_rgba(0,232,122,0.08)] bg-[#050812]"
            style={{ aspectRatio: "16/9", width: "100%" }}
          />

          {/* Game Over overlay */}
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/75 backdrop-blur-md">
              <div className="text-center px-8 py-8 glass-card max-w-sm">
                <div className="text-5xl mb-3">😿</div>
                <h2 className="text-xl font-black text-pink-400 mb-1">Game Over</h2>
                <div className="text-gray-300 text-sm mb-4 space-y-1">
                  <div>本局分数 <span className="text-neon-green font-bold">{score.toLocaleString()}</span></div>
                  <div>收集 Token <span className="text-yellow-400 font-bold">{sessionTokens}</span></div>
                </div>
                <button onClick={restartGame} className="btn-primary w-full flex items-center justify-center gap-2">
                  <RefreshCw size={15} /> 再来一局
                </button>
              </div>
            </div>
          )}

          {/* Level Win toast */}
          {levelWin !== null && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 glass-card px-6 py-3 text-sm font-bold text-neon-green border border-neon-green/40 animate-bounce z-30">
              🎉 第 {levelWin + 1} 关通关！→ 第 {levelWin + 2} 关
            </div>
          )}

          {/* Controls hint bar */}
          <div className="mt-2 text-center text-xs text-gray-500 space-x-3">
            <span>← → 移动</span>
            <span>↑/W/Space 跳跃</span>
            <span>二段跳：再按跳跃</span>
            <span>Shift/Z 冲刺</span>
            <span className="text-pink-400">从头顶踩死敌人</span>
          </div>
        </div>

        {/* ---- Sidebar ---- */}
        <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-3">

          {/* Live stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass-card p-3 text-center">
              <Gamepad2 size={16} className="text-neon-green mx-auto mb-1" />
              <div className="text-xs text-gray-400">本局分</div>
              <div className="font-bold text-white text-sm leading-tight">{score.toLocaleString()}</div>
            </div>
            <div className="glass-card p-3 text-center">
              <span className="text-lg block leading-tight">🪙</span>
              <div className="text-xs text-gray-400">Token</div>
              <div className="font-bold text-yellow-400 text-sm leading-tight">{sessionTokens}</div>
            </div>
            <div className="glass-card p-3 text-center">
              <span className="text-lg block leading-tight">
                {"❤".repeat(Math.max(0, hp))}
              </span>
              <div className="text-xs text-gray-400 mt-0.5">生命</div>
            </div>
          </div>

          {/* Combo indicator */}
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
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t ? "bg-neon-green text-black" : "text-gray-400 hover:text-white"}`}
              >
                {t === "mine" ? "⛏ 矿站" : t === "shop" ? "🛒 升级" : "🏆 排行"}
              </button>
            ))}
          </div>

          {/* ===== MINE TAB ===== */}
          {tab === "mine" && (
            <div className="space-y-2.5">
              {/* Wallet */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-neon-green" />
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">钱包总余额</span>
                </div>
                <div className="text-2xl font-black text-neon-green">{tokens.toLocaleString()}</div>
                <div className="text-xs text-gray-500">$GNARP Token</div>
              </div>

              {/* Mining rate */}
              <div className="glass-card p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={13} className="text-yellow-400" />
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">挖矿数据</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><Clock size={11} /> 每小时产出</span>
                    <span className="font-bold text-white">{miningRate.toFixed(1)} <span className="text-neon-green text-xs">Token</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5"><Coins size={11} /> 今日已产出</span>
                    <span className="font-bold text-white">{todayEarned} <span className="text-gray-500 text-xs">/ {dailyCap}</span></span>
                  </div>
                </div>

                {/* Daily cap bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>今日产出进度</span><span>{capPct}%</span>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${capPct}%`,
                        background: capPct > 80 ? "#ff4fa3" : "linear-gradient(90deg, #00e87a, #9b6dff)",
                        boxShadow: `0 0 8px ${capPct > 80 ? "#ff4fa3" : "#00e87a"}`,
                      }}
                    />
                  </div>
                  {capPct >= 100 && (
                    <div className="text-xs text-pink-400 mt-1 text-center">今日已达上限 · 明日重置</div>
                  )}
                </div>
              </div>

              {/* Upgrade previews */}
              <div className="glass-card p-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">当前装备加成</div>
                {(["antenna", "fan", "dance"] as (keyof MinerUpgrades)[]).map((k) => (
                  <div key={k} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-xs text-gray-400">{UPGRADE_ICONS[k]} {UPGRADE_NAMES[k]}</span>
                    <span className={`text-xs font-bold ${upgrades[k] > 0 ? "text-neon-green" : "text-gray-600"}`}>
                      {upgrades[k] > 0 ? `Lv.${upgrades[k]}` : "未解锁"}
                    </span>
                  </div>
                ))}
                <button onClick={() => setTab("shop")} className="mt-3 w-full py-1.5 rounded-lg bg-neon-green/10 text-neon-green text-xs font-bold hover:bg-neon-green/20 transition-all flex items-center justify-center gap-1.5">
                  <ShoppingBag size={12} /> 去升级
                </button>
              </div>
            </div>
          )}

          {/* ===== SHOP TAB ===== */}
          {tab === "shop" && (
            <div className="space-y-2.5">
              <div className="glass-card p-3 flex items-center gap-2">
                <span className="text-yellow-400 font-black">🪙</span>
                <span className="text-xs text-gray-400">可用余额：</span>
                <span className="text-yellow-400 font-bold">{tokens.toLocaleString()} $GNARP</span>
              </div>
              <div className="text-xs text-gray-500 px-1">升级后永久生效，玩游戏赚 Token → 买装备 → 提升产出</div>
              {(["antenna", "fan", "dance"] as (keyof MinerUpgrades)[]).map((item) => (
                <UpgradeCard key={item} item={item} />
              ))}
            </div>
          )}

          {/* ===== RANK TAB ===== */}
          {tab === "rank" && (
            <div className="glass-card p-3 space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={14} className="text-yellow-400" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">今日挖矿王 TOP 20</span>
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
