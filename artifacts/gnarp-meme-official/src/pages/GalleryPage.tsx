import { useState } from "react";
import { Heart, Download, Share2, Plus } from "lucide-react";

const MEMES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
    title: "摸鱼中的 Gnarp",
    likes: 2847,
    author: "GnarpFan01",
    tags: ["摸鱼", "可爱"],
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop",
    title: "Gnarp 跳月亮舞",
    likes: 1932,
    author: "MoonDancer",
    tags: ["月亮", "舞步"],
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
    title: "量子天线充能",
    likes: 3156,
    author: "QuantumGnarp",
    tags: ["科技", "天线"],
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1545468955-9f5264e20834?w=400&h=400&fit=crop",
    title: "Gnarp 挖矿中...",
    likes: 4201,
    author: "Miner9000",
    tags: ["挖矿", "Token"],
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=400&h=400&fit=crop",
    title: "三连 Gnarp！",
    likes: 5678,
    author: "TripleGnarp",
    tags: ["三连击", "洗脑"],
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop",
    title: "深夜摸鱼",
    likes: 1234,
    author: "NightOwl",
    tags: ["深夜", "摸鱼"],
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop",
    title: "Gnarp 的眼神",
    likes: 2109,
    author: "StarGazer",
    tags: ["眼神", "外太空"],
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    title: "Gnarp vs 狗",
    likes: 6666,
    author: "WARGnarp",
    tags: ["搞笑", "竞争"],
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1561948955-570b270e7c36?w=400&h=400&fit=crop",
    title: "吸猫警报！",
    likes: 9999,
    author: "CatAddict",
    tags: ["吸猫", "可爱"],
  },
];

export default function GalleryPage() {
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState("全部");
  const [showUpload, setShowUpload] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: "", author: "", tags: "" });

  const tags = ["全部", "摸鱼", "挖矿", "搞笑", "可爱", "外太空"];

  const filteredMemes = filter === "全部"
    ? MEMES
    : MEMES.filter((m) => m.tags.includes(filter));

  const handleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = (meme: typeof MEMES[0]) => {
    const text = `我在 Gnarp Meme 官网发现了一个超萌的表情包：${meme.title}！Gnarp Gnarp！ #GnarpToken #外星小猫`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDownload = (url: string, title: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `gnarp-${title}.jpg`;
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 animate-fade-in-up">
          <h1
            className="text-4xl md:text-6xl font-black mb-4"
            style={{
              background: "linear-gradient(135deg, #bf5fff, #ff2d78)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Meme Gallery
          </h1>
          <p className="text-gray-400 mb-6">Gnarp 二创星球，粉丝们最好的作品</p>

          <button
            onClick={() => setShowUpload(true)}
            className="btn-neon-green inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
          >
            <Plus size={18} /> 投稿我的表情包
          </button>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                filter === tag ? "btn-neon-green" : "text-gray-400 hover:text-white"
              }`}
              style={
                filter === tag
                  ? {}
                  : {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
              }
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredMemes.map((meme, i) => (
            <div
              key={meme.id}
              className="card-glow rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={meme.url}
                  alt={meme.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3"
                  style={{ background: "rgba(3, 6, 17, 0.7)" }}
                >
                  <button
                    onClick={() => handleDownload(meme.url, meme.title)}
                    className="p-2 rounded-full transition-all duration-200 hover:scale-110"
                    style={{
                      background: "rgba(57, 255, 20, 0.2)",
                      border: "1px solid #39ff14",
                      color: "#39ff14",
                    }}
                    title="下载"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => handleShare(meme)}
                    className="p-2 rounded-full transition-all duration-200 hover:scale-110"
                    style={{
                      background: "rgba(191, 95, 255, 0.2)",
                      border: "1px solid #bf5fff",
                      color: "#bf5fff",
                    }}
                    title="分享到 X"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white mb-1">{meme.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">@{meme.author}</span>
                  <button
                    onClick={() => handleLike(meme.id)}
                    className="flex items-center gap-1 text-sm transition-all duration-200 hover:scale-110"
                    style={{ color: liked.has(meme.id) ? "#ff2d78" : "#666" }}
                  >
                    <Heart
                      size={16}
                      fill={liked.has(meme.id) ? "#ff2d78" : "none"}
                    />
                    {meme.likes + (liked.has(meme.id) ? 1 : 0)}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {meme.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(191, 95, 255, 0.15)",
                        color: "#bf5fff",
                        border: "1px solid #bf5fff44",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showUpload && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
            onClick={(e) => e.target === e.currentTarget && setShowUpload(false)}
          >
            <div className="card-glow-purple rounded-3xl p-8 w-full max-w-md animate-bounce-in">
              <h3 className="text-2xl font-black mb-6" style={{ color: "#bf5fff" }}>
                投稿表情包
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="表情包标题"
                  value={submitForm.title}
                  onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{
                    background: "rgba(191, 95, 255, 0.1)",
                    border: "1px solid #bf5fff44",
                    color: "white",
                  }}
                />
                <input
                  type="text"
                  placeholder="你的 X 用户名（@xxx）"
                  value={submitForm.author}
                  onChange={(e) => setSubmitForm({ ...submitForm, author: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: "rgba(191, 95, 255, 0.1)",
                    border: "1px solid #bf5fff44",
                    color: "white",
                  }}
                />
                <div
                  className="w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:border-solid"
                  style={{ borderColor: "#bf5fff66", color: "#bf5fff" }}
                >
                  <Plus size={32} className="mb-2" />
                  <span className="text-sm">点击上传表情包</span>
                  <span className="text-xs text-gray-500 mt-1">支持 JPG / PNG / GIF</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      alert("投稿成功！感谢你的 Gnarp 二创！Gnarp Gnarp！🐱");
                      setShowUpload(false);
                      setSubmitForm({ title: "", author: "", tags: "" });
                    }}
                    className="flex-1 btn-neon-purple py-3 rounded-xl font-bold"
                  >
                    提交投稿
                  </button>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-400"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
