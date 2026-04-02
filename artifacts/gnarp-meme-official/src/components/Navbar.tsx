import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, Menu, X } from "lucide-react";

const links = [
  { path: "/", label: "首页" },
  { path: "/lore", label: "Lore" },
  { path: "/gallery", label: "Gallery" },
  { path: "/community", label: "社区" },
  { path: "/token", label: "Token" },
  { path: "/game", label: "Super Gnarp" },
];

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
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(5, 8, 18, 0.85)"
          : "rgba(5, 8, 18, 0.4)",
        backdropFilter: "blur(24px) saturate(180%)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #00e87a, #00c94e)" }}
            >
              <span className="text-base">🐱</span>
            </div>
            <span
              className="text-base font-black tracking-tight"
              style={{ color: "#00e87a" }}
            >
              GNARP
            </span>
            <Zap size={12} style={{ color: "#00e87a", opacity: 0.7 }} />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`nav-link ${location.pathname === l.path ? "active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://twitter.com/Ricedmdq"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-4 py-2 rounded-lg text-xs"
            >
              @Ricedmdq
            </a>
            <Link
              to="/token"
              className="btn-primary px-5 py-2 rounded-lg text-xs"
            >
              Buy $GNARP
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden px-5 pb-5 animate-fade-in"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="pt-4 space-y-1">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`block nav-link ${location.pathname === l.path ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <Link
                to="/token"
                className="btn-primary px-4 py-3 rounded-xl text-sm text-center"
                onClick={() => setOpen(false)}
              >
                Buy $GNARP
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
