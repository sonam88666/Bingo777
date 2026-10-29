import React, { useState, useEffect, useCallback } from 'react';
import {
  Phone,
  Lock,
  Flame,
  Gift,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Key
} from 'lucide-react';
import { UserRecord, DeviceRecord } from '../../types';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';
import { firebaseSync } from '../../services/firebaseSync';
import { apiClient } from '../../services/apiClient';
import { Bingo777Logo } from '../common/Bingo777Logo';
import { rtdb, rtdbRef, rtdbOnValue } from '../../firebase';

import { PhoneLoginModal } from './PhoneLoginModal';

interface UserAuthModalProps {
  onSuccess: (user: UserRecord) => void;
  onClose: () => void;
}

const generateCaptcha = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const UserAuthModal: React.FC<UserAuthModalProps> = ({ onSuccess, onClose }) => {
  const { showToast } = useToast();

  // Real-time listener for /admin_settings/auth_config/otpLoginEnabled
  const [otpLoginEnabled, setOtpLoginEnabled] = useState<boolean>(() => {
    return store.getAdminSettings().auth_config?.otpLoginEnabled ?? true;
  });

  const [tab, setTab] = useState<'otp' | 'login' | 'register'>(() => {
    const params = new URLSearchParams(window.location.search);
    const initialOtpEnabled = store.getAdminSettings().auth_config?.otpLoginEnabled ?? true;
    if (!initialOtpEnabled) {
      return params.get('ref') ? 'register' : 'login';
    }
    if (params.get('mode') === 'password') return 'login';
    return 'otp';
  });

  // Alternative login sub-mode when on 'login' tab: 'password' | 'direct'
  const [loginMethod, setLoginMethod] = useState<'password' | 'direct'>('password');

  // Form Fields
  const [phone, setPhone] = useState(() => localStorage.getItem('bingo777_last_phone') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || '';
  });

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Captcha State
  const [captchaCode, setCaptchaCode] = useState<string>(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');

  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
  }, []);

  // Real-time onValue listener to /admin_settings/auth_config/otpLoginEnabled
  useEffect(() => {
    const otpRef = rtdbRef(rtdb, 'admin_settings/auth_config/otpLoginEnabled');
    const unsub = rtdbOnValue(
      otpRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const enabled = Boolean(snapshot.val());
          setOtpLoginEnabled(enabled);
          if (!enabled) {
            // Gracefully fall back to alternative login method (Password or Direct Mobile)
            setTab((curr) => (curr === 'otp' ? 'login' : curr));
          }
        } else {
          setOtpLoginEnabled(true);
        }
      },
      (err) => {
        console.warn('[UserAuthModal] RTDB otpLoginEnabled notice:', err);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    refreshCaptcha();
    store.syncUsersWithBackend();
    firebaseSync.pullUsersFromRtdb().catch(() => {});
  }, [tab, refreshCaptcha]);

  // Detect client device details
  const getClientDevice = (): DeviceRecord => {
    const userAgent = navigator.userAgent;
    let browser = 'Chrome';
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';

    let os = 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    else if (userAgent.includes('Macintosh')) os = 'macOS';
    else if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Linux')) os = 'Linux';

    return store.getOrCreateClientDevice();
  };

  const [pendingDeviceNotice, setPendingDeviceNotice] = useState<string | null>(null);

  /**
   * Handle Login (Mobile Number + Password + Captcha)
   * Checks local permanent store first, and automatically restores from backend disk if needed.
   * Enforces strict 1 Number = 1 Device policy (2nd device requires Admin approval).
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setPendingDeviceNotice(null);
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    const existingCandidate = store.findUserByPhone(cleanPhone);
    const isSelectedAdmin = Boolean(existingCandidate && existingCandidate.role === 'master_admin');
    if (!isSelectedAdmin && !store.isFeatureEnabled('user_login')) {
      showToast('Member Login is temporarily paused by Master Admin for maintenance.', 'error');
      return;
    }
    if (!password) {
      showToast('Please enter your password', 'error');
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      showToast('Invalid Captcha code! Please enter the correct Captcha.', 'error');
      refreshCaptcha();
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseSync.pullUsersFromRtdb();
      const device = getClientDevice();
      const existingLocal = store.findUserByPhone(cleanPhone);

      if (existingLocal) {
        const loginAttempt = store.attemptDeviceBoundedLogin(cleanPhone, device, password);
        if (loginAttempt.success && loginAttempt.user) {
          const user = loginAttempt.user;
          localStorage.setItem('bingo777_active_uid', user.uid);
          localStorage.setItem('maanwin_active_uid', user.uid);
          localStorage.setItem('bingo777_last_phone', cleanPhone);
          firebaseSync.pushUserToFirestore(user, cleanPhone);
          firebaseSync.attachRealtimeUserSync(user.uid, cleanPhone);

          showToast(`Welcome back, ${user.username}!`, 'success');
          onSuccess(user);
          onClose();
          return;
        }
        if (loginAttempt.code === 'DEVICE_APPROVAL_REQUIRED') {
          const msg =
            loginAttempt.error ||
            `1 Number = 1 Device Policy: New device (${device.deviceId}) requires Admin approval before login.`;
          setPendingDeviceNotice(msg);
          showToast('New device detected! Sent to Admin for approval (1 Number = 1 Device).', 'error');
          refreshCaptcha();
          return;
        }
        showToast(loginAttempt.error || 'Incorrect password! Please try again.', 'error');
        refreshCaptcha();
        return;
      }

      // Not found in local memory/storage — query authoritative backend disk store
      const serverRes = await apiClient.loginUser(cleanPhone, password, device);
      if (serverRes.success && serverRes.user) {
        const sUser = serverRes.user as UserRecord;
        const restored = store.restoreUserFromBackend(sUser, undefined, password);
        const verifyRestored = store.attemptDeviceBoundedLogin(cleanPhone, device, password);
        if (!verifyRestored.success) {
          if (verifyRestored.code === 'DEVICE_APPROVAL_REQUIRED') {
            const msg =
              verifyRestored.error ||
              `1 Number = 1 Device Policy: New device (${device.deviceId}) requires Admin approval before login.`;
            setPendingDeviceNotice(msg);
            showToast('New device detected! Sent to Admin for approval (1 Number = 1 Device).', 'error');
            refreshCaptcha();
            return;
          }
          showToast(verifyRestored.error || 'Login restricted.', 'error');
          return;
        }
        localStorage.setItem('bingo777_active_uid', restored.uid);
        localStorage.setItem('maanwin_active_uid', restored.uid);
        localStorage.setItem('bingo777_last_phone', cleanPhone);
        firebaseSync.pushUserToFirestore(restored, cleanPhone);
        firebaseSync.attachRealtimeUserSync(restored.uid, cleanPhone);

        showToast(`Welcome back, ${restored.username}!`, 'success');
        onSuccess(restored);
        onClose();
        return;
      }

      if (serverRes.code === 'DEVICE_APPROVAL_REQUIRED') {
        const msg =
          serverRes.error ||
          `1 Number = 1 Device Policy: New device (${device.deviceId}) requires Admin approval before login.`;
        setPendingDeviceNotice(msg);
        showToast('New device detected! Sent to Admin for approval (1 Number = 1 Device).', 'error');
        refreshCaptcha();
        return;
      }

      if (serverRes.code === 'INVALID_PASSWORD') {
        showToast('Incorrect password! Please try again.', 'error');
        refreshCaptcha();
        return;
      }

      showToast(serverRes.error || 'Account not found with this mobile number. Please Sign Up first.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Direct Mobile Login (No Password required)
   * Fallback / fast verification method when OTP is disabled or user prefers direct access.
   */
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setPendingDeviceNotice(null);
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    const existingCandidate = store.findUserByPhone(cleanPhone);
    const isSelectedAdmin = Boolean(existingCandidate && existingCandidate.role === 'master_admin');
    if (!isSelectedAdmin && !store.isFeatureEnabled('user_login')) {
      showToast('Member Login is temporarily paused by Master Admin for maintenance.', 'error');
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      showToast('Invalid Captcha code! Please enter the correct Captcha.', 'error');
      refreshCaptcha();
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseSync.pullUsersFromRtdb().catch(() => {});
      const device = getClientDevice();
      device.status = 'approved';

      const existingLocal = store.findUserByPhone(cleanPhone);
      if (existingLocal) {
        localStorage.setItem('bingo777_active_uid', existingLocal.uid);
        localStorage.setItem('maanwin_active_uid', existingLocal.uid);
        localStorage.setItem('bingo777_last_phone', cleanPhone);
        await firebaseSync.pushUserToFirestore(existingLocal, cleanPhone);
        firebaseSync.attachRealtimeUserSync(existingLocal.uid, cleanPhone);

        showToast(`Welcome back, ${existingLocal.username}! Direct Mobile Login successful.`, 'success');
        onSuccess(existingLocal);
        onClose();
        return;
      }

      // If user doesn't exist yet, auto-register them with Welcome Signup Bonus!
      const defaultUsername = `Player_${cleanPhone.slice(-4)}`;
      const newUser = store.registerUser(cleanPhone, defaultUsername, device);
      await apiClient
        .registerUser({
          user: newUser,
          phone: cleanPhone,
          username: newUser.username,
          uid: newUser.uid,
          device
        })
        .catch(() => {});

      localStorage.setItem('bingo777_active_uid', newUser.uid);
      localStorage.setItem('maanwin_active_uid', newUser.uid);
      localStorage.setItem('bingo777_last_phone', cleanPhone);
      await firebaseSync.pushUserToFirestore(newUser, cleanPhone);
      firebaseSync.attachRealtimeUserSync(newUser.uid, cleanPhone);

      showToast(`Welcome! ₹${newUser.balance} Signup Bonus credited to your wallet.`, 'success');
      onSuccess(newUser);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Sign Up (Mobile Number + Password + Confirm Password + Refer Code + Captcha)
   * Permanently saves account to local registry, backend disk, and Firestore on first registration.
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setPendingDeviceNotice(null);
    if (!store.isFeatureEnabled('user_registration')) {
      showToast('New user Sign Up is temporarily paused by Master Admin.', 'error');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Password and Confirm Password do not match!', 'error');
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      showToast('Invalid Captcha code! Please enter the correct Captcha.', 'error');
      refreshCaptcha();
      return;
    }

    setIsSubmitting(true);
    try {
      // Pull latest users from Firebase RTDB so referral codes from other devices are always matched
      await firebaseSync.pullUsersFromRtdb();

      const device = getClientDevice();
      device.status = 'approved';

      const existing = store.findUserByPhone(cleanPhone);
      if (existing) {
        const loginAttempt = store.attemptDeviceBoundedLogin(cleanPhone, device, password);
        if (loginAttempt.success && loginAttempt.user) {
          const loggedIn = loginAttempt.user;
          localStorage.setItem('bingo777_active_uid', loggedIn.uid);
          localStorage.setItem('maanwin_active_uid', loggedIn.uid);
          localStorage.setItem('bingo777_last_phone', cleanPhone);
          firebaseSync.pushUserToFirestore(loggedIn, cleanPhone);
          firebaseSync.attachRealtimeUserSync(loggedIn.uid, cleanPhone);
          showToast(`Welcome back, ${loggedIn.username}! Logged into your saved account.`, 'success');
          onSuccess(loggedIn);
          onClose();
          return;
        }
        if (loginAttempt.code === 'DEVICE_APPROVAL_REQUIRED') {
          setTab('login');
          setPendingDeviceNotice(
            loginAttempt.error ||
              `1 Number = 1 Device Policy: This number is already registered on another device. Device ${device.deviceId} is now pending Admin approval.`
          );
          showToast('This number is bound to another device. Sent to Admin for approval!', 'error');
          refreshCaptcha();
          return;
        }
        showToast('This mobile number is already registered. Please Login with your password.', 'info');
        setTab('login');
        refreshCaptcha();
        return;
      }

      const defaultUsername = `Player_${cleanPhone.slice(-4)}`;
      const enteredRefCode = referralCode.trim() ? referralCode.trim().toUpperCase() : undefined;
      const newUser = store.registerUser(
        cleanPhone,
        defaultUsername,
        device,
        enteredRefCode,
        undefined,
        password
      );

      await apiClient.registerUser({
        user: newUser,
        phone: cleanPhone,
        username: newUser.username,
        password,
        referralCode: newUser.referralCode,
        referredBy: newUser.referredBy,
        uid: newUser.uid,
        device
      });

      localStorage.setItem('bingo777_active_uid', newUser.uid);
      localStorage.setItem('maanwin_active_uid', newUser.uid);
      localStorage.setItem('bingo777_last_phone', cleanPhone);

      await firebaseSync.pushUserToFirestore(newUser, cleanPhone);
      const linkedRef = store.getAllReferrals().find((r) => r.referredUid === newUser.uid);
      if (linkedRef) {
        await firebaseSync.pushReferralToFirestore(linkedRef);
      }
      firebaseSync.attachRealtimeUserSync(newUser.uid, cleanPhone);

      showToast(`Account created! Welcome ₹${newUser.balance} Signup Bonus credited to your wallet.`, 'success');
      onSuccess(newUser);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (otpLoginEnabled && tab === 'otp') {
    return (
      <PhoneLoginModal
        onSuccess={onSuccess}
        onClose={onClose}
        onSwitchToPasswordLogin={() => setTab('login')}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6">
        {/* Clean Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Bingo777Logo size="md" variant="badge" />
            <span className="font-brand font-black text-lg bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Bingo777
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Login / Sign Up Switcher (Respects Admin otpLoginEnabled) */}
        {otpLoginEnabled ? (
          <div className="grid grid-cols-3 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setTab('otp')}
              className={`py-2 rounded-lg transition text-[11px] font-bold ${
                tab === 'otp'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              ⚡ Phone OTP
            </button>
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`py-2 rounded-lg transition text-[11px] ${
                tab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`py-2 rounded-lg transition text-[11px] ${
                tab === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`py-2.5 rounded-lg transition text-xs ${
                  tab === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`py-2.5 rounded-lg transition text-xs ${
                  tab === 'register'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Direct Mobile & Password Login Active (SMS OTP paused by Admin)</span>
            </div>
          </div>
        )}

        {/* 1 Number = 1 Device Pending Approval Notice */}
        {pendingDeviceNotice && (
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs leading-relaxed">
            <div className="font-bold text-amber-300 mb-0.5">🔒 1 Number = 1 Device Security Lock</div>
            <div>{pendingDeviceNotice}</div>
          </div>
        )}

        {/* Sub-method switcher on Login tab (Password vs Direct Mobile Login) */}
        {tab === 'login' && (
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-bold gap-1">
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                loginMethod === 'password'
                  ? 'bg-slate-800 text-amber-300 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3 h-3" />
              <span>Password Login</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('direct')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                loginMethod === 'direct'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Direct Mobile Login</span>
            </button>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={tab === 'login' ? (loginMethod === 'direct' ? handleDirectLogin : handleLogin) : handleRegister}
          className="space-y-3.5"
        >
          {/* Mobile Number */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <span className="absolute left-9 text-xs font-bold text-amber-400 font-mono">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-16 pr-4 py-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Password (Only when not in direct mobile mode) */}
          {tab === 'login' && loginMethod === 'direct' ? (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Instant 1-Click Verification: Login with mobile number without password.</span>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  placeholder="Enter password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Only on Sign Up) */}
          {tab === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  placeholder="Confirm password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Refer Code (Only on Sign Up) */}
          {tab === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Refer Code</span>
                <span className="text-[10px] text-slate-500">Optional</span>
              </label>
              <div className="relative flex items-center">
                <Gift className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Enter refer code (optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 font-mono text-xs text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>
            </div>
          )}

          {/* Captcha Verification */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Captcha
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 flex items-center">
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 uppercase tracking-widest"
                  required
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 select-none">
                <span className="font-mono font-black text-sm tracking-[0.25em] text-amber-300 italic">
                  {captchaCode}
                </span>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="p-1 text-slate-400 hover:text-amber-400 transition"
                  title="Refresh Captcha"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 active:scale-95 transition mt-2"
          >
            {tab === 'login' ? (loginMethod === 'direct' ? 'Direct Mobile Login' : 'Login') : 'Sign Up'}
          </button>

          {/* Conditional footer switch */}
          {otpLoginEnabled ? (
            <div className="pt-2 text-center border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTab('otp')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold transition flex items-center justify-center space-x-1.5 mx-auto"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Login / Sign Up with Phone OTP &rarr;</span>
              </button>
            </div>
          ) : (
            tab === 'login' && (
              <div className="pt-2 text-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLoginMethod(loginMethod === 'password' ? 'direct' : 'password')}
                  className="text-xs text-amber-400/90 hover:text-amber-300 font-semibold transition flex items-center justify-center space-x-1.5 mx-auto"
                >
                  {loginMethod === 'password' ? (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Prefer no password? Switch to Direct Mobile Login &rarr;</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>Have password? Switch to Password Login &rarr;</span>
                    </>
                  )}
                </button>
              </div>
            )
          )}
        </form>
      </div>
    </div>
  );
};
