import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Phone,
  ShieldCheck,
  Gift,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  ChevronDown
} from 'lucide-react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, rtdb, rtdbRef, rtdbOnValue } from '../../firebase';
import { UserRecord, DeviceRecord } from '../../types';
import { store } from '../../services/store';
import { firebaseSync } from '../../services/firebaseSync';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';
import { Bingo777Logo } from '../common/Bingo777Logo';

interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
  phoneLength: number;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳', phoneLength: 10 },
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸', phoneLength: 10 },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', flag: '🇦🇪', phoneLength: 9 },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧', phoneLength: 10 },
  { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬', phoneLength: 8 },
  { code: 'BD', dialCode: '+880', name: 'Bangladesh', flag: '🇧🇩', phoneLength: 10 },
  { code: 'NP', dialCode: '+977', name: 'Nepal', flag: '🇳🇵', phoneLength: 10 },
  { code: 'PK', dialCode: '+92', name: 'Pakistan', flag: '🇵🇰', phoneLength: 10 },
  { code: 'LK', dialCode: '+94', name: 'Sri Lanka', flag: '🇱🇰', phoneLength: 9 }
];

export interface PhoneLoginModalProps {
  onSuccess: (user: UserRecord) => void;
  onClose: () => void;
  onSwitchToPasswordLogin?: () => void;
}

export const PhoneLoginModal: React.FC<PhoneLoginModalProps> = ({
  onSuccess,
  onClose,
  onSwitchToPasswordLogin
}) => {
  const { showToast } = useToast();

  // Step: 'phone' (enter number) | 'otp' (enter 6-digit code)
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // Country code & phone
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(() => {
    const last = localStorage.getItem('bingo777_last_phone') || '';
    return last.replace(/\D/g, '').slice(-10);
  });

  // Referral code (prefill from URL parameter ?ref= if present)
  const [referralCode, setReferralCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('ref') || '').toUpperCase();
  });
  const [showReferralField, setShowReferralField] = useState(Boolean(referralCode));

  // OTP inputs (6 individual boxes)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Loading & error state
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend Countdown
  const [resendCooldown, setResendCooldown] = useState(0);

  // Confirmation result
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(
    () => window.confirmationResult || null
  );

  // Recaptcha verifier ref
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Real-time listener for /admin_settings/auth_config/otpLoginEnabled
  const [otpLoginEnabled, setOtpLoginEnabled] = useState<boolean>(() => {
    return store.getAdminSettings().auth_config?.otpLoginEnabled ?? true;
  });

  // Get active admin signup bonus amount
  const adminSettings = store.getAdminSettings();
  const signupBonusAmount =
    (adminSettings as any).signup_bonus ??
    (adminSettings as any).signupBonus ??
    adminSettings.signupBonusAmount ??
    100;

  // Real-time onValue listener to /admin_settings/auth_config/otpLoginEnabled
  useEffect(() => {
    const otpRef = rtdbRef(rtdb, 'admin_settings/auth_config/otpLoginEnabled');
    const unsub = rtdbOnValue(
      otpRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setOtpLoginEnabled(Boolean(snapshot.val()));
        } else {
          setOtpLoginEnabled(true);
        }
      },
      (err) => {
        console.warn('[PhoneLoginModal] RTDB otpLoginEnabled notice:', err);
      }
    );

    return () => unsub();
  }, []);

  // Cleanup recaptcha verifier on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
        recaptchaVerifierRef.current = null;
      }
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {}
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Pull latest users and settings from RTDB on mount
  useEffect(() => {
    firebaseSync.pullUsersFromRtdb().catch(() => {});
  }, []);

  // Detect or retrieve client device record
  const getClientDevice = (): DeviceRecord => {
    return store.getOrCreateClientDevice();
  };

  /**
   * Initializes or gets the RecaptchaVerifier instance safely
   */
  const getOrCreateRecaptchaVerifier = (): RecaptchaVerifier => {
    // If we already have a valid verifier attached to window, reuse it
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    const container = document.getElementById('recaptcha-container');
    if (!container) {
      throw new Error('reCAPTCHA container element not found in DOM.');
    }

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - will proceed with submit
      },
      'expired-callback': () => {
        showToast('reCAPTCHA expired. Please try sending OTP again.', 'error');
        resetRecaptchaVerifier();
      }
    });

    window.recaptchaVerifier = verifier;
    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const resetRecaptchaVerifier = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {}
      recaptchaVerifierRef.current = null;
    }
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {}
      window.recaptchaVerifier = undefined;
    }
  };

  /**
   * Step 1: Send OTP to Phone Number
   */
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSendingOtp) return;
    setErrorMessage(null);

    if (!otpLoginEnabled) {
      setErrorMessage('Phone OTP SMS login is temporarily paused by Master Admin. Please switch to Password / Mobile Login.');
      return;
    }

    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (selectedCountry.code === 'IN') {
      if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
        setErrorMessage('Please enter a valid 10-digit Indian mobile number (starts with 6-9).');
        return;
      }
    } else {
      if (cleanDigits.length < 7 || cleanDigits.length > 15) {
        setErrorMessage(`Please enter a valid mobile number for ${selectedCountry.name}.`);
        return;
      }
    }

    const fullPhoneNumber = `${selectedCountry.dialCode}${cleanDigits}`;

    setIsSendingOtp(true);
    try {
      const appVerifier = getOrCreateRecaptchaVerifier();

      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      window.confirmationResult = result;
      setConfirmationResult(result);

      setStep('otp');
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      showToast(`Verification OTP sent via SMS to ${fullPhoneNumber}`, 'success');

      // Auto-focus first digit after step transition
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      console.error('[PhoneAuth] Error sending OTP:', err);
      resetRecaptchaVerifier();

      const errCode = err?.code || '';
      let friendlyMessage = 'Failed to send OTP SMS. Please check your mobile number and try again.';

      if (errCode === 'auth/invalid-phone-number') {
        friendlyMessage = 'The phone number entered is invalid. Please check the country code and number.';
      } else if (errCode === 'auth/too-many-requests') {
        friendlyMessage = 'Too many requests. SMS quota reached or temporarily blocked. Please wait a few minutes or test with demo account.';
      } else if (errCode === 'auth/quota-exceeded') {
        friendlyMessage = 'SMS daily quota reached for this project. Please contact support or try demo login.';
      } else if (errCode === 'auth/captcha-check-failed') {
        friendlyMessage = 'reCAPTCHA verification failed. Please try again.';
      } else if (errCode === 'auth/billing-not-enabled') {
        friendlyMessage = 'Firebase Phone Auth requires active billing or configured Test Phone Numbers in Firebase Console.';
      } else if (err?.message) {
        friendlyMessage = err.message;
      }

      setErrorMessage(friendlyMessage);
      showToast(friendlyMessage, 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  /**
   * Step 2: Handle OTP Digits Input
   */
  const handleOtpDigitChange = (index: number, val: string) => {
    // Only allow digits
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      // Cleared current digit
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    // Single digit input
    const char = clean.slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });

    // Auto advance to next box
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move back and clear previous
        otpInputRefs.current[index - 1]?.focus();
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
      } else {
        // Clear current
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    const focusIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIdx]?.focus();

    // If full 6 digits were pasted, automatically verify
    if (pasted.length === 6) {
      setTimeout(() => {
        verifyOtpCode(pasted);
      }, 100);
    }
  };

  /**
   * Step 3: Verify OTP Code and Auto-Credit Signup Bonus
   */
  const handleVerifySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit OTP code received via SMS.');
      return;
    }
    verifyOtpCode(otpCode);
  };

  const verifyOtpCode = async (otpCode: string) => {
    const activeConfirm = confirmationResult || window.confirmationResult;
    if (!activeConfirm) {
      setErrorMessage('No active confirmation session found. Please request a new OTP.');
      setStep('phone');
      return;
    }

    if (isVerifyingOtp) return;
    setIsVerifyingOtp(true);
    setErrorMessage(null);

    try {
      const result = await activeConfirm.confirm(otpCode);
      const firebaseUser = result.user;

      if (!firebaseUser) {
        throw new Error('Authentication succeeded but user record was empty.');
      }

      // Format clean 10-digit phone
      const cleanPhone = (firebaseUser.phoneNumber || `${selectedCountry.dialCode}${mobileNumber}`)
        .replace(/\D/g, '')
        .slice(-10);

      const device = getClientDevice();
      device.status = 'approved';

      // Pull latest database snapshot to check if user already exists
      await firebaseSync.pullUsersFromRtdb().catch(() => {});

      let existingUser =
        store.findUserByPhone(cleanPhone) ||
        store.getUser(firebaseUser.uid) ||
        Object.values(store.getUsers()).find((u) => u.phone === cleanPhone);

      if (existingUser) {
        // --- EXISTING USER LOGGING IN VIA OTP ---
        existingUser.isOnline = true;
        existingUser.lastActive = Date.now();
        if (existingUser.devices) {
          existingUser.devices[device.deviceId] = device;
        }

        localStorage.setItem('bingo777_active_uid', existingUser.uid);
        localStorage.setItem('maanwin_active_uid', existingUser.uid);
        localStorage.setItem('bingo777_last_phone', cleanPhone);

        await firebaseSync.pushUserToFirestore(existingUser, cleanPhone);
        firebaseSync.attachRealtimeUserSync(existingUser.uid, cleanPhone);

        showToast(`Welcome back, ${existingUser.username}! Verified via SMS OTP.`, 'success');
        onSuccess(existingUser);
        onClose();
      } else {
        // --- NEW USER REGISTRATION VIA PHONE OTP ---
        // Auto-credit Signup Bonus directly into wallet
        const defaultUsername = `Player_${cleanPhone.slice(-4)}`;
        const enteredRefCode = referralCode.trim() ? referralCode.trim().toUpperCase() : undefined;

        // Register user with customUid matching firebaseUser.uid
        const newUser = store.registerUser(
          cleanPhone,
          defaultUsername,
          device,
          enteredRefCode,
          firebaseUser.uid
        );

        // Notify authoritative backend and cloud
        await apiClient
          .registerUser({
            user: newUser,
            phone: cleanPhone,
            username: newUser.username,
            referralCode: newUser.referralCode,
            referredBy: newUser.referredBy,
            uid: newUser.uid,
            device
          })
          .catch(() => {});

        localStorage.setItem('bingo777_active_uid', newUser.uid);
        localStorage.setItem('maanwin_active_uid', newUser.uid);
        localStorage.setItem('bingo777_last_phone', cleanPhone);

        await firebaseSync.pushUserToFirestore(newUser, cleanPhone);

        // If referred, sync referral record to cloud
        const linkedRef = store.getAllReferrals().find((r) => r.referredUid === newUser.uid);
        if (linkedRef) {
          await firebaseSync.pushReferralToFirestore(linkedRef).catch(() => {});
        }

        firebaseSync.attachRealtimeUserSync(newUser.uid, cleanPhone);

        showToast(
          `🎉 Account created! Welcome ₹${newUser.balance} Signup Bonus credited to your wallet!`,
          'success'
        );
        onSuccess(newUser);
        onClose();
      }
    } catch (err: any) {
      console.error('[PhoneAuth] Error verifying OTP:', err);
      const errCode = err?.code || '';
      let friendlyMessage = 'Invalid verification code. Please check your SMS and try again.';

      if (errCode === 'auth/invalid-verification-code') {
        friendlyMessage = 'Incorrect OTP code! Please enter the 6-digit code sent to your phone.';
      } else if (errCode === 'auth/code-expired') {
        friendlyMessage = 'This OTP has expired. Please click "Resend OTP" to receive a new one.';
      } else if (err?.message) {
        friendlyMessage = err.message;
      }

      setErrorMessage(friendlyMessage);
      showToast(friendlyMessage, 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6 relative">
        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container" className="flex justify-center my-1" />

        {/* Clean Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Bingo777Logo size="md" variant="badge" />
            <div>
              <span className="font-brand font-black text-base sm:text-lg bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent block leading-tight">
                Bingo777
              </span>
              <span className="text-[10px] text-amber-300/80 font-bold tracking-wide">
                Phone Number OTP Verification
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Signup Bonus Teaser Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">Welcome Signup Bonus</div>
              <div className="text-[10px] text-slate-400">
                Instant ₹{signupBonusAmount} credited to your wallet upon verification
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/20 px-2 py-1 rounded-lg">
            +₹{signupBonusAmount}
          </span>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* OTP Disabled by Admin Notice */}
        {!otpLoginEnabled && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <div className="font-bold flex items-center space-x-1.5 text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>SMS OTP Login is temporarily paused by Admin</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Phone SMS verification is currently switched off in Admin Settings. Please use Password Login or Direct Mobile Login.
            </p>
            {onSwitchToPasswordLogin && (
              <button
                type="button"
                onClick={onSwitchToPasswordLogin}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Switch to Password / Mobile Login &rarr;</span>
              </button>
            )}
          </div>
        )}

        {/* STEP 1: ENTER PHONE NUMBER */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Mobile Number
              </label>

              <div className="relative flex items-center">
                {/* Country Code Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-l-xl px-3 py-2.5 text-xs text-amber-300 font-bold hover:bg-slate-900 transition"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="font-mono">{selectedCountry.dialCode}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 z-30 max-h-48 overflow-y-auto">
                      {COUNTRY_CODES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(c);
                            setIsCountryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-900 transition ${
                            selectedCountry.code === c.code ? 'text-amber-400 font-bold' : 'text-slate-300'
                          }`}
                        >
                          <span className="flex items-center space-x-2">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </span>
                          <span className="font-mono text-slate-500">{c.dialCode}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Input Field */}
                <div className="relative flex-1">
                  <input
                    type="tel"
                    maxLength={selectedCountry.phoneLength}
                    placeholder={`Enter ${selectedCountry.phoneLength}-digit number`}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-r-xl px-3 py-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 tracking-wider"
                    required
                    autoFocus
                  />
                  {mobileNumber && (
                    <button
                      type="button"
                      onClick={() => setMobileNumber('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-amber-500/80" />
                <span>You will receive an authentic 6-digit SMS OTP from Firebase.</span>
              </p>
            </div>

            {/* Optional Referral Code Toggle */}
            <div>
              {!showReferralField ? (
                <button
                  type="button"
                  onClick={() => setShowReferralField(true)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                >
                  <Gift className="w-3 h-3" />
                  <span>Have an invite/referral code? (Optional)</span>
                </button>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Referral Code</span>
                    <span className="text-[10px] text-slate-500">Optional</span>
                  </label>
                  <div className="relative flex items-center">
                    <Gift className="w-4 h-4 text-slate-500 absolute left-3.5" />
                    <input
                      type="text"
                      placeholder="Enter refer code"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 font-mono text-xs text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Send OTP Button */}
            <button
              type="submit"
              disabled={!otpLoginEnabled || isSendingOtp || mobileNumber.length < 7}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
            >
              {!otpLoginEnabled ? (
                <span>Phone OTP Disabled by Admin</span>
              ) : isSendingOtp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending SMS OTP...</span>
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Switch to Password Login Option */}
            {onSwitchToPasswordLogin && (
              <div className="pt-2 text-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={onSwitchToPasswordLogin}
                  className="text-xs text-slate-400 hover:text-amber-300 transition flex items-center justify-center space-x-1.5 mx-auto"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Prefer password login? Login with Password &rarr;</span>
                </button>
              </div>
            )}
          </form>
        )}

        {/* STEP 2: ENTER OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">Enter Verification Code</h4>
              <p className="text-xs text-slate-400">
                Sent to{' '}
                <span className="font-mono font-bold text-amber-300">
                  {selectedCountry.dialCode} {mobileNumber}
                </span>
              </p>
            </div>

            {/* 6 OTP Input Boxes */}
            <div>
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-10 sm:w-12 h-12 text-center text-base sm:text-lg font-mono font-black text-amber-300 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400 transition selection:bg-transparent"
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Type or paste your 6-digit SMS code
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isVerifyingOtp || otpDigits.join('').length !== 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
            >
              {isVerifyingOtp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Proceed</span>
                </>
              )}
            </button>

            {/* Resend & Change Phone Actions */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setErrorMessage(null);
                }}
                className="text-slate-400 hover:text-slate-200 transition flex items-center space-x-1 text-[11px]"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change Number</span>
              </button>

              {resendCooldown > 0 ? (
                <span className="text-slate-500 text-[11px]">
                  Resend in <span className="font-mono font-bold text-amber-400">{resendCooldown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={isSendingOtp}
                  className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center space-x-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
