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
  // Wallet
  tokens: number;
  stakedTokens: number;
  totalScore: number;
  // Upgrades
  upgrades: MinerUpgrades;
  // Economy
  p2ePool: number;           // starts at 100_000_000
  feesBoughtBack: number;    // simulated 1.5% buyback
  feesMarketing: number;     // simulated 1%
  feesAirdrop: number;       // simulated 0.5%
  // Energy / daily plays
  energy: number;
  maxEnergy: number;
  freePlaysUsed: number;
  lastEnergyRefill: number;
  // Mining
  lastOnlineTime: number;
  todayEarned: number;
  todayDate: string;
  // Level progress
  highestLevel: number;
  endlessBest: number;
  leaderboard: LeaderboardEntry[];

  // Actions
  addTokens: (amount: number) => void;
  stakeTokens: (amount: number) => void;
  unstakeTokens: (amount: number) => void;
  buyUpgrade: (item: keyof MinerUpgrades, cost: number) => void;
  addScore: (score: number) => void;
  consumeEnergy: (amount: number) => boolean;
  refillEnergy: () => void;
  useFreePla: () => boolean;
  simulateFee: (txAmount: number) => void;
  calculateOfflineEarnings: () => number;
  addToLeaderboard: (name: string, score: number, tokens: number) => void;
  setHighestLevel: (lv: number) => void;
  setEndlessBest: (score: number) => void;

  // Helpers
  getMiningRatePerHour: () => number;
  getDailyCapTokens: () => number;
  getTodayEarned: () => number;
  getEnergyMaxPerStake: () => number;
}

/*
 * UPGRADE FORMULA:
 *   antenna Lv N: +N token/hr auto-mine
 *   fan Lv N: offline multiplier 1 + N×0.4 (max 3×)
 *   dance Lv N: game collect bonus 1 + N×0.3 (max 2.5×)
 *
 * DAILY CAP = 240 + antenna×40 + fan×30 + staking bonus
 *
 * ENERGY:
 *   baseMax = 100, +20 per 1000 staked, max 500
 *   5 free plays/day, extra plays cost 10 energy each
 *
 * P2E POOL:
 *   starts at 100,000,000 GNARP (dev injected)
 *   each earn deducts from pool
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
  antenna: "每小时自动产出 Token（Lv1→5 = 1-5/hr）",
  fan: "离线收益倍率，最高 3×",
  dance: "游戏收集奖励翻倍，最高 2.5×",
};

export const P2E_POOL_INITIAL = 100_000_000;
export const DAILY_FREE_PLAYS = 5;
export const ENERGY_PER_EXTRA_PLAY = 10;

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export const useStore = create<GnarpStore>()(
  persist(
    (set, get) => ({
      tokens: 0,
      stakedTokens: 0,
      totalScore: 0,
      upgrades: { antenna: 0, fan: 0, dance: 0 },
      p2ePool: P2E_POOL_INITIAL,
      feesBoughtBack: 0,
      feesMarketing: 0,
      feesAirdrop: 0,
      energy: 100,
      maxEnergy: 100,
      freePlaysUsed: 0,
      lastEnergyRefill: Date.now(),
      lastOnlineTime: Date.now(),
      todayEarned: 0,
      todayDate: getTodayStr(),
      highestLevel: 0,
      endlessBest: 0,
      leaderboard: [
        { id: "1", name: "GnarpKing",   score: 48200, tokens: 1640, date: "2026-04-02" },
        { id: "2", name: "外星猫奴",    score: 36800, tokens: 1220, date: "2026-04-02" },
        { id: "3", name: "MoonMiner",   score: 29600, tokens: 980,  date: "2026-04-02" },
        { id: "4", name: "SuperJumper", score: 22800, tokens: 760,  date: "2026-04-02" },
        { id: "5", name: "GnarpFan",    score: 17800, tokens: 580,  date: "2026-04-02" },
        { id: "6", name: "CryptoKitty", score: 12400, tokens: 410,  date: "2026-04-02" },
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
        const newPool = Math.max(0, state.p2ePool - actual);
        set({
          tokens: state.tokens + actual,
          todayEarned: todayEarned + actual,
          todayDate: today,
          p2ePool: newPool,
        });
      },

      stakeTokens: (amount) => {
        const state = get();
        const actual = Math.min(amount, state.tokens);
        if (actual <= 0) return;
        const staked = state.stakedTokens + actual;
        const maxE = state.getEnergyMaxPerStake();
        set({
          tokens: state.tokens - actual,
          stakedTokens: staked,
          maxEnergy: maxE,
        });
      },

      unstakeTokens: (amount) => {
        const state = get();
        const actual = Math.min(amount, state.stakedTokens);
        if (actual <= 0) return;
        set({
          tokens: state.tokens + actual,
          stakedTokens: state.stakedTokens - actual,
        });
      },

      buyUpgrade: (item, cost) => {
        const state = get();
        const level = state.upgrades[item];
        if (level >= 5 || state.tokens < cost) return;
        // 3% fee simulation on in-game purchases
        get().simulateFee(cost);
        set({
          tokens: state.tokens - cost,
          upgrades: { ...state.upgrades, [item]: level + 1 },
        });
      },

      addScore: (score) =>
        set((state) => ({ totalScore: state.totalScore + score })),

      consumeEnergy: (amount) => {
        const state = get();
        if (state.energy < amount) return false;
        set({ energy: state.energy - amount });
        return true;
      },

      refillEnergy: () => {
        const state = get();
        const maxE = state.getEnergyMaxPerStake();
        const now = Date.now();
        const hoursElapsed = (now - state.lastEnergyRefill) / 3600000;
        const refill = Math.floor(hoursElapsed * 10); // 10 energy/hr
        if (refill <= 0) return;
        set({
          energy: Math.min(maxE, state.energy + refill),
          lastEnergyRefill: now,
          maxEnergy: maxE,
        });
      },

      useFreePla: () => {
        const state = get();
        const today = getTodayStr();
        const freshDay = today !== state.todayDate;
        const used = freshDay ? 0 : state.freePlaysUsed;
        if (used < DAILY_FREE_PLAYS) {
          set({ freePlaysUsed: used + 1, todayDate: today });
          return true;
        }
        // Try consuming energy for extra play
        return get().consumeEnergy(ENERGY_PER_EXTRA_PLAY);
      },

      simulateFee: (txAmount) => {
        const fee = txAmount * 0.03;
        const buyback = fee * 0.5;
        const marketing = fee * (1 / 3);
        const airdrop = fee * (1 / 6);
        set((s) => ({
          feesBoughtBack: s.feesBoughtBack + buyback,
          feesMarketing: s.feesMarketing + marketing,
          feesAirdrop: s.feesAirdrop + airdrop,
        }));
      },

      calculateOfflineEarnings: () => {
        const state = get();
        const now = Date.now();
        const hoursElapsed = Math.min(8, (now - state.lastOnlineTime) / 3600000);
        const antennaRate = state.upgrades.antenna;
        const fanMult = 1 + state.upgrades.fan * 0.4;
        const earnings = Math.floor(hoursElapsed * antennaRate * fanMult);
        get().refillEnergy();
        if (earnings > 0) {
          get().addTokens(earnings);
          set({ lastOnlineTime: now });
        }
        return earnings;
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

      setHighestLevel: (lv) =>
        set((s) => ({ highestLevel: Math.max(s.highestLevel, lv) })),

      setEndlessBest: (score) =>
        set((s) => ({ endlessBest: Math.max(s.endlessBest, score) })),

      getMiningRatePerHour: () => {
        const { upgrades } = get();
        const fanBonus = 1 + upgrades.fan * 0.15;
        return Math.round(upgrades.antenna * fanBonus * 10) / 10;
      },

      getDailyCapTokens: () => {
        const { upgrades, stakedTokens } = get();
        const stakeBonus = Math.floor(stakedTokens / 100) * 5;
        return 240 + upgrades.antenna * 40 + upgrades.fan * 30 + stakeBonus;
      },

      getTodayEarned: () => {
        const state = get();
        if (getTodayStr() !== state.todayDate) return 0;
        return state.todayEarned;
      },

      getEnergyMaxPerStake: () => {
        const { stakedTokens } = get();
        return Math.min(500, 100 + Math.floor(stakedTokens / 1000) * 20);
      },
    }),
    { name: "gnarp-store-v4" }
  )
);
