import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MinerUpgrades {
  antenna: number;
  jump: number;
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
  buyUpgrade: (item: keyof MinerUpgrades, cost: number) => void;
  calculateOfflineEarnings: () => number;
  setLastOnlineTime: () => void;
  addToLeaderboard: (name: string, score: number, tokens: number) => void;
}

export const useStore = create<GnarpStore>()(
  persist(
    (set, get) => ({
      tokens: 0,
      totalScore: 0,
      upgrades: { antenna: 0, jump: 0, fan: 0 },
      lastOnlineTime: Date.now(),
      leaderboard: [
        { id: "1", name: "GnarpKing", score: 18500, tokens: 340, date: "2026-04-01" },
        { id: "2", name: "外星猫奴", score: 14200, tokens: 280, date: "2026-04-01" },
        { id: "3", name: "MoonMiner", score: 11800, tokens: 220, date: "2026-04-01" },
        { id: "4", name: "SuperJumper", score: 9400, tokens: 180, date: "2026-04-02" },
        { id: "5", name: "GnarpFan", score: 7600, tokens: 140, date: "2026-04-02" },
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

      buyUpgrade: (item, cost) => {
        const state = get();
        const level = state.upgrades[item];
        if (level >= 3 || state.tokens < cost) return;
        set({
          tokens: state.tokens - cost,
          upgrades: { ...state.upgrades, [item]: level + 1 },
        });
      },

      calculateOfflineEarnings: () => {
        const state = get();
        const now = Date.now();
        const hoursElapsed = (now - state.lastOnlineTime) / 1000 / 3600;
        const fanRate = state.upgrades.fan * 20;
        const earnings = Math.floor(hoursElapsed * fanRate);
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
    { name: "gnarp-store-v2" }
  )
);
