import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import StarField from "./components/StarField";
import FloatingGnarp from "./components/FloatingGnarp";
import HomePage from "./pages/HomePage";
import LorePage from "./pages/LorePage";
import GalleryPage from "./pages/GalleryPage";
import CommunityPage from "./pages/CommunityPage";
import TokenPage from "./pages/TokenPage";
import GamePage from "./pages/GamePage";

const CA = "5EbMhNWHEvRMS2k7MEPXz9dtR6j1YyEvwY6qDGobpump";
const PUMP_URL = `https://pump.fun/coin/${CA}`;
const TELEGRAM_URL = "https://t.me/gnarpsolana";

function Footer() {
  return (
    <footer className="relative border-t border-white/6 mt-20 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐱</span>
              <span className="text-xl font-black text-neon-green">GNARP</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              外星小猫降临 Solana · 边玩边赚 · 零预挖公平发射 · 社区共建月球基地
            </p>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-500 uppercase tracking-wider">合约地址</span>
              <a href={`https://solscan.io/token/${CA}`} target="_blank" rel="noopener noreferrer"
                className="text-xs font-mono text-neon-green/70 hover:text-neon-green transition-colors break-all">
                {CA}
              </a>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">产品</div>
            <div className="space-y-2">
              {[
                { to: "/token", label: "代币信息" },
                { to: "/game", label: "Super Gnarp 游戏" },
                { to: "/gallery", label: "Gnarp 图鉴" },
                { to: "/lore", label: "Lore 世界观" },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="block text-sm text-gray-400 hover:text-white transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">社区</div>
            <div className="space-y-2">
              {[
                { href: TELEGRAM_URL, label: "✈️ Telegram" },
                { href: "https://twitter.com/Ricedmdq", label: "𝕏 Twitter / X" },
                { href: PUMP_URL, label: "🚀 Pump.fun" },
                { href: `https://solscan.io/token/${CA}`, label: "🔍 Solscan" },
              ].map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                  className="block text-sm text-gray-400 hover:text-white transition-colors">{l.label}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <div>© 2025 Gnarp 🐱 · 外星小猫征服宇宙</div>
          <div className="flex items-center gap-4">
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="hover:text-neon-green transition-colors">Telegram</a>
            <a href="https://twitter.com/Ricedmdq" target="_blank" rel="noopener noreferrer"
              className="hover:text-neon-green transition-colors">Twitter</a>
            <a href={PUMP_URL} target="_blank" rel="noopener noreferrer"
              className="hover:text-neon-green transition-colors">Pump.fun</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <div className="relative min-h-screen flex flex-col" style={{ background: "#050812" }}>
        <StarField />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lore" element={<LorePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/token" element={<TokenPage />} />
            <Route path="/game" element={<GamePage />} />
          </Routes>
        </main>
        <Footer />
        <FloatingGnarp />
      </div>
    </BrowserRouter>
  );
}
