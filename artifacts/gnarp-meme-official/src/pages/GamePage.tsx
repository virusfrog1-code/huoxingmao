import { useEffect, useRef, useState, useCallback } from "react";
import { createSuperGnarpGame } from "../game/SuperGnarpGame";
import { useStore } from "../store/useStore";
import { Zap, TrendingUp, ShoppingBag, Trophy, Twitter, RefreshCw, Info } from "lucide-react";
import type Phaser from "phaser";

const UPGRADES = [
  {
    id: "antenna",
    name: "量子天线",
    icon: "📡",
    desc: "每秒自动产出 1 Token",
    cost: [50, 200, 600],
    effect: (lvl: number) => `+${lvl} Token/秒`,
  },
  {
    id: "jump",
    name: "跳跃芯片",
    icon: "🦘",
    desc: "增强 Gnarp 跳跃力",
    cost: [80, 300, 900],
    effect: (lvl: number) => `跳跃力 +${lvl * 15}%`,
  },
  {
    id: "fan",
    name: "粉丝矩阵",
    icon: "👾",
    desc: "离线时每小时产出 20 Token",
    cost: [120, 500, 1500],
    effect: (lvl: number) => `离线 +${lvl * 20}/h`,
  },
];

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ color }} className="mb-1">{icon}</div>
      <div className="text-base font-black" style={{ color }}>{value}</div>
      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
    </div>
  );
}

export default function GamePage() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(3);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [gameOverData, setGameOverData] = useState<{ score: number; tokens: number } | null>(null);
  const [levelComplete, setLevelComplete] = useState<{ level: number; tokens: number } | null>(null);
  const [tab, setTab] = useState<"mine" | "upgrade" | "board">("mine");

  const { tokens, upgrades, leaderboard, addTokens, buyUpgrade } = useStore();

  const handleTokenCollect = useCallback((_total: number) => {
    setSessionTokens((prev) => prev + 1);
    addTokens(1);
  }, [addTokens]);

  const handleScoreUpdate = useCallback((s: number) => setScore(s), []);
  const handleHpUpdate = useCallback((h: number) => setHp(h), []);
  const handleLevelComplete = useCallback((level: number, tok: number) => {
    setLevelComplete({ level, tokens: tok });
    addTokens(Math.floor(tok * 0.5));
  }, [addTokens]);
  const handleGameOver = useCallback((s: number, t: number) => {
    setGameOverData({ score: s, tokens: t });
  }, []);

  const initGame = useCallback(() => {
    if (gameRef.current || !containerRef.current) return;
    gameRef.current = createSuperGnarpGame("super-gnarp-game", {
      onTokenCollect: handleTokenCollect,
      onScoreUpdate: handleScoreUpdate,
      onLevelComplete: handleLevelComplete,
      onGameOver: handleGameOver,
      onHpUpdate: handleHpUpdate,
    });
  }, [handleTokenCollect, handleScoreUpdate, handleLevelComplete, handleGameOver, handleHpUpdate]);

  useEffect(() => {
    const t = setTimeout(initGame, 120);
    return () => {
      clearTimeout(t);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []); // eslint-disable-line

  const restart = () => {
    gameRef.current?.destroy(true);
    gameRef.current = null;
    setGameOverData(null);
    setLevelComplete(null);
    setScore(0);
    setHp(3);
    setSessionTokens(0);
    setTimeout(initGame, 160);
  };

  const shareToX = () => {
    const text = `我在 Super Gnarp 中获得了 ${score} 分，挖了 ${sessionTokens} 个 Token！🐱⛏️ #SuperGnarp #GnarpToken`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const canBuy = (id: string, level: number) => {
    const up = UPGRADES.find((u) => u.id === id);
    if (!up || level >= 3) return false;
    return tokens >= up.cost[level];
  };

  return (
    <div className="relative z-10 min-h-screen pt-20">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Title Row */}
        <div className="flex items-center gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "#f5f5f7" }}>
              Super <span className="gradient-text">Gnarp</span>
            </h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              横版平台跳跃 · 踩敌人 · 收金币 · 挖 Token · 3 个关卡
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={restart}
              className="btn-outline flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            >
              <RefreshCw size={13} /> 重开
            </button>
            <button
              onClick={shareToX}
              className="btn-secondary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            >
              <Twitter size={13} /> 分享
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-5">
          {/* Game Canvas */}
          <div className="flex-1 min-w-0">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "#050812",
                border: "1px solid rgba(0,232,122,0.2)",
                boxShadow: "0 0 40px rgba(0,232,122,0.05)",
              }}
            >
              {/* Hint */}
              <div
                className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs pointer-events-none"
                style={{ background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)" }}
              >
                <Info size={11} />
                ← → 移动 · ↑/W/Space 跳跃 · 二段跳 · 踩敌人头顶消灭
              </div>

              <div
                id="super-gnarp-game"
                ref={containerRef}
                style={{ width: "100%", minHeight: 300, aspectRatio: "16/9" }}
              />

              {/* Game Over Overlay */}
              {gameOverData && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(5,8,18,0.88)", backdropFilter: "blur(12px)" }}
                >
                  <div className="text-center animate-scale-in p-8">
                    <div className="text-6xl mb-4">😿</div>
                    <h2 className="text-3xl font-black mb-2" style={{ color: "#ff4fa3" }}>游戏结束</h2>
                    <div className="space-y-1 text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
                      <p>最终分数：<span style={{ color: "#00e87a", fontWeight: 700 }}>{gameOverData.score}</span></p>
                      <p>本局 Token：<span style={{ color: "#ffd700", fontWeight: 700 }}>{gameOverData.tokens}</span></p>
                    </div>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <button onClick={restart} className="btn-primary px-6 py-3 rounded-xl text-sm flex items-center gap-2">
                        <RefreshCw size={14} /> 再来一局
                      </button>
                      <button onClick={shareToX} className="btn-secondary px-6 py-3 rounded-xl text-sm flex items-center gap-2">
                        <Twitter size={14} /> 分享成绩
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Level Complete Overlay */}
              {levelComplete && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(5,8,18,0.88)", backdropFilter: "blur(12px)" }}
                >
                  <div className="text-center animate-scale-in p-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-black mb-2" style={{ color: "#00e87a" }}>
                      {levelComplete.level >= 3 ? "全关通关！🏆 Gnarp 登上月球！" : `第 ${levelComplete.level + 1} 关完成！`}
                    </h2>
                    <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                      额外奖励：<span style={{ color: "#ffd700", fontWeight: 700 }}>+{Math.floor(levelComplete.tokens * 0.5)} Token</span>
                    </p>
                    <button
                      onClick={() => { setLevelComplete(null); if (levelComplete.level >= 3) restart(); }}
                      className="btn-primary px-8 py-3 rounded-xl text-sm"
                    >
                      {levelComplete.level >= 3 ? "再挑战 🚀" : "继续下一关 →"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Controls Row */}
            <div
              className="mt-4 rounded-xl p-4"
              style={{ background: "rgba(10,14,30,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { k: "← →", d: "左右移动" },
                  { k: "↑ / W / Space", d: "跳跃" },
                  { k: "连按 ↑ 两次", d: "二段跳" },
                  { k: "从头顶踩下", d: "消灭敌人" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="text-xs font-bold mb-0.5" style={{ color: "#00e87a" }}>{item.k}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{item.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:w-64 space-y-4 flex-shrink-0">
            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard icon={<Zap size={14} />} label="本局分" value={score.toString()} color="#00e87a" />
              <StatCard icon={<span className="text-sm">💛</span>} label="Token" value={sessionTokens.toString()} color="#ffd700" />
              <StatCard icon={<span className="text-sm">❤️</span>} label="生命" value={"❤".repeat(Math.max(0, hp))} color="#ff4fa3" />
            </div>

            {/* Wallet */}
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.18)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} style={{ color: "#00e87a" }} />
                <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>钱包总余额</span>
              </div>
              <div className="text-2xl font-black" style={{ color: "#00e87a" }}>{tokens}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>$GNARP Token</div>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                { key: "mine" as const, label: "矿站", icon: <Zap size={12} /> },
                { key: "upgrade" as const, label: "升级", icon: <ShoppingBag size={12} /> },
                { key: "board" as const, label: "排行", icon: <Trophy size={12} /> },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold transition-all duration-200"
                  style={{
                    background: tab === t.key ? "rgba(0,232,122,0.15)" : "transparent",
                    color: tab === t.key ? "#00e87a" : "rgba(255,255,255,0.4)",
                    borderBottom: tab === t.key ? "1px solid #00e87a" : "1px solid transparent",
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Mine */}
            {tab === "mine" && (
              <div className="space-y-2">
                <p className="text-xs px-1" style={{ color: "rgba(255,255,255,0.4)" }}>当前挖矿配置</p>
                {UPGRADES.map((up) => {
                  const lvl = upgrades[up.id as keyof typeof upgrades] ?? 0;
                  return (
                    <div key={up.id}
                      className="flex items-center justify-between rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{up.icon}</span>
                        <div>
                          <div className="text-xs font-bold" style={{ color: "#f5f5f7" }}>{up.name}</div>
                          <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {lvl > 0 ? up.effect(lvl) : "未解锁"}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-2 h-2 rounded-sm" style={{ background: i < lvl ? "#00e87a" : "rgba(255,255,255,0.12)" }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Upgrade */}
            {tab === "upgrade" && (
              <div className="space-y-2">
                {UPGRADES.map((up) => {
                  const lvl = upgrades[up.id as keyof typeof upgrades] ?? 0;
                  const maxed = lvl >= 3;
                  const cost = maxed ? 0 : up.cost[lvl];
                  const able = !maxed && canBuy(up.id, lvl);

                  return (
                    <div key={up.id}
                      className="rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{up.icon}</span>
                        <div className="flex-1">
                          <div className="text-xs font-bold" style={{ color: "#f5f5f7" }}>{up.name} Lv.{lvl}</div>
                          <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{up.desc}</div>
                        </div>
                      </div>
                      <button
                        disabled={!able}
                        onClick={() => buyUpgrade(up.id as any, cost)}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${maxed ? "btn-outline opacity-40 cursor-default" : able ? "btn-primary" : "btn-outline opacity-50 cursor-not-allowed"}`}
                      >
                        {maxed ? "✓ 满级" : `升级 · ${cost} Token`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Leaderboard */}
            {tab === "board" && (
              <div className="space-y-1.5">
                {leaderboard.slice(0, 8).map((entry: any, i: number) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{
                      background: i === 0 ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${i === 0 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <span className="text-xs w-5 font-black" style={{ color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "rgba(255,255,255,0.3)" }}>
                      {i + 1}
                    </span>
                    <span className="flex-1 text-xs truncate" style={{ color: "#f5f5f7" }}>{entry.name}</span>
                    <span className="text-xs font-bold" style={{ color: "#00e87a" }}>{entry.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
