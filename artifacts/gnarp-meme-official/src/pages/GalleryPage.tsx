import { useState } from "react";
import { Heart, Download, Share2, Search, Plus } from "lucide-react";

const MEMES = [
  { id: 1, url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=500&fit=crop&crop=faces", title: "摸鱼大师 Gnarp", likes: 4821, tags: ["摸鱼", "可爱"], author: "GnarpKing" },
  { id: 2, url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&h=500&fit=crop", title: "月亮之上", likes: 3204, tags: ["月亮", "Token"], author: "MoonMiner" },
  { id: 3, url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=500&fit=crop", title: "量子天线在线", likes: 5616, tags: ["科技", "天线"], author: "QuantumGnarp" },
  { id: 4, url: "https://images.unsplash.com/photo-1545468955-9f5264e20834?w=500&h=500&fit=crop", title: "挖矿挖矿！", likes: 7890, tags: ["挖矿", "游戏"], author: "Miner9000" },
  { id: 5, url: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=500&h=500&fit=crop", title: "Super Gnarp 通关", likes: 9999, tags: ["游戏", "通关"], author: "TripleGnarp" },
  { id: 6, url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&h=500&fit=crop", title: "深夜摸鱼局", likes: 2341, tags: ["深夜", "摸鱼"], author: "NightOwl" },
  { id: 7, url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&h=500&fit=crop", title: "银河系 Boss", likes: 4120, tags: ["Boss", "外太空"], author: "GalacticCat" },
  { id: 8, url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=500&fit=crop", title: "Gnarp vs 老板", likes: 8888, tags: ["搞笑", "Boss"], author: "WARGnarp" },
  { id: 9, url: "https://images.unsplash.com/photo-1561948955-570b270e7c36?w=500&h=500&fit=crop", title: "吸猫警报！", likes: 11234, tags: ["吸猫", "病毒"], author: "CatAddict" },
];

const allTags = ["全部", "摸鱼", "挖矿", "游戏", "搞笑", "外太空", "可爱"];

export default function GalleryPage() {
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", author: "" });

  const filtered = MEMES.filter((m) => {
    const matchTag = filter === "全部" || m.tags.includes(filter);
    const matchSearch = !search || m.title.includes(search) || m.tags.some((t) => t.includes(search));
    return matchTag && matchSearch;
  });

  const toggle = (id: number) =>
    setLiked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const share = (m: typeof MEMES[0]) =>
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`这个 Gnarp Meme 绝了：${m.title} 🐱 #GnarpToken #SuperGnarp`)}`,"_blank");

  return (
    <div className="relative z-10 min-h-screen pt-28 pb-20 px-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-up">
          <p className="section-label mb-4">社区创作</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">
            <span className="gradient-text">Meme Gallery</span>
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            全球猫奴二创精选 · 点赞 · 分享 · 投稿
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              type="text"
              placeholder="搜索表情包..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#f5f5f7",
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${filter === tag ? "btn-primary" : "btn-outline"}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-secondary flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs flex-shrink-0"
          >
            <Plus size={14} /> 投稿
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m, i) => (
            <div
              key={m.id}
              className="card overflow-hidden group"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={m.url}
                  alt={m.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3"
                  style={{ background: "linear-gradient(to top, rgba(5,8,18,0.9) 0%, transparent 60%)" }}
                >
                  <div className="flex gap-2">
                    <button
                      onClick={() => share(m)}
                      className="p-2 rounded-lg text-xs transition-all hover:scale-110"
                      style={{ background: "rgba(155,109,255,0.3)", color: "#9b6dff" }}
                      title="分享到 X"
                    >
                      <Share2 size={14} />
                    </button>
                    <button
                      onClick={() => window.open(m.url, "_blank")}
                      className="p-2 rounded-lg text-xs transition-all hover:scale-110"
                      style={{ background: "rgba(0,232,122,0.2)", color: "#00e87a" }}
                      title="下载"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-bold mb-0.5" style={{ color: "#f5f5f7" }}>{m.title}</h3>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>@{m.author}</span>
                  </div>
                  <button
                    onClick={() => toggle(m.id)}
                    className="flex items-center gap-1 text-xs transition-all duration-200 hover:scale-110 flex-shrink-0 mt-0.5"
                    style={{ color: liked.has(m.id) ? "#ff4fa3" : "rgba(255,255,255,0.35)" }}
                  >
                    <Heart size={14} fill={liked.has(m.id) ? "#ff4fa3" : "none"} />
                    <span className="font-semibold">{m.likes + (liked.has(m.id) ? 1 : 0)}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {m.tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className="text-xs px-2 py-0.5 rounded-md transition-colors hover:opacity-80"
                      style={{ background: "rgba(0,232,122,0.08)", color: "#00e87a", border: "1px solid rgba(0,232,122,0.15)" }}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl overflow-hidden animate-scale-in"
              style={{ background: "rgba(8,12,28,0.98)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 className="font-black text-base" style={{ color: "#f5f5f7" }}>投稿表情包</h3>
                <button onClick={() => setShowModal(false)} style={{ color: "rgba(255,255,255,0.4)" }}>
                  <Plus size={18} className="rotate-45" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: "标题", key: "title", placeholder: "给你的 Meme 起个名字" },
                  { label: "你的 X 用户名", key: "author", placeholder: "@你的用户名" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>{f.label}</label>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f5f7" }}
                    />
                  </div>
                ))}
                <div
                  className="rounded-xl border-2 border-dashed p-8 flex flex-col items-center text-center cursor-pointer transition-colors hover:border-opacity-60"
                  style={{ borderColor: "rgba(0,232,122,0.3)", color: "rgba(255,255,255,0.3)" }}
                >
                  <Plus size={24} className="mb-2" style={{ color: "#00e87a", opacity: 0.6 }} />
                  <span className="text-xs">点击或拖拽上传图片</span>
                  <span className="text-xs mt-1" style={{ opacity: 0.5 }}>PNG · JPG · GIF · ≤10MB</span>
                </div>
                <button
                  onClick={() => {
                    alert("投稿成功！Gnarp Gnarp！感谢你的创作 🐱");
                    setShowModal(false);
                    setForm({ title: "", author: "" });
                  }}
                  className="w-full btn-primary py-3 rounded-xl text-sm font-bold"
                >
                  提交投稿
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
