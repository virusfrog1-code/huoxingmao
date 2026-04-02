import { useEffect, useRef } from "react";

const timeline = [
  {
    year: "宇宙元年",
    title: "Gnarp 星诞生",
    desc: "在银河系边缘的一颗深蓝星球上，一群会跳舞的外星猫猫诞生了。他们的舞步能产生宇宙能量，称为 Gnarp Token。",
    icon: "🌍",
    color: "#39ff14",
  },
  {
    year: "宇宙 2047 年",
    title: "洗脑舞步的发现",
    desc: "Gnarp 族的首席科学家发现，当 Gnarp 跳出完美的「四连击舞步」时，能产生大量量子能量，足以为整个星球供电。",
    icon: "💃",
    color: "#bf5fff",
  },
  {
    year: "宇宙 2199 年",
    title: "地球信号截获",
    desc: "Gnarp 的监测阵列截获到来自地球的「猫咪视频」信号。Gnarp 最高委员会决定：派遣使者前往地球，传播舞步文化。",
    icon: "📡",
    color: "#ff2d78",
  },
  {
    year: "2026 年 4 月",
    title: "Gnarp 登陆地球",
    desc: "首位 Gnarp 大使驾驶宇宙飞船降落地球。他的第一句话是：「Gnarp Gnarp！」地球人懵了，但都觉得他好可爱。",
    icon: "🚀",
    color: "#00ffff",
  },
  {
    year: "现在",
    title: "Gnarp 摸鱼时代",
    desc: "Gnarp 在地球建立了第一个「外星节奏挖矿站」。只要跟着节拍跳舞，就能挖到 Gnarp Token！全球粉丝蜂拥而至。",
    icon: "⚡",
    color: "#ffcc00",
  },
  {
    year: "未来",
    title: "Token 飞向月球",
    desc: "Gnarp 的终极目标：将所有地球猫咪的灵魂接引到 Gnarp 星，在那里大家都能永远跳舞摸鱼，Token 无限！",
    icon: "🌙",
    color: "#39ff14",
  },
];

export default function LorePage() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-x-0");
            entry.target.classList.remove("opacity-0", "-translate-x-10");
          }
        });
      },
      { threshold: 0.1 }
    );
    refs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1
            className="text-4xl md:text-6xl font-black mb-4"
            style={{
              background: "linear-gradient(135deg, #39ff14, #bf5fff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Gnarp 起源故事
          </h1>
          <p className="text-gray-400 text-lg">
            从外太空到地球摸鱼，一只猫猫的宇宙史诗
          </p>
        </div>

        <div className="relative">
          <div
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5"
            style={{
              background: "linear-gradient(to bottom, #39ff14, #bf5fff, #ff2d78)",
              boxShadow: "0 0 10px #39ff1466",
              transform: "translateX(-50%)",
            }}
          />

          <div className="space-y-12">
            {timeline.map((item, i) => (
              <div
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className={`relative flex items-start gap-6 transition-all duration-700 opacity-0 -translate-x-10 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div
                  className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full border-2 flex-shrink-0 z-10"
                  style={{
                    borderColor: item.color,
                    background: item.color,
                    boxShadow: `0 0 15px ${item.color}`,
                    transform: "translate(-50%, 8px)",
                  }}
                />

                <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                  <div
                    className="card-glow rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300"
                    style={{
                      border: `1px solid ${item.color}44`,
                      boxShadow: `0 0 25px ${item.color}22`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <div
                          className="text-xs font-bold px-2 py-0.5 rounded-full mb-1"
                          style={{
                            background: `${item.color}22`,
                            color: item.color,
                            border: `1px solid ${item.color}44`,
                          }}
                        >
                          {item.year}
                        </div>
                        <h3
                          className="text-lg font-black"
                          style={{ color: item.color }}
                        >
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                <div className="hidden md:block md:w-1/2" />
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-16 card-glow-purple rounded-3xl p-8 text-center"
        >
          <div className="text-5xl mb-4">🐱✨</div>
          <h3
            className="text-2xl font-black mb-4"
            style={{ color: "#bf5fff" }}
          >
            你也是 Gnarp 的一部分！
          </h3>
          <p className="text-gray-400 mb-6">
            每一个参与跳舞挖矿的地球人，都成为了 Gnarp 宇宙舰队的一员。
            你的每一次完美连击，都在为 Gnarp Token 的传说增添新的章节。
          </p>
          <a
            href="/game"
            className="btn-neon-purple inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg"
          >
            开始你的 Gnarp 之旅 →
          </a>
        </div>
      </div>
    </div>
  );
}
