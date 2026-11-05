import React, { useState, useEffect } from 'react';
import {
  Save,
  DollarSign,
  ShieldCheck,
  Megaphone,
  Gift,
  Sliders,
  AlertTriangle,
  Clock,
  Wrench,
  CheckCircle2,
  Smartphone,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Radio,
  Flame,
  ShieldAlert,
  Key,
  Lock,
  Eye,
  EyeOff,
  UserX,
  Globe,
  ArrowRightLeft,
  RefreshCw,
  UserPlus,
  Volume2,
  VolumeX,
  Music,
  Zap,
  Upload
} from 'lucide-react';
import { AdminSettings, UpiChannel, AppPopupConfig, AdSlideItem, UserRecord, AuthConfig, CurrencyConverterConfig, AudioSystemConfig } from '../../types';
import { SUPPORTED_CURRENCIES, FALLBACK_RATES_FROM_INR } from '../user/WalletView';
import { store } from '../../services/store';
import { firebaseSync } from '../../services/firebaseSync';
import { soundFx } from '../../services/soundFx';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';
import { AdminTelegramSupport } from './AdminTelegramSupport';
import {
  rtdb,
  rtdbRef,
  rtdbGet,
  rtdbSet,
  rtdbUpdate,
  rtdbOnValue,
  rtdbRemove
} from '../../firebase';

interface AdminSettingsProps {
  adminId: string;
}

const DEFAULT_AUTH_CONFIG: AuthConfig = {
  otpLoginEnabled: true,
  passwordLoginEnabled: true,
  directLoginEnabled: true,
  allowNewUserSignup: true,
  defaultAuthTab: 'login',
  defaultLoginMethod: 'otp',
  showNameFieldOnSignup: false,
  showReferralFieldOnSignup: true,
  requireReferralOnSignup: false,
  minPasswordLength: 4,
  loginPageTitle: 'Player Access Portal',
  loginPageSubtitle: 'Instant Wallet & Refer & Earn Commission',
  signupBannerText: 'Get ₹50 Signup Bonus + ₹120 Per Refer + 3-Tier Refer & Earn Commission!',
  loginButtonText: 'Access My Account',
  signupButtonText: 'Create Account & Claim Bonus',
};

const DEFAULT_CURRENCY_CONFIG: CurrencyConverterConfig = {
  enabled: true,
  defaultCurrency: 'USD',
  rateMode: 'live_api',
  rateAdjustmentPercent: 0,
  enabledCurrencies: ['INR', 'USD', 'EUR', 'GBP', 'AED', 'BDT', 'NPR', 'SGD', 'AUD', 'CAD', 'USDT'],
  customRatesFromInr: { ...FALLBACK_RATES_FROM_INR },
  showInWalletDashboard: true,
  showBreakdownConversion: true,
  allowUserCurrencySwitch: true,
};

const DEFAULT_AUDIO_CONFIG: AudioSystemConfig = {
  enabled: true,
  allowUserAudioControls: true,
  sfxAllowed: true,
  bgmAllowed: true,
  defaultSfxEnabled: true,
  defaultBgmEnabled: false,
  defaultSfxVolume: 0.8,
  defaultBgmVolume: 0.5,
};

export const AdminSettingsPanel: React.FC<AdminSettingsProps> = ({ adminId }) => {
  const { showToast } = useToast();
  const [formState, setFormState] = useState<AdminSettings>(store.getAdminSettings());
  const [, setTick] = useState(0);
  const [selectedCandidateUid, setSelectedCandidateUid] = useState<string>('');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');

  // Multiple UPI Management Form State
  const [newUpiId, setNewUpiId] = useState('');
  const [newUpiMerchantName, setNewUpiMerchantName] = useState('');
  const [newUpiLabel, setNewUpiLabel] = useState('');
  const [newUpiSetAsActive, setNewUpiSetAsActive] = useState(false);

  // 📢 Live Admin Ads, Offers, Discounts & App Update Popup System State (/admin_settings/app_popup & /admin_settings/ad_slides)
  const [appPopup, setAppPopup] = useState<AppPopupConfig>({
    enabled: false,
    title: 'Special ₹200 Welcome Bonus + 100% Deposit Offer!',
    message: 'New Sign-Up gets ₹200 instant bonus! Recharge now and get 100% Extra Deposit Bonus credited to your wallet.',
    badgeText: 'VIP SPECIAL OFFER',
    discountTag: '100% EXTRA + ₹200 BONUS',
    popupType: 'deposit_offer',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    buttonText: 'Claim Offer Now',
    actionUrl: 'deposit',
    showEveryTime: false
  });
  const [isSavingPopup, setIsSavingPopup] = useState(false);

  // 🖼️ Custom Lobby Ad Slides State (/admin_settings/ad_slides)
  const [adSlides, setAdSlides] = useState<AdSlideItem[]>(() => store.getAdminSettings().ad_slides || []);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideBadge, setNewSlideBadge] = useState('VIP OFFER');
  const [newSlideTag, setNewSlideTag] = useState('100% DISCOUNT');
  const [newSlideImageUrl, setNewSlideImageUrl] = useState('');
  const [newSlideButtonText, setNewSlideButtonText] = useState('Claim Offer');
  const [newSlideActionUrl, setNewSlideActionUrl] = useState('deposit');
  const [includeSlidesInPopup, setIncludeSlidesInPopup] = useState(false);

  // 🔐 High-Security Admin Access & Device Lock State (/admin_security)
  const [allowedPhones, setAllowedPhones] = useState<Record<string, { phone: string; name?: string; addedAt?: number }>>({});
  const [allowedDevices, setAllowedDevices] = useState<Record<string, { deviceId: string; phone?: string; pairedAt?: number; status?: string; deviceName?: string }>>({});
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPhoneName, setNewAdminPhoneName] = useState('');
  const [masterAdminPassInput, setMasterAdminPassInput] = useState('Anchal@8877@@!');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // 📱 Full Sign Up & Login Page Configuration State (/admin_settings/auth_config)
  const [authConfig, setAuthConfig] = useState<AuthConfig>(() => ({
    ...DEFAULT_AUTH_CONFIG,
    ...(store.getAdminSettings().auth_config || {}),
    showNameFieldOnSignup: false,
  }));
  const [otpLoginEnabled, setOtpLoginEnabled] = useState<boolean>(() => {
    return store.getAdminSettings().auth_config?.otpLoginEnabled ?? true;
  });
  const [isUpdatingOtpToggle, setIsUpdatingOtpToggle] = useState<boolean>(false);
  const [isSavingAuthConfig, setIsSavingAuthConfig] = useState<boolean>(false);

  // 🌐 Full Real-Time Currency Converter Configuration State (/admin_settings/currency_config)
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConverterConfig>(() => ({
    ...DEFAULT_CURRENCY_CONFIG,
    ...(store.getAdminSettings().currency_config || {}),
    customRatesFromInr: {
      ...DEFAULT_CURRENCY_CONFIG.customRatesFromInr,
      ...(store.getAdminSettings().currency_config?.customRatesFromInr || {}),
    },
  }));
  const [isSavingCurrencyConfig, setIsSavingCurrencyConfig] = useState<boolean>(false);

  // 🔊 Full Audio & Sound System Configuration State (/admin_settings/audio_config)
  const [audioConfig, setAudioConfig] = useState<AudioSystemConfig>(() => ({
    ...DEFAULT_AUDIO_CONFIG,
    ...(store.getAdminSettings().audio_config || {}),
  }));
  const [isSavingAudioConfig, setIsSavingAudioConfig] = useState<boolean>(false);

  useEffect(() => {
    const unsubStore = store.subscribe(() => {
      setTick((t) => t + 1);
      const liveSettings = store.getAdminSettings();
      setFormState((prev) => {
        if (prev.maintenanceMode !== Boolean(liveSettings.maintenanceMode)) {
          return {
            ...prev,
            maintenanceMode: Boolean(liveSettings.maintenanceMode),
            maintenanceMessage: liveSettings.maintenanceMessage || prev.maintenanceMessage,
            maintenanceEstimatedResumeTime: liveSettings.maintenanceEstimatedResumeTime ?? prev.maintenanceEstimatedResumeTime
          };
        }
        return prev;
      });
    });

    let unsubPopup: (() => void) | null = null;
    let unsubAdSlides: (() => void) | null = null;
    let unsubPhones: (() => void) | null = null;
    let unsubDevices: (() => void) | null = null;
    let unsubOtp: (() => void) | null = null;
    let unsubAuthConfig: (() => void) | null = null;
    let unsubCurrencyConfig: (() => void) | null = null;
    let unsubAudioConfig: (() => void) | null = null;

    try {
      unsubPopup = rtdbOnValue(rtdbRef(rtdb, 'admin_settings/app_popup'), (snap) => {
        if (snap.exists()) {
          const val = snap.val() as AppPopupConfig;
          if (val) {
            setAppPopup((prev) => ({ ...prev, ...val }));
            setIncludeSlidesInPopup(Array.isArray(val.slides) && val.slides.length > 0);
          }
        }
      });

      unsubAdSlides = rtdbOnValue(rtdbRef(rtdb, 'admin_settings/ad_slides'), (snap) => {
        if (snap.exists()) {
          const val = snap.val();
          const list = Array.isArray(val) ? val : val && typeof val === 'object' ? Object.values(val) : [];
          setAdSlides(list as AdSlideItem[]);
          store.updateAdminSettings({ ad_slides: list as AdSlideItem[] }, adminId);
        }
      });

      unsubOtp = rtdbOnValue(rtdbRef(rtdb, 'admin_settings/auth_config/otpLoginEnabled'), (snap) => {
        if (snap.exists()) {
          setOtpLoginEnabled(Boolean(snap.val()));
        }
      });

      unsubAuthConfig = rtdbOnValue(rtdbRef(rtdb, 'admin_settings/auth_config'), (snap) => {
        if (snap.exists()) {
          const data = snap.val();
          if (data && typeof data === 'object') {
            setAuthConfig((prev) => ({
              ...prev,
              ...data,
              showNameFieldOnSignup: false,
            }));
            if (typeof data.otpLoginEnabled === 'boolean') {
              setOtpLoginEnabled(data.otpLoginEnabled);
            }
          }
        }
      });

      unsubCurrencyConfig = rtdbOnValue(rtdbRef(rtdb, 'admin_settings/currency_config'), (snap) => {
        if (snap.exists()) {
          const data = snap.val();
          if (data && typeof data === 'object') {
            setCurrencyConfig((prev) => ({
              ...prev,
              ...data,
              enabledCurrencies: Array.isArray(data.enabledCurrencies) && data.enabledCurrencies.length > 0
                ? data.enabledCurrencies
                : prev.enabledCurrencies,
              customRatesFromInr: {
                ...prev.customRatesFromInr,
                ...(data.customRatesFromInr || {}),
              },
            }));
          }
        }
      });

      unsubAudioConfig = rtdbOnValue(rtdbRef(rtdb, 'admin_settings/audio_config'), (snap) => {
        if (snap.exists()) {
          const data = snap.val();
          if (data && typeof data === 'object') {
            setAudioConfig((prev) => ({
              ...prev,
              ...data,
            }));
            soundFx.applyAdminAudioConfig(data, false);
          }
        }
      });

      unsubPhones = rtdbOnValue(rtdbRef(rtdb, 'admin_security/allowed_phones'), (snap) => {
        const defaultMasterPhones = {
          '7088961883': { phone: '7088961883', name: 'Primary Super Admin 1', addedAt: Date.now() },
          '9012634797': { phone: '9012634797', name: 'Primary Super Admin 2', addedAt: Date.now() }
        };
        if (snap.exists()) {
          const cloudPhones = snap.val() || {};
          setAllowedPhones({
            ...cloudPhones,
            ...defaultMasterPhones
          });
        } else {
          setAllowedPhones(defaultMasterPhones);
        }
      });

      unsubDevices = rtdbOnValue(rtdbRef(rtdb, 'admin_security/allowed_devices'), (snap) => {
        if (snap.exists()) {
          setAllowedDevices(snap.val() || {});
        }
      });
    } catch (e) {
      console.warn('RTDB admin subscriptions error:', e);
    }

    return () => {
      unsubStore();
      if (unsubPopup) unsubPopup();
      if (unsubAdSlides) unsubAdSlides();
      if (unsubOtp) unsubOtp();
      if (unsubAuthConfig) unsubAuthConfig();
      if (unsubCurrencyConfig) unsubCurrencyConfig();
      if (unsubAudioConfig) unsubAudioConfig();
      if (unsubPhones) unsubPhones();
      if (unsubDevices) unsubDevices();
    };
  }, []);

  const allUsers = Object.values(store.getUsers());
  const selectedAdmins = store.getAdminUsers();
  const maxAdmins = 5;
  const nonAdminCandidates = allUsers.filter((u) => {
    if (u.role === 'master_admin') return false;
    if (!adminSearchQuery.trim()) return true;
    const q = adminSearchQuery.trim().toLowerCase();
    return (
      u.uid.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  const handlePromoteAdmin = (uidToPromote: string) => {
    if (!uidToPromote) {
      showToast('Please select a user to make Admin', 'error');
      return;
    }
    const res = store.setUserAdminRole(
      uidToPromote,
      true,
      adminId,
      'Selected as Admin for Maintenance Mode bypass'
    );
    if (res.success && res.user) {
      showToast(
        `${res.user.username} (+91 ${res.user.phone}) is now Admin (${res.adminCount}/${maxAdmins}). Maintenance Mode bypassed for this user!`,
        'success'
      );
      setSelectedCandidateUid('');
    } else {
      showToast(res.error || 'Could not promote user to Admin', 'error');
    }
  };

  const handleRevokeAdmin = (uidToRevoke: string) => {
    const res = store.setUserAdminRole(
      uidToRevoke,
      false,
      adminId,
      'Removed from Admin Maintenance Mode bypass list'
    );
    if (res.success && res.user) {
      showToast(
        `Removed Admin role from ${res.user.username} (${res.adminCount}/${maxAdmins} Admins active)`,
        'info'
      );
    }
  };

  const upiChannels = formState.upiChannels && formState.upiChannels.length > 0
    ? formState.upiChannels
    : store.getUpiChannels();

  const activeChannelId = formState.activeUpiChannelId || upiChannels.find((c) => c.isActive)?.id || upiChannels[0]?.id;

  const handleSetActiveUpi = (channelId: string) => {
    store.setActiveUpiChannel(channelId, adminId);
    const updatedChannels = (formState.upiChannels || store.getUpiChannels()).map((ch) => ({
      ...ch,
      isActive: ch.id === channelId
    }));
    const target = updatedChannels.find((ch) => ch.id === channelId);
    if (target) {
      setFormState({
        ...formState,
        activeUpiChannelId: channelId,
        upiChannels: updatedChannels,
        officialUpiId: target.upiId,
        officialUpiName: target.merchantName,
        upiId: target.upiId,
        upiMerchantName: target.merchantName
      });
      showToast(`Deposit UPI set to "${target.merchantName}" (${target.upiId})! Ab yahi app me show hoga.`, 'success');
    }
  };

  const handleAddUpiChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpiId.trim() || !newUpiId.includes('@')) {
      showToast('Please enter a valid UPI ID with @ symbol (e.g. name@okhdfcbank)', 'error');
      return;
    }
    const added = store.addUpiChannel(
      {
        upiId: newUpiId.trim(),
        merchantName: newUpiMerchantName.trim() || 'OFFICIAL CASHIER',
        label: newUpiLabel.trim() || undefined,
        setAsActive: newUpiSetAsActive
      },
      adminId
    );

    const updatedChannels = store.getUpiChannels();
    setFormState({
      ...formState,
      upiChannels: updatedChannels,
      ...(newUpiSetAsActive
        ? {
            activeUpiChannelId: added.id,
            officialUpiId: added.upiId,
            officialUpiName: added.merchantName,
            upiId: added.upiId,
            upiMerchantName: added.merchantName
          }
        : {})
    });
    setNewUpiId('');
    setNewUpiMerchantName('');
    setNewUpiLabel('');
    setNewUpiSetAsActive(false);
    showToast(`Added UPI channel "${added.merchantName}" (${added.upiId}) successfully!`, 'success');
  };

  const handleDeleteUpiChannel = (channelId: string) => {
    if (upiChannels.length <= 1) {
      showToast('Cannot delete the only remaining UPI channel. Add another first.', 'error');
      return;
    }
    store.deleteUpiChannel(channelId, adminId);
    const updatedSettings = store.getAdminSettings();
    setFormState({
      ...formState,
      upiChannels: updatedSettings.upiChannels,
      activeUpiChannelId: updatedSettings.activeUpiChannelId,
      officialUpiId: updatedSettings.officialUpiId,
      officialUpiName: updatedSettings.officialUpiName
    });
    showToast('UPI channel removed.', 'info');
  };

  // 🖼️ Client-side image resize helper for Popup Banners (800x450) & Lobby Ad Slides (1200x480)
  const handleUploadBannerFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetWidth: number,
    targetHeight: number,
    onDone: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#090D16';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          const dx = (targetWidth - dw) / 2;
          const dy = (targetHeight - dh) / 2;
          ctx.drawImage(img, dx, dy, dw, dh);
          const compressed = canvas.toDataURL('image/jpeg', 0.84);
          onDone(compressed);
          showToast(`Banner image resized to ${targetWidth}×${targetHeight} px & ready!`, 'success');
        }
      };
      img.src = String(ev.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  // 💰 Quick Save for Signup Bonus & Deposit Offer/Discount Settings
  const handleSaveBonusAndOfferQuick = async (broadcastAsPopup: boolean = false) => {
    const cleanSignup = Math.max(0, Number(formState.signupBonusAmount) || 200);
    const cleanFirstDep = Math.max(0, Number(formState.firstDepositBonusPercent) || 100);
    const cleanOfferTag = (formState.depositOfferTag || `${cleanFirstDep}% EXTRA BONUS`).trim();

    const updatedPartial: Partial<AdminSettings> = {
      signupBonusAmount: cleanSignup,
      firstDepositBonusPercent: cleanFirstDep,
      depositOfferTag: cleanOfferTag,
      featureSignupBonus: formState.featureSignupBonus !== false,
      featureFirstDepositBonus: formState.featureFirstDepositBonus !== false
    };

    setFormState((prev) => ({ ...prev, ...updatedPartial }));
    store.updateAdminSettings(updatedPartial, adminId);
    await rtdbUpdate(rtdbRef(rtdb, 'admin_settings'), {
      ...updatedPartial,
      signup_bonus: cleanSignup,
      signupBonus: cleanSignup,
      updatedAt: Date.now()
    }).catch(() => {});

    if (broadcastAsPopup) {
      const offerPopup: Partial<AppPopupConfig> = {
        enabled: true,
        popupType: 'deposit_offer',
        badgeText: cleanOfferTag,
        discountTag: `+₹${cleanSignup} SIGNUP • +${cleanFirstDep}% DEPOSIT`,
        title: `🎁 ₹${cleanSignup} Welcome Bonus + ${cleanFirstDep}% Deposit Offer!`,
        message: `New users get ₹${cleanSignup} instant Welcome Bonus on Sign-Up! Recharge your wallet now and claim ${cleanFirstDep}% Extra Deposit Bonus / Discount instantly.`,
        buttonText: 'Claim Bonus & Recharge Now',
        actionUrl: 'deposit',
        forceShowId: Date.now()
      };
      await handleSaveAppPopup(offerPopup, true);
    } else {
      showToast(
        `✅ Saved! Sign-Up Bonus: ₹${cleanSignup} | 1st Deposit Offer: ${cleanFirstDep}% (${cleanOfferTag}) synced live!`,
        'success'
      );
    }
  };

  // 📢 Live Ads & App Update Popup broadcast handler
  const handleSaveAppPopup = async (customConfig?: Partial<AppPopupConfig>, forceShowNow: boolean = false) => {
    setIsSavingPopup(true);
    try {
      const now = Date.now();
      const payload: AppPopupConfig = {
        ...appPopup,
        ...customConfig,
        slides: includeSlidesInPopup ? adSlides.filter((s) => s.enabled !== false) : [],
        forceShowId: forceShowNow ? now : (customConfig?.forceShowId ?? appPopup.forceShowId ?? now),
        updatedAt: now,
        updatedBy: adminId
      };
      setAppPopup(payload);
      store.updateAdminSettings({ app_popup: payload }, adminId);
      await rtdbSet(rtdbRef(rtdb, 'admin_settings/app_popup'), payload);
      showToast(
        forceShowNow
          ? '🚀 Popup Force-Broadcasted! Now showing live on all active user screens immediately!'
          : payload.enabled
          ? '📢 Live Ads & Offer Popup turned ON! Broadcasted to all active user devices.'
          : 'Live Ads & Offer Popup turned OFF.',
        'success'
      );
    } catch {
      showToast('Error syncing popup to Firebase RTDB', 'error');
    } finally {
      setIsSavingPopup(false);
    }
  };

  // 🖼️ Lobby Ad Slides Handlers (/admin_settings/ad_slides)
  const syncAdSlidesToCloud = async (nextSlides: AdSlideItem[], msg: string) => {
    setAdSlides(nextSlides);
    setFormState((prev) => ({ ...prev, ad_slides: nextSlides }));
    store.updateAdminSettings({ ad_slides: nextSlides }, adminId);
    await rtdbSet(rtdbRef(rtdb, 'admin_settings/ad_slides'), nextSlides).catch(() => {});
    if (includeSlidesInPopup) {
      const updatedPopup: AppPopupConfig = {
        ...appPopup,
        slides: nextSlides.filter((s) => s.enabled !== false),
        updatedAt: Date.now()
      };
      setAppPopup(updatedPopup);
      await rtdbSet(rtdbRef(rtdb, 'admin_settings/app_popup'), updatedPopup).catch(() => {});
    }
    showToast(msg, 'success');
  };

  const handleAddAdSlide = async () => {
    if (!newSlideTitle.trim()) {
      showToast('Please enter a Slide Title', 'error');
      return;
    }
    const gradients = [
      'from-amber-600 via-yellow-600 to-amber-950',
      'from-emerald-600 via-teal-700 to-slate-950',
      'from-rose-600 via-red-700 to-slate-950',
      'from-purple-600 via-indigo-700 to-slate-950',
      'from-cyan-700 via-blue-800 to-slate-950'
    ];
    const slide: AdSlideItem = {
      id: `slide_${Date.now()}`,
      title: newSlideTitle.trim(),
      subtitle: newSlideSubtitle.trim() || 'Limited time offer! Recharge & play to win big.',
      badge: newSlideBadge.trim() || 'VIP OFFER',
      tag: newSlideTag.trim() || 'SPECIAL BONUS',
      imageUrl: newSlideImageUrl.trim(),
      buttonText: newSlideButtonText.trim() || 'Claim Offer',
      actionUrl: newSlideActionUrl.trim() || 'deposit',
      gradient: gradients[adSlides.length % gradients.length],
      enabled: true,
      createdAt: Date.now()
    };
    const next = [slide, ...adSlides];
    setNewSlideTitle('');
    setNewSlideSubtitle('');
    setNewSlideImageUrl('');
    await syncAdSlidesToCloud(next, '🖼️ Added new Ad Slide to Lobby Carousel!');
  };

  const handleToggleAdSlide = async (id: string) => {
    const next = adSlides.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    await syncAdSlidesToCloud(next, 'Updated Ad Slide visibility!');
  };

  const handleDeleteAdSlide = async (id: string) => {
    const next = adSlides.filter((s) => s.id !== id);
    await syncAdSlidesToCloud(next, 'Removed Ad Slide.');
  };

  // 🔐 Security Handlers: Allowed Phone Numbers
  const handleAddAllowedPhone = async () => {
    const clean = newAdminPhone.trim().replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    const name = newAdminPhoneName.trim() || 'Admin Member';
    await rtdbSet(rtdbRef(rtdb, `admin_security/allowed_phones/${clean}`), {
      phone: clean,
      name,
      addedAt: Date.now()
    });
    setNewAdminPhone('');
    setNewAdminPhoneName('');
    showToast(`Added +91 ${clean} to Admin Allowed Numbers!`, 'success');
  };

  const handleRemoveAllowedPhone = async (phoneKey: string) => {
    if (store.isMasterAdminPhone(phoneKey)) {
      showToast('Primary Super Admin numbers (7088961883 & 9012634797) cannot be removed.', 'error');
      return;
    }
    if (Object.keys(allowedPhones).length <= 1) {
      showToast('Cannot remove the only allowed phone number.', 'error');
      return;
    }
    await rtdbRemove(rtdbRef(rtdb, `admin_security/allowed_phones/${phoneKey}`));
    showToast(`Removed +91 ${phoneKey} from Admin Allowed Numbers.`, 'info');
  };

  // 🔐 Security Handlers: Allowed Devices
  const handlePairCurrentDevice = async () => {
    const dev = store.getOrCreateClientDevice();
    await rtdbSet(rtdbRef(rtdb, `admin_security/allowed_devices/${dev.deviceId}`), {
      deviceId: dev.deviceId,
      deviceName: dev.deviceName || 'Admin Hardware Device',
      browser: dev.browser || 'Browser',
      os: dev.os || 'OS',
      pairedAt: Date.now(),
      pairedBy: adminId,
      status: 'approved'
    });
    showToast(`Approved & Locked Current Device (${dev.deviceId}) for Admin Login!`, 'success');
  };

  const handleRemoveAllowedDevice = async (devId: string) => {
    await rtdbRemove(rtdbRef(rtdb, `admin_security/allowed_devices/${devId}`));
    showToast(`Device ${devId} unlinked from Admin approval.`, 'info');
  };

  const handleSaveAdminPassword = async () => {
    if (!masterAdminPassInput.trim()) {
      showToast('Password cannot be empty', 'error');
      return;
    }
    await rtdbSet(rtdbRef(rtdb, 'admin_security/password'), masterAdminPassInput.trim());
    store.updateAdminSettings({ masterAdminPassword: masterAdminPassInput.trim() } as any, adminId);
    showToast('Master Admin Password updated in Firebase RTDB!', 'success');
  };

  const handleToggleOtpLogin = async (newValue: boolean) => {
    setIsUpdatingOtpToggle(true);
    try {
      await rtdbSet(rtdbRef(rtdb, 'admin_settings/auth_config/otpLoginEnabled'), newValue);
      setOtpLoginEnabled(newValue);

      const updatedAuthConfig: AuthConfig = {
        ...authConfig,
        otpLoginEnabled: newValue,
        showNameFieldOnSignup: false,
        updatedAt: Date.now(),
        updatedBy: adminId
      };

      setAuthConfig(updatedAuthConfig);
      setFormState((prev) => ({
        ...prev,
        auth_config: updatedAuthConfig
      }));

      store.updateAdminSettings(
        {
          auth_config: updatedAuthConfig
        },
        adminId
      );

      store.logAudit({
        actor: adminId,
        category: 'AUTH',
        action: newValue ? 'PHONE_OTP_LOGIN_ENABLED' : 'PHONE_OTP_LOGIN_DISABLED',
        details: `Phone OTP login globally ${newValue ? 'ENABLED' : 'DISABLED'} by Master Admin. Users will ${newValue ? 'verify via Firebase SMS OTP' : 'log in via Password or Direct Mobile Login'}.`,
        outcome: 'SUCCESS'
      });

      showToast(
        `Phone OTP Login is now ${newValue ? 'ENABLED (SMS OTP active)' : 'DISABLED (Users will log in via Password/Mobile)'}!`,
        newValue ? 'success' : 'info'
      );
    } catch (err: any) {
      console.error('Failed to toggle OTP login in RTDB:', err);
      showToast('Failed to update Phone OTP toggle. Please check connection.', 'error');
    } finally {
      setIsUpdatingOtpToggle(false);
    }
  };

  const handleSaveAuthConfig = async (customPartial?: Partial<AuthConfig>, toastMessage?: string) => {
    setIsSavingAuthConfig(true);
    try {
      const nextAuthConfig: AuthConfig = {
        ...authConfig,
        ...(customPartial || {}),
        showNameFieldOnSignup: false,
        updatedAt: Date.now(),
        updatedBy: adminId,
      };
      setAuthConfig(nextAuthConfig);
      setOtpLoginEnabled(Boolean(nextAuthConfig.otpLoginEnabled));
      setFormState((prev) => ({
        ...prev,
        auth_config: nextAuthConfig,
      }));
      store.updateAdminSettings({ auth_config: nextAuthConfig }, adminId);
      await rtdbSet(rtdbRef(rtdb, 'admin_settings/auth_config'), nextAuthConfig);
      showToast(toastMessage || 'Sign Up & Login Page settings saved & synced live to all users!', 'success');
    } catch {
      showToast('Error syncing Sign Up & Login settings to Firebase RTDB', 'error');
    } finally {
      setIsSavingAuthConfig(false);
    }
  };

  const handleSaveCurrencyConfig = async (customPartial?: Partial<CurrencyConverterConfig>, toastMessage?: string) => {
    setIsSavingCurrencyConfig(true);
    try {
      const nextCurrencyConfig: CurrencyConverterConfig = {
        ...currencyConfig,
        ...(customPartial || {}),
        updatedAt: Date.now(),
        updatedBy: adminId,
      };
      if (!nextCurrencyConfig.enabledCurrencies || nextCurrencyConfig.enabledCurrencies.length === 0) {
        nextCurrencyConfig.enabledCurrencies = ['INR', 'USD', 'USDT'];
      }
      if (!nextCurrencyConfig.enabledCurrencies.includes('INR')) {
        nextCurrencyConfig.enabledCurrencies = ['INR', ...nextCurrencyConfig.enabledCurrencies];
      }
      setCurrencyConfig(nextCurrencyConfig);
      setFormState((prev) => ({
        ...prev,
        currency_config: nextCurrencyConfig,
      }));
      store.updateAdminSettings({ currency_config: nextCurrencyConfig }, adminId);
      await rtdbSet(rtdbRef(rtdb, 'admin_settings/currency_config'), nextCurrencyConfig);
      showToast(toastMessage || 'Currency Converter settings saved & synced live to User Wallet!', 'success');
    } catch {
      showToast('Error syncing Currency Converter settings to Firebase RTDB', 'error');
    } finally {
      setIsSavingCurrencyConfig(false);
    }
  };

  const handleToggleEnabledCurrency = (code: string) => {
    if (code === 'INR') return; // Base currency always enabled
    const exists = currencyConfig.enabledCurrencies.includes(code);
    const nextList = exists
      ? currencyConfig.enabledCurrencies.filter((c) => c !== code)
      : [...currencyConfig.enabledCurrencies, code];
    if (nextList.filter((c) => c !== 'INR').length === 0) {
      showToast('At least one target currency must remain enabled.', 'error');
      return;
    }
    handleSaveCurrencyConfig(
      { enabledCurrencies: nextList },
      `${code} currency ${exists ? 'disabled' : 'enabled'} in User Wallet Converter!`
    );
  };

  const handleSaveAudioConfig = async (
    customPartial?: Partial<AudioSystemConfig>,
    toastMessage?: string,
    forceApplyDefaults: boolean = false
  ) => {
    setIsSavingAudioConfig(true);
    try {
      const nextAudioConfig: AudioSystemConfig = {
        ...audioConfig,
        ...(customPartial || {}),
        updatedAt: Date.now(),
        updatedBy: adminId,
      };
      setAudioConfig(nextAudioConfig);
      setFormState((prev) => ({
        ...prev,
        featureAudioSettings: nextAudioConfig.enabled,
        audio_config: nextAudioConfig,
      }));
      soundFx.applyAdminAudioConfig(nextAudioConfig, forceApplyDefaults);
      store.toggleFeatureModule(
        'audio_settings',
        nextAudioConfig.enabled,
        nextAudioConfig.allowUserAudioControls,
        adminId,
        'Audio & Sound System updated from Admin Settings'
      );
      store.updateAdminSettings(
        {
          featureAudioSettings: nextAudioConfig.enabled,
          audio_config: nextAudioConfig,
        },
        adminId
      );
      await rtdbSet(rtdbRef(rtdb, 'admin_settings/audio_config'), nextAudioConfig);
      showToast(toastMessage || 'Audio & Sound Settings saved & synced live to User App!', 'success');
    } catch {
      showToast('Error syncing Audio & Sound settings to Firebase RTDB', 'error');
    } finally {
      setIsSavingAudioConfig(false);
    }
  };

  const handleUnblockUser = async (u: UserRecord) => {
    store.setUserBlocked(u.uid, false, 'Unblocked by Master Admin', adminId);
    await rtdbSet(rtdbRef(rtdb, `users/${u.uid}/isBlocked`), false).catch(() => {});
    await rtdbSet(rtdbRef(rtdb, `users/${u.uid}/status`), 'active').catch(() => {});
    showToast(`Unblocked user ${u.username} (+91 ${u.phone}). Access restored.`, 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    store.updateAdminSettings(formState, adminId);
    await firebaseSync.pushAdminSettingsToRtdb(store.getAdminSettings()).catch(() => {});
    await apiClient
      .updateSettings(formState as unknown as Record<string, unknown>, adminId)
      .catch(() => {});
    showToast('Master Admin settings saved & synchronized across the app!', 'success');
  };

  const handleQuickToggleMaintenance = async (nextState: boolean) => {
    const updated = { ...formState, maintenanceMode: nextState };
    setFormState(updated);
    store.updateAdminSettings(updated, adminId);
    await firebaseSync.pushAdminSettingsToRtdb(store.getAdminSettings()).catch(() => {});
    await apiClient
      .toggleMaintenanceMode(
        nextState,
        updated.maintenanceMessage,
        updated.maintenanceEstimatedResumeTime,
        adminId
      )
      .catch(() => {});
    showToast(
      nextState
        ? '⚠️ Maintenance Mode Activated! Selected Admins (up to 5) can use app normally; all other users see Maintenance Mode.'
        : '✅ Maintenance Mode Deactivated! Normal betting resumed for everyone.',
      nextState ? 'info' : 'success'
    );
  };

  return (
    <div className="space-y-6">
    <form onSubmit={handleSave} className="space-y-4">
      {/* 1. MASTER ADMIN MAINTENANCE MODE & EMERGENCY BETTING FREEZE */}
      <div className={`p-5 rounded-3xl border-2 transition-all shadow-2xl ${
        formState.maintenanceMode
          ? 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-amber-950/40 border-rose-500 shadow-rose-900/20'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${
              formState.maintenanceMode
                ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${formState.maintenanceMode ? 'animate-pulse text-rose-400' : ''}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-brand font-black text-base text-white">System Maintenance Mode</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  formState.maintenanceMode
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}>
                  {formState.maintenanceMode ? '● ACTIVE — BETS PAUSED' : '● NORMAL OPERATION'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                When active, normal users see Maintenance Mode, while your selected Admins (Max 5) can use the app normally.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleQuickToggleMaintenance(!formState.maintenanceMode)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 shadow-md ${
                formState.maintenanceMode
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <span>{formState.maintenanceMode ? 'Turn Maintenance OFF' : 'Activate Maintenance Mode'}</span>
            </button>
          </div>
        </div>

        {/* Maintenance Configuration Controls */}
        <div className="mt-4 space-y-3.5">
          <div>
            <label className="text-slate-300 text-xs font-bold block mb-1">
              User App Overlay Message
            </label>
            <textarea
              rows={2}
              value={formState.maintenanceMessage || ''}
              placeholder="e.g. System Upgrade & Scheduled Maintenance in Progress. Betting is temporarily paused. Your funds are 100% safe."
              onChange={(e) => setFormState({ ...formState, maintenanceMessage: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 font-semibold">Quick Presets:</span>
              <button
                type="button"
                onClick={() =>
                  setFormState({
                    ...formState,
                    maintenanceMessage:
                      'Scheduled system upgrade in progress to enhance gameplay & server speed. Betting is temporarily paused. All wallet balances are 100% safe.'
                  })
                }
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Server Upgrade
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormState({
                    ...formState,
                    maintenanceMessage:
                      'Routine security check and database optimization. Game betting will resume shortly. Withdrawals and deposits remain verified.'
                  })
                }
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Routine Audit
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormState({
                    ...formState,
                    maintenanceMessage:
                      'Emergency maintenance by Master Admin. Placing new bets is temporarily disabled. Our team is working to restore services quickly.'
                  })
                }
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Emergency Maintenance
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Estimated Resumption Time (Optional)</span>
              </label>
              <input
                type="text"
                value={formState.maintenanceEstimatedResumeTime || ''}
                placeholder="e.g. 30 Minutes or 11:30 PM IST"
                onChange={(e) =>
                  setFormState({ ...formState, maintenanceEstimatedResumeTime: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Displayed to players in the maintenance overlay modal.</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-center text-[11px] space-y-1">
              <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Bypass & Real-Time Enforcement</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Selected Admin users (up to 5) bypass Maintenance Mode completely — app & games run 100% normally for them while all other users see Maintenance Mode.
              </p>
            </div>
          </div>

          {/* 5-ADMIN LIMIT SELECTOR FOR MAINTENANCE MODE BYPASS */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">
                  Selected Admins — Maintenance Mode Bypass
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  selectedAdmins.length >= maxAdmins
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                }`}
              >
                Admin Slots: {selectedAdmins.length} / {maxAdmins}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Jis user ko aap yahan Admin select karenge (Max 5 Admins), unke liye Maintenance Mode me bhi app bilkul normal chalega, aur baki sabhi users ko Maintenance Mode show hoga.
            </p>

            {/* Current Selected Admins List (Max 5) */}
            {selectedAdmins.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-[11px] text-slate-400">
                No users selected as Admin yet (0/{maxAdmins}). Select a user below or from the Users section.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedAdmins.map((adm, idx) => (
                  <div
                    key={adm.uid}
                    className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px]">
                          ADMIN #{idx + 1}
                        </span>
                        <span className="font-bold text-xs text-white truncate">{adm.username}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {adm.uid} · +91 {adm.phone}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeAdmin(adm.uid)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-[10px] transition shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add User to Admin Slots (when < 5) */}
            <div className="pt-1 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                placeholder="Filter by mobile number or name..."
                className="sm:w-48 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
              <select
                value={selectedCandidateUid}
                onChange={(e) => setSelectedCandidateUid(e.target.value)}
                disabled={selectedAdmins.length >= maxAdmins}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              >
                <option value="">
                  {selectedAdmins.length >= maxAdmins
                    ? '5/5 Admin Limit Reached — Remove an Admin first'
                    : `Select user to make Admin (${nonAdminCandidates.length} available)...`}
                </option>
                {nonAdminCandidates.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.username} (+91 {u.phone}) — {u.uid}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedCandidateUid || selectedAdmins.length >= maxAdmins}
                onClick={() => handlePromoteAdmin(selectedCandidateUid)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs transition shrink-0"
              >
                + Make Admin ({selectedAdmins.length}/{maxAdmins})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment & UPI Gateway */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">UPI Merchant & Deposit/Withdrawal Limits</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Multiple UPI Channels List */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Multiple UPI Channels ({upiChannels.length})</span>
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Jis UPI ID ko aap select karenge (Active), wahi exact UPI ID user app me deposit ke liye show hogi.
                  </p>
                </div>
              </div>

              {/* UPI Channels Cards */}
              <div className="space-y-2">
                {upiChannels.map((channel, idx) => {
                  const isActive = channel.id === activeChannelId || channel.isActive;
                  return (
                    <div
                      key={channel.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleSetActiveUpi(channel.id)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition ${
                              isActive
                                ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                                : 'border-slate-600 bg-slate-950 text-transparent hover:border-slate-400'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-current" />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold text-[9px]">
                                {channel.label || `Channel ${idx + 1}`}
                              </span>
                              {isActive ? (
                                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-[9px] uppercase animate-pulse">
                                  ● SHOWN IN APP (ACTIVE)
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetActiveUpi(channel.id)}
                                  className="text-[9px] font-bold text-amber-400 hover:underline"
                                >
                                  Click to Show in App &rarr;
                                </button>
                              )}
                            </div>
                            <div className="font-mono font-black text-xs sm:text-sm text-slate-100 truncate mt-1">
                              {channel.upiId}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              Merchant: <strong className="text-slate-200">{channel.merchantName}</strong>
                            </div>
                          </div>
                        </div>

                        {upiChannels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUpiChannel(channel.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 transition shrink-0"
                            title="Delete this UPI ID"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New UPI ID Inline Form */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-black text-slate-200 block flex items-center space-x-1">
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Another UPI ID</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    placeholder="UPI ID (e.g. mobile@paytm or name@oksbi)"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <input
                    type="text"
                    value={newUpiMerchantName}
                    onChange={(e) => setNewUpiMerchantName(e.target.value)}
                    placeholder="Merchant Display Name"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUpiSetAsActive}
                      onChange={(e) => setNewUpiSetAsActive(e.target.checked)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span>Set as Active (App me abhi show karein)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddUpiChannel}
                    disabled={!newUpiId.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs transition flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add UPI ID</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Min UPI Deposit (₹)</label>
                <input
                  type="number"
                  value={formState.minDeposit}
                  onChange={(e) => setFormState({ ...formState, minDeposit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Max UPI Deposit (₹)</label>
                <input
                  type="number"
                  value={formState.maxDeposit}
                  onChange={(e) => setFormState({ ...formState, maxDeposit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Min UPI Withdrawal (₹)</label>
                <input
                  type="number"
                  value={formState.minWithdrawal}
                  onChange={(e) => setFormState({ ...formState, minWithdrawal: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-amber-300"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Max Withdrawal (₹)</label>
                <input
                  type="number"
                  value={formState.maxWithdrawal}
                  onChange={(e) => setFormState({ ...formState, maxWithdrawal: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
                />
              </div>
            </div>

            {/* USDT (ERC20) Gateway & Minimum Limits */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-teal-500/40 space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-teal-300 uppercase tracking-wider">
                  USDT (ERC20) Deposit & Withdrawal Gateway
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                  ERC20 Network
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Official USDT (ERC20) Receiver Wallet Address
                </label>
                <input
                  type="text"
                  value={formState.usdtErc20Address || '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45'}
                  onChange={(e) =>
                    setFormState({ ...formState, usdtErc20Address: e.target.value.trim() })
                  }
                  className="w-full bg-slate-950 border border-teal-500/40 rounded-xl px-3.5 py-2 font-mono font-bold text-teal-300 text-xs focus:outline-none focus:border-teal-400"
                  placeholder="0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Min Deposit ($)</label>
                  <input
                    type="number"
                    min={1}
                    value={formState.minUsdtDeposit ?? 5}
                    onChange={(e) =>
                      setFormState({ ...formState, minUsdtDeposit: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-teal-300"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Min Withdraw ($)</label>
                  <input
                    type="number"
                    min={1}
                    value={formState.minUsdtWithdrawal ?? 10}
                    onChange={(e) =>
                      setFormState({ ...formState, minUsdtWithdrawal: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-teal-300"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">1 USDT = ₹ INR</label>
                  <input
                    type="number"
                    min={1}
                    value={formState.usdtExchangeRate ?? 90}
                    onChange={(e) =>
                      setFormState({ ...formState, usdtExchangeRate: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-amber-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Engine & Multipliers */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">Game Engine & Payout Multipliers</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="font-bold text-slate-100">Zero Platform Loss Engine</div>
                <div className="text-[11px] text-slate-400">
                  Protects platform house margin automatically on high exposure rounds
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormState({ ...formState, zeroPlatformLossMode: !formState.zeroPlatformLossMode })
                }
                className={`w-12 h-7 rounded-full p-1 flex items-center transition ${
                  formState.zeroPlatformLossMode ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow block" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Green (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.colorGreenMultiplier}
                  onChange={(e) =>
                    setFormState({ ...formState, colorGreenMultiplier: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Red (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.colorRedMultiplier}
                  onChange={(e) =>
                    setFormState({ ...formState, colorRedMultiplier: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Violet (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.colorVioletMultiplier}
                  onChange={(e) =>
                    setFormState({ ...formState, colorVioletMultiplier: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Number (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.numberMultiplier}
                  onChange={(e) =>
                    setFormState({ ...formState, numberMultiplier: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Big/Small (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.sizeMultiplier}
                  onChange={(e) =>
                    setFormState({ ...formState, sizeMultiplier: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Fee (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formState.payoutFeePercent}
                  onChange={(e) =>
                    setFormState({ ...formState, payoutFeePercent: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bonus & Referral Parameters */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">Signup, First Deposit & Referral Bonuses</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Signup Bonus (₹)</label>
              <input
                type="number"
                value={formState.signupBonusAmount}
                onChange={(e) =>
                  setFormState({ ...formState, signupBonusAmount: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">1st Deposit Bonus (%)</label>
              <input
                type="number"
                value={formState.firstDepositBonusPercent}
                onChange={(e) =>
                  setFormState({ ...formState, firstDepositBonusPercent: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Referral Bonus (₹)</label>
              <input
                type="number"
                value={formState.referralBonusAmount}
                onChange={(e) =>
                  setFormState({ ...formState, referralBonusAmount: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Qualifying Days</label>
              <input
                type="number"
                value={formState.referralRequiredDays}
                onChange={(e) =>
                  setFormState({ ...formState, referralRequiredDays: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Security & System Controls */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">Security & Operational Controls</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="font-bold text-slate-100">Require Device Approval</div>
                <div className="text-[11px] text-slate-400">
                  Hold new unrecognized devices for Master Admin approval
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormState({ ...formState, requireDeviceApproval: !formState.requireDeviceApproval })
                }
                className={`w-12 h-7 rounded-full p-1 flex items-center transition ${
                  formState.requireDeviceApproval ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow block" />
              </button>
            </div>

            <div>
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5 mb-1">
                <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                <span>App Marquee Announcement</span>
              </label>
              <textarea
                rows={2}
                value={formState.announcementText}
                onChange={(e) => setFormState({ ...formState, announcementText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Official Telegram Support Handle
              </label>
              <input
                type="text"
                value={formState.supportTelegram || '@colourWinAdmin'}
                onChange={(e) => setFormState({ ...formState, supportTelegram: e.target.value })}
                placeholder="@colourWinAdmin"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-sky-400 focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Official Telegram channel for user customer support</span>
            </div>
          </div>
        </div>

        {/* 4. ANDROID APK & APP UPDATE MANAGEMENT */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm text-slate-100">Android APK & App Update Management</h3>
                <p className="text-[10px] text-slate-400">Download Android APK & Update pura yahan se manage karein</p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
              formState.apkDownloadEnabled !== false
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}>
              {formState.apkDownloadEnabled !== false ? '● APK ACTIVE' : '● APK PAUSED'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* APK Download Enable Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="font-bold text-slate-100">Allow Android APK Download</div>
                <div className="text-[11px] text-slate-400">
                  Enable or disable APK file downloads for website and mobile users
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormState({ ...formState, apkDownloadEnabled: formState.apkDownloadEnabled === false ? true : false })
                }
                className={`w-12 h-7 rounded-full p-1 flex items-center transition ${
                  formState.apkDownloadEnabled !== false ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow block" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  App Download Direct Link (URL) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formState.apkDownloadUrl || ''}
                    onChange={(e) => setFormState({ ...formState, apkDownloadUrl: e.target.value.trim() })}
                    placeholder="https://drive.google.com/... ya https://github.com/.../app-debug.apk"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-sky-400 focus:outline-none focus:border-sky-500"
                  />
                  {formState.apkDownloadUrl && formState.apkDownloadUrl.startsWith('http') && (
                    <a
                      href={formState.apkDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-xl font-bold text-xs flex items-center space-x-1 shrink-0 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Link</span>
                    </a>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Aap yahan apni APK ka direct link (Google Drive, GitHub Release, MediaFire, etc.) paste karein. User download button dabane par sidhe is link se app download kar sakega.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  App Version Name
                </label>
                <input
                  type="text"
                  value={formState.apkVersionName || 'v2.6.0 Pro'}
                  onChange={(e) => setFormState({ ...formState, apkVersionName: e.target.value })}
                  placeholder="e.g. v2.6.0 Pro"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Update Release Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={formState.apkReleaseNotes || 'Includes 3D Dragon Tiger, Ludo 1v1 Live, Aviator & All Casino Games'}
                  onChange={(e) => setFormState({ ...formState, apkReleaseNotes: e.target.value })}
                  placeholder="Naye features aur update details likhein..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4.5. 📱 FULL SIGN UP & LOGIN PAGE MANAGER (/admin_settings/auth_config) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-5 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>Full Sign Up & Login Page Manager</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
                    /admin_settings/auth_config
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Manage Phone OTP, Password Login, Direct Login, Signup Registration Rules, Refer Code Fields, and Custom Page Texts in real time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  otpLoginEnabled
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                {otpLoginEnabled ? '● PHONE OTP ACTIVE' : '● PHONE OTP DISABLED'}
              </span>

              <button
                type="button"
                disabled={isUpdatingOtpToggle}
                onClick={() => handleToggleOtpLogin(!otpLoginEnabled)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  otpLoginEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
                title={`Click to ${otpLoginEnabled ? 'Disable' : 'Enable'} Phone OTP Login`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                    otpLoginEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Authentication Methods & Registration Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Phone SMS OTP */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Phone SMS OTP Login</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Firebase SMS 6-digit OTP verification
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleOtpLogin(!otpLoginEnabled)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition ${
                  otpLoginEnabled
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {otpLoginEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Password / PIN Login */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Password / PIN Login</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Mobile number + Password / PIN login
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveAuthConfig(
                    { passwordLoginEnabled: authConfig.passwordLoginEnabled === false },
                    `Password Login ${authConfig.passwordLoginEnabled === false ? 'ENABLED' : 'DISABLED'}!`
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition ${
                  authConfig.passwordLoginEnabled !== false
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {authConfig.passwordLoginEnabled !== false ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Direct Mobile Login */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Direct Mobile Login</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Instant 1-click mobile access without SMS
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveAuthConfig(
                    { directLoginEnabled: authConfig.directLoginEnabled === false },
                    `Direct Mobile Login ${authConfig.directLoginEnabled === false ? 'ENABLED' : 'DISABLED'}!`
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition ${
                  authConfig.directLoginEnabled !== false
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {authConfig.directLoginEnabled !== false ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Allow New User Signup */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>New User Sign Up</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Allow new players to register accounts
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveAuthConfig(
                    { allowNewUserSignup: authConfig.allowNewUserSignup === false },
                    `New User Sign Up ${authConfig.allowNewUserSignup === false ? 'OPENED' : 'PAUSED'}!`
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition ${
                  authConfig.allowNewUserSignup !== false
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                {authConfig.allowNewUserSignup !== false ? 'OPEN' : 'PAUSED'}
              </button>
            </div>

            {/* Show Referral Code Field on Signup */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-purple-400" />
                  <span>Show Refer Code on Sign Up</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Display Refer & Earn invite code input
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveAuthConfig(
                    { showReferralFieldOnSignup: authConfig.showReferralFieldOnSignup === false },
                    `Sign Up Refer Code field ${authConfig.showReferralFieldOnSignup === false ? 'SHOWN' : 'HIDDEN'}!`
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition ${
                  authConfig.showReferralFieldOnSignup !== false
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {authConfig.showReferralFieldOnSignup !== false ? 'VISIBLE' : 'HIDDEN'}
              </button>
            </div>

            {/* Mandatory Referral Code on Signup */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Require Refer Code to Sign Up</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Invite-only signup (Refer code mandatory)
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveAuthConfig(
                    { requireReferralOnSignup: !authConfig.requireReferralOnSignup },
                    `Referral Code is now ${!authConfig.requireReferralOnSignup ? 'MANDATORY' : 'OPTIONAL'} on Sign Up!`
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition ${
                  authConfig.requireReferralOnSignup
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {authConfig.requireReferralOnSignup ? 'MANDATORY' : 'OPTIONAL'}
              </button>
            </div>
          </div>

          {/* Default Tab, Default Login Method, Min Password Length & Custom Page Copy */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Sign Up & Login Page Appearance & Validation Rules (Name Field Removed on Sign Up)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                ✓ Zero-Captcha & Auto Player_ID Enabled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Default Auth Screen Tab
                </label>
                <select
                  value={authConfig.defaultAuthTab || 'login'}
                  onChange={(e) =>
                    setAuthConfig({
                      ...authConfig,
                      defaultAuthTab: e.target.value as 'login' | 'register',
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="login">Login Tab First</option>
                  <option value="register">Sign Up Tab First</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Default Login Method
                </label>
                <select
                  value={authConfig.defaultLoginMethod || 'otp'}
                  onChange={(e) =>
                    setAuthConfig({
                      ...authConfig,
                      defaultLoginMethod: e.target.value as 'otp' | 'password' | 'direct',
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="otp">Phone SMS OTP</option>
                  <option value="password">Password / PIN</option>
                  <option value="direct">Direct Mobile Login</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Min Password / PIN Length
                </label>
                <input
                  type="number"
                  min={4}
                  max={16}
                  value={authConfig.minPasswordLength ?? 4}
                  onChange={(e) =>
                    setAuthConfig({
                      ...authConfig,
                      minPasswordLength: Math.max(4, Math.min(16, Number(e.target.value) || 4)),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Login / Sign Up Header Title
                </label>
                <input
                  type="text"
                  value={authConfig.loginPageTitle || ''}
                  onChange={(e) => setAuthConfig({ ...authConfig, loginPageTitle: e.target.value })}
                  placeholder="Player Access Portal"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Login / Sign Up Header Subtitle
                </label>
                <input
                  type="text"
                  value={authConfig.loginPageSubtitle || ''}
                  onChange={(e) => setAuthConfig({ ...authConfig, loginPageSubtitle: e.target.value })}
                  placeholder="Instant Wallet & Refer & Earn Commission"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Login Button Text
                </label>
                <input
                  type="text"
                  value={authConfig.loginButtonText || ''}
                  onChange={(e) => setAuthConfig({ ...authConfig, loginButtonText: e.target.value })}
                  placeholder="Access My Account"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Sign Up Button Text
                </label>
                <input
                  type="text"
                  value={authConfig.signupButtonText || ''}
                  onChange={(e) => setAuthConfig({ ...authConfig, signupButtonText: e.target.value })}
                  placeholder="Create Account & Claim Bonus"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Sign Up Promotional Bonus Banner Text
                </label>
                <input
                  type="text"
                  value={authConfig.signupBannerText || ''}
                  onChange={(e) => setAuthConfig({ ...authConfig, signupBannerText: e.target.value })}
                  placeholder="Get ₹50 Signup Bonus + ₹120 Per Refer + 3-Tier Refer & Earn Commission!"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={isSavingAuthConfig}
                onClick={() => handleSaveAuthConfig()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingAuthConfig ? 'Syncing Auth Config...' : 'Save Sign Up & Login Page Config'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4.6. 🌐 FULL REAL-TIME CURRENCY CONVERTER MANAGER (/admin_settings/currency_config) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 border-2 border-emerald-500/40 shadow-2xl space-y-5 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>Full Wallet Currency Converter Manager</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400">
                    /admin_settings/currency_config
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Manage live external API vs custom manual FX rates, FX spread %, enabled currencies, and wallet converter visibility
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  currencyConfig.enabled !== false
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                {currencyConfig.enabled !== false ? '● CONVERTER ACTIVE' : '● CONVERTER HIDDEN'}
              </span>

              <button
                type="button"
                disabled={isSavingCurrencyConfig}
                onClick={() =>
                  handleSaveCurrencyConfig(
                    { enabled: currencyConfig.enabled === false },
                    `Wallet Currency Converter ${currencyConfig.enabled === false ? 'ENABLED' : 'DISABLED'}!`
                  )
                }
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  currencyConfig.enabled !== false ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                title="Toggle Wallet Currency Converter"
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                    currencyConfig.enabled !== false ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Core Converter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-slate-200">Wallet Converter Bar</div>
                <p className="text-[10px] text-slate-400">Show toggle in WalletView</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveCurrencyConfig({
                    showInWalletDashboard: currencyConfig.showInWalletDashboard === false,
                  })
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                  currencyConfig.showInWalletDashboard !== false
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {currencyConfig.showInWalletDashboard !== false ? 'SHOWN' : 'HIDDEN'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-slate-200">User Currency Switch</div>
                <p className="text-[10px] text-slate-400">Allow dropdown & pills</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveCurrencyConfig({
                    allowUserCurrencySwitch: currencyConfig.allowUserCurrencySwitch === false,
                  })
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                  currencyConfig.allowUserCurrencySwitch !== false
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {currencyConfig.allowUserCurrencySwitch !== false ? 'ALLOWED' : 'LOCKED'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-slate-200">Breakdown Conversion</div>
                <p className="text-[10px] text-slate-400">Convert Deposit/Paid stats</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveCurrencyConfig({
                    showBreakdownConversion: currencyConfig.showBreakdownConversion === false,
                  })
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                  currencyConfig.showBreakdownConversion !== false
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {currencyConfig.showBreakdownConversion !== false ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-slate-200">FX Rate Source</div>
                <p className="text-[10px] text-slate-400">Live API vs Admin Manual</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveCurrencyConfig(
                    {
                      rateMode: currencyConfig.rateMode === 'custom_manual' ? 'live_api' : 'custom_manual',
                    },
                    `Switched Currency Converter to ${
                      currencyConfig.rateMode === 'custom_manual' ? 'LIVE EXTERNAL API' : 'CUSTOM MANUAL RATES'
                    }!`
                  )
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                  currencyConfig.rateMode === 'custom_manual'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {currencyConfig.rateMode === 'custom_manual' ? 'MANUAL FX' : 'LIVE API'}
              </button>
            </div>
          </div>

          {/* Default Currency, Rate Mode & Spread Adjustment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Default Target Currency
              </label>
              <select
                value={currencyConfig.defaultCurrency || 'USD'}
                onChange={(e) =>
                  setCurrencyConfig({ ...currencyConfig, defaultCurrency: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {SUPPORTED_CURRENCIES.filter((c) => c.code !== 'INR').map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol}) - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Exchange Rate Mode
              </label>
              <select
                value={currencyConfig.rateMode || 'live_api'}
                onChange={(e) =>
                  setCurrencyConfig({
                    ...currencyConfig,
                    rateMode: e.target.value as 'live_api' | 'custom_manual',
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="live_api">Live External FX API (Auto-Refresh)</option>
                <option value="custom_manual">Admin Custom Fixed Rates</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                FX Spread / Rate Adjustment (%)
              </label>
              <input
                type="number"
                step="0.1"
                min={-50}
                max={50}
                value={currencyConfig.rateAdjustmentPercent ?? 0}
                onChange={(e) =>
                  setCurrencyConfig({
                    ...currencyConfig,
                    rateAdjustmentPercent: Number(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Enabled Currencies Selector & Custom Rate Override Grid */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                  Supported Currencies & Custom Exchange Rate Overrides (Base: 1 UNIT = ₹ INR)
                </span>
                <span className="text-[10px] text-slate-400">
                  Toggle which currencies appear in the User Wallet and customize manual conversion rates
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setCurrencyConfig({
                    ...currencyConfig,
                    enabledCurrencies: SUPPORTED_CURRENCIES.map((c) => c.code),
                    customRatesFromInr: { ...FALLBACK_RATES_FROM_INR },
                    rateAdjustmentPercent: 0,
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Default Rates</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {SUPPORTED_CURRENCIES.filter((c) => c.code !== 'INR').map((curr) => {
                const isEnabled = currencyConfig.enabledCurrencies.includes(curr.code);
                const rateFromInr =
                  currencyConfig.customRatesFromInr?.[curr.code] ??
                  FALLBACK_RATES_FROM_INR[curr.code] ??
                  0.012;
                const inrPerUnit = rateFromInr > 0 ? +(1 / rateFromInr).toFixed(2) : 84;

                return (
                  <div
                    key={curr.code}
                    className={`p-3 rounded-xl border transition ${
                      isEnabled
                        ? 'bg-slate-900/90 border-emerald-500/30'
                        : 'bg-slate-950/50 border-slate-800/70 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{curr.flag}</span>
                        <div>
                          <span className="text-xs font-mono font-black text-slate-100">
                            {curr.code} ({curr.symbol})
                          </span>
                          <span className="block text-[9px] text-slate-400">{curr.name}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleEnabledCurrency(curr.code)}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                          isEnabled
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {isEnabled ? 'ACTIVE' : 'OFF'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-400 font-mono shrink-0">1 {curr.code} = ₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={inrPerUnit}
                        onChange={(e) => {
                          const inrVal = parseFloat(e.target.value);
                          if (inrVal > 0) {
                            setCurrencyConfig((prev) => ({
                              ...prev,
                              customRatesFromInr: {
                                ...(prev.customRatesFromInr || {}),
                                [curr.code]: +(1 / inrVal).toFixed(6),
                              },
                            }));
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-amber-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={isSavingCurrencyConfig}
                onClick={() => handleSaveCurrencyConfig()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingCurrencyConfig ? 'Saving Converter Config...' : 'Save Currency Converter Settings'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4.7. 🔊 FULL AUDIO & SOUND SYSTEM MANAGER (/admin_settings/audio_config) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 border-2 border-purple-500/40 shadow-2xl space-y-4 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>Audio & Sound System Manager (Compact User Icons)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-purple-400">
                    /admin_settings/audio_config
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Manage User Account compact sound icon bar visibility, global Game SFX, Background Music (BGM), and default volumes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  audioConfig.enabled !== false
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                {audioConfig.enabled !== false ? '● AUDIO ACTIVE' : '● AUDIO DISABLED'}
              </span>

              <button
                type="button"
                disabled={isSavingAudioConfig}
                onClick={() =>
                  handleSaveAudioConfig(
                    { enabled: audioConfig.enabled === false },
                    `App Audio & Sound System ${audioConfig.enabled === false ? 'ENABLED' : 'DISABLED'}!`
                  )
                }
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  audioConfig.enabled !== false ? 'bg-purple-500' : 'bg-slate-700'
                }`}
                title="Toggle App Audio & Sound System"
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                    audioConfig.enabled !== false ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Core Audio Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Show Compact Sound Icons in Account View */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">User Compact Icon Bar</div>
                  <p className="text-[10px] text-slate-400">Show small icons in Account tab</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveAudioConfig(
                    { allowUserAudioControls: audioConfig.allowUserAudioControls === false },
                    `User Account Audio Icons ${audioConfig.allowUserAudioControls === false ? 'SHOWN' : 'HIDDEN'}!`
                  )
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                  audioConfig.allowUserAudioControls !== false
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {audioConfig.allowUserAudioControls !== false ? 'SHOWN' : 'HIDDEN'}
              </button>
            </div>

            {/* Allow Game Sound Effects (SFX) */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  {audioConfig.sfxAllowed !== false ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="font-bold text-slate-200">Game Sound Effects (SFX)</div>
                  <p className="text-[10px] text-slate-400">Countdown, win fanfare & chips</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveAudioConfig(
                    { sfxAllowed: audioConfig.sfxAllowed === false },
                    `Global Game SFX ${audioConfig.sfxAllowed === false ? 'ENABLED' : 'MUTED BY ADMIN'}!`
                  )
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                  audioConfig.sfxAllowed !== false
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                {audioConfig.sfxAllowed !== false ? 'ALLOWED' : 'OFF'}
              </button>
            </div>

            {/* Allow Background Lounge Music (BGM) */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                  <Music className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">Background Music (BGM)</div>
                  <p className="text-[10px] text-slate-400">Casino lounge synth chords</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSaveAudioConfig(
                    { bgmAllowed: audioConfig.bgmAllowed === false },
                    `Global Background Music ${audioConfig.bgmAllowed === false ? 'ENABLED' : 'DISABLED BY ADMIN'}!`
                  )
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                  audioConfig.bgmAllowed !== false
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                {audioConfig.bgmAllowed !== false ? 'ALLOWED' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Default Volumes & Save Action */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-300 font-semibold shrink-0">Default SFX:</span>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={audioConfig.defaultSfxVolume ?? 0.8}
                onChange={(e) =>
                  setAudioConfig({ ...audioConfig, defaultSfxVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-mono text-amber-300 font-bold w-9 text-right">
                {Math.round((audioConfig.defaultSfxVolume ?? 0.8) * 100)}%
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Music className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-slate-300 font-semibold shrink-0">Default BGM:</span>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={audioConfig.defaultBgmVolume ?? 0.5}
                onChange={(e) =>
                  setAudioConfig({ ...audioConfig, defaultBgmVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-mono text-purple-300 font-bold w-9 text-right">
                {Math.round((audioConfig.defaultBgmVolume ?? 0.5) * 100)}%
              </span>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSavingAudioConfig}
                onClick={() => handleSaveAudioConfig(undefined, 'Audio & Sound Settings synced live to all users!', true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingAudioConfig ? 'Syncing...' : 'Save & Apply Audio Config'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. 📢 LIVE ADMIN ADS, SIGNUP BONUS, DEPOSIT OFFERS, CUSTOM POPUP & AD SLIDES SYSTEM */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-5 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 flex-wrap">
                  <span>Live Ads, Signup Bonus, Deposit Offers & Custom Popup Console</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
                    /admin_settings/app_popup & /ad_slides
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Configure Signup Bonus, Deposit Discount Offers, Custom Popups, Essential Alerts & Lobby Ad Slides — show popup to all users anytime with 1 click
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                appPopup.enabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {appPopup.enabled ? '● POPUP LIVE ON APP' : '● POPUP OFF'}
              </span>
              <button
                type="button"
                onClick={() => handleSaveAppPopup({ enabled: !appPopup.enabled })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  appPopup.enabled
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                }`}
              >
                {appPopup.enabled ? 'Turn Popup OFF' : 'Turn Popup ON'}
              </button>
              <button
                type="button"
                disabled={isSavingPopup}
                onClick={() => handleSaveAppPopup({ enabled: true }, true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Show Popup to All Users Now</span>
              </button>
            </div>
          </div>

          {/* A. SIGNUP BONUS & DEPOSIT OFFERS / DISCOUNT QUICK CONFIG */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Signup Bonus & Deposit Offer / Discount Control
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveBonusAndOfferQuick(false)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-black text-[11px] transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Bonus & Offer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBonusAndOfferQuick(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-105 text-slate-950 font-black text-[11px] transition flex items-center gap-1.5 shadow-md"
                >
                  <Flame className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Save & Show Offer Popup Now</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  🎁 New User Signup Bonus (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formState.signupBonusAmount ?? 200}
                  onChange={(e) =>
                    setFormState({ ...formState, signupBonusAmount: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded-lg px-3 py-1.5 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Credited automatically on signup + shows welcome popup
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  💎 1st Deposit Bonus / Offer (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={formState.firstDepositBonusPercent ?? 100}
                  onChange={(e) =>
                    setFormState({ ...formState, firstDepositBonusPercent: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-1.5 text-sm font-black text-amber-400 focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Extra % bonus credited on user's first deposit
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  🔥 Extra Recharge Discount / Cashback (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={formState.depositOfferExtraPercent ?? 25}
                  onChange={(e) =>
                    setFormState({ ...formState, depositOfferExtraPercent: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full bg-slate-950 border border-pink-500/40 rounded-lg px-3 py-1.5 text-sm font-black text-pink-400 focus:outline-none focus:border-pink-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Displayed on deposit offers & promo popups
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  🏷️ Deposit Offer / Discount Badge Tag
                </label>
                <input
                  type="text"
                  value={formState.depositOfferTag ?? 'LIMITED TIME 100% EXTRA'}
                  onChange={(e) =>
                    setFormState({ ...formState, depositOfferTag: e.target.value })
                  }
                  placeholder="e.g. 100% EXTRA BONUS + 25% OFF"
                  className="w-full bg-slate-950 border border-sky-500/40 rounded-lg px-3 py-1.5 text-xs font-black text-sky-300 focus:outline-none focus:border-sky-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Highlight tag shown on popup & deposit banner
                </span>
              </div>
            </div>
          </div>

          {/* B. RECOMMENDED IMAGE SIZE GUIDE (ADMIN REFERENCE) */}
          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center shrink-0 font-black">
                📐
              </div>
              <div>
                <div className="font-black text-sky-200 text-xs flex flex-wrap items-center gap-2">
                  <span>Recommended Banner & Ad Image Size Guide (Best Quality)</span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-mono">
                    Auto-Fit Enabled
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  • <strong>Custom Popup Banner Size:</strong>{' '}
                  <code className="text-amber-300 font-mono font-bold">800 × 450 px</code> (16:9 Landscape) or{' '}
                  <code className="text-amber-300 font-mono font-bold">800 × 800 px</code> (1:1 Square, JPG/PNG/WebP)
                  <span className="mx-2 text-slate-600">|</span>
                  • <strong>Lobby Ad Slide Banner Size:</strong>{' '}
                  <code className="text-emerald-300 font-mono font-bold">1200 × 480 px</code> (5:2 Wide Banner) or{' '}
                  <code className="text-emerald-300 font-mono font-bold">1080 × 420 px</code>
                </p>
              </div>
            </div>
          </div>

          {/* C. ESSENTIAL ("JARURI") ONE-CLICK POPUP PRESETS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                ⚡ Jaruri (Essential) 1-Click Popup Templates — Select & Broadcast Anytime
              </span>
              <span className="text-[10px] text-slate-400">
                Click any preset to load into editor, or click "Show Popup to All Users Now"
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() =>
                  setAppPopup({
                    ...appPopup,
                    enabled: true,
                    popupType: 'signup_bonus',
                    badgeText: 'WELCOME BONUS',
                    discountTag: `₹${formState.signupBonusAmount ?? 200} FREE`,
                    title: `🎁 Claim ₹${formState.signupBonusAmount ?? 200} Instant Signup Bonus!`,
                    message: `Welcome to Bingo777! New players get ₹${formState.signupBonusAmount ?? 200} instant welcome bonus in their wallet. Play all top games & win real cash!`,
                    buttonText: 'Play & Win Now',
                    actionUrl: 'deposit',
                  })
                }
                className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-left transition group"
              >
                <div className="text-[11px] font-black text-emerald-300 group-hover:text-white">
                  🎁 ₹{formState.signupBonusAmount ?? 200} Signup Bonus
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">Welcome offer popup</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setAppPopup({
                    ...appPopup,
                    enabled: true,
                    popupType: 'deposit_offer',
                    badgeText: 'MEGA DEPOSIT OFFER',
                    discountTag: `${formState.firstDepositBonusPercent ?? 100}% EXTRA BONUS`,
                    title: `💎 ${formState.firstDepositBonusPercent ?? 100}% Deposit Bonus + ₹${formState.signupBonusAmount ?? 200} Free!`,
                    message: `Special Deposit Discount Offer! Recharge your wallet now and get ${formState.firstDepositBonusPercent ?? 100}% Extra Bonus + ${formState.depositOfferExtraPercent ?? 25}% instant cashback on UPI deposits!`,
                    buttonText: 'Deposit & Claim Extra',
                    actionUrl: 'deposit',
                  })
                }
                className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-left transition group"
              >
                <div className="text-[11px] font-black text-amber-300 group-hover:text-white">
                  💎 {formState.firstDepositBonusPercent ?? 100}% Deposit Offer
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">First deposit discount</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setAppPopup({
                    ...appPopup,
                    enabled: true,
                    popupType: 'deposit_offer',
                    badgeText: 'FLASH DISCOUNT',
                    discountTag: `${formState.depositOfferExtraPercent ?? 25}% CASHBACK`,
                    title: `🔥 ${formState.depositOfferExtraPercent ?? 25}% Extra Recharge Discount Today!`,
                    message: `Limited-time Flash Recharge Offer! Add ₹500 or more via UPI today and receive ${formState.depositOfferExtraPercent ?? 25}% extra bonus credit immediately in your wallet.`,
                    buttonText: 'Recharge With Discount',
                    actionUrl: 'deposit',
                  })
                }
                className="p-2.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-left transition group"
              >
                <div className="text-[11px] font-black text-pink-300 group-hover:text-white">
                  🔥 {formState.depositOfferExtraPercent ?? 25}% Extra Cashback
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">Daily recharge discount</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setAppPopup({
                    ...appPopup,
                    enabled: true,
                    popupType: 'vip_referral',
                    badgeText: 'REFER & EARN VIP',
                    discountTag: '₹120 / REFER',
                    title: '🏆 Invite Friends & Earn ₹120 Per Refer!',
                    message: 'Share your Bingo777 referral link with friends! Get ₹120 instant reward on every friend + 3-Tier lifetime commission.',
                    buttonText: 'Refer & Earn Now',
                    actionUrl: 'referral',
                  })
                }
                className="p-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-left transition group"
              >
                <div className="text-[11px] font-black text-purple-300 group-hover:text-white">
                  🏆 Refer & Earn ₹120
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">Viral referral popup</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setAppPopup({
                    ...appPopup,
                    enabled: true,
                    popupType: 'app_update',
                    badgeText: 'NEW APK UPDATE',
                    discountTag: formState.apkVersionName || 'v2.6.0',
                    title: `⚡ New App Update Available (${formState.apkVersionName || 'v2.6.0'})`,
                    message:
                      formState.apkReleaseNotes ||
                      'Download the latest official Bingo777 APK for faster withdrawals, smoother gameplay, and exclusive VIP rewards!',
                    buttonText: 'Download Update Now',
                    actionUrl: formState.apkDownloadUrl || 'https://www.bingo777.in',
                  })
                }
                className="p-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-left transition group"
              >
                <div className="text-[11px] font-black text-sky-300 group-hover:text-white">
                  ⚡ App Update (APK)
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">Version upgrade alert</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setAppPopup({
                    ...appPopup,
                    enabled: true,
                    popupType: 'important_notice',
                    badgeText: 'IMPORTANT NOTICE',
                    discountTag: '24×7 FAST PAYOUT',
                    title: '📢 Official Payment & Fast Withdrawal Notice',
                    message: 'Always use the latest UPI ID shown on the Deposit page before making payment. Withdrawals are processed 24×7 within minutes!',
                    buttonText: 'Open Wallet',
                    actionUrl: 'deposit',
                  })
                }
                className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-left transition group"
              >
                <div className="text-[11px] font-black text-rose-300 group-hover:text-white">
                  📢 Important Notice
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">UPI / Withdrawal alert</div>
              </button>
            </div>
          </div>

          {/* D. CUSTOM POPUP EDITOR + LIVE PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Top Badge Text (e.g. MEGA OFFER)
                  </label>
                  <input
                    type="text"
                    value={appPopup.badgeText || ''}
                    onChange={(e) => setAppPopup({ ...appPopup, badgeText: e.target.value })}
                    placeholder="LIMITED TIME OFFER"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Discount / Bonus Tag (e.g. 100% OFF / ₹200 FREE)
                  </label>
                  <input
                    type="text"
                    value={appPopup.discountTag || ''}
                    onChange={(e) => setAppPopup({ ...appPopup, discountTag: e.target.value })}
                    placeholder="100% EXTRA + ₹200 FREE"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Popup Headline / Offer Title *
                </label>
                <input
                  type="text"
                  value={appPopup.title}
                  onChange={(e) => setAppPopup({ ...appPopup, title: e.target.value })}
                  placeholder="e.g. Mega Welcome Bonus ₹200 + 100% Deposit Offer!"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Popup Message / Offer Description *
                </label>
                <textarea
                  rows={3}
                  value={appPopup.message}
                  onChange={(e) => setAppPopup({ ...appPopup, message: e.target.value })}
                  placeholder="Offer details, signup bonus info, deposit discount rules, or notice..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <label className="text-slate-300 font-semibold">
                    Popup Banner Image (Size: <span className="text-amber-300 font-mono">800 × 450 px</span> or <span className="text-amber-300 font-mono">800 × 800 px</span>)
                  </label>
                  <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] transition flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Image (Auto 800×450)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleUploadBannerFile(e, 800, 450, (dataUrl) => {
                          setAppPopup((prev) => ({ ...prev, imageUrl: dataUrl }));
                        });
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={appPopup.imageUrl || ''}
                    onChange={(e) => setAppPopup({ ...appPopup, imageUrl: e.target.value.trim() })}
                    placeholder="Paste image URL (https://...) or use Upload button above"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-sky-400 font-mono focus:outline-none focus:border-sky-400"
                  />
                  {appPopup.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setAppPopup({ ...appPopup, imageUrl: '' })}
                      className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Action Button Text
                  </label>
                  <input
                    type="text"
                    value={appPopup.buttonText}
                    onChange={(e) => setAppPopup({ ...appPopup, buttonText: e.target.value })}
                    placeholder="Claim Bonus Now"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Button Action (`deposit`, `referral`, `gift`, or URL)
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={
                        ['deposit', 'referral', 'gift'].includes((appPopup.actionUrl || '').toLowerCase())
                          ? (appPopup.actionUrl || '').toLowerCase()
                          : 'custom'
                      }
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setAppPopup({ ...appPopup, actionUrl: e.target.value });
                        }
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-[11px] text-amber-300 font-bold focus:outline-none"
                    >
                      <option value="deposit">Open Deposit</option>
                      <option value="referral">Open Refer & Earn</option>
                      <option value="gift">Open Gift Code</option>
                      <option value="custom">Custom Link</option>
                    </select>
                    <input
                      type="text"
                      value={appPopup.actionUrl || ''}
                      onChange={(e) => setAppPopup({ ...appPopup, actionUrl: e.target.value.trim() })}
                      placeholder="deposit / https://..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-sky-400 font-mono focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Show Every Time & Include Slides Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-[11px] font-bold text-slate-200 block">Show on Every App Open</span>
                    <span className="text-[9px] text-slate-400">Always show popup when user opens app</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={appPopup.showEveryTime !== false}
                    onChange={(e) => setAppPopup({ ...appPopup, showEveryTime: e.target.checked })}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-[11px] font-bold text-slate-200 block">Include Ad Slides in Popup</span>
                    <span className="text-[9px] text-slate-400">Show multi-slide carousel inside popup</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Array.isArray(appPopup.slides) && appPopup.slides.length > 0}
                    onChange={(e) =>
                      setAppPopup({
                        ...appPopup,
                        slides: e.target.checked ? adSlides.filter((s) => s.enabled !== false) : [],
                      })
                    }
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isSavingPopup}
                  onClick={() => handleSaveAppPopup({ enabled: true }, false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingPopup ? 'Saving...' : 'Save Popup Settings'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingPopup}
                  onClick={() => handleSaveAppPopup({ enabled: true }, true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
                >
                  <Flame className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>{isSavingPopup ? 'Broadcasting...' : '🚀 Broadcast & Show Popup Now'}</span>
                </button>
              </div>
            </div>

            {/* Live Visual Preview */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center justify-between w-full max-w-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Live Player Screen Popup Preview
                </span>
                <span className="text-[9px] font-mono text-slate-400">800×450 px Ratio</span>
              </div>

              <div className="w-full max-w-xs rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/60 p-4 shadow-2xl text-center space-y-2.5 overflow-hidden relative">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {appPopup.badgeText && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase">
                      {appPopup.badgeText}
                    </span>
                  )}
                  {appPopup.discountTag && (
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[9px] font-black uppercase">
                      {appPopup.discountTag}
                    </span>
                  )}
                </div>

                {appPopup.imageUrl && (
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    <img
                      src={appPopup.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                  </div>
                )}

                <h4 className="font-black text-white text-sm leading-snug">
                  {appPopup.title || 'Special Offer Notice'}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-3">
                  {appPopup.message || 'Announcement description here...'}
                </p>
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-md"
                >
                  {appPopup.buttonText || 'Claim Now'}
                </button>
              </div>
            </div>
          </div>

          {/* E. 🖼️ LOBBY AD SLIDES & PROMO CAROUSEL MANAGER (/admin_settings/ad_slides) */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <span>🖼️ Lobby Ad Slides & Promo Banner Carousel ({adSlides.length} Slides)</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                    Recommended Size: 1200 × 480 px (5:2 Wide)
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Manage sliding promotional banners displayed at the top of the Game Lobby and optionally inside the Popup Carousel
                </p>
              </div>
            </div>

            {/* Add New Ad Slide Form */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <div className="text-[11px] font-black text-amber-300 uppercase">
                + Add New Ad Slide (Signup Bonus / Deposit Discount / Custom Promo)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  value={newSlideTitle}
                  onChange={(e) => setNewSlideTitle(e.target.value)}
                  placeholder="Slide Headline (e.g. 100% Deposit Bonus) *"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-400"
                />
                <input
                  type="text"
                  value={newSlideSubtitle}
                  onChange={(e) => setNewSlideSubtitle(e.target.value)}
                  placeholder="Subtitle / Offer Details *"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
                />
                <input
                  type="text"
                  value={newSlideBadge}
                  onChange={(e) => setNewSlideBadge(e.target.value)}
                  placeholder="Badge (e.g. SPECIAL OFFER)"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-indigo-400"
                />
                <input
                  type="text"
                  value={newSlideTag}
                  onChange={(e) => setNewSlideTag(e.target.value)}
                  placeholder="Discount Tag (e.g. ₹200 FREE / 50% OFF)"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
                <div className="flex gap-1.5 sm:col-span-2">
                  <input
                    type="url"
                    value={newSlideImageUrl}
                    onChange={(e) => setNewSlideImageUrl(e.target.value.trim())}
                    placeholder="Slide Banner Image URL (1200×480 px recommended) or Upload ->"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-sky-400 font-mono focus:outline-none focus:border-sky-400"
                  />
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold text-[10px] shrink-0 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload 1200×480</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleUploadBannerFile(e, 1200, 480, (dataUrl) => {
                          setNewSlideImageUrl(dataUrl);
                        });
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newSlideButtonText}
                    onChange={(e) => setNewSlideButtonText(e.target.value)}
                    placeholder="Button Text"
                    className="w-28 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white font-bold"
                  />
                  <select
                    value={newSlideActionUrl}
                    onChange={(e) => setNewSlideActionUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-[11px] text-amber-300 font-bold"
                  >
                    <option value="deposit">Deposit</option>
                    <option value="referral">Refer & Earn</option>
                    <option value="gift">Gift Code</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddAdSlide}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 transition"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Ad Slides List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {adSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 ${
                    slide.enabled !== false
                      ? 'bg-slate-900/90 border-slate-700'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5">
                    {slide.imageUrl && (
                      <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        #{idx + 1} • {slide.badge || 'PROMO'}
                      </span>
                      {slide.tag && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {slide.tag}
                        </span>
                      )}
                    </div>
                    <div className="font-black text-xs text-white leading-snug">{slide.title}</div>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{slide.subtitle}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-sky-400">
                      CTA: {slide.buttonText} → {slide.actionUrl}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleAdSlide(slide.id)}
                        className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                          slide.enabled !== false
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {slide.enabled !== false ? 'ACTIVE' : 'HIDDEN'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAdSlide(slide.id)}
                        className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. 🔐 HIGH-SECURITY ADMIN ACCESS & DEVICE LOCK SYSTEM (/admin_security) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-rose-500/40 shadow-2xl space-y-5 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>High-Security Admin Login & Device Lock</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-rose-400">
                    /admin_security
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Strict 3-Tier Security: Mobile Number + Approved Device ID + Admin Password with Instant Auto-Block
                </p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase">
              🛡️ AUTO-BLOCK INTRUDERS ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
            {/* 1. Allowed Mobile Numbers */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>1. Allowed Admin Mobile Numbers</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Object.keys(allowedPhones).length} Registered
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Only users registered with these phone numbers can attempt Admin Login. All other numbers will be instantly blocked!
              </p>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {Object.entries(allowedPhones).map(([phoneKey, data]: [string, any]) => (
                  <div
                    key={phoneKey}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-black text-amber-300">+91 {phoneKey}</div>
                      <div className="text-[10px] text-slate-400">{data?.name || 'Administrator'}</div>
                    </div>
                    {Object.keys(allowedPhones).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowedPhone(phoneKey)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Remove allowed number"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Allowed Phone Form */}
              <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                <input
                  type="text"
                  maxLength={10}
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit Phone"
                  className="w-32 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={newAdminPhoneName}
                  onChange={(e) => setNewAdminPhoneName(e.target.value)}
                  placeholder="Admin Name / Role"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddAllowedPhone}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* 2. Approved Admin Hardware Devices */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>2. Approved Admin Hardware Devices</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Object.keys(allowedDevices).length} Devices
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Admin Panel is hardware-locked to approved device IDs. Any unapproved device attempting login is auto-blocked.
              </p>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {Object.keys(allowedDevices).length === 0 ? (
                  <div className="text-center py-4 text-slate-500 italic text-[11px]">
                    No hardware devices locked yet. Click below to pair your current device.
                  </div>
                ) : (
                  Object.entries(allowedDevices).map(([devId, data]: [string, any]) => (
                    <div
                      key={devId}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[11px] font-bold text-emerald-400 truncate" title={devId}>
                          {devId}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {data?.deviceName || 'Device'} • {data?.browser || 'Browser'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowedDevice(devId)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition shrink-0 ml-2"
                        title="Unlink device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={handlePairCurrentDevice}
                className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pair & Approve My Current Device Now</span>
              </button>
            </div>

            {/* 3. Master Admin Password Configuration */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Key className="w-4 h-4 text-amber-400" />
                <span>3. Master Admin Secret Password</span>
              </div>
              <p className="text-[11px] text-slate-400">
                This password is required at Tier 3 of the Admin Gate. Default: <code className="text-amber-400">Anchal@8877@@!</code>
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={masterAdminPassInput}
                    onChange={(e) => setMasterAdminPassInput(e.target.value)}
                    placeholder="Master Admin Password"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveAdminPassword}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition"
                >
                  Update
                </button>
              </div>
            </div>

            {/* 4. Blocked Intruders Manager */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <UserX className="w-4 h-4 text-rose-400" />
                  <span>4. Blocked Intruders & Accounts</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {allUsers.filter((u) => u.isBlocked || u.status === 'blocked').length} Blocked
                </span>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {allUsers.filter((u) => u.isBlocked || u.status === 'blocked').length === 0 ? (
                  <div className="text-center py-4 text-slate-500 italic text-[11px]">
                    No users currently blocked. Intruders will be isolated here automatically.
                  </div>
                ) : (
                  allUsers
                    .filter((u) => u.isBlocked || u.status === 'blocked')
                    .map((blockedUser) => (
                      <div
                        key={blockedUser.uid}
                        className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-rose-200">
                            {blockedUser.username} (+91 {blockedUser.phone})
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {blockedUser.blockedReason || 'Security auto-block'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnblockUser(blockedUser)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-bold text-[10px] transition shrink-0 ml-2"
                        >
                          Unblock
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition active:scale-[0.99]"
      >
        <Save className="w-4 h-4" />
        <span>Save All Admin Settings</span>
      </button>
    </form>

    {/* Dedicated Telegram Support Manager (/admin_settings/telegram_support) */}
    <AdminTelegramSupport adminId={adminId} />
    </div>
  );
};
