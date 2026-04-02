import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MinerUpgrades {
  antenna: number;
  dance: number;
  fan: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  tokens: number;
  date: string;
}

interface GnarpStore {
  tokens: number;
  totalScore: number;
  upgrades: MinerUpgrades;
  lastOnlineTime: number;
  leaderboard: LeaderboardEntry[];
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean;
  addScore: (score: number) => void;
  upgradeItem: (item: keyof MinerUpgrades) => boolean;
  calculateOfflineEarnings: () => number;
  setLastOnlineTime: () => void;
  addToLeaderboard: (name: string, score: number, tokens: number) => void;
}

const UPGRADE_COSTS = {
  antenna: [100, 300, 1000],
  dance: [200, 600, 2000],
  fan: [150, 500, 1500],
};

const UPGRADE_NAMES = {
  antenna: "量子天线",
  dance: "舞步芯片",
  fan: "粉丝矩阵",
};

export { UPGRADE_COSTS, UPGRADE_NAMES };

export const useStore = create<GnarpStore>()(
  persist(
    (set, get) => ({
      tokens: 0,
      totalScore: 0,
      upgrades: { antenna: 0, dance: 0, fan: 0 },
      lastOnlineTime: Date.now(),
      leaderboard: [
        { id: "1", name: "GnarpKing", score: 99999, tokens: 9999, date: "2026-04-01" },
        { id: "2", name: "外星猫奴", score: 75000, tokens: 7500, date: "2026-04-01" },
        { id: "3", name: "MoonMiner", score: 60000, tokens: 6000, date: "2026-04-01" },
        { id: "4", name: "DanceMaster", score: 45000, tokens: 4500, date: "2026-04-02" },
        { id: "5", name: "GnarpFan", score: 30000, tokens: 3000, date: "2026-04-02" },
      ],

      addTokens: (amount) =>
        set((state) => ({ tokens: state.tokens + amount })),

      spendTokens: (amount) => {
        const state = get();
        if (state.tokens >= amount) {
          set({ tokens: state.tokens - amount });
          return true;
        }
        return false;
      },

      addScore: (score) =>
        set((state) => ({ totalScore: state.totalScore + score })),

      upgradeItem: (item) => {
        const state = get();
        const level = state.upgrades[item];
        const costs = UPGRADE_COSTS[item];
        if (level >= costs.length) return false;
        const cost = costs[level];
        if (state.tokens < cost) return false;
        set({
          tokens: state.tokens - cost,
          upgrades: { ...state.upgrades, [item]: level + 1 },
        });
        return true;
      },

      calculateOfflineEarnings: () => {
        const state = get();
        const now = Date.now();
        const elapsed = (now - state.lastOnlineTime) / 1000 / 60;
        const fanRate = state.upgrades.fan * 2;
        const earnings = Math.floor(elapsed * fanRate);
        if (earnings > 0) {
          set({ tokens: state.tokens + earnings, lastOnlineTime: now });
        }
        return earnings;
      },

      setLastOnlineTime: () => set({ lastOnlineTime: Date.now() }),

      addToLeaderboard: (name, score, tokens) => {
        const state = get();
        const entry: LeaderboardEntry = {
          id: Date.now().toString(),
          name,
          score,
          tokens,
          date: new Date().toISOString().split("T")[0],
        };
        const updated = [...state.leaderboard, entry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 20);
        set({ leaderboard: updated });
      },
    }),
    { name: "gnarp-store" }
  )
);
