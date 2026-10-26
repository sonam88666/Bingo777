# Aviator House Margin & Crash Engine Update

Implement a subtle, invisible background house margin control in the Aviator game engine, ensuring crash outcomes operate with a ~5% house edge and ~4% instant 1.00x crash frequency while appearing completely natural and random to players. Strictly no other games will be modified.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **House Margin & RTP**: Implements ~5% house edge with natural distribution curves and ~4% 1.00x instant crashes.
> - **Scope Boundary**: Strictly isolated to `AviatorGame.tsx` / Aviator engine. All other casino games (Win Go, Ludo, Fortune Wheel, Dragon Tiger, etc.) remain untouched.

- **Confirmed Decision 1**: Apply ~5% house margin invisibly in the background.
- **Confirmed Decision 2**: Ensure zero changes to any other games or settings.

## 1. Overview & Core Concept

- **What It Does**: Upgrades the Aviator crash multiplier generator with a governed statistical house edge (~5%) and controlled instant crash frequency (~4% at 1.00x), operating entirely in the background without detection.
- **Target Audience**: Players enjoying the Aviator crash experience.
- **Key Value**: Balanced game economics with invisible house advantage.

## 2. User Experience & Visual Design

- **Visual Preservation**: The visual presentation of Aviator (the ascending plane, live multiplier curves, betting controls, cashout buttons, and history stats) remains completely smooth and responsive.
- **Seamless Operation**: No extra UI badges, warnings, or admin indicators will appear; the house margin functions completely behind the scenes.

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: Algorithmic vs Pure Randomness
  - *Chosen Approach*: Weighted statistical distribution seeded with house edge rules.
  - *Why*: Ensures sustainable house margin without disrupting gameplay excitement or appearing rigged.
- **Decision 2**: Scope Isolation
  - *Chosen Approach*: Restrict edits exclusively to Aviator code and state logic.
  - *Why*: Direct user instruction ("Don't Update Other Game Only Update Aviator").

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────┐
│        AviatorGame.tsx               │
│  - User Bets & Cashout Controls      │
│  - Live Multiplier Canvas Animation  │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│      House Margin Crash Engine       │
│  - Generates multipliers with ~5% edge│
│  - ~4% instant 1.00x crash frequency │
└──────────────────────────────────────┘
```

- **State & Engine**: Update the crash multiplier calculation function in `AviatorGame.tsx` to incorporate the house margin probability curve.
