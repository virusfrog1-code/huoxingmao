import { useEffect, useRef } from "react";

const events = [
  {
    era: "宇宙元年",
    title: "Gnarp 星诞生",
    body: "在银河系 Orion 臂末端，一颗蓝绿色星球悄然形成。这颗星球上进化出了一种特殊生物——外星猫猫 Gnarp。他们会跳舞，会摸鱼，还会把宇宙舞步转化为量子能量。",
    dot: "#00e87a",
    label: "起源",
  },
  {
    era: "宇宙 2047 年",
    title: "舞步能量的发现",
    body: "Gnarp 星首席科学家 Dr. Meow 发现，当 Gnarp 以特定节奏跳跃并踩踏特定音符砖块时，会释放出稳定的量子能量流。这种能量后来被命名为 Gnarp Token（GNARP）。",
    dot: "#9b6dff",
    label: "发现",
  },
  {
    era: "宇宙 2150 年",
    title: "星际摸鱼帝国",
    body: "Gnarp 文明进入巅峰期。他们建造了覆盖三个星系的摸鱼网络，每个 Gnarp 公民都能通过日常游戏获得被动收入。当然，他们把这叫做「生产性休息」。",
    dot: "#ff4fa3",
    label: "文明",
  },
  {
    era: "宇宙 2199 年",
    title: "地球信号",
    body: "Gnarp 的监测阵列捕获到来自地球的奇异信号——数百亿条猫咪视频。Gnarp 最高委员会召开紧急会议：\"他们也养猫？我们必须去！\"",
    dot: "#00c2ff",
    label: "接触",
  },
  {
    era: "2026 年 4 月",
    title: "Gnarp 登陆地球",
    body: "第一位 Gnarp 大使驾驶量子飞船降落地球。他的第一句话是：\"Gnarp Gnarp！\" 全世界猫咪集体竖耳回应。地球互联网在 48 小时内爆发了第一波 Gnarp 表情包浪潮。",
    dot: "#ffd700",
    label: "降临",
  },
  {
    era: "现在 & 未来",
    title: "Super Gnarp 时代",
    body: "Gnarp 在地球建立了 Super Gnarp 游戏挖矿站。玩家可以控制 Gnarp 在霓虹平台上跳跃冒险，同时挖掘真实的 $GNARP Token。月球是第一个目标，宇宙才是终点。",
    dot: "#00e87a",
    label: "未来",
  },
];

export default function LorePage() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = "1";
            (e.target as HTMLElement).style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.15 }
    );
    refs.current.forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative z-10 min-h-screen pt-28 pb-20 px-5">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-up">
          <p className="section-label mb-4">起源故事</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">
            <span style={{ color: "#f5f5f7" }}>The </span>
            <span className="gradient-text">Gnarp Lore</span>
          </h1>
          <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            从外太空到地球摸鱼，一段跨越宇宙的猫猫史诗
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-px"
            style={{
              background: "linear-gradient(to bottom, transparent, rgba(0,232,122,0.3) 10%, rgba(155,109,255,0.3) 50%, rgba(255,79,163,0.3) 90%, transparent)",
            }}
          />

          <div className="space-y-12 pl-14">
            {events.map((ev, i) => (
              <div
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                style={{
                  opacity: 0,
                  transform: "translateY(24px)",
                  transition: `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`,
                }}
              >
                {/* Dot */}
                <div
                  className="absolute left-[15px] w-3 h-3 rounded-full mt-5"
                  style={{
                    background: ev.dot,
                    boxShadow: `0 0 12px ${ev.dot}`,
                    left: 14,
                  }}
                />

                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="badge"
                      style={{
                        background: `${ev.dot}18`,
                        color: ev.dot,
                        border: `1px solid ${ev.dot}40`,
                      }}
                    >
                      {ev.label}
                    </span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {ev.era}
                    </span>
                  </div>
                  <h3
                    className="text-lg font-black mb-3 tracking-tight"
                    style={{ color: "#f5f5f7" }}
                  >
                    {ev.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {ev.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* End CTA */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{
            background: "rgba(0, 232, 122, 0.05)",
            border: "1px solid rgba(0, 232, 122, 0.15)",
          }}
        >
          <div className="text-4xl mb-4">🐱🚀</div>
          <h3 className="text-xl font-black mb-3" style={{ color: "#f5f5f7" }}>
            这个故事还没结束
          </h3>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
            每一位玩家都是 Gnarp 传说的共同书写者。你的高分、你的 Token、你的 Meme，都将载入 Gnarp 宇宙史册。
          </p>
          <a
            href="/game"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
          >
            加入传说 →
          </a>
        </div>
      </div>
    </div>
  );
}
