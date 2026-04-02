import { useState, useEffect } from "react";

const GNARP_PHRASES = [
  "Gnarp Gnarp！",
  "外星小猫来啦～",
  "Meeeeow~",
  "Gnarp Gnarp Gnarp！",
  "摸鱼时间到！",
  "Token 到月球！",
  "喵呜！",
  "我来自外太空～",
  "快来玩我的小游戏！",
  "Gnarp is love！",
  "挖矿挖矿！",
  "Gnarp Gnarp，嘿嘿嘿！",
];

export default function FloatingGnarp() {
  const [phrase, setPhrase] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showPhrase, setShowPhrase] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => f + 1);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const randomPhrase = GNARP_PHRASES[Math.floor(Math.random() * GNARP_PHRASES.length)];
    setPhrase(randomPhrase);
    setShowPhrase(true);
    setTimeout(() => {
      setShowPhrase(false);
      setTimeout(() => setIsAnimating(false), 300);
    }, 2000);
  };

  const catFrames = ["(=^･ω･^=)", "(=^･ｪ･^=)", "(=^‥^=)", "(=ФωФ=)"];
  const dancingCat = catFrames[frame % catFrames.length];

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 select-none"
    >
      {showPhrase && phrase && (
        <div
          className="animate-bounce-in card-glow rounded-xl px-4 py-2 text-sm font-bold max-w-48 text-center"
          style={{ color: "#39ff14", animationFillMode: "both" }}
        >
          {phrase}
        </div>
      )}
      <button
        onClick={handleClick}
        className={`text-3xl cursor-pointer transition-transform ${isAnimating ? "animate-dance1" : "animate-float"}`}
        style={{ filter: "drop-shadow(0 0 10px #39ff14)", background: "none", border: "none", padding: 0 }}
        title="点我！"
      >
        <div className="flex flex-col items-center">
          <div
            className="text-2xl font-mono font-bold"
            style={{
              color: "#39ff14",
              textShadow: "0 0 10px #39ff14, 0 0 20px #39ff14",
            }}
          >
            {dancingCat}
          </div>
          <div
            className="text-xs mt-1 font-bold"
            style={{ color: "#bf5fff" }}
          >
            点我！
          </div>
        </div>
      </button>
    </div>
  );
}
