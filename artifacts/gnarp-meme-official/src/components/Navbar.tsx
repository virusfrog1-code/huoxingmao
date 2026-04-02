import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
  { path: "/", label: "首页" },
  { path: "/lore", label: "Lore" },
  { path: "/gallery", label: "图库" },
  { path: "/community", label: "社区" },
  { path: "/token", label: "Token" },
  { path: "/game", label: "小游戏" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        background: "rgba(3, 6, 17, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(57, 255, 20, 0.2)",
        boxShadow: "0 0 20px rgba(57, 255, 20, 0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🐱</span>
            <span
              className="text-xl font-black tracking-wider"
              style={{
                background: "linear-gradient(135deg, #39ff14, #bf5fff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              GNARP
            </span>
            <Zap size={16} style={{ color: "#39ff14", filter: "drop-shadow(0 0 5px #39ff14)" }} />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive ? "nav-active" : "text-gray-400 hover:text-white"
                  }`}
                  style={
                    isActive
                      ? {
                          background: "rgba(57, 255, 20, 0.1)",
                          boxShadow: "0 0 10px rgba(57, 255, 20, 0.3)",
                        }
                      : {}
                  }
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href="https://twitter.com/Ricedmdq"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon-green px-4 py-2 rounded-lg text-sm font-bold ml-2"
            >
              X @Ricedmdq
            </a>
          </div>

          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: "#39ff14" }}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden animate-fade-in-up"
          style={{
            background: "rgba(3, 6, 17, 0.98)",
            borderBottom: "1px solid rgba(57, 255, 20, 0.2)",
          }}
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive ? "nav-active" : "text-gray-400"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href="https://twitter.com/Ricedmdq"
              target="_blank"
              rel="noopener noreferrer"
              className="block btn-neon-green px-4 py-3 rounded-lg text-sm font-bold text-center"
            >
              X @Ricedmdq
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
