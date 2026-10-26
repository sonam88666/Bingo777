import React from 'react';
import { 
  User, 
  Smartphone, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  LogOut, 
  Clock, 
  CheckCircle,
  Copy
} from 'lucide-react';
import { UserRecord } from '../../types';
import { useToast } from '../common/Toast';

interface UserProfileModalProps {
  user: UserRecord;
  onLogout: () => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onLogout,
  onClose
}) => {
  const { showToast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied UID to clipboard', 'info');
  };

  const winRate = user.totalBetsCount > 0
    ? Math.round((user.totalWonAmount / (user.totalWonAmount + user.totalLostAmount || 1)) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center font-brand font-black text-slate-950 text-lg shadow-lg">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <span>{user.username}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300">
                  VIP {user.vipLevel}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <span className="font-mono">UID: {user.uid}</span>
                <button 
                  onClick={() => handleCopy(user.uid)}
                  className="hover:text-amber-400 text-slate-500"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Total Bets</span>
              <span className="font-mono font-bold text-sm text-slate-200">{user.totalBetsCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Total Won</span>
              <span className="font-mono font-bold text-sm text-emerald-400">₹{user.totalWonAmount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Estimated Payout</span>
              <span className="font-mono font-bold text-sm text-amber-400">{winRate}%</span>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Profile Specifications
            </h4>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Linked Phone:</span>
                <span className="font-mono text-slate-200">+91 {user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Status:</span>
                <span className={`font-bold capitalize ${user.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {user.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registered On:</span>
                <span className="text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Authorized Devices Workflow */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Authorized Hardware Devices</span>
              <span className="text-[10px] text-amber-400 lowercase font-normal">
                {Object.keys(user.devices).length} device(s)
              </span>
            </h4>

            <div className="space-y-2">
              {Object.values(user.devices).map((device) => (
                <div
                  key={device.deviceId}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-semibold text-slate-200 text-xs">
                        {device.deviceName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {device.os} • {device.browser}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    device.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : device.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {device.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 font-bold text-xs flex items-center justify-center space-x-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
