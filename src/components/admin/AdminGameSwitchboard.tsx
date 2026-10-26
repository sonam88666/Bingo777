import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  CheckCircle2,
  XCircle,
  Flame,
  Plane,
  Dice6,
  Zap,
  Swords,
  Sparkles,
  Trophy,
  Power,
  Play,
  Pause,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Layers,
  Check,
  X
} from 'lucide-react';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';

interface AdminGameSwitchboardProps {
  adminId?: string;
  masterToken?: string;
  showTitle?: boolean;
}

interface GameDefinition {
  id: string;
  title: string;
  category: string;
  description: string;
  multiplier: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  badgeText: string;
  submodes?: Array<{ id: string; label: string }>;
}

export const AdminGameSwitchboard: React.FC<AdminGameSwitchboardProps> = ({
  adminId = 'MasterAdmin_01',
  masterToken,
  showTitle = true
}) => {
  const { showToast } = useToast();
  const [featureModules, setFeatureModules] = useState(() => store.getFeatureModules());
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const tokenToUse = masterToken || sessionStorage.getItem('bingo777_master_admin_token') || 'BINGO_MASTER_2026_KEY';

  useEffect(() => {
    return store.subscribe(() => {
      setFeatureModules({ ...store.getFeatureModules() });
    });
  }, []);

  const gamesCatalog: GameDefinition[] = [
    {
      id: 'wingo',
      title: 'Win Go Color Prediction',
      category: 'Lottery',
      description: 'Core 0-9 number, Green/Violet/Red color and Big/Small lottery draw engine.',
      multiplier: '9.0X Max',
      icon: Flame,
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      badgeText: 'HOT 9X',
      submodes: [
        { id: 'wingo_30s', label: '30s Fast' },
        { id: 'wingo_1min', label: '1m Standard' },
        { id: 'wingo_3min', label: '3m Strategic' }
      ]
    },
    {
      id: 'aviator',
      title: 'Aviator Crash Multiplier',
      category: 'Crash / Multiplier',
      description: 'Real-time curve rocket flight crash multiplier with instant cashout.',
      multiplier: '100.0X Max',
      icon: Plane,
      iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      badgeText: '100X CRASH'
    },
    {
      id: 'k3_dice',
      title: 'K3 Lotre 3-Dice Game',
      category: 'Dice Lottery',
      description: '3-Dice sum (3-18), Big/Small, Odd/Even, and combination lottery engine.',
      multiplier: '240.0X Max',
      icon: Dice6,
      iconBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      badgeText: '240X DICE'
    },
    {
      id: 'trx_wingo',
      title: 'TRX Hash Win Go',
      category: 'Blockchain Crypto',
      description: 'Cryptographic public Tron blockchain block-hash color & number prediction.',
      multiplier: '9.0X Max',
      icon: Zap,
      iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      badgeText: 'TRON HASH'
    },
    {
      id: 'ludo',
      title: 'Ludo 1v1 Battle',
      category: 'Skill Multiplayer',
      description: 'Real-time 1v1 multiplayer cash Ludo with live voice/text chat & 10% house margin.',
      multiplier: '2.0X Win',
      icon: Swords,
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      badgeText: 'LIVE 1V1'
    },
    {
      id: 'wheel',
      title: 'Fortune Wheel (Lucky Spin)',
      category: 'Instant Spin',
      description: 'High-frequency spinning wheel with instant multiplier cash prizes and bonus tiles.',
      multiplier: '50.0X Max',
      icon: Sparkles,
      iconBg: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
      badgeText: 'LUCKY SPIN'
    },
    {
      id: 'quiz_battle',
      title: 'Live Quiz Battle',
      category: 'Auto News Polls',
      description: 'Automated AI news-driven YES/NO live quiz poll battle with 15% house margin pool distribution.',
      multiplier: '1.90X Pool',
      icon: Trophy,
      iconBg: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      badgeText: 'LIVE QUIZ'
    }
  ];

  // Calculate active games stats
  const activeGamesCount = gamesCatalog.filter((g) => {
    const mod = featureModules[g.id];
    return mod ? mod.enabled && mod.status === 'active' : true;
  }).length;
  const allActive = activeGamesCount === gamesCatalog.length;
  const allDisabled = activeGamesCount === 0;

  // 1-Click Toggle Individual Game
  const handleToggleGame = async (gameId: string, currentEnabled: boolean, gameTitle: string) => {
    const nextEnabled = !currentEnabled;
    const visible = nextEnabled;

    const res = store.toggleFeatureModule(
      gameId,
      nextEnabled,
      visible,
      adminId,
      `Master Admin 1-click toggled ${gameTitle} (${gameId}) to ${nextEnabled ? 'ENABLED' : 'DISABLED'}`
    );

    if (res.success) {
      await apiClient
        .toggleFeature(
          gameId,
          nextEnabled,
          visible,
          `Master Admin 1-click switch`,
          adminId,
          tokenToUse
        )
        .catch(() => {});

      showToast(
        `${gameTitle} is now ${nextEnabled ? 'ACTIVE (Visible in Lobby)' : 'DISABLED (Hidden from Lobby)'}`,
        nextEnabled ? 'success' : 'info'
      );
    } else {
      showToast(res.error || 'Failed to toggle game', 'error');
    }
  };

  // 1-Click Toggle Submode (e.g. Win Go 30s, 1m, 3m)
  const handleToggleSubmode = async (submodeId: string, label: string) => {
    const existing = featureModules[submodeId];
    const currentEnabled = existing ? existing.enabled && existing.status === 'active' : true;
    const nextEnabled = !currentEnabled;

    const res = store.toggleFeatureModule(
      submodeId,
      nextEnabled,
      true,
      adminId,
      `Master Admin toggled ${label} mode to ${nextEnabled ? 'ON' : 'OFF'}`
    );

    if (res.success) {
      await apiClient
        .toggleFeature(submodeId, nextEnabled, true, 'Win Go submode switch', adminId, tokenToUse)
        .catch(() => {});
      showToast(`${label} interval ${nextEnabled ? 'Enabled' : 'Paused'}`, 'info');
    }
  };

  // 1-Click Enable All Games
  const handleEnableAllGames = async () => {
    setIsUpdatingAll(true);
    const res = store.toggleAllGames(true, adminId, 'Master Admin 1-click ENABLE ALL GAMES button');
    await apiClient.toggleAllGames(true, adminId, tokenToUse).catch(() => {});
    setIsUpdatingAll(false);

    if (res.success) {
      showToast('All games enabled successfully! All modules accepting bets.', 'success');
    } else {
      showToast('Error enabling all games', 'error');
    }
  };

  // 1-Click Disable All Games
  const handleDisableAllGames = async () => {
    setIsUpdatingAll(true);
    const res = store.toggleAllGames(false, adminId, 'Master Admin 1-click DISABLE ALL GAMES button');
    await apiClient.toggleAllGames(false, adminId, tokenToUse).catch(() => {});
    setIsUpdatingAll(false);

    if (res.success) {
      showToast('All games disabled! Betting temporarily paused across all modules.', 'info');
    } else {
      showToast('Error disabling all games', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & 1-Click Master Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-emerald-500/10 via-amber-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            {showTitle && (
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-brand font-black text-slate-100 text-lg sm:text-xl tracking-tight">
                    All Games Live Switchboard
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enable or disable any game anytime with a single click. Instant user app sync.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2.5 mt-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center space-x-1.5 ${
                allActive
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : allDisabled
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  allActive ? 'bg-emerald-400 animate-pulse' : allDisabled ? 'bg-rose-400' : 'bg-amber-400 animate-ping'
                }`} />
                <span>
                  {activeGamesCount} of {gamesCatalog.length} Games Active
                </span>
              </span>

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                • 1-Click real-time control
              </span>
            </div>
          </div>

          {/* Quick Action 1-Click Master Buttons */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              type="button"
              disabled={isUpdatingAll || allActive}
              onClick={handleEnableAllGames}
              className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-900/30 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
              title="1-Click: Enable every game simultaneously"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Enable All Games</span>
            </button>

            <button
              type="button"
              disabled={isUpdatingAll || allDisabled}
              onClick={handleDisableAllGames}
              className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-950/40 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
              title="1-Click: Disable every game simultaneously"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Disable All Games</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of All Games with Individual 1-Click Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {gamesCatalog.map((game) => {
          const mod = featureModules[game.id];
          const isEnabled = mod ? mod.enabled && mod.status === 'active' : true;
          const Icon = game.icon;

          return (
            <div
              key={game.id}
              className={`p-4 rounded-3xl border transition-all duration-200 shadow-xl flex flex-col justify-between ${
                isEnabled
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/80 border-rose-950/60 opacity-85'
              }`}
            >
              <div>
                {/* Top Row: Icon + Title + Status Badge + 1-Click Switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${game.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-brand font-bold text-slate-100 text-sm truncate">
                          {game.title}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-slate-800 text-amber-300 border border-slate-700 shrink-0">
                          {game.multiplier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {game.category} • ID: <code className="text-amber-400 font-mono">{game.id}</code>
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Toggle Switch */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      onClick={() => handleToggleGame(game.id, isEnabled, game.title)}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-700'
                      }`}
                      title={isEnabled ? `Click to Disable ${game.title}` : `Click to Enable ${game.title}`}
                    >
                      <span
                        className={`pointer-events-none inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      >
                        {isEnabled ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400 stroke-[3]" />
                        )}
                      </span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2">
                  {game.description}
                </p>

                {/* Submodes if present (e.g. Win Go intervals) */}
                {game.submodes && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center space-x-2 flex-wrap gap-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Intervals:
                    </span>
                    {game.submodes.map((sub) => {
                      const subMod = featureModules[sub.id];
                      const subEnabled = subMod ? subMod.enabled && subMod.status === 'active' : true;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleToggleSubmode(sub.id, sub.label)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                            subEnabled && isEnabled
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                              : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {sub.label} {subEnabled && isEnabled ? '✓' : '✗'}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center space-x-1 ${
                  isEnabled
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  <span>{isEnabled ? 'ACCEPTING BETS' : 'GAME DISABLED'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleGame(game.id, isEnabled, game.title)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                    isEnabled
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{isEnabled ? 'Disable Game' : 'Enable Game'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
