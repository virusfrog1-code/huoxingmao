# 🎮 Super Gnarp Game Economy & Mechanics

Complete guide to the P2E (Play-to-Earn) game mechanics, reward system, and token economics.

---

## Table of Contents

1. [Game Overview](#game-overview)
2. [Reward System](#reward-system)
3. [Staking & Bonuses](#staking--bonuses)
4. [Energy System](#energy-system)
5. [Upgrades & Equipment](#upgrades--equipment)
6. [Daily Caps & Limits](#daily-caps--limits)
7. [Fee Distribution](#fee-distribution)
8. [Leaderboards & Achievements](#leaderboards--achievements)
9. [Economy Balancing](#economy-balancing)

---

## Game Overview

**Super Gnarp** is a 2D platformer game with integrated P2E mechanics where players:
- Jump through 20 story levels or infinite procedural levels
- Collect in-game tokens while maintaining a combo
- Earn real $GNARP tokens deposited to their wallet
- Stake GNARP to unlock bonuses and daily earning caps
- Upgrade equipment to increase mining efficiency

### Game Modes

#### 📖 Story Mode (20 Levels)
- **Levels 1-4**: "办公室地狱" (Office Hell)
- **Levels 5-9**: "霓虹都市" (Neon City)
- **Levels 10-14**: "太空站" (Space Station)
- **Levels 15-19**: "月球基地" (Moon Base)
- **Level 20**: 💀 Final BOSS Battle
- Every 5 levels features a major boss encounter
- Progressive difficulty with new enemy types
- Rewards increase per level (50→200 GNARP on completion)

#### ∞ Endless Mode
- Infinite procedurally-generated levels
- Difficulty increases every 2 levels
- Score-based ranking system
- Best score stored on personal leaderboard
- Unique purple aesthetic vs. story green

---

## Reward System

### Per-Game Earnings

**Base Formula**:
```
Base Reward Per Game = Score × 0.0001 + Level Bonus
```

**Examples**:
- Score 1,000 = 0.1 GNARP base
- Score 10,000 = 1 GNARP base
- Score 100,000 = 10 GNARP base

**Level Bonuses**:
```
Level Bonus = (Level / 2) GNARP
```
- Story Mode Level 1: +0.5 GNARP
- Story Mode Level 10: +5 GNARP
- Story Mode Level 20: +10 GNARP

**Total Earnings Per Game**:
```
Total = Base Reward + Level Bonus + Combo Multiplier
```

### Combo Multiplier

Consecutive enemy kills without taking damage:
- Combo 2-3: 1.1× multiplier
- Combo 4-5: 1.25× multiplier
- Combo 6-7: 1.5× multiplier (MEGA)
- Combo 8+: 2.0× multiplier (ULTRA)

**Example**:
- Score: 5,000 = 0.5 GNARP
- Level 5 bonus: 2.5 GNARP
- Combo 8+ multiplier: 2.0×
- **Total: 6 GNARP earned**

---

## Staking & Bonuses

### Staking Mechanics

Players can stake their earned $GNARP to unlock:
1. Increased daily earning cap
2. Staking bonus (% per token)
3. Higher Energy maximum
4. Passive offline earnings

**Staking Cost**: 0 gas (simulated/free in demo mode)

### Staking Bonus Formula

```
Staking Bonus = (Staked Amount / 1000) × 30%
```

**Bonus Breakdown**:
- 1,000 GNARP staked = +30% earnings
- 5,000 GNARP staked = +150% earnings
- 10,000 GNARP staked = +300% earnings
- 50,000 GNARP staked = +1500% earnings (cap)

**Example Calculation**:
- Base earnings without stake: 1 GNARP per game
- With 5,000 GNARP staked (150% bonus): 1 × 2.5 = 2.5 GNARP per game

### Unstaking

- Instantaneous unstaking (no cooldown)
- Loses all staking bonuses immediately
- Useful for emergency liquidity

---

## Energy System

### Energy Overview

Energy is a **daily-reset resource** for additional game plays:
- **Free plays per day**: 10 (reset at 00:00 UTC)
- **Cost per additional play**: 10 Energy
- **Max Energy**: Scales with staked amount

### Energy Max Formula

```
Max Energy = 100 + (Staked Amount / 1000) × 20
```

**Progression**:
- No stake: 100 Energy (10 free plays)
- 1,000 GNARP staked: 120 Energy
- 5,000 GNARP staked: 200 Energy
- 10,000 GNARP staked: 300 Energy
- 25,000+ GNARP staked: 500 Energy (cap)

### Energy Recovery

Energy regenerates naturally:
- **Rate**: 1 point per 30 seconds
- **Max recovery per day**: 2,880 Energy (48 hours worth)
- Recovery continues even while offline

---

## Upgrades & Equipment

### Upgrade System

Three equipment categories, 5 levels each (1-5):

#### ⚡ Quantum Antenna (量子天线)
Increases base earnings per game by 5% per level

```
Earnings Multiplier = 1 + (Level × 0.05)
Level 1: 1.05× (5% boost)
Level 5: 1.25× (25% boost)
```

**Costs**: 50 → 150 → 400 → 1,000 → 2,500 GNARP

#### 💃 Dance Chip (舞步芯片)
Increases combo multiplier

```
Combo Multiplier = Base × (1 + Level × 0.3)
Level 1: 1.3× combo power
Level 5: 2.5× combo power
```

**Costs**: 75 → 225 → 600 → 1,500 → 3,750 GNARP

#### 👥 Fanbase Matrix (粉丝矩阵)
Increases passive offline earnings

```
Offline Earnings Rate = Base Rate × (1 + Level × 0.4)
Level 1: 1.4× offline yield
Level 5: 3.0× offline yield
```

**Costs**: 100 → 300 → 800 → 2,000 → 5,000 GNARP

### Upgrade Strategy

**Early Game** (< 5K tokens):
- Prioritize Antenna for direct earning boost
- Levels 1-2 of each

**Mid Game** (5K-25K tokens):
- Prioritize Dance Chip for combos
- Antenna 3-4, Dance 3-4

**Late Game** (25K+ tokens):
- Max out Dance Chip and Fanbase
- Focus on Fanbase for passive income
- Full maxing all upgrades: 24,550 GNARP total

---

## Daily Caps & Limits

### Daily Earning Cap

Prevents farming of unlimited tokens. Cap resets at 00:00 UTC.

```
Daily Cap = min(240 + (Staked / 100) × 5, 5000)
```

**Examples**:
- No stake: 240 GNARP/day
- 1,000 GNARP staked: 290 GNARP/day
- 5,000 GNARP staked: 490 GNARP/day
- 100,000 GNARP staked: 5,000 GNARP/day (max)

### Free Play Limit

- **10 free plays per day** (no Energy cost)
- After 10 plays, each additional play costs 10 Energy
- Free plays reset at 00:00 UTC

### Earnings Calculator

On the `/token` page, simulate your earnings:

**Inputs**:
1. Staked amount (GNARP)
2. Games per day

**Outputs**:
- Gross daily earnings
- 3% fee deduction
- Net earnings after fee
- Daily cap limit
- Energy maximum
- Offline 8-hour earnings

---

## Fee Distribution

### Transaction Fee

Every token earned incurs a **3% fee** (mandatory):

```
Fee = Earnings × 0.03
Net = Earnings - Fee
```

**Example**:
- Earned: 100 GNARP
- Fee: 3 GNARP
- Net to wallet: 97 GNARP

### Fee Distribution

The 3% fee is automatically distributed:

| Component | Percentage | Amount | Purpose |
|-----------|-----------|--------|---------|
| **Buyback** | 1.5% | 1.5% | Buy GNARP from DEX, lock in P2E pool |
| **Marketing** | 1% | 1% | Community growth, partnerships, dev |
| **Community** | 0.5% | 0.5% | Airdrops, contests, events |

**Visual**: See the donut chart on `/token` page

### P2E Pool

All buyback fees (1.5%) accumulate in the **P2E Pool**:
- Starting amount: 100M GNARP
- Distributed as game rewards
- Pool status shown on `/game` sidebar
- Current pool: X% remaining

---

## Leaderboards & Achievements

### Personal Leaderboard

Each player maintains best scores:
- **Story Mode**: Best score, highest level reached
- **Endless Mode**: Best score, personal record

Data stored locally in `localStorage` (configurable for server-side in production).

### Global Leaderboard

Top 100 players across all modes:
- **24h leaderboard**: Scores from last 24 hours
- **All-time leaderboard**: Best scores ever
- Ties broken by earliest timestamp

**Leaderboard Rewards** (future feature):
- 🏆 #1-3: Weekly GNARP bonus
- 🥇 Earn achievement badges
- 📊 Track personal progress

### Session Statistics

After each game:
- Score
- Tokens earned (gross)
- Tokens earned (after fee)
- Level reached (story mode)
- Duration
- Mode (story/endless)

---

## Economy Balancing

### Anti-Botting Measures

1. **Daily Caps**: Prevents unlimited farming
2. **Energy System**: Gating with natural regeneration
3. **Fee Deduction**: 3% on every earn
4. **Score Verification**: Server-side validation (future)
5. **Behavioral Analysis**: Detect and flag suspicious patterns

### Inflation Control

```
Monthly Inflation Rate = (Total Daily Cap × 30) / Circulating Supply
```

Target: < 2% monthly inflation

**Adjustment Levers**:
- Daily cap formula
- Base earnings per point
- Staking bonus percentage
- Energy regeneration rate
- Upgrade costs

### Supply Mechanics

- **Total Supply**: 1 Billion GNARP (fixed, no minting)
- **P2E Pool**: 100M reserved for game rewards
- **Circulation**: 900M initially for DEX, community
- **Buyback Mechanism**: 1.5% fees buy from open market, lock in pool

---

## Formulas Reference

### Earnings Per Game
```
Gross = (Score × 0.0001) + (Level × 0.5)
Boosted = Gross × (1 + StakingBonus%)
Actual = min(Boosted, DailyCap - AlreadyEarned)
Net = Actual × (1 - 0.03)
```

### Staking Bonus
```
Bonus% = (StakedAmount / 1000) × 30%
```

### Energy Maximum
```
MaxEnergy = 100 + (StakedAmount / 1000) × 20
Capped at 500
```

### Daily Cap
```
DailyCap = min(240 + (StakedAmount / 100) × 5, 5000)
```

### Offline Earnings
```
OfflineEarnings = (DailyActual × 8) / 24
Max: 8 hours of offline
Requires Energy > 0
```

### Combo Multiplier
```
if Combo < 2: 1.0×
if Combo 2-3: 1.1×
if Combo 4-5: 1.25×
if Combo 6-7: 1.5×
if Combo 8+: 2.0×
```

---

## Gameplay Tips & Strategy

### Maximize Daily Earnings

1. **Stack combo early**: Kill 8+ enemies for 2.0× multiplier
2. **Time free plays**: Use all 10 daily free plays
3. **Stake efficiently**: 5K stake = ~2× earning multiplier
4. **Upgrade for score**: Antenna + Dance Chip = higher scores
5. **Play consistently**: Daily habit > rare big sessions

### Recommended Progression

**Week 1-2** (Building Foundation):
- Play 5-10 games daily (free plays only)
- Earn: ~1-2K GNARP
- Stake: 500 GNARP when possible
- Upgrade: Antenna Lvl 1

**Week 3-4** (Mid-Game):
- Play 10-15 games daily (some Energy)
- Current stake: 2-3K GNARP
- Daily earnings: ~300-500 GNARP
- Upgrade progression: Antenna 2, Dance 1

**Month 2-3** (Scaling):
- Play 20+ games daily
- Stake: 10-20K GNARP
- Daily earnings: 1-2K GNARP
- Upgrade: Work toward Lvl 3-4

**Month 4+** (Maxing):
- Stake: 50K+ GNARP
- Daily earnings: 2-5K GNARP
- Upgrade: Pursue full Lvl 5

### Risk Management

- **Diversify**: Don't put all earnings back into stake
- **Take profits**: Convert some GNARP to stables periodically
- **Test upgrades**: Verify ROI before maxing out
- **Energy management**: Don't waste Energy on low-score runs

---

## Future Economy Features

Planned additions to enhance gameplay:

- **Guilds**: Pooled staking with shared bonuses
- **Seasonal Battles**: Special boss events with mega rewards
- **NFT Equipment**: Unique cosmetics with stat boosts
- **Governance**: DAO voting on economy changes
- **Cross-game**: Gnarp tokens usable in partner games
- **DeFi Integration**: Yield farming with GNARP-SOL LP

---

## Questions?

Join our community for discussion:
- **Discord**: [Join server](https://discord.gg/gnarp)
- **Telegram**: [Chat](https://t.me/gnarpsolana)
- **Twitter**: [@Ricedmdq](https://twitter.com/Ricedmdq)

---

**Happy earning! 🐱⛏️💰**

Gnarp Gnarp!
