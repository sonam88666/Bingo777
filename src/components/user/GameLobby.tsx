import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Sparkles, 
  Plane, 
  Dice6, 
  Bomb, 
  Trophy, 
  Users, 
  ChevronRight, 
  Zap, 
  Coins, 
  Gift, 
  ShieldCheck, 
  Radio,
  Play,
  Award,
  Crown,
  RotateCw,
  Clock,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { GameId, UserRecord } from '../../types';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';

interface GameLobbyProps {
  user: UserRecord | null;
  onSelectGame: (gameId: GameId) => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
  onOpenGiftCode?: () => void;
  onOpenReferral?: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  user,
  onSelectGame,
  onOpenDeposit,
  onOpenAuth,
  onOpenGiftCode,
  onOpenReferral
}) => {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'lottery' | 'crash' | 'cards' | 'mines'>('all');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [, setStoreTick] = useState(0);

  // Subscribe to store so lobby immediately reflects games being enabled/disabled in real time
  useEffect(() => {
    return store.subscribe(() => {
      setStoreTick((t) => t + 1);
    });
  }, []);

  const handleSelectGameWithFeatureCheck = (gameId: GameId) => {
    if (!store.isFeatureEnabled(gameId) || !store.isFeatureVisible(gameId)) {
      showToast('This game is currently disabled by Master Admin. Please check back shortly or try another active game.', 'info');
      return;
    }
    onSelectGame(gameId);
  };

  // Progressive Jackpot live ticker
  const [jackpotAmount, setJackpotAmount] = useState(3842190.50);

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpotAmount((prev) => prev + Math.floor(Math.random() * 8) + 1.25);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const rawBanners = [
    {
      title: 'FIRST RECHARGE +100% BONUS',
      subtitle: 'Double your wallet instantly. Credited on UPI recharge with Admin verification.',
      code: 'WELCOME100',
      badge: 'VIP PROMOTION',
      gradient: 'from-amber-600 via-yellow-600 to-amber-950',
      tag: 'INSTANT CREDIT'
    },
    {
      gameId: 'aviator' as GameId,
      title: 'AVIATOR 100X FLIGHT TOURNAMENT',
      subtitle: 'Cash out before the plane crashes! Daily ₹5,00,000 prize pool.',
      code: 'HOT CRASH',
      badge: 'TRENDING 100X',
      gradient: 'from-rose-600 via-red-700 to-slate-950',
      tag: 'HIGH ROLLER'
    },
    {
      gameId: 'trx_wingo' as GameId,
      title: 'TRX WIN GO PROVABLY FAIR',
      subtitle: 'Public cryptographic Tron block hash lottery. 100% transparent draws.',
      code: 'CRYPTO LOTRE',
      badge: 'BLOCKCHAIN FAIR',
      gradient: 'from-cyan-700 via-blue-800 to-slate-950',
      tag: 'TRON HASH'
    },
    {
      gameId: 'wingo' as GameId,
      title: 'WIN GO 1-MINUTE COLOR PREDICTION',
      subtitle: 'Green, Violet, Red & Numbers 0-9 with 9x multiplier!',
      code: 'PROVABLY FAIR',
      badge: 'MOST POPULAR',
      gradient: 'from-emerald-600 via-teal-700 to-slate-950',
      tag: 'ROUND 24/7'
    },
    {
      gameId: 'dragon_tiger' as GameId,
      title: 'DRAGON VS TIGER 3D ROYAL ARENA',
      subtitle: '3D Casino Card Showdown! 1:1 Dragon/Tiger, 9X Tie & 50X Suited Tie.',
      code: '3D CASINO',
      badge: 'NEW 3D TABLE',
      gradient: 'from-red-700 via-amber-600 to-slate-950',
      tag: '50X SUITED TIE'
    }
  ];

  // Only show banners for games that are actively enabled
  const banners = rawBanners.filter((b) => {
    if (!b.gameId) return true;
    return store.isFeatureEnabled(b.gameId) && store.isFeatureVisible(b.gameId);
  });

  // Rotate banner every 4.5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const liveWinners = [
    { user: 'Member 98***10', game: 'TRX Win Go', amount: '₹18,500', avatar: 'T' },
    { user: 'Member 91***88', game: 'Aviator', amount: '₹42,300', avatar: 'A' },
    { user: 'Member 89***45', game: 'Win Go 1m', amount: '₹9,800', avatar: 'W' },
    { user: 'Member 97***32', game: 'K3 Lotre', amount: '₹25,000', avatar: 'K' },
    { user: 'Member 93***19', game: 'Win Go 3m', amount: '₹14,200', avatar: 'W' },
    { user: 'Member 99***76', game: 'Aviator', amount: '₹31,600', avatar: 'A' }
  ];

  // Complete games catalog (Only provably-fair shared lottery & crash games)
  const games = [
    {
      id: 'wingo' as GameId,
      title: 'Win Go',
      subtitle: 'Color & Number Prediction',
      category: 'lottery',
      multiplier: '9.0X',
      tag: 'HOT',
      playersCount: '34,180',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      bgGradient: 'from-emerald-950 via-slate-900 to-slate-950',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      accentColor: 'text-emerald-400',
      icon: Flame,
      previewBadge: '1m / 3m / 5m',
      iconBg: 'from-emerald-500 to-teal-700'
    },
    {
      id: 'aviator' as GameId,
      title: 'Aviator Crash',
      subtitle: 'Rocket Multiplier Cashout',
      category: 'crash',
      multiplier: '100.0X',
      tag: 'TRENDING',
      playersCount: '48,920',
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      bgGradient: 'from-rose-950 via-slate-900 to-slate-950',
      borderColor: 'border-rose-500/30 hover:border-rose-400',
      accentColor: 'text-rose-400',
      icon: Plane,
      previewBadge: 'Auto Cashout',
      iconBg: 'from-rose-500 to-red-700'
    },
    {
      id: 'k3_dice' as GameId,
      title: 'K3 Lotre',
      subtitle: '3-Dice Sum & Combinations',
      category: 'lottery',
      multiplier: '240.0X',
      tag: 'LOTRE',
      playersCount: '14,350',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      bgGradient: 'from-purple-950 via-slate-900 to-slate-950',
      borderColor: 'border-purple-500/30 hover:border-purple-400',
      accentColor: 'text-purple-400',
      icon: Dice6,
      previewBadge: 'Sum 3-18',
      iconBg: 'from-purple-600 to-fuchsia-700'
    },
    {
      id: 'trx_wingo' as GameId,
      title: 'TRX Win Go',
      subtitle: 'Blockchain Hash Prediction',
      category: 'lottery',
      multiplier: '9.0X',
      tag: 'CRYPTO',
      playersCount: '10,900',
      tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      bgGradient: 'from-cyan-950 via-slate-900 to-slate-950',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
      accentColor: 'text-cyan-400',
      icon: Zap,
      previewBadge: 'Tron Hash',
      iconBg: 'from-cyan-600 to-blue-700'
    },
    {
      id: 'ludo' as GameId,
      title: 'Ludo 1v1 Battle',
      subtitle: 'Skill-Based Live Cash Game',
      category: 'cards',
      multiplier: '2.0X',
      tag: 'LEGAL',
      playersCount: '28,450',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      bgGradient: 'from-amber-950 via-slate-900 to-slate-950',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      accentColor: 'text-amber-400',
      icon: Dice6,
      previewBadge: '10% House Margin',
      iconBg: 'from-amber-500 to-yellow-700'
    },
    {
      id: 'dragon_tiger' as GameId,
      title: 'Dragon Tiger 3D',
      subtitle: '3D Royal Card Battle Arena',
      category: 'cards',
      multiplier: '50.0X',
      tag: '3D LIVE',
      playersCount: '31,640',
      tagColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      bgGradient: 'from-red-950 via-amber-950/60 to-slate-950',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      accentColor: 'text-amber-400',
      icon: Crown,
      previewBadge: '1:1 · 9X Tie · 50X Suited',
      iconBg: 'from-red-600 via-orange-500 to-amber-500'
    },
    {
      id: 'quiz_battle' as GameId,
      title: 'Live Quiz Battle',
      subtitle: 'Auto News YES/NO Quiz',
      category: 'cards',
      multiplier: '1.90X',
      tag: 'AUTO LIVE',
      playersCount: '19,820',
      tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      bgGradient: 'from-indigo-950 via-slate-900 to-slate-950',
      borderColor: 'border-indigo-500/30 hover:border-indigo-400',
      accentColor: 'text-indigo-400',
      icon: Trophy,
      previewBadge: '5 Categories · 1.90X Win',
      iconBg: 'from-indigo-500 to-purple-700'
    }
  ];

  const filteredGames = games.filter((g) => {
    // If disabled or marked not visible by Master Admin, hide completely from lobby
    if (!store.isFeatureEnabled(g.id) || !store.isFeatureVisible(g.id)) return false;
    if (selectedCategory === 'all') return true;
    return g.category === selectedCategory;
  });

  const activeBanner = banners.length > 0 ? banners[activeBannerIndex % banners.length] : null;
  const showJackpotBanner = store.isFeatureEnabled('jackpot_banner');
  const showHeroCarousel = store.isFeatureEnabled('hero_carousel') && Boolean(activeBanner);
  const showWinnersTicker = store.isFeatureEnabled('live_winners_ticker');
  const showGiftCodes = store.isFeatureEnabled('gift_codes');

  // Quick Action feature chips dynamically filtered by active enabled games
  const quickActionItems = [
    { id: 'wingo' as GameId, label: 'Win Go', icon: Flame, color: 'text-emerald-400 bg-emerald-500/10 hover:border-emerald-500/40' },
    { id: 'aviator' as GameId, label: 'Aviator', icon: Plane, color: 'text-rose-400 bg-rose-500/10 hover:border-rose-500/40' },
    { id: 'dragon_tiger' as GameId, label: 'Dragon 3D', icon: Crown, color: 'text-orange-400 bg-orange-500/15 hover:border-orange-400' },
    { id: 'ludo' as GameId, label: 'Ludo 1v1', icon: Dice6, color: 'text-amber-400 bg-amber-500/15 hover:border-amber-400' },
    { id: 'trx_wingo' as GameId, label: 'TRX Win', icon: Zap, color: 'text-sky-400 bg-sky-500/10 hover:border-sky-500/40' },
    { id: 'quiz_battle' as GameId, label: 'Live Quiz', icon: Trophy, color: 'text-indigo-400 bg-indigo-500/10 hover:border-indigo-500/40' },
    { id: 'k3_dice' as GameId, label: 'K3 Lotre', icon: Dice6, color: 'text-purple-400 bg-purple-500/10 hover:border-purple-500/40' }
  ].filter((item) => store.isFeatureEnabled(item.id) && store.isFeatureVisible(item.id));

  // Category filter tabs only shown if at least 1 game in that category is active
  const categoryTabs = [
    { id: 'all', label: '🔥 All Games' },
    { id: 'lottery', label: '🎨 Win Go & Lotre' },
    { id: 'crash', label: '✈️ Aviator Crash' },
    { id: 'cards', label: '🃏 Dragon 3D, Ludo & Quiz' }
  ].filter((cat) => {
    if (cat.id === 'all') return true;
    return games.some(
      (g) => g.category === cat.id && store.isFeatureEnabled(g.id) && store.isFeatureVisible(g.id)
    );
  });

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-3 space-y-4">
      {/* 1. Grand Progressive Jackpot Live Ticker Box */}
      {showJackpotBanner && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 p-3 sm:p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30">
              <Crown className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center space-x-1">
                <span>GRAND JACKPOT</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </span>
              <div className="font-mono font-black text-lg sm:text-xl text-yellow-300 tracking-wider">
                ₹{jackpotAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenDeposit}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition flex items-center space-x-1"
          >
            <span>Recharge</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Luxury Animated Hero Carousel Banner */}
      {showHeroCarousel && activeBanner && (
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${activeBanner.gradient} p-5 sm:p-6 shadow-2xl transition-all duration-700 border border-amber-400/30`}>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-black text-amber-300 tracking-wider border border-amber-400/30">
                {activeBanner.badge}
              </span>
              <span className="text-[10px] font-mono text-amber-100 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                {activeBanner.tag}
              </span>
            </div>

            <h2 className="font-brand font-black text-xl sm:text-2xl text-slate-100 tracking-wide leading-tight">
              {activeBanner.title}
            </h2>

            <p className="text-xs text-amber-100/90 leading-relaxed max-w-sm">
              {activeBanner.subtitle}
            </p>

            <div className="pt-2 flex items-center space-x-2">
              {user ? (
                <button
                  onClick={onOpenDeposit}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs shadow-lg active:scale-95 transition border border-amber-500/30 flex items-center space-x-1.5"
                >
                  <span>Recharge & Play</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs shadow-lg active:scale-95 transition border border-amber-500/30 flex items-center space-x-1.5"
                >
                  <span>Register & Claim</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Carousel Indicator Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 right-4 flex space-x-1.5 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBannerIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeBannerIndex === i ? 'w-5 bg-white shadow-md' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Quick Action Feature Chips Row (Only Active Games) */}
      {(quickActionItems.length > 0 || showGiftCodes) && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {quickActionItems.map((chip) => {
            const ChipIcon = chip.icon;
            return (
              <button
                key={chip.id}
                onClick={() => handleSelectGameWithFeatureCheck(chip.id)}
                className="flex-1 min-w-[76px] p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center space-y-1 shadow-md active:scale-95 transition group"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${chip.color} group-hover:scale-110 transition`}>
                  <ChipIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 whitespace-nowrap">{chip.label}</span>
              </button>
            );
          })}

          {showGiftCodes && (
            <button
              onClick={() => {
                if (onOpenGiftCode) onOpenGiftCode();
                else onOpenDeposit();
              }}
              className="flex-1 min-w-[76px] p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 flex flex-col items-center justify-center space-y-1 shadow-md active:scale-95 transition group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
                <Gift className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-300 whitespace-nowrap">Gift Code</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Live Winner Ticker Marquee */}
      {showWinnersTicker && (
        <div className="p-2.5 rounded-2xl bg-slate-900/95 border border-slate-800 flex items-center space-x-2.5 overflow-hidden shadow-inner">
          <div className="flex items-center space-x-1 text-amber-400 font-bold text-xs shrink-0 pl-1">
            <Trophy className="w-4 h-4" />
            <span className="hidden xs:inline">Live Wins:</span>
          </div>
          <div className="flex-1 overflow-x-auto no-scrollbar flex items-center space-x-3.5 text-xs">
            {liveWinners.map((w, i) => (
              <div key={i} className="flex items-center space-x-1.5 whitespace-nowrap shrink-0">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-black text-amber-300 flex items-center justify-center">
                  {w.avatar}
                </span>
                <span className="text-slate-300 text-[11px] font-medium">{w.user}</span>
                <span className="text-[10px] text-slate-500">[{w.game}]</span>
                <span className="font-mono font-bold text-emerald-400 text-xs">+{w.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Game Categories Filter Tabs */}
      {categoryTabs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categoryTabs.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-950/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* 6. Stunning 2-Column Responsive Game Cards Grid (Only Active Games Rendered) */}
      {filteredGames.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-200">No active games in this category</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            These games have been temporarily paused by Master Admin. Please check back shortly or explore other categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredGames.map((game) => {
            const Icon = game.icon;
            return (
              <div
                key={game.id}
                onClick={() => handleSelectGameWithFeatureCheck(game.id)}
                className={`group cursor-pointer rounded-3xl bg-gradient-to-b ${game.bgGradient} border ${game.borderColor} p-4 shadow-xl transition-all duration-200 active:scale-95 hover:shadow-2xl flex flex-col justify-between`}
              >
                {/* Card Top: Icon & Tags */}
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${game.iconBg} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition duration-200 border border-white/20`}>
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${game.tagColor}`}>
                    {game.tag}
                  </span>
                </div>

                {/* Card Middle: Title & Multiplier */}
                <div className="mt-3.5 space-y-1">
                  <h3 className="font-brand font-black text-sm sm:text-base text-slate-100 group-hover:text-amber-300 transition leading-tight">
                    {game.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {game.subtitle}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {game.previewBadge}
                    </span>
                    <span className="text-amber-400 font-mono font-black text-xs">
                      {game.multiplier}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Active Players & Play CTA */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 flex items-center space-x-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>{game.playersCount}</span>
                  </span>

                  <button
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] shadow transition flex items-center space-x-0.5 group-hover:scale-105"
                  >
                    <span>PLAY</span>
                    <Play className="w-2.5 h-2.5 fill-slate-950" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
