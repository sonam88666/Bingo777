import React, { useState } from 'react';
import { Gift, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRecord } from '../../types';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';

interface GiftCodeModalProps {
  user: UserRecord;
  onClose: () => void;
}

export const GiftCodeModal: React.FC<GiftCodeModalProps> = ({ user, onClose }) => {
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('Please enter a valid gift voucher code', 'error');
      return;
    }

    setIsRedeeming(true);
    const result = store.claimGiftCode(user.uid, code.trim());
    setIsRedeeming(false);

    if (result.success && result.amount) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      showToast(`Congratulations! ₹${result.amount} has been credited to your balance!`, 'success');
      setCode('');
      onClose();
    } else {
      showToast(result.error || 'Failed to claim gift code', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-black text-lg text-amber-300">
                Redeem Gift Code
              </h3>
              <p className="text-[11px] text-slate-400">
                Enter your official gift code below to claim instant bonus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Input Form - Only input field and claim button */}
        <form onSubmit={handleRedeem} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              Please enter gift code
            </label>
            <input
              type="text"
              placeholder="Enter gift code here"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 font-mono font-bold text-base text-amber-300 uppercase tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-amber-500 text-center"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isRedeeming}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-950/40 active:scale-95 transition flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isRedeeming ? 'Redeeming...' : 'Receive Gift'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
