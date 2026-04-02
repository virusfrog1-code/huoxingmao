import { useEffect, useRef, useState, useCallback } from "react";
import { useStore, UPGRADE_COSTS, UPGRADE_NAMES } from "../store/useStore";
import { createDanceMinerGame } from "../game/DanceMinerGame";
import type Phaser from "phaser";
import { Gamepad2, Zap, Trophy, Share2, X, ChevronUp, Clock } from "lucide-react";

const upgradeIcons = {
  antenna: "📡",
  dance: "💃",
  fan: "👥",
};

const upgradeDescs = {
  antenna: "每分钟自动产出 Token",
  dance: "奖励倍数 +50%",
  fan: "离线挖矿速率提升",
};

export default function GamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTokens, setFinalTokens] = useState(0);
  const [liveScore, setLiveScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboGrade, setComboGrade] = useState("");
  const [playerName, setPlayerName] = useState("Gnarp");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");
  const [offlineEarnings, setOfflineEarnings] = useState(0);

  const { tokens, upgrades, leaderboard, addTokens, upgradeItem, addToLeaderboard, calculateOfflineEarnings } = useStore();

  useEffect(() => {
    const earnings = calculateOfflineEarnings();
    if (earnings > 0) setOfflineEarnings(earnings);
  }, []);

  const startGame = useCallback(() => {
    setStarted(true);
    setGameOver(false);
    setLiveScore(0);
    setCombo(0);
    setFinalScore(0);
    setFinalTokens(0);
    setOfflineEarnings(0);

    setTimeout(() => {
      if (!containerRef.current) return;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }

      const danceMultiplier = 1 + upgrades.dance * 0.5;

      gameRef.current = createDanceMinerGame("phaser-game", {
        onScoreChange: (score) => setLiveScore(score),
        onComboChange: (c, grade) => {
          setCombo(c);
          setComboGrade(grade);
        },
        onGameOver: (score, rawTokens) => {
          const bonusTokens = Math.floor(rawTokens * danceMultiplier);
          addTokens(bonusTokens);
          setFinalScore(score);
          setFinalTokens(bonusTokens);
          setGameOver(true);
          setStarted(false);
        },
        onTokenClaim: (t) => addTokens(t),
      });
    }, 100);
  }, [upgrades, addTokens]);

  useEffect(() => {
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const handleUpgrade = (key: "antenna" | "dance" | "fan") => {
    const success = upgradeItem(key);
    if (success) {
      setUpgradeMsg(`${upgradeIcons[key]} ${UPGRADE_NAMES[key]} 升级成功！`);
    } else {
      const lvl = upgrades[key];
      const maxLvl = UPGRADE_COSTS[key].length;
      if (lvl >= maxLvl) setUpgradeMsg("已达最高级！");
      else setUpgradeMsg("Token 不足！");
    }
    setTimeout(() => setUpgradeMsg(""), 2000);
  };

  const shareScore = () => {
    const text = `我在 Gnarp Dance Miner 里得了 ${finalScore} 分，挖到了 ${finalTokens} 个 Gnarp Token！Gnarp Gnarp！🐱 #GnarpToken #外星小猫`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const submitToLeaderboard = () => {
    addToLeaderboard(playerName || "Gnarp", finalScore, finalTokens);
    setShowLeaderboard(true);
  };

  const comboColors: Record<string, string> = {
    perfect: "#39ff14",
    great: "#bf5fff",
    good: "#ffcc00",
    miss: "#666",
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1
            className="text-3xl md:text-5xl font-black mb-2"
            style={{
              background: "linear-gradient(135deg, #39ff14, #bf5fff, #ff2d78)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Dance Miner
          </h1>
          <p className="text-gray-400 text-sm">按箭头键 / 点击屏幕跟随节拍！完美连击挖 Token！</p>
        </div>

        {offlineEarnings > 0 && !started && !gameOver && (
          <div
            className="max-w-md mx-auto mb-4 rounded-2xl p-4 text-center animate-bounce-in"
            style={{
              background: "rgba(255, 204, 0, 0.15)",
              border: "1px solid rgba(255, 204, 0, 0.4)",
            }}
          >
            <div className="text-2xl mb-1">💰</div>
            <div className="font-black text-lg" style={{ color: "#ffcc00" }}>
              离线收益：+{offlineEarnings} Gnarp Token！
            </div>
            <div className="text-xs text-gray-400 mt-1">粉丝矩阵在你不在时帮你挖矿了！</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div
              className="rounded-3xl overflow-hidden relative"
              style={{
                border: "2px solid rgba(57, 255, 20, 0.4)",
                boxShadow: "0 0 30px rgba(57, 255, 20, 0.2)",
                minHeight: 400,
                background: "#030611",
              }}
            >
              {!started && !gameOver && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{ background: "rgba(3, 6, 17, 0.95)" }}
                >
                  <div
                    className="text-4xl md:text-6xl font-mono font-black mb-4 animate-dance1"
                    style={{ color: "#39ff14", textShadow: "0 0 20px #39ff14" }}
                  >
                    (=^･ω･^=)
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Gnarp Dance Miner</h2>
                  <p className="text-gray-400 text-sm mb-1">按 ← ↑ → ↓ 键跟节拍击打箭头</p>
                  <p className="text-gray-400 text-sm mb-1">移动端：点击对应的 1/4 屏区域</p>
                  <p className="text-gray-400 text-sm mb-6">每 1000 分 = 1 Gnarp Token</p>
                  <div className="flex flex-wrap justify-center gap-3 mb-4 text-xs">
                    {[
                      { dir: "←", color: "#39ff14" },
                      { dir: "↑", color: "#bf5fff" },
                      { dir: "→", color: "#ff2d78" },
                      { dir: "↓", color: "#00ffff" },
                    ].map((k) => (
                      <span
                        key={k.dir}
                        className="px-3 py-2 rounded-lg font-black text-xl"
                        style={{
                          color: k.color,
                          border: `2px solid ${k.color}`,
                          textShadow: `0 0 10px ${k.color}`,
                          boxShadow: `0 0 10px ${k.color}44`,
                        }}
                      >
                        {k.dir}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={startGame}
                    className="btn-neon-green px-10 py-4 rounded-2xl font-black text-xl flex items-center gap-3 animate-pulse-glow"
                  >
                    <Gamepad2 size={24} /> 开始挖矿！
                  </button>
                  <div className="mt-4 text-xs text-gray-600">当前 Token: {tokens}</div>
                </div>
              )}

              {gameOver && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{ background: "rgba(3, 6, 17, 0.96)", backdropFilter: "blur(10px)" }}
                >
                  <div className="text-5xl mb-4 animate-bounce-in">🎉</div>
                  <h2
                    className="text-3xl font-black mb-2"
                    style={{ color: "#39ff14" }}
                  >
                    游戏结束！
                  </h2>
                  <div className="card-glow rounded-2xl p-6 mb-6 w-64 text-center">
                    <div className="text-4xl font-black text-white mb-1">{finalScore.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm mb-4">总得分</div>
                    <div
                      className="text-3xl font-black mb-1"
                      style={{ color: "#ffcc00" }}
                    >
                      +{finalTokens} 🪙
                    </div>
                    <div className="text-gray-400 text-sm">本局 Gnarp Token</div>
                  </div>

                  <div className="flex flex-col gap-2 w-64 mb-4">
                    <input
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="输入你的昵称"
                      className="w-full px-4 py-2 rounded-xl text-sm text-white text-center outline-none"
                      style={{ background: "rgba(57,255,20,0.1)", border: "1px solid #39ff1444" }}
                    />
                    <button
                      onClick={submitToLeaderboard}
                      className="btn-neon-green py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <Trophy size={18} /> 上传排行榜
                    </button>
                    <button
                      onClick={shareScore}
                      className="btn-neon-purple py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <Share2 size={18} /> 分享到 X
                    </button>
                    <button
                      onClick={startGame}
                      className="btn-neon-pink py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      再来一局！
                    </button>
                  </div>
                </div>
              )}

              {started && (
                <div
                  className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10 pointer-events-none"
                >
                  <div
                    className="px-3 py-1 rounded-lg text-sm font-black"
                    style={{ color: "#39ff14", background: "rgba(57,255,20,0.15)" }}
                  >
                    {liveScore.toLocaleString()}
                  </div>
                  {combo > 1 && (
                    <div
                      className="px-3 py-1 rounded-lg text-sm font-black animate-bounce-in"
                      style={{
                        color: comboColors[comboGrade] || "#fff",
                        background: `${comboColors[comboGrade] || "#fff"}22`,
                      }}
                    >
                      {combo}x Combo!
                    </div>
                  )}
                </div>
              )}

              <div id="phaser-game" ref={containerRef} className="w-full" style={{ minHeight: 400 }} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-glow rounded-2xl p-5">
              <h3 className="font-black text-white mb-4 flex items-center gap-2">
                <Zap size={18} style={{ color: "#ffcc00" }} /> Mining Station
              </h3>

              <div className="text-center mb-4 p-3 rounded-xl" style={{ background: "rgba(255,204,0,0.1)", border: "1px solid rgba(255,204,0,0.3)" }}>
                <div className="text-3xl font-black" style={{ color: "#ffcc00" }}>{tokens}</div>
                <div className="text-xs text-gray-400">Gnarp Token</div>
              </div>

              {upgradeMsg && (
                <div
                  className="text-center text-sm font-bold mb-3 py-2 rounded-lg animate-bounce-in"
                  style={{ color: "#39ff14", background: "rgba(57,255,20,0.1)" }}
                >
                  {upgradeMsg}
                </div>
              )}

              <div className="space-y-3">
                {(["antenna", "dance", "fan"] as const).map((key) => {
                  const lvl = upgrades[key];
                  const maxLvl = UPGRADE_COSTS[key].length;
                  const cost = lvl < maxLvl ? UPGRADE_COSTS[key][lvl] : null;
                  const canAfford = cost !== null && tokens >= cost;

                  return (
                    <div
                      key={key}
                      className="rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">
                          {upgradeIcons[key]} {UPGRADE_NAMES[key]}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: lvl > 0 ? "rgba(57,255,20,0.2)" : "rgba(255,255,255,0.05)",
                            color: lvl > 0 ? "#39ff14" : "#666",
                          }}
                        >
                          Lv.{lvl}/{maxLvl}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{upgradeDescs[key]}</div>
                      <button
                        onClick={() => handleUpgrade(key)}
                        disabled={lvl >= maxLvl || !canAfford}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                          lvl >= maxLvl
                            ? "text-gray-600 cursor-not-allowed"
                            : canAfford
                            ? "btn-neon-green hover:scale-105"
                            : "text-gray-500 cursor-not-allowed"
                        }`}
                        style={
                          !canAfford && lvl < maxLvl
                            ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }
                            : lvl >= maxLvl
                            ? { background: "rgba(57,255,20,0.05)", border: "1px solid rgba(57,255,20,0.2)" }
                            : {}
                        }
                      >
                        {lvl >= maxLvl ? "MAX 已满级！" : `升级 (${cost} 🪙)`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card-glow-purple rounded-2xl p-4">
              <h3
                className="font-black mb-3 flex items-center justify-between cursor-pointer"
                style={{ color: "#bf5fff" }}
                onClick={() => setShowLeaderboard(!showLeaderboard)}
              >
                <span className="flex items-center gap-2">
                  <Trophy size={16} /> 全球排行榜
                </span>
                <ChevronUp
                  size={16}
                  className={`transition-transform ${showLeaderboard ? "" : "rotate-180"}`}
                />
              </h3>

              {showLeaderboard && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {leaderboard.slice(0, 10).map((entry, i) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className="w-5 h-5 flex items-center justify-center rounded font-black text-xs flex-shrink-0"
                        style={{
                          background: i === 0 ? "#ffcc00" : i === 1 ? "#aaa" : i === 2 ? "#cd7f32" : "rgba(255,255,255,0.1)",
                          color: i < 3 ? "#030611" : "#666",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 text-gray-300 truncate">{entry.name}</span>
                      <span className="text-gray-500">{entry.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="rounded-2xl p-4 text-xs text-gray-500"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-1 mb-2 font-bold text-gray-400">
                <Clock size={12} /> 每日挑战
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>达到 10000 分</span>
                  <span style={{ color: liveScore >= 10000 ? "#39ff14" : "#666" }}>
                    {liveScore >= 10000 ? "✓ +500 🪙" : `${Math.min(liveScore, 10000)}/10000`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>50 Combo 连击</span>
                  <span style={{ color: "#666" }}>待完成</span>
                </div>
                <div className="flex justify-between">
                  <span>挖到 10 Token</span>
                  <span style={{ color: tokens >= 10 ? "#39ff14" : "#666" }}>
                    {tokens >= 10 ? "✓ 已完成" : `${Math.min(tokens, 10)}/10`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
