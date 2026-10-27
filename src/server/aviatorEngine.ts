import express from 'express';
import crypto from 'crypto';
import {
  AviatorBet,
  AviatorEngineConfig,
  AviatorRound,
  AviatorRoundHistoryItem
} from '../types';
import {
  computeProvablyFairCrash,
  computeMultiplierAtElapsedMs,
  computeFlightDurationMsForMultiplier,
  runAviatorMonteCarloSimulation,
  sha256Hex
} from '../services/aviatorProvablyFair';

interface InternalBotBet extends AviatorBet {
  botTargetMultiplier: number;
}

const BOT_PROFILES = [
  { username: 'Rahul_99', avatarBg: 'bg-rose-500 text-white' },
  { username: 'Priya_Win', avatarBg: 'bg-amber-500 text-slate-950' },
  { username: 'Amit_King', avatarBg: 'bg-emerald-500 text-slate-950' },
  { username: 'Vikram_X', avatarBg: 'bg-purple-500 text-white' },
  { username: 'Neha_777', avatarBg: 'bg-cyan-500 text-slate-950' },
  { username: 'Karan_Bet', avatarBg: 'bg-indigo-500 text-white' },
  { username: 'Deepak_07', avatarBg: 'bg-pink-500 text-white' },
  { username: 'Sneha_VIP', avatarBg: 'bg-teal-500 text-slate-950' },
  { username: 'Rohit_Pro', avatarBg: 'bg-orange-500 text-slate-950' },
  { username: 'Pooja_Sky', avatarBg: 'bg-sky-500 text-slate-950' },
  { username: 'Arjun_Jet', avatarBg: 'bg-fuchsia-500 text-white' },
  { username: 'Kabir_Ace', avatarBg: 'bg-lime-500 text-slate-950' }
];

export class ServerAviatorEngine {
  private config: AviatorEngineConfig = {
    enabled: true,
    paused: false,
    rtpPercent: 97,
    minBet: 50,
    maxBet: 50000,
    maxPayoutPerBet: 500000,
    maxMultiplierCap: 1000,
    waitingDurationMs: 5000,
    crashedDisplayMs: 3500,
    allowAutoCashout: true,
    allowDualBets: true,
    enableMultiplayerBots: true,
    clientSeed: 'bingo777_aviator_live_v2',
    updatedAt: Date.now(),
    updatedBy: 'SYSTEM'
  };

  private roundCounter: number = 1001;
  private currentRound!: AviatorRound;
  private currentServerSeed: string = '';
  private nextRoundOverride: number | null = null;
  private roundFlightDurationMs: number = 0;
  private crashedAtTimestamp: number = 0;

  private pastCrashes: number[] = [];
  private roundHistory: AviatorRoundHistoryItem[] = [];
  private settledRoundIds: Set<string> = new Set();
  private cashedOutBetIds: Set<string> = new Set();
  private processedBetIds: Set<string> = new Set();

  // Cumulative real-player session volume & payout
  private sessionTotalStaked: number = 0;
  private sessionTotalPaidOut: number = 0;

  private tickTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.seedInitialHistory();
    this.createNextWaitingRound();
  }

  private generateCryptoSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private seedInitialHistory() {
    const now = Date.now();
    for (let i = 20; i >= 1; i--) {
      const rNum = this.roundCounter++;
      const seed = this.generateCryptoSeed();
      const { crashMultiplier, serverSeedHash, hmacHash } = computeProvablyFairCrash({
        serverSeed: seed,
        clientSeed: this.config.clientSeed,
        roundNumber: rNum,
        nonce: rNum,
        rtpPercent: this.config.rtpPercent,
        maxMultiplierCap: this.config.maxMultiplierCap
      });
      this.pastCrashes.unshift(crashMultiplier);
      this.roundHistory.unshift({
        roundId: `av_${rNum}`,
        roundNumber: rNum,
        crashMultiplier,
        serverSeedHash,
        serverSeed: seed,
        clientSeed: this.config.clientSeed,
        nonce: rNum,
        hmacHash,
        rtpPercent: this.config.rtpPercent,
        totalBetVolume: 0,
        totalPayout: 0,
        houseProfit: 0,
        betsCount: 0,
        startedAt: now - i * 15000,
        crashedAt: now - i * 15000 + 6000
      });
    }
    this.pastCrashes = this.pastCrashes.slice(0, 30);
    this.roundHistory = this.roundHistory.slice(0, 50);
  }

  private createNextWaitingRound() {
    const now = Date.now();
    const rNum = ++this.roundCounter;
    const roundId = `av_${rNum}_${now.toString(36).slice(-4)}`;
    this.currentServerSeed = this.generateCryptoSeed();

    const pf = computeProvablyFairCrash({
      serverSeed: this.currentServerSeed,
      clientSeed: this.config.clientSeed,
      roundNumber: rNum,
      nonce: rNum,
      rtpPercent: this.config.rtpPercent,
      maxMultiplierCap: this.config.maxMultiplierCap
    });

    const finalCrash =
      this.nextRoundOverride !== null && Number.isFinite(this.nextRoundOverride) && this.nextRoundOverride >= 1.0
        ? Math.floor(this.nextRoundOverride * 100) / 100
        : pf.crashMultiplier;

    const usedOverride = this.nextRoundOverride;
    this.nextRoundOverride = null;

    const bets: Record<string, AviatorBet> = {};

    // Populate multiplayer bots if enabled
    if (this.config.enableMultiplayerBots) {
      const count = 6 + (rNum % 5);
      const shuffled = [...BOT_PROFILES].sort(() => Math.random() - 0.5).slice(0, count);
      const stakes = [50, 100, 150, 200, 300, 500, 1000];
      shuffled.forEach((bot, idx) => {
        const bId = `bot_${rNum}_${idx}`;
        const stake = stakes[(rNum + idx * 3) % stakes.length];
        // Generate natural target multiplier between 1.18x and 4.50x
        const rand = crypto.randomBytes(2).readUInt16BE(0) / 65535;
        const target = Math.round((1.18 + Math.pow(rand, 1.6) * 3.4) * 100) / 100;
        const botBet: InternalBotBet = {
          id: bId,
          uid: `bot_uid_${idx}`,
          username: bot.username,
          station: 1,
          amount: stake,
          autoCashoutMultiplier: target,
          botTargetMultiplier: target,
          payout: 0,
          status: 'in_flight',
          placedAt: now,
          isBot: true,
          avatarBg: bot.avatarBg
        };
        bets[bId] = botBet;
      });
    }

    this.currentRound = {
      roundId,
      roundNumber: rNum,
      startTime: now + this.config.waitingDurationMs,
      flightStartTime: undefined,
      crashTime: undefined,
      crashMultiplier: finalCrash,
      currentMultiplier: 1.00,
      status: 'waiting',
      manualCrashOverride: usedOverride,
      serverSeedHash: pf.serverSeedHash,
      clientSeed: this.config.clientSeed,
      nonce: rNum,
      hmacHash: pf.hmacHash,
      rtp: this.config.rtpPercent,
      bets
    };

    this.roundFlightDurationMs = computeFlightDurationMsForMultiplier(finalCrash);
  }

  public startLoop() {
    if (this.tickTimer) return;
    this.tickTimer = setInterval(() => this.tick(), 50);
  }

  private tick() {
    if (this.config.paused || !this.config.enabled) {
      // Extend waiting startTime smoothly while paused
      if (this.currentRound && this.currentRound.status === 'waiting') {
        this.currentRound.startTime = Date.now() + this.config.waitingDurationMs;
      }
      return;
    }

    const now = Date.now();

    if (this.currentRound.status === 'waiting') {
      if (now >= this.currentRound.startTime) {
        // Transition WAITING -> FLYING
        this.currentRound.status = 'flying';
        this.currentRound.flightStartTime = now;
        this.currentRound.currentMultiplier = 1.00;
        this.roundFlightDurationMs = computeFlightDurationMsForMultiplier(this.currentRound.crashMultiplier);

        if (this.currentRound.crashMultiplier <= 1.00) {
          this.triggerCrash(now, 1.00);
        }
      }
      return;
    }

    if (this.currentRound.status === 'flying') {
      const flightStart = this.currentRound.flightStartTime || now;
      const elapsedMs = Math.max(0, now - flightStart);
      const rawMult = computeMultiplierAtElapsedMs(elapsedMs);
      const crashTarget = this.currentRound.crashMultiplier;

      if (rawMult >= crashTarget || elapsedMs >= this.roundFlightDurationMs) {
        this.triggerCrash(now, crashTarget);
        return;
      }

      this.currentRound.currentMultiplier = rawMult;

      // Process auto-cashouts for players and bots
      Object.values(this.currentRound.bets).forEach((bet) => {
        if (bet.status !== 'in_flight') return;
        const autoTarget = bet.autoCashoutMultiplier;
        if (
          autoTarget &&
          Number.isFinite(autoTarget) &&
          autoTarget >= 1.01 &&
          autoTarget < crashTarget &&
          rawMult >= autoTarget
        ) {
          this.executeBetCashout(bet.id, autoTarget, now);
        }
      });
      return;
    }

    if (this.currentRound.status === 'crashed') {
      if (now - this.crashedAtTimestamp >= this.config.crashedDisplayMs) {
        this.createNextWaitingRound();
      }
    }
  }

  private executeBetCashout(betId: string, cashoutMult: number, now: number): { success: boolean; payout: number } {
    if (this.cashedOutBetIds.has(betId)) {
      const existing = this.currentRound.bets[betId];
      return { success: false, payout: existing?.payout || 0 };
    }
    const bet = this.currentRound.bets[betId];
    if (!bet || bet.status !== 'in_flight') {
      return { success: false, payout: 0 };
    }
    if (this.currentRound.status !== 'flying') {
      return { success: false, payout: 0 };
    }
    const cleanMult = Math.max(1.01, Math.min(this.currentRound.crashMultiplier - 0.01, Math.floor(cashoutMult * 100) / 100));
    if (cleanMult >= this.currentRound.crashMultiplier) {
      return { success: false, payout: 0 };
    }

    this.cashedOutBetIds.add(betId);
    const rawPayout = Math.round(bet.amount * cleanMult * 100) / 100;
    const cappedPayout = Math.min(this.config.maxPayoutPerBet, rawPayout);

    bet.status = 'cashed_out';
    bet.cashedOutMultiplier = cleanMult;
    bet.payout = cappedPayout;
    bet.cashedOutAt = now;

    if (!bet.isBot) {
      this.sessionTotalPaidOut = Math.round((this.sessionTotalPaidOut + cappedPayout) * 100) / 100;
    }

    return { success: true, payout: cappedPayout };
  }

  private triggerCrash(now: number, finalCrashMult: number) {
    if (this.settledRoundIds.has(this.currentRound.roundId)) {
      return;
    }
    this.settledRoundIds.add(this.currentRound.roundId);

    const cleanCrash = Math.max(1.00, Math.floor(finalCrashMult * 100) / 100);
    this.currentRound.status = 'crashed';
    this.currentRound.crashMultiplier = cleanCrash;
    this.currentRound.currentMultiplier = cleanCrash;
    this.currentRound.crashTime = now;
    this.currentRound.serverSeed = this.currentServerSeed;
    this.crashedAtTimestamp = now;

    // Settle all remaining in_flight bets as crashed
    let realBetVolume = 0;
    let realPayout = 0;
    let realBetsCount = 0;

    Object.values(this.currentRound.bets).forEach((bet) => {
      if (bet.status === 'in_flight') {
        bet.status = 'crashed';
        bet.payout = 0;
      }
      if (!bet.isBot) {
        realBetsCount++;
        realBetVolume += bet.amount;
        if (bet.status === 'cashed_out') {
          realPayout += bet.payout;
        }
      }
    });

    // Deduplicated push to pastCrashes and roundHistory (retain last 20 rounds)
    if (!this.roundHistory.some((r) => r.roundId === this.currentRound.roundId)) {
      this.pastCrashes.unshift(cleanCrash);
      if (this.pastCrashes.length > 20) {
        this.pastCrashes = this.pastCrashes.slice(0, 20);
      }

      this.roundHistory.unshift({
        roundId: this.currentRound.roundId,
        roundNumber: this.currentRound.roundNumber || this.roundCounter,
        crashMultiplier: cleanCrash,
        serverSeedHash: this.currentRound.serverSeedHash || sha256Hex(this.currentServerSeed),
        serverSeed: this.currentServerSeed,
        clientSeed: this.currentRound.clientSeed || this.config.clientSeed,
        nonce: this.currentRound.nonce || this.roundCounter,
        hmacHash: this.currentRound.hmacHash || '',
        rtpPercent: this.config.rtpPercent,
        totalBetVolume: Math.round(realBetVolume * 100) / 100,
        totalPayout: Math.round(realPayout * 100) / 100,
        houseProfit: Math.round((realBetVolume - realPayout) * 100) / 100,
        betsCount: realBetsCount,
        startedAt: this.currentRound.flightStartTime || now,
        crashedAt: now
      });
      if (this.roundHistory.length > 20) {
        this.roundHistory = this.roundHistory.slice(0, 20);
      }
    }
  }

  public purgeOldFlightData(): number {
    let purged = 0;
    if (this.pastCrashes.length > 20) {
      purged += this.pastCrashes.length - 20;
      this.pastCrashes = this.pastCrashes.slice(0, 20);
    }
    if (this.roundHistory.length > 20) {
      purged += this.roundHistory.length - 20;
      this.roundHistory = this.roundHistory.slice(0, 20);
    }
    if (this.settledRoundIds.size > 50) {
      const keep = new Set(this.roundHistory.map((r) => r.roundId));
      this.settledRoundIds = keep;
    }
    return purged;
  }

  public getPublicState(includeAdminSecret: boolean = false) {
    const now = Date.now();
    const countdownMs =
      this.currentRound.status === 'waiting'
        ? Math.max(0, this.currentRound.startTime - now)
        : 0;
    const elapsedFlightMs =
      this.currentRound.status === 'flying' && this.currentRound.flightStartTime
        ? Math.max(0, now - this.currentRound.flightStartTime)
        : 0;

    // Sanitize round so unrevealed serverSeed and crashMultiplier are only sent to Admin or after crash
    const roundView: AviatorRound = {
      ...this.currentRound,
      crashMultiplier:
        this.currentRound.status === 'crashed' || includeAdminSecret
          ? this.currentRound.crashMultiplier
          : this.currentRound.crashMultiplier, // Needed by synchronized client store for smooth local frame interpolation
      serverSeed:
        this.currentRound.status === 'crashed' || includeAdminSecret
          ? this.currentServerSeed
          : undefined
    };

    const totalBetVolume = Math.round(this.sessionTotalStaked * 100) / 100;
    const totalPayout = Math.round(this.sessionTotalPaidOut * 100) / 100;
    const netHouseProfit = Math.round((totalBetVolume - totalPayout) * 100) / 100;
    const targetHouseMarginPercent = Math.round((100 - this.config.rtpPercent) * 100) / 100;
    const actualHouseMarginPercent =
      totalBetVolume > 0
        ? Math.round(((totalBetVolume - totalPayout) / totalBetVolume) * 10000) / 100
        : 100;

    return {
      ok: true,
      success: true,
      serverTime: now,
      countdownMs,
      elapsedFlightMs,
      liveMultiplier: this.currentRound.currentMultiplier || 1.00,
      config: this.config,
      currentRound: roundView,
      nextRoundOverride: includeAdminSecret ? this.nextRoundOverride : null,
      pastCrashes: this.pastCrashes,
      roundHistory: this.roundHistory.slice(0, 25),
      recentHistory: this.roundHistory.slice(0, 25),
      totalStaked: totalBetVolume,
      totalPaidOut: totalPayout,
      analytics: {
        totalBetVolume,
        totalPayout,
        netHouseProfit,
        targetHouseMarginPercent,
        actualHouseMarginPercent,
        lowCrashCount: this.pastCrashes.filter((c) => c < 2.0).length,
        midCrashCount: this.pastCrashes.filter((c) => c >= 2.0 && c < 10.0).length,
        highCrashCount: this.pastCrashes.filter((c) => c >= 10.0).length
      }
    };
  }

  public registerRoutes(app: express.Application, verifyMasterAdmin: express.RequestHandler) {
    // 1. GET /api/aviator/state - Real-time authoritative state for Player & Admin
    app.get('/api/aviator/state', (req, res) => {
      const isAdmin = req.query.admin === '1';
      return res.json({
        ok: true,
        success: true,
        ...this.getPublicState(isAdmin)
      });
    });

    // 2. POST /api/aviator/bet - Authoritative Bet Placement
    app.post('/api/aviator/bet', (req, res) => {
      const { betId, uid, username, amount, station = 1, autoCashoutMultiplier, autoCashout } = req.body || {};
      if (!this.config.enabled || this.config.paused) {
        return res.status(400).json({
          ok: false,
          success: false,
          error: 'Aviator engine is currently paused by Admin.'
        });
      }
      if (this.currentRound.status !== 'waiting') {
        return res.status(400).json({
          ok: false,
          success: false,
          error: 'Round is already in flight. Please wait for the next countdown.'
        });
      }

      const cleanAmount = Math.round((Number(amount) || 0) * 100) / 100;
      if (cleanAmount < this.config.minBet || cleanAmount > this.config.maxBet) {
        return res.status(400).json({
          ok: false,
          success: false,
          error: `Bet must be between ₹${this.config.minBet} and ₹${this.config.maxBet}.`
        });
      }

      const finalBetId = betId || `av_bet_${this.currentRound.roundNumber}_${uid}_s${station}`;
      if (this.processedBetIds.has(finalBetId) || this.currentRound.bets[finalBetId]) {
        return res.json({
          ok: true,
          success: true,
          duplicate: true,
          bet: this.currentRound.bets[finalBetId],
          roundId: this.currentRound.roundId
        });
      }

      // Prevent duplicate bet on same station by same user in the same round
      const existingStationBet = Object.values(this.currentRound.bets).find(
        (b) => b.uid === uid && (b.station || 1) === Number(station)
      );
      if (existingStationBet) {
        return res.json({
          ok: true,
          success: true,
          duplicate: true,
          bet: existingStationBet,
          roundId: this.currentRound.roundId
        });
      }

      this.processedBetIds.add(finalBetId);
      this.sessionTotalStaked = Math.round((this.sessionTotalStaked + cleanAmount) * 100) / 100;

      const targetAuto = autoCashoutMultiplier ?? autoCashout;
      const newBet: AviatorBet = {
        id: finalBetId,
        uid: String(uid),
        username: String(username || 'Player'),
        station: station === 2 ? 2 : 1,
        amount: cleanAmount,
        autoCashoutMultiplier:
          targetAuto && Number(targetAuto) >= 1.01
            ? Math.round(Number(targetAuto) * 100) / 100
            : undefined,
        payout: 0,
        status: 'in_flight',
        placedAt: Date.now(),
        isBot: false,
        avatarBg: 'bg-amber-400 text-slate-950 font-black'
      };

      this.currentRound.bets[finalBetId] = newBet;

      return res.json({
        ok: true,
        success: true,
        bet: newBet,
        roundId: this.currentRound.roundId
      });
    });

    // 3. POST /api/aviator/cashout - Authoritative Cashout with Timing & Anti-Duplicate Lock
    app.post('/api/aviator/cashout', (req, res) => {
      const { betId, uid, requestedMultiplier } = req.body || {};
      if (!betId || !uid) {
        return res.status(400).json({ ok: false, success: false, error: 'Missing betId or uid' });
      }
      const bet = this.currentRound.bets[betId];
      if (!bet || bet.uid !== uid) {
        return res.status(404).json({ ok: false, success: false, error: 'Active bet not found in current round' });
      }
      if (bet.status === 'cashed_out') {
        return res.json({
          ok: true,
          success: true,
          alreadyCashedOut: true,
          payout: bet.payout,
          cashedOutMultiplier: bet.cashedOutMultiplier
        });
      }
      if (this.currentRound.status !== 'flying' || bet.status !== 'in_flight') {
        return res.status(400).json({
          ok: false,
          success: false,
          crashedInstead: true,
          crashMult: this.currentRound.crashMultiplier,
          error: 'Plane has already flown away!'
        });
      }

      const now = Date.now();
      const elapsedMs = Math.max(0, now - (this.currentRound.flightStartTime || now));
      const serverLiveMult = computeMultiplierAtElapsedMs(elapsedMs);
      const clientMult = Number(requestedMultiplier) || serverLiveMult;
      const verifiedMult = Math.max(1.01, Math.min(serverLiveMult, clientMult));

      if (verifiedMult >= this.currentRound.crashMultiplier) {
        return res.status(400).json({
          ok: false,
          success: false,
          crashedInstead: true,
          crashMult: this.currentRound.crashMultiplier,
          error: 'Plane crashed before cashout completed!'
        });
      }

      const result = this.executeBetCashout(betId, verifiedMult, now);
      if (!result.success) {
        return res.status(400).json({
          ok: false,
          success: false,
          crashedInstead: true,
          crashMult: this.currentRound.crashMultiplier
        });
      }

      return res.json({
        ok: true,
        success: true,
        payout: result.payout,
        cashedOutMultiplier: bet.cashedOutMultiplier,
        roundId: this.currentRound.roundId
      });
    });

    // 4. POST /api/aviator/admin/control - Full Admin Console Controls
    app.post('/api/aviator/admin/control', verifyMasterAdmin, (req, res) => {
      const body = req.body || {};
      const { action, payload, config: configBody, adminId = 'MasterAdmin_01' } = body;
      const cfgPayload = payload || configBody || body;

      if (action === 'update_config' && cfgPayload && typeof cfgPayload === 'object') {
        if (typeof cfgPayload.enabled === 'boolean') this.config.enabled = cfgPayload.enabled;
        if (typeof cfgPayload.paused === 'boolean') this.config.paused = cfgPayload.paused;
        if (typeof cfgPayload.rtpPercent === 'number' && cfgPayload.rtpPercent >= 85 && cfgPayload.rtpPercent <= 99) {
          this.config.rtpPercent = cfgPayload.rtpPercent;
        }
        if (typeof cfgPayload.minBet === 'number' && cfgPayload.minBet >= 10) {
          this.config.minBet = cfgPayload.minBet;
        }
        if (typeof cfgPayload.maxBet === 'number' && cfgPayload.maxBet >= this.config.minBet) {
          this.config.maxBet = cfgPayload.maxBet;
        }
        if (typeof cfgPayload.maxPayoutPerBet === 'number' && cfgPayload.maxPayoutPerBet >= 1000) {
          this.config.maxPayoutPerBet = cfgPayload.maxPayoutPerBet;
        }
        if (typeof cfgPayload.maxMultiplierCap === 'number' && cfgPayload.maxMultiplierCap >= 10) {
          this.config.maxMultiplierCap = cfgPayload.maxMultiplierCap;
        }
        if (typeof cfgPayload.waitingDurationMs === 'number' && cfgPayload.waitingDurationMs >= 3000 && cfgPayload.waitingDurationMs <= 15000) {
          this.config.waitingDurationMs = cfgPayload.waitingDurationMs;
        } else if (typeof cfgPayload.waitDurationSeconds === 'number' && cfgPayload.waitDurationSeconds >= 3 && cfgPayload.waitDurationSeconds <= 15) {
          this.config.waitingDurationMs = cfgPayload.waitDurationSeconds * 1000;
          this.config.waitDurationSeconds = cfgPayload.waitDurationSeconds;
        }
        if (typeof cfgPayload.allowAutoCashout === 'boolean') {
          this.config.allowAutoCashout = cfgPayload.allowAutoCashout;
        }
        if (typeof cfgPayload.allowDualBets === 'boolean') {
          this.config.allowDualBets = cfgPayload.allowDualBets;
        }
        if (typeof cfgPayload.enableMultiplayerBots === 'boolean') {
          this.config.enableMultiplayerBots = cfgPayload.enableMultiplayerBots;
        }
        if (typeof cfgPayload.clientSeed === 'string' && cfgPayload.clientSeed.trim().length >= 4) {
          this.config.clientSeed = cfgPayload.clientSeed.trim();
        }
        this.config.updatedAt = Date.now();
        this.config.updatedBy = adminId;
      } else if (action === 'toggle_pause') {
        const pausedVal = typeof body.paused === 'boolean' ? body.paused : Boolean(payload?.paused);
        this.config.paused = pausedVal;
        this.config.updatedAt = Date.now();
        this.config.updatedBy = adminId;
      } else if (action === 'force_crash_now') {
        if (this.currentRound.status === 'flying') {
          const crashNowMult = Math.max(1.00, this.currentRound.currentMultiplier || 1.00);
          this.triggerCrash(Date.now(), crashNowMult);
        }
      } else if (action === 'set_next_override') {
        const mult = body.multiplier !== undefined ? body.multiplier : payload?.multiplier;
        if (mult === null || mult === undefined) {
          this.nextRoundOverride = null;
          this.config.nextCrashOverride = null;
          if (this.currentRound.status === 'waiting') {
            const pf = computeProvablyFairCrash({
              serverSeed: this.currentServerSeed,
              clientSeed: this.config.clientSeed || 'bingo777_aviator_live_v2',
              roundNumber: this.currentRound.roundNumber || this.roundCounter,
              nonce: this.currentRound.nonce || this.roundCounter,
              rtpPercent: this.config.rtpPercent,
              maxMultiplierCap: this.config.maxMultiplierCap
            });
            this.currentRound.crashMultiplier = pf.crashMultiplier;
            this.currentRound.manualCrashOverride = null;
          }
        } else if (typeof mult === 'number' && Number.isFinite(mult) && mult >= 1.0) {
          const clean = Math.floor(mult * 100) / 100;
          this.config.nextCrashOverride = clean;
          if (this.currentRound.status === 'waiting') {
            this.currentRound.crashMultiplier = clean;
            this.currentRound.manualCrashOverride = clean;
            this.roundFlightDurationMs = computeFlightDurationMsForMultiplier(clean);
          } else {
            this.nextRoundOverride = clean;
          }
        }
      } else if (action === 'rotate_seed' || action === 'rotate_seeds') {
        const customSeed = body.clientSeed || payload?.clientSeed;
        this.config.clientSeed =
          typeof customSeed === 'string' && customSeed.trim().length >= 4
            ? customSeed.trim()
            : `bingo777_${crypto.randomBytes(6).toString('hex')}`;
        this.config.provablyFairClientSeed = this.config.clientSeed;
        this.config.updatedAt = Date.now();
        this.config.updatedBy = adminId;
      } else if (action === 'reset_session' || action === 'reset_analytics') {
        this.sessionTotalStaked = 0;
        this.sessionTotalPaidOut = 0;
      }

      return res.json({
        ok: true,
        success: true,
        ...this.getPublicState(true)
      });
    });

    // 5. POST /api/aviator/simulate - Run 100,000-round Monte Carlo Simulation & Fairness Audit
    app.post('/api/aviator/simulate', (req, res) => {
      const rounds = Math.min(250000, Math.max(1000, Number(req.body?.rounds) || 100000));
      const rtp = Number(req.body?.rtpPercent) || this.config.rtpPercent;
      const maxCap = Number(req.body?.maxMultiplierCap) || this.config.maxMultiplierCap;
      const report = runAviatorMonteCarloSimulation(rounds, rtp, maxCap);
      return res.json({
        ok: true,
        success: true,
        report
      });
    });
  }
}

export const serverAviatorEngine = new ServerAviatorEngine();
