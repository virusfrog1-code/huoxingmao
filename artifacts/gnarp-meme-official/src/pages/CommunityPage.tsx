import { useState } from "react";
import { Send, Twitter, Users, MessageCircle } from "lucide-react";

export default function CommunityPage() {
  const [form, setForm] = useState({ name: "", twitter: "", content: "", type: "fanart" });
  const [submitted, setSubmitted] = useState(false);

  const posts = [
    { avatar: "🐱", name: "GnarpKing", time: "2分钟前", text: "刚刚在 Dance Miner 里打了 99999 分！Gnarp Gnarp！🎉 #GnarpToken", likes: 234 },
    { avatar: "🌟", name: "外星猫奴", time: "15分钟前", text: "每天挖矿挖到停不下来，粉丝矩阵真的太好用了！离线产出太爽了！", likes: 89 },
    { avatar: "🚀", name: "MoonMiner", time: "1小时前", text: "Gnarp Token 什么时候上线交易所啊！！我已经攒了 50000 个了！", likes: 456 },
    { avatar: "💜", name: "DanceMaster", time: "2小时前", text: "四连击 Perfect 的时候 Gnarp 的表情太可爱了！做了个表情包分享给大家 #GnarpMeme", likes: 178 },
    { avatar: "⭐", name: "GnarpFan", time: "3小时前", text: "我把 Gnarp 的舞步教给了我的猫，她跳得比我还好！😂 Gnarp Gnarp！", likes: 312 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: "", twitter: "", content: "", type: "fanart" });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 animate-fade-in-up">
          <h1
            className="text-4xl md:text-6xl font-black mb-4"
            style={{
              background: "linear-gradient(135deg, #ff2d78, #bf5fff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Gnarp 社区
          </h1>
          <p className="text-gray-400 text-lg">和全球猫奴一起跳舞、摸鱼、挖矿！</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: <Users size={24} />, label: "活跃猫奴", value: "128,847", color: "#39ff14" },
            { icon: <MessageCircle size={24} />, label: "社区帖子", value: "56,231", color: "#bf5fff" },
            { icon: <Twitter size={24} />, label: "X 关注者", color: "#ff2d78", label2: "@Ricedmdq", value: "4,200+" },
          ].map((stat, i) => (
            <div
              key={i}
              className="card-glow rounded-2xl p-6 text-center"
              style={{ border: `1px solid ${stat.color}44` }}
            >
              <div className="flex justify-center mb-3" style={{ color: stat.color }}>{stat.icon}</div>
              <div className="text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
              {stat.label2 && <div className="text-xs mt-1" style={{ color: stat.color }}>{stat.label2}</div>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Twitter size={24} style={{ color: "#1DA1F2" }} />
              <h2 className="text-xl font-black text-white">@Ricedmdq 最新动态</h2>
            </div>

            <div className="space-y-4 mb-6">
              {posts.map((post, i) => (
                <div
                  key={i}
                  className="card-glow rounded-2xl p-4 hover:scale-[1.01] transition-transform duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{post.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{post.name}</span>
                        <span className="text-xs text-gray-500">{post.time}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{post.text}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
                        >
                          ❤ {post.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(29, 161, 242, 0.3)",
                background: "rgba(29, 161, 242, 0.05)",
              }}
            >
              <div className="p-4 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(29, 161, 242, 0.2)" }}>
                <Twitter size={16} style={{ color: "#1DA1F2" }} />
                <span className="text-sm font-bold" style={{ color: "#1DA1F2" }}>在 X 关注 @Ricedmdq</span>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-400 text-sm mb-4">关注我们获取 Gnarp 最新动态、空投活动和社区活动！</p>
                <a
                  href="https://twitter.com/Ricedmdq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    background: "#1DA1F2",
                    color: "white",
                    boxShadow: "0 0 20px rgba(29, 161, 242, 0.4)",
                  }}
                >
                  <Twitter size={18} />
                  关注 @Ricedmdq
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <Send size={24} style={{ color: "#39ff14" }} />
              <h2 className="text-xl font-black text-white">投稿 / 社区活动</h2>
            </div>

            <div className="card-glow rounded-2xl p-6">
              {submitted ? (
                <div className="text-center py-8 animate-bounce-in">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-black mb-2" style={{ color: "#39ff14" }}>
                    Gnarp Gnarp！投稿成功！
                  </h3>
                  <p className="text-gray-400 text-sm">感谢你的支持！我们会尽快审核你的内容！</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-400 mb-2 block">投稿类型</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "fanart", label: "🎨 二创图" },
                        { value: "meme", label: "😂 表情包" },
                        { value: "video", label: "🎬 视频" },
                        { value: "other", label: "✨ 其他" },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setForm({ ...form, type: type.value })}
                          className={`py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                            form.type === type.value ? "btn-neon-green" : "text-gray-400"
                          }`}
                          style={
                            form.type !== type.value
                              ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
                              : {}
                          }
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-400 mb-1 block">昵称 *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="你的 Gnarp 昵称"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white placeholder-gray-600"
                      style={{
                        background: "rgba(57, 255, 20, 0.08)",
                        border: "1px solid rgba(57, 255, 20, 0.3)",
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-400 mb-1 block">X 主页（选填）</label>
                    <input
                      type="text"
                      value={form.twitter}
                      onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                      placeholder="@你的X用户名"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white placeholder-gray-600"
                      style={{
                        background: "rgba(57, 255, 20, 0.08)",
                        border: "1px solid rgba(57, 255, 20, 0.3)",
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-400 mb-1 block">内容 / 链接 *</label>
                    <textarea
                      required
                      rows={4}
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="分享你的 Gnarp 创作，或粘贴链接..."
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none text-white placeholder-gray-600"
                      style={{
                        background: "rgba(57, 255, 20, 0.08)",
                        border: "1px solid rgba(57, 255, 20, 0.3)",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-neon-green py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Gnarp Gnarp！提交！
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 card-glow-pink rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-black text-lg mb-2" style={{ color: "#ff2d78" }}>每周精选</h3>
              <p className="text-gray-400 text-sm mb-4">
                每周最佳投稿可获得 1000 Gnarp Token 奖励！
                快来参与社区活动！
              </p>
              <div className="text-xs" style={{ color: "#ff2d78" }}>
                下次评选：还剩 3 天
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
