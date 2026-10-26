import React, { useState, useEffect } from 'react';
import { Home, Flame, Plane, Wallet, User as UserIcon, Gift } from 'lucide-react';
import { store } from '../../services/store';

export type TabId = 'home' | 'wingo' | 'aviator' | 'activity' | 'wallet' | 'account';

interface BottomNavProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  unreadSupportCount?: number;
  onSecretAdminTrigger?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, unreadSupportCount = 0, onSecretAdminTrigger }) => {
  const [, setStoreTick] = useState(0);
  const [activityClickCount, setActivityClickCount] = useState(0);
  const [activityClickTimer, setActivityClickTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setStoreTick((t) => t + 1);
    });
  }, []);

  const showWingo = store.isFeatureEnabled('wingo') && store.isFeatureVisible('wingo');
  const showAviator = store.isFeatureEnabled('aviator') && store.isFeatureVisible('aviator');

  const tabs = [
    { id: 'home' as TabId, label: 'Lobby', icon: Home },
    ...(showWingo ? [{ id: 'wingo' as TabId, label: 'Win Go', icon: Flame, badge: 'HOT' }] : []),
    ...(showAviator ? [{ id: 'aviator' as TabId, label: 'Aviator', icon: Plane, highlight: true }] : []),
    { id: 'activity' as TabId, label: 'Activity', icon: Gift },
    { id: 'wallet' as TabId, label: 'Wallet', icon: Wallet },
    { id: 'account' as TabId, label: 'Account', icon: UserIcon, alert: unreadSupportCount > 0 }
  ];

  const handleTabClick = (tabId: TabId) => {
    if (tabId === 'activity') {
      const nextCount = activityClickCount + 1;
      setActivityClickCount(nextCount);
      if (activityClickTimer) clearTimeout(activityClickTimer);
      const timer = setTimeout(() => {
        setActivityClickCount(0);
      }, 2000);
      setActivityClickTimer(timer);

      if (nextCount >= 13) {
        setActivityClickCount(0);
        if (activityClickTimer) clearTimeout(activityClickTimer);
        if (onSecretAdminTrigger) {
          onSecretAdminTrigger();
          return;
        }
      }
    } else {
      setActivityClickCount(0);
      if (activityClickTimer) clearTimeout(activityClickTimer);
    }
    onChangeTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-amber-500/20 py-1.5 px-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.highlight) {
            // Central highlighted Aviator action button
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="relative -top-3.5 flex flex-col items-center group focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-95 border ${
                  isActive
                    ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 border-amber-300 text-white shadow-rose-600/40 scale-105'
                    : 'bg-gradient-to-tr from-slate-900 to-rose-950 border-rose-500/40 text-rose-400 hover:scale-105'
                }`}>
                  <Plane className="w-6 h-6 animate-pulse" />
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-tight ${
                  isActive ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition-all duration-200 focus:outline-none ${
                isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full bg-rose-500 text-white text-[8px] font-black uppercase">
                    {tab.badge}
                  </span>
                )}
                {tab.alert && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <span className={`text-[10px] font-medium mt-1 ${isActive ? 'font-bold text-amber-300' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
