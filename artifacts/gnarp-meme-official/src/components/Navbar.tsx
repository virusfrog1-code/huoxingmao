import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, Menu, X, Wallet } from "lucide-react";
import { usePhantomWallet } from "../hooks/usePhantomWallet";

const CA = "5EbMhNWHEvRMS2k7MEPXz9dtR6j1YyEvwY6qDGobpump";
const PUMP_URL = `https://pump.fun/coin/${CA}`;
const TELEGRAM_URL = "https://t.me/gnarpsolana";

const links = [
  { path: "/", label: "首页" },
  { path: "/lore", label: "Lore" },
  { path: "/gallery", label: "Gallery" },
  { path: "/community", label: "社区" },
  { path: "/token", label: "Token" },
  { path: "/game", label: "🎮 Play" },
];

function WalletBtn({ size = "sm" }: { size?: "sm" | "md" }) {
  const { connected, connecting, shortAddress, connect, disconnect } = usePhantomWallet();
  const cls = size === "md"
    ? "px-5 py-3 rounded-xl text-sm font-bold"
    : "px-4 py-2 rounded-lg text-xs font-bold";
  if (connected) {
    return (
      <button onClick={disconnect}
        className={`${cls} flex items-center gap-1.5 border border-neon-green/40 text-neon-green hover:bg-neon-green/8 transition-all`}>
        <Wallet size={size === "md" ? 14 : 12} />
        {shortAddress}
      </button>
    );
  }
  return (
    <button onClick={connect} disabled={connecting}
      className={`${cls} flex items-center gap-1.5 bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 active:scale-95 transition-all disabled:opacity-50`}>
      <Wallet size={size === "md" ? 14 : 12} />
      {connecting ? "连接中…" : "Connect Wallet"}
    </button>
  );
}

export { WalletBtn };

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(5,8,18,0.88)" : "rgba(5,8,18,0.4)",
        backdropFilter: "blur(24px) saturate(180%)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#00e87a,#00c94e)" }}>
              <span className="text-base">🐱</span>
            </div>
            <span className="text-base font-black tracking-tight text-neon-green">GNARP</span>
            <Zap size={12} style={{ color: "#00e87a", opacity: 0.7 }} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((l) => (
              <Link key={l.path} to={l.path}
                className={`nav-link ${location.pathname === l.path ? "active" : ""}`}>
                {l.label}
              </Link>
            ))}
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="nav-link flex items-center gap-1">
              ✈️ TG
            </a>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <WalletBtn />
            <a href={PUMP_URL} target="_blank" rel="noopener noreferrer"
              className="btn-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 no-underline">
              🚀 Buy $GNARP
            </a>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg text-white/70" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-5 pb-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="pt-4 space-y-1">
            {links.map((l) => (
              <Link key={l.path} to={l.path}
                className={`block nav-link ${location.pathname === l.path ? "active" : ""}`}
                onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="block nav-link" onClick={() => setOpen(false)}>
              ✈️ Telegram 社区
            </a>
            <div className="pt-4 flex flex-col gap-2">
              <WalletBtn size="md" />
              <a href={PUMP_URL} target="_blank" rel="noopener noreferrer"
                className="btn-primary py-3 rounded-xl text-sm text-center no-underline block">
                🚀 Buy $GNARP on Pump.fun
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
