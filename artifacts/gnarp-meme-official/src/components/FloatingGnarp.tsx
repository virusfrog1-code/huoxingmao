import { useState } from "react";
import { X, Gamepad2, Coins, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const quips = [
  "Gnarp Gnarp！我刚从月球回来！",
  "摸鱼效率 +9999%",
  "嘿，要不要来挖几个 Token？",
  "外太空网速真的很慢…",
  "Gnarp Nation 永不止步！",
  "我踩死了一个键盘 boss！",
  "Token 正在飞向月球中…",
];

export default function FloatingGnarp() {
  const [open, setOpen] = useState(false);
  const [quip] = useState(() => quips[Math.floor(Math.random() * quips.length)]);
  const [currentQuip, setCurrentQuip] = useState(quip);

  const refresh = () => {
    setCurrentQuip(quips[Math.floor(Math.random() * quips.length)]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-72 rounded-2xl overflow-hidden animate-scale-in"
          style={{
            background: "rgba(8, 12, 28, 0.95)",
            border: "1px solid rgba(0, 232, 122, 0.25)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 232, 122, 0.08)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-bounce-subtle"
                style={{ background: "#00e87a" }}
              />
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                Gnarp Assistant
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-4">
            <div
              className="rounded-xl p-3 mb-4 text-sm"
              style={{
                background: "rgba(0, 232, 122, 0.06)",
                border: "1px solid rgba(0, 232, 122, 0.12)",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.6,
              }}
            >
              {currentQuip}
              <button
                onClick={refresh}
                className="block mt-2 text-xs"
                style={{ color: "#00e87a", opacity: 0.7 }}
              >
                换一句 ↻
              </button>
            </div>

            <div className="space-y-2">
              {[
                { icon: <Gamepad2 size={14} />, label: "玩 Super Gnarp", to: "/game", style: "btn-primary" },
                { icon: <Coins size={14} />, label: "查看 Token", to: "/token", style: "btn-secondary" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`${item.style} flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <a
                href="https://twitter.com/Ricedmdq"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs"
              >
                <Twitter size={14} />
                关注 @Ricedmdq
              </a>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="relative group"
        style={{ background: "none", border: "none", padding: 0 }}
      >
        {!open && (
          <div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-bounce-subtle"
            style={{ background: "#00e87a", border: "2px solid #050812" }}
          />
        )}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${open ? "scale-95" : "group-hover:scale-105 animate-float"}`}
          style={{
            background: "linear-gradient(135deg, rgba(0,232,122,0.2), rgba(155,109,255,0.2))",
            border: "1px solid rgba(0, 232, 122, 0.35)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 232, 122, 0.15)",
          }}
        >
          🐱
        </div>
      </button>
    </div>
  );
}
