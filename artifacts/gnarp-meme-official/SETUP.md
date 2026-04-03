# 🚀 Gnarp Meme Coin Website — Complete Setup Guide

Welcome! This comprehensive guide will help you set up, customize, and deploy the Gnarp meme coin website.

---

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Customization](#customization)
4. [Game Integration](#game-integration)
5. [Wallet Integration](#wallet-integration)
6. [Deployment](#deployment)
7. [FAQ](#faq)

---

## Installation

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <your-repo-url>
cd gnarp-meme-official

# Or if downloaded as ZIP, extract and navigate to folder
```

### Step 2: Install Dependencies

```bash
# Using pnpm (recommended for monorepo)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### Step 3: Start Development Server

```bash
pnpm --filter @workspace/gnarp-meme-official run dev
```

The website should now be running at `http://localhost:5173` 🎉

---

## Configuration

### Configure Your Solana Token

**File**: `src/App.tsx`, `src/pages/HomePage.tsx`, `src/pages/TokenPage.tsx`

Replace all instances of:
```javascript
const CA = "5EbMhNWHEvRMS2k7MEPXz9dtR6j1YyEvwY6qDGobpump";
```

With your actual contract address:
```javascript
const CA = "YOUR_CONTRACT_ADDRESS_HERE";
```

### Update Social Links

**File**: `src/App.tsx`, `src/components/Navbar.tsx`

```javascript
// Update Telegram
const TELEGRAM_URL = "https://t.me/your-telegram-handle";

// Update Twitter (in multiple places)
const TWITTER_URL = "https://twitter.com/your-handle";
```

### Configure Phantom Wallet Integration

**File**: `src/hooks/usePhantomWallet.ts`

If you want to enable real staking functionality:

```typescript
// Line 4-5: Set your staking vault address
export const STAKING_VAULT = "YOUR_STAKING_VAULT_ADDRESS";
export const VAULT_IS_CONFIGURED = true; // Set to true when ready
```

Otherwise, leave as `false` for demo mode (all transactions simulate).

---

## Customization

### Update Gnarp Mascot Image

**File**: `public/gnarp-mascot.jpg`

1. Replace `gnarp-mascot.jpg` with your custom Gnarp image
2. Image should be 400x400px minimum
3. Recommended: PNG with transparency or JPG on transparent background

```html
<!-- The image is referenced in HomePage.tsx line 366 -->
<img src="/gnarp-mascot.jpg" alt="Gnarp" />
```

### Change Theme Colors

**File**: `src/index.css` (CSS variables section)

```css
:root {
  --background: 230 80% 3%;
  --foreground: 0 0% 96%;
  --color-gnarp-green: #00e87a;    /* Change neon green */
  --color-gnarp-purple: #9b6dff;   /* Change cyber purple */
  --color-gnarp-pink: #ff4fa3;     /* Change hot pink */
}
```

Or override in Tailwind:
```typescript
// tailwind.config.js (if added)
module.exports = {
  theme: {
    colors: {
      'neon-green': '#00ff9f',  // New green
      'gnarp-purple': '#c026d3', // New purple
    }
  }
}
```

### Update Game Levels

**File**: `src/pages/GamePage.tsx`

```typescript
const LEVEL_NAMES = [
  "Your Custom Level 1",
  "Your Custom Level 2",
  // ... (total 20 levels for story mode)
];
```

### Modify Token Economics

**File**: `src/store/useStore.ts`

Key constants you can adjust:

```typescript
// Initial P2E pool (in GNARP)
export const P2E_POOL_INITIAL = 100_000_000;

// Daily free plays
export const DAILY_FREE_PLAYS = 10;

// Upgrade costs per level
export const UPGRADE_COSTS = {
  antenna: [50, 150, 400, 1000, 2500],
  dance: [75, 225, 600, 1500, 3750],
  fans: [100, 300, 800, 2000, 5000],
};
```

### Update Gallery Memes

**File**: `src/pages/GalleryPage.tsx`

Replace the `MEMES` array with your own:

```typescript
const MEMES = [
  { 
    id: 1, 
    url: "https://your-image-url.jpg", 
    title: "Meme Title", 
    likes: 100, 
    tags: ["tag1", "tag2"], 
    author: "AuthorName" 
  },
  // ... add more
];
```

### Update Community Feed

**File**: `src/pages/CommunityPage.tsx`

Replace the `tweets` array with real community updates:

```typescript
const tweets = [
  {
    name: "Username",
    handle: "twitter-handle",
    time: "2m",
    avatar: "🐱",
    text: "Your community update...",
    likes: 100,
  },
  // ... add more
];
```

---

## Game Integration

### Using Your Own Phaser Game

**File**: `src/game/SuperGnarpGame.ts`

The game is already fully functional with:
- 20-level story mode
- Endless infinite mode
- Token reward system
- Upgrade mechanics
- Leaderboard

To customize game assets:

```typescript
// In SuperGnarpGame.ts, modify sprite paths
preload(scene) {
  scene.load.image('gnarp', '/sprites/your-gnarp.png');
  scene.load.image('enemy', '/sprites/your-enemy.png');
  // ... etc
}
```

### Adding Custom Audio

```typescript
// In SuperGnarpGame.ts preload
scene.load.audio('bgm', '/sounds/your-bgm.mp3');
scene.load.audio('collect', '/sounds/your-collect.mp3');

// Then play in appropriate game events
this.sound.play('bgm', { loop: true });
```

### Adjusting Game Difficulty

```typescript
// In useStore.ts, modify earned token amounts
const basePerGame = 50 * 0.0001 * 10000; // Adjust the multiplier
const stakeBonus = Math.floor(stake / 1000) * 0.3; // Adjust bonus per 1K stake
```

---

## Wallet Integration

### Phantom Wallet Setup

The project includes full Phantom wallet integration. To test:

1. Install [Phantom Wallet](https://phantom.app/) browser extension
2. Create a test wallet or import existing
3. Switch to Mainnet (or Devnet for testing)

### Testing Staking Features

**Without Real Vault Setup (Demo Mode)**:
- All transactions show as "simulated"
- No actual blockchain interaction
- Safe for testing UI/UX

**With Real Vault Setup**:
1. Deploy your staking contract
2. Update `STAKING_VAULT` in `usePhantomWallet.ts`
3. Set `VAULT_IS_CONFIGURED = true`
4. Test small amounts first

### Checking Wallet Connection

```typescript
// In any component
import { usePhantomWallet } from "../hooks/usePhantomWallet";

function MyComponent() {
  const { connected, publicKey, balance } = usePhantomWallet();
  
  return <div>{connected ? `Connected: ${balance}` : 'Not connected'}</div>;
}
```

---

## Deployment

### Option 1: Vercel (Easiest) ⭐ Recommended

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, select framework = Vite
```

### Option 2: GitHub Pages

```bash
# Build for production
pnpm --filter @workspace/gnarp-meme-official run build

# The dist/public folder is your static site
# Push to gh-pages branch or use GitHub Actions
```

### Option 3: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Build directory: artifacts/gnarp-meme-official/dist/public
```

### Option 4: Docker (Self-Hosted)

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install
COPY . .
RUN pnpm --filter @workspace/gnarp-meme-official run build
EXPOSE 5173
CMD ["pnpm", "preview"]
```

Then:
```bash
docker build -t gnarp-meme .
docker run -p 5173:5173 gnarp-meme
```

### Environment Variables (if needed)

Create `.env.local` in project root:

```env
VITE_RPC_URL=https://api.mainnet-beta.solana.com
VITE_CA=YOUR_CONTRACT_ADDRESS
VITE_PUMP_URL=https://pump.fun/coin/YOUR_CA
```

---

## FAQ

### Q: How do I change the website title?

**A**: Update `index.html` in the project root:

```html
<title>Gnarp 🐱 — Alien Cat Meme Coin on Solana</title>
```

### Q: Can I use different fonts?

**A**: Yes! In `src/App.tsx`, you can import Google Fonts:

```typescript
import '@fontsource/[your-font]';
```

Then update `index.css`:

```css
:root {
  --font-sans: '[Your Font Name]', sans-serif;
}
```

### Q: How do I add more pages?

**A**: 
1. Create new file in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`:

```typescript
<Route path="/your-page" element={<YourPage />} />
```

3. Add navbar link in `src/components/Navbar.tsx`:

```typescript
const links = [
  { path: "/", label: "首页" },
  { path: "/your-page", label: "Your Page" },
  // ...
];
```

### Q: How do I customize the game rewards?

**A**: Edit reward formulas in `src/store/useStore.ts`:

```typescript
// Modify earned tokens calculation
const earned = score * 0.001; // Change multiplier

// Modify daily cap
const dailyCap = stakedTokens * 0.05;

// Modify fee percentage
const fee = earned * 0.03; // 3% fee
```

### Q: Can I run this on a subdomain?

**A**: Yes! Update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/gnarp/',  // Subdomain path
  // ...
});
```

### Q: How do I enable PWA (offline support)?

**A**: The project includes `manifest.json` and `sw.js`. They're already configured for PWA support. Users can install as an app on their phone!

### Q: Can I use a custom domain?

**A**: Yes! After deployment:
1. Point your domain to your hosting provider's nameservers
2. Update social links to use your domain
3. Consider SSL certificate (usually auto-configured)

### Q: How do I track analytics?

**A**: Add Google Analytics to `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Support & Resources

- **Documentation**: See `README.md` for complete feature list
- **Discord**: [Join our community](https://discord.gg/gnarp)
- **Twitter**: [@Ricedmdq](https://twitter.com/Ricedmdq)
- **Telegram**: [Chat with us](https://t.me/gnarpsolana)

---

## What's Next?

1. ✅ Customize all text, links, and images
2. ✅ Test on mobile and desktop
3. ✅ Deploy to production
4. ✅ Monitor analytics and user feedback
5. ✅ Plan future features (Discord bot, NFT collection, etc.)

---

**Happy launching! 🐱🚀**

Gnarp Gnarp!
