import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, AlertCircle, Loader2 } from 'lucide-react';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';
import { Bingo777Logo } from '../common/Bingo777Logo';
import { apiClient } from '../../services/apiClient';

interface AdminLoginModalProps {
  onSuccess: (adminId: string, token?: string) => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [adminUsername, setAdminUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return Number(sessionStorage.getItem('admin_login_fails') || 0);
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    return Number(sessionStorage.getItem('admin_lockout_until') || 0);
  });

  const isLockedOut = lockoutUntil > Date.now();
  const lockoutSecondsRemaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    setErrorMsg('');

    if (isLockedOut) {
      setErrorMsg(`Too many failed attempts. Security lockout active for ${lockoutSecondsRemaining} seconds.`);
      return;
    }

    const cleanKey = masterKey.trim();
    const cleanUser = adminUsername.trim();

    if (!cleanUser) {
      setErrorMsg('Please enter your Master Admin ID.');
      return;
    }
    if (!cleanKey) {
      setErrorMsg('Please enter your Master Secret Key.');
      return;
    }

    setIsVerifying(true);
    try {
      // 1. Authoritative Backend Cryptographic Verification
      const res = await apiClient.verifyMasterAdmin(cleanKey);

      if (!res.success) {
        const nextFails = failedAttempts + 1;
        setFailedAttempts(nextFails);
        sessionStorage.setItem('admin_login_fails', nextFails.toString());

        if (nextFails >= 5 || res.code === 'RATE_LIMIT_EXCEEDED') {
          const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 minute security lockout
          setLockoutUntil(lockoutTime);
          sessionStorage.setItem('admin_lockout_until', lockoutTime.toString());
          setErrorMsg(res.error || 'Security Lockout: 5 failed attempts. Administrative gateway locked for 15 minutes.');
        } else {
          setErrorMsg(res.error || `Invalid credentials. Authorization denied (${5 - nextFails} attempts remaining).`);
        }

        store.logAudit({
          actor: cleanUser || 'Unknown',
          category: 'AUTH',
          action: 'FAILED_ADMIN_LOGIN',
          details: `Failed authorization attempt for actor "${cleanUser}". Attempt ${nextFails}/5. IP/Hardware logged.`,
          outcome: 'DENIED'
        });
        return;
      }

      // Success! Clear lockout
      sessionStorage.removeItem('admin_login_fails');
      sessionStorage.removeItem('admin_lockout_until');
      sessionStorage.setItem('bingo777_master_admin_token', cleanKey);
      localStorage.setItem('bingo777_master_admin_token', cleanKey);

      store.logAudit({
        actor: cleanUser,
        category: 'AUTH',
        action: 'MASTER_ADMIN_LOGIN',
        details: `Master Admin authenticated successfully with verified server authorization token.`,
        outcome: 'SUCCESS'
      });

      showToast(`Master Admin authenticated: ${cleanUser}`, 'success');
      onSuccess(cleanUser, cleanKey);
    } catch {
      setErrorMsg('Network connection error while contacting authentication authority.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Brand Header with 3D Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Bingo777Logo size="xl" variant="badge" />
          </div>
          <h2 className="font-brand font-black text-xl text-slate-100 tracking-wider">
            BINGO777 MASTER ADMIN GATEWAY
          </h2>
          <p className="text-xs text-slate-400">
            Authorized Personnel Only. Cryptographically protected with brute-force prevention.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">
              Master Admin ID
            </label>
            <input
              type="text"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              disabled={isLockedOut}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono disabled:opacity-50"
              placeholder="e.g. MasterAdmin_01"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">
              Master Secret Key / Token
            </label>
            <input
              type="password"
              value={masterKey}
              onChange={(e) => setMasterKey(e.target.value)}
              disabled={isLockedOut}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-mono disabled:opacity-50"
              placeholder="Enter master key"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLockedOut || isVerifying}
              className={`flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center space-x-1.5 ${
                isLockedOut || isVerifying ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : isLockedOut ? (
                `Locked (${lockoutSecondsRemaining}s)`
              ) : (
                'Authenticate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
