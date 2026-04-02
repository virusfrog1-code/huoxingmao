import { useState } from "react";
import { Send, Twitter, Users, MessageSquare, Trophy, Zap } from "lucide-react";

const tweets = [
  { name: "GnarpKing", handle: "gnarpking", time: "2m", avatar: "🏆", text: "Super Gnarp 第三关真的太难了！键盘 Boss 一直在拖我，但我已经挖了 500 Token！#SuperGnarp #GnarpToken", likes: 312 },
  { name: "外星猫奴", handle: "aliencat99", time: "18m", avatar: "🐱", text: "粉丝矩阵升到 3 级了，离线挖矿速度起飞！昨天睡一觉醒来多了 80 个 Token，Gnarp 是认真的！", likes: 128 },
  { name: "MoonMiner", handle: "moonminer", time: "1h", avatar: "🌙", text: "$GNARP 什么时候上线 Raydium！？我已经囤了 2000 个 Token 等着呢，Gnarp Gnarp！", likes: 567 },
  { name: "DanceKing", handle: "danceking88", time: "3h", avatar: "💜", text: "二段跳完美卡过 Boss 的那一刻，感觉自己就是 Gnarp 星球的英雄！截图在下面", likes: 243 },
  { name: "TokenFarm", handle: "tokenfarm", time: "5h", avatar: "⚡", text: "Gnarp 挖矿系统设计得真的太妙了，游戏好玩 + 被动收入，这就是 Web3 游戏应该有的样子", likes: 891 },
];

const stats = [
  { icon: <Users size={16} />, label: "活跃矿工", value: "128,847", color: "#00e87a" },
  { icon: <Zap size={16} />, label: "每日产出 Token", value: "2.4M", color: "#9b6dff" },
  { icon: <Trophy size={16} />, label: "最高单局记录", value: "99,999", color: "#ffd700" },
  { icon: <MessageSquare size={16} />, label: "社区帖子", value: "56K+", color: "#ff4fa3" },
];

export default function CommunityPage() {
  const [form, setForm] = useState({ name: "", twitter: "", type: "meme", content: "" });
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: "", twitter: "", type: "meme", content: "" });
  };

  return (
    <div className="relative z-10 min-h-screen pt-28 pb-20 px-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-up">
          <p className="section-label mb-4">Gnarp Nation</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">
            <span className="gradient-text">社区中心</span>
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            和 128,000+ 外星猫奴一起摸鱼、挖矿、创作
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((s, i) => (
            <div
              key={i}
              className="card p-5 text-center"
            >
              <div className="flex justify-center mb-2" style={{ color: s.color }}>{s.icon}</div>
              <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* X Feed */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Twitter size={18} style={{ color: "#1DA1F2" }} />
              <h2 className="text-base font-bold" style={{ color: "#f5f5f7" }}>社区动态</h2>
              <span className="badge badge-green ml-auto">直播更新</span>
            </div>

            <div className="space-y-3 mb-6">
              {tweets.map((t, i) => (
                <div
                  key={i}
                  className="card p-4"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="flex gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      {t.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold" style={{ color: "#f5f5f7" }}>{t.name}</span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>@{t.handle} · {t.time}</span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{t.text}</p>
                      <button className="flex items-center gap-1 mt-2 text-xs transition-colors hover:text-red-400" style={{ color: "rgba(255,255,255,0.3)" }}>
                        ❤ {t.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://twitter.com/Ricedmdq"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: "#1DA1F2", color: "#fff" }}
            >
              <Twitter size={16} />
              在 X 上关注 @Ricedmdq 获取最新消息
            </a>
          </div>

          {/* Submit Form */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Send size={18} style={{ color: "#00e87a" }} />
              <h2 className="text-base font-bold" style={{ color: "#f5f5f7" }}>投稿 / 社区活动</h2>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(10,14,30,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {submitted ? (
                <div className="p-10 text-center animate-scale-in">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-black mb-2" style={{ color: "#00e87a" }}>投稿成功！</h3>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                    感谢你的 Gnarp 创作，我们会尽快审核！Gnarp Gnarp！
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: "meme", label: "😂 表情包" },
                      { v: "fanart", label: "🎨 二创图" },
                      { v: "video", label: "🎬 视频" },
                      { v: "other", label: "✨ 其他" },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setForm({ ...form, type: opt.v })}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${form.type === opt.v ? "btn-primary" : "btn-outline"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {[
                    { key: "name", label: "昵称 *", placeholder: "你的 Gnarp 昵称", required: true },
                    { key: "twitter", label: "X 主页（选填）", placeholder: "@你的X用户名", required: false },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>{f.label}</label>
                      <input
                        required={f.required}
                        type="text"
                        placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f5f7" }}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>内容 / 链接 *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="分享你的 Gnarp 创作，或粘贴图片/视频链接..."
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f5f7" }}
                    />
                  </div>

                  <button type="submit" className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    <Send size={15} /> 提交投稿
                  </button>
                </form>
              )}
            </div>

            {/* Weekly prize */}
            <div
              className="mt-4 card-pink card p-5 text-center"
            >
              <Trophy size={20} className="mx-auto mb-2" style={{ color: "#ffd700" }} />
              <h4 className="font-bold text-sm mb-1" style={{ color: "#f5f5f7" }}>每周最佳投稿</h4>
              <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                奖励 <span style={{ color: "#ffd700", fontWeight: 700 }}>1,000 Gnarp Token</span> · 下次评选还剩 3 天
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
