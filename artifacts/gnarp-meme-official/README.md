# 🐱 Gnarp Meme Official

外星小猫 Gnarp 官方网站 — 节奏挖矿、Meme 图库、Gnarp Token！

## 项目功能

- **首页 Hero** — 全屏 Gnarp 三连舞动画 + 三个醒目入口按钮
- **Lore 故事页** — Gnarp 起源宇宙时间线
- **Meme Gallery** — 响应式图库，支持点赞 / 下载 / 分享到 X
- **社区页** — @Ricedmdq 最新动态 + 投稿表单
- **Token Moon 页** — Gnarp Token 信息 + 价格图表 + 钱包连接占位
- **小游戏中心** — Gnarp Dance Miner 节奏挖矿（Phaser 3）

## 小游戏：Dance Miner

- 4 条箭头轨道（← ↑ → ↓），跟随节拍下落
- 键盘 / 触摸双操作
- Perfect 连击让 Gnarp 跳舞
- 每 1000 分 = 1 Gnarp Token
- 3 种矿机升级：量子天线 / 舞步芯片 / 粉丝矩阵
- 离线挖矿 + 全球排行榜
- 游戏结束自动生成分享文案

## 本地运行

```bash
pnpm install
pnpm --filter @workspace/gnarp-meme-official run dev
```

## 一键部署教程（Replit Static Deployment）

1. 点击右上角 **Deploy** 按钮
2. 选择 **Static** 类型
3. Build Command: `pnpm --filter @workspace/gnarp-meme-official run build`
4. Output Directory: `artifacts/gnarp-meme-official/dist/public`
5. 点击 **Deploy** 即可上线！

### 上线后

你的网站将在 `https://你的项目名.replit.app/` 访问。

## 技术栈

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** — 深空黑 + 霓虹绿/粉紫 风格
- **Phaser 3** — Dance Miner 节奏游戏
- **Zustand** — 全局状态管理（Token、排行榜、升级）
- **React Router v6** — 6 页路由
- **PWA** — manifest + Service Worker

## 替换占位资源

- 图片：搜索替换 `images.unsplash.com` 链接
- 音频：在 `DanceMinerGame.ts` 中接入真实 BGM
- 猫猫图片：在 `FloatingGnarp.tsx` 替换 ASCII 猫为真实图片

---

**Gnarp Gnarp！** 🐱 项目已完成！请点击右上角 **Deploy** 按钮一键上线！
