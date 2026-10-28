import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { rtdb, rtdbRef, rtdbOnValue, rtdbUpdate } from '../firebase';
import { AdminSettings, UpiChannel } from '../types';
import { store } from '../services/store';
import { firebaseSync } from '../services/firebaseSync';

export interface AdminSettingsContextValue {
  settings: AdminSettings;
  upiChannels: UpiChannel[];
  activeUpiChannel: UpiChannel;
  isStreamConnected: boolean;
  lastUpdatedAt: number;
  isMaintenanceActiveForUser: (uid?: string | null) => boolean;
  isGameEnabled: (gameId: string) => boolean;
  isFeatureEnabled: (featureId: string) => boolean;
  updateAdminSettingsAtomically: (changedData: Partial<AdminSettings>, adminId?: string) => Promise<void>;
}

const AdminSettingsContext = createContext<AdminSettingsContextValue | undefined>(undefined);

export const AdminSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AdminSettings>(() => ({ ...store.getAdminSettings() }));
  const [isStreamConnected, setIsStreamConnected] = useState<boolean>(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(() => Date.now());
  const [, setStoreTick] = useState<number>(0);

  // 1. Mount persistent onValue(ref(db, 'admin_settings')) stream at the app root upon boot
  useEffect(() => {
    const settingsRef = rtdbRef(rtdb, 'admin_settings');
    const unsubscribeRtdb = rtdbOnValue(
      settingsRef,
      (snapshot) => {
        setIsStreamConnected(true);
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            store.ingestCloudAdminSettings(val as Partial<AdminSettings>);
            setSettings({ ...store.getAdminSettings() });
            setLastUpdatedAt(Date.now());
          }
        } else {
          // Initialize /admin_settings in RTDB if node doesn't exist yet
          const initialSettings = store.getAdminSettings();
          firebaseSync.pushAdminSettingsToRtdb(initialSettings).catch(() => {});
        }
      },
      (err) => {
        console.warn('[AdminSettingsContext] RTDB stream notice:', err?.message || err);
      }
    );

    // 2. Subscribe to authoritative store updates so local & cloud changes re-render within <200ms
    const unsubscribeStore = store.subscribe(() => {
      setSettings({ ...store.getAdminSettings() });
      setStoreTick((t) => t + 1);
      setLastUpdatedAt(Date.now());
    });

    return () => {
      unsubscribeRtdb();
      unsubscribeStore();
    };
  }, []);

  const updateAdminSettingsAtomically = useCallback(
    async (changedData: Partial<AdminSettings>, adminId: string = 'MasterAdmin_01') => {
      if (!changedData || typeof changedData !== 'object') return;
      const timestampedChanges: Partial<AdminSettings> = {
        ...changedData,
        updatedAt: Date.now()
      };

      // Update local store and trigger callbacks immediately
      store.updateAdminSettings(timestampedChanges, adminId);
      setSettings({ ...store.getAdminSettings() });
      setLastUpdatedAt(Date.now());

      // Write directly to /admin_settings via atomic update(ref(db, 'admin_settings'), changedData)
      try {
        await rtdbUpdate(rtdbRef(rtdb, 'admin_settings'), timestampedChanges as Record<string, unknown>);
      } catch (err) {
        console.warn('[AdminSettingsContext] Atomic RTDB update notice:', err);
      }
    },
    []
  );

  const isMaintenanceActiveForUser = useCallback(
    (uid?: string | null): boolean => {
      if (!settings.maintenanceMode) return false;
      if (uid && Array.isArray(settings.maintenanceBypassUids) && settings.maintenanceBypassUids.includes(uid)) {
        return false;
      }
      return store.isMaintenanceActiveForUser(uid);
    },
    [settings]
  );

  const isGameEnabled = useCallback(
    (gameId: string): boolean => {
      if (settings.allGamesEnabled === false) return false;
      const g = gameId.toLowerCase();
      if ((g === 'wingo' || g.startsWith('wingo_')) && settings.wingoEnabled === false) return false;
      if (g === 'aviator' && settings.aviatorEnabled === false) return false;
      if ((g === 'k3_dice' || g === 'k3') && settings.k3Enabled === false) return false;
      if ((g === 'trx_wingo' || g === 'trx') && settings.trxEnabled === false) return false;
      if (g === 'ludo' && settings.ludoEnabled === false) return false;
      if (g === 'dragon_tiger' && settings.dragonTigerEnabled === false) return false;
      if ((g === 'quiz_battle' || g === 'live_quiz') && settings.liveQuizEnabled === false) return false;
      if (g === 'wheel' && settings.wheelEnabled === false) return false;
      return store.isFeatureEnabled(gameId);
    },
    [settings]
  );

  const isFeatureEnabled = useCallback(
    (featureId: string): boolean => {
      return store.isFeatureEnabled(featureId);
    },
    [settings]
  );

  const upiChannels = useMemo(() => store.getUpiChannels(), [settings]);
  const activeUpiChannel = useMemo(() => store.getActiveUpiChannel(), [settings]);

  const contextValue = useMemo<AdminSettingsContextValue>(
    () => ({
      settings,
      upiChannels,
      activeUpiChannel,
      isStreamConnected,
      lastUpdatedAt,
      isMaintenanceActiveForUser,
      isGameEnabled,
      isFeatureEnabled,
      updateAdminSettingsAtomically
    }),
    [
      settings,
      upiChannels,
      activeUpiChannel,
      isStreamConnected,
      lastUpdatedAt,
      isMaintenanceActiveForUser,
      isGameEnabled,
      isFeatureEnabled,
      updateAdminSettingsAtomically
    ]
  );

  return (
    <AdminSettingsContext.Provider value={contextValue}>
      {children}
    </AdminSettingsContext.Provider>
  );
};

export const useAdminSettings = (): AdminSettingsContextValue => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) {
    return {
      settings: store.getAdminSettings(),
      upiChannels: store.getUpiChannels(),
      activeUpiChannel: store.getActiveUpiChannel(),
      isStreamConnected: true,
      lastUpdatedAt: Date.now(),
      isMaintenanceActiveForUser: (uid?: string | null) => store.isMaintenanceActiveForUser(uid),
      isGameEnabled: (gameId: string) => store.isFeatureEnabled(gameId),
      isFeatureEnabled: (featureId: string) => store.isFeatureEnabled(featureId),
      updateAdminSettingsAtomically: async (changedData: Partial<AdminSettings>, adminId: string = 'MasterAdmin_01') => {
        store.updateAdminSettings(changedData, adminId);
        try {
          await rtdbUpdate(rtdbRef(rtdb, 'admin_settings'), {
            ...changedData,
            updatedAt: Date.now()
          } as Record<string, unknown>);
        } catch {}
      }
    };
  }
  return ctx;
};
