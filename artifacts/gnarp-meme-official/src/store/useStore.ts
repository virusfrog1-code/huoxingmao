import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MinerUpgrades {
  antenna: number;
  fan: number;
  dance: number;
}

export interface LeaderboardEntry {
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
  todayEarned: number;
  todayDate: string;
  leaderboard: LeaderboardEntry[];
  // actions
  addTokens: (amount: number) => void;
  buyUpgrade: (item: keyof MinerUpgrades, cost: number) => void;
  addScore: (score: number) => void;
  calculateOfflineEarnings: () => number;
  addToLeaderboard: (name: string, score: number, tokens: number) => void;
  // derived helpers
  getMiningRatePerHour: () => number;
  getDailyCapTokens: () => number;
  getTodayEarned: () => number;
}

/*
 * Upgrade formula:
 *   antenna Lv N: +N token/hour auto-mine (1-5, max 5 token/hr)
 *   fan Lv N: offline multiplier × (1 + N * 0.4) — up to 3x
 *   dance Lv N: in-game collect bonus × (1 + N * 0.3) — up to 2.5x
 *
 * Daily cap = 240 + antenna*40 + fan*30
 */

export const UPGRADE_COSTS: Record<keyof MinerUpgrades, number[]> = {
  antenna: [80, 240, 600, 1400, 3000],
  fan:     [120, 360, 900, 2000, 4200],
  dance:   [60,  180, 450, 1000, 2200],
};

export const UPGRADE_NAMES: Record<keyof MinerUpgrades, string> = {
  antenna: "量子天线",
  fan: "粉丝矩阵",
  dance: "舞步芯片",
};

export const UPGRADE_ICONS: Record<keyof MinerUpgrades, string> = {
  antenna: "📡",
  fan: "👾",
  dance: "🎵",
};

export const UPGRADE_DESCS: Record<keyof MinerUpgrades, string> = {
  antenna: "每小时自动产出 Token（最多 5/hr）",
  fan: "离线收益倍率 × 最高 3×",
  dance: "游戏中收集奖励翻倍（最高 2.5×）",
};

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export const useStore = create<GnarpStore>()(
  persist(
    (set, get) => ({
      tokens: 0,
      totalScore: 0,
      upgrades: { antenna: 0, fan: 0, dance: 0 },
      lastOnlineTime: Date.now(),
      todayEarned: 0,
      todayDate: getTodayStr(),
      leaderboard: [
        { id: "1", name: "GnarpKing",  score: 24500, tokens: 820, date: "2026-04-02" },
        { id: "2", name: "外星猫奴",   score: 18200, tokens: 610, date: "2026-04-02" },
        { id: "3", name: "MoonMiner",  score: 14800, tokens: 490, date: "2026-04-02" },
        { id: "4", name: "SuperJumper",score: 11400, tokens: 380, date: "2026-04-02" },
        { id: "5", name: "GnarpFan",   score: 8900,  tokens: 290, date: "2026-04-02" },
      ],

      addTokens: (amount) => {
        const state = get();
        const today = getTodayStr();
        const freshDay = today !== state.todayDate;
        const cap = state.getDailyCapTokens();
        const todayEarned = freshDay ? 0 : state.todayEarned;
        const remaining = Math.max(0, cap - todayEarned);
        const actual = Math.min(amount, remaining);
        if (actual <= 0) return;
        set({
          tokens: state.tokens + actual,
          todayEarned: todayEarned + actual,
          todayDate: today,
        });
      },

      buyUpgrade: (item, cost) => {
        const state = get();
        const level = state.upgrades[item];
        if (level >= 5 || state.tokens < cost) return;
        set({
          tokens: state.tokens - cost,
          upgrades: { ...state.upgrades, [item]: level + 1 },
        });
      },

      addScore: (score) =>
        set((state) => ({ totalScore: state.totalScore + score })),

      calculateOfflineEarnings: () => {
        const state = get();
        const now = Date.now();
        const hoursElapsed = Math.min(8, (now - state.lastOnlineTime) / 3600000);
        const antennaRate = state.upgrades.antenna;
        const fanMult = 1 + state.upgrades.fan * 0.4;
        const base = hoursElapsed * antennaRate;
        const earnings = Math.floor(base * fanMult);
        if (earnings > 0) {
          get().addTokens(earnings);
          set({ lastOnlineTime: now });
        }
        return earnings;
      },

      getMiningRatePerHour: () => {
        const { upgrades } = get();
        const base = upgrades.antenna;
        const fanBonus = 1 + upgrades.fan * 0.15;
        return Math.round(base * fanBonus * 10) / 10;
      },

      getDailyCapTokens: () => {
        const { upgrades } = get();
        return 240 + upgrades.antenna * 40 + upgrades.fan * 30;
      },

      getTodayEarned: () => {
        const state = get();
        if (getTodayStr() !== state.todayDate) return 0;
        return state.todayEarned;
      },

      addToLeaderboard: (name, score, tokens) => {
        const state = get();
        const entry: LeaderboardEntry = {
          id: Date.now().toString(), name, score, tokens,
          date: getTodayStr(),
        };
        const updated = [...state.leaderboard, entry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 20);
        set({ leaderboard: updated });
      },
    }),
    { name: "gnarp-store-v3" }
  )
);
