import React, { useState } from 'react';
import {
  Gift,
  Plus,
  Edit3,
  Trash2,
  Eye
} from 'lucide-react';
import { GiftCode } from '../../types';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';

interface AdminGiftCodesProps {
  adminId: string;
  masterToken?: string;
}

export const AdminGiftCodes: React.FC<AdminGiftCodesProps> = ({ adminId, masterToken }) => {
  const { showToast } = useToast();
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'expired' | 'used'>('all');

  // Create / Edit Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCode, setEditingCode] = useState<GiftCode | null>(null);
  const [codeStr, setCodeStr] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [maxUses, setMaxUses] = useState<number>(100);
  const [expiryDays, setExpiryDays] = useState<number>(30);
  const [minVipLevel, setMinVipLevel] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Redemption History Modal
  const [inspectingCode, setInspectingCode] = useState<GiftCode | null>(null);

  const giftCodesRecord = store.getGiftCodes();
  const giftCodes: GiftCode[] = Array.isArray(giftCodesRecord)
    ? giftCodesRecord
    : Object.values(giftCodesRecord || {});
  const usersMap = store.getUsers();
  const tokenToUse = masterToken || sessionStorage.getItem('bingo777_master_admin_token') || 'BINGO_MASTER_2026_KEY';

  const getCodeStatus = (gc: GiftCode): 'Active' | 'Expired' | 'Used' => {
    const activeFlag = gc.isActive !== undefined ? gc.isActive : (gc as unknown as { active?: boolean }).active !== false;
    const maxLimit = gc.maxUses || (gc as unknown as { maxClaims?: number }).maxClaims || 100;
    if (!activeFlag || Date.now() > gc.expiresAt) return 'Expired';
    if (gc.usedCount >= maxLimit) return 'Used';
    return 'Active';
  };

  const filteredCodes = giftCodes.filter((gc) => {
    const st = getCodeStatus(gc);
    if (filterTab === 'active') return st === 'Active';
    if (filterTab === 'expired') return st === 'Expired';
    if (filterTab === 'used') return st === 'Used' || gc.usedCount > 0;
    return true;
  });

  const openCreateModal = () => {
    setEditingCode(null);
    setCodeStr('WELCOME' + Math.floor(100 + Math.random() * 900));
    setAmount(500);
    setMaxUses(100);
    setExpiryDays(30);
    setMinVipLevel(1);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (gc: GiftCode) => {
    setEditingCode(gc);
    setCodeStr(gc.code);
    setAmount(gc.amount);
    setMaxUses(gc.maxUses || (gc as unknown as { maxClaims?: number }).maxClaims || 100);
    const remainingDays = Math.max(1, Math.ceil((gc.expiresAt - Date.now()) / 86400000));
    setExpiryDays(remainingDays);
    setMinVipLevel(gc.minVipLevel || 1);
    setIsActive(gc.isActive !== undefined ? gc.isActive : true);
    setShowModal(true);
  };

  const handleSaveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) {
      const res = store.createGiftCode(codeStr, amount, maxUses, Math.max(1, expiryDays), adminId, minVipLevel);
      if (res.success) {
        await apiClient.createGiftCode(codeStr, amount, maxUses, expiryDays, minVipLevel, adminId, tokenToUse).catch(() => {});
        showToast(`Created Gift Code ${codeStr.toUpperCase()} (₹${amount})`, 'success');
        setShowModal(false);
      } else {
        showToast(res.error || 'Failed to create gift code', 'error');
      }
    } else {
      const expiresAt = Date.now() + Math.max(1, expiryDays) * 86400000;
      const res = store.updateGiftCode(
        editingCode.code,
        {
          amount,
          maxUses,
          expiresAt,
          isActive,
          minVipLevel
        },
        adminId,
        'Updated via Gift Code Management'
      );
      if (res.success) {
        await apiClient
          .updateGiftCode(
            editingCode.code,
            { amount, maxUses, expiryDays, isActive, minVipLevel, reason: 'Admin edit' },
            adminId,
            tokenToUse
          )
          .catch(() => {});
        showToast(`Updated Gift Code ${editingCode.code}`, 'success');
        setShowModal(false);
      } else {
        showToast(res.error || 'Failed to update gift code', 'error');
      }
    }
  };

  const handleDeleteOrDeactivate = async (gc: GiftCode) => {
    if (gc.usedCount > 0) {
      store.toggleGiftCodeStatus(gc.code, false, adminId, 'Deactivated redeemed gift code (audit retention)');
      await apiClient.updateGiftCode(gc.code, { isActive: false, reason: 'Deactivated redeemed code' }, adminId, tokenToUse).catch(() => {});
      showToast(
        `${gc.code} has ${gc.usedCount} redemptions. Marked Expired/Inactive to preserve financial audit records.`,
        'info'
      );
      return;
    }

    const res = store.deleteGiftCode(gc.code, adminId, 'Deleted unused gift code');
    if (res.success) {
      await apiClient.deleteGiftCode(gc.code, 'Deleted unused gift code', adminId, tokenToUse).catch(() => {});
      showToast(`Deleted unused gift code ${gc.code}`, 'success');
    } else {
      showToast(res.error || 'Cannot delete gift code', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Segmented Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl grid grid-cols-4 gap-1">
        {([
          { id: 'all', label: 'All Codes' },
          { id: 'active', label: 'Active' },
          { id: 'expired', label: 'Expired' },
          { id: 'used', label: 'Used' }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Primary Gold "+ Create Gift Code" Button */}
      <button
        type="button"
        onClick={openCreateModal}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition active:scale-[0.99]"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Create Gift Code</span>
      </button>

      {/* Gift Code Cards List */}
      <div className="space-y-2.5">
        {filteredCodes.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-xs">
            No gift codes found in this tab.
          </div>
        ) : (
          filteredCodes.map((gc) => {
            const status = getCodeStatus(gc);
            const maxLimit = gc.maxUses || (gc as unknown as { maxClaims?: number }).maxClaims || 100;
            return (
              <div
                key={gc.code}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-slate-100 text-sm sm:text-base truncate">
                        {gc.code}
                      </span>
                      <span className="font-mono font-black text-amber-400 text-sm sm:text-base tabular-nums">
                        ₹{gc.amount}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium tabular-nums mt-0.5">
                      Uses: {gc.usedCount}/{maxLimit}
                    </div>
                    <div className="text-xs text-slate-400 tabular-nums">
                      Expiry:{' '}
                      {new Date(gc.expiresAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {status}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {gc.usedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setInspectingCode(gc)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center justify-center transition"
                        title="View Redemption History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditModal(gc)}
                      className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm transition"
                      title="Edit Gift Code"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOrDeactivate(gc)}
                      className="w-8 h-8 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-sm transition"
                      title={gc.usedCount > 0 ? 'Deactivate Code (Preserves Audit Trail)' : 'Delete Unused Code'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT GIFT CODE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCode}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100"
          >
            <h4 className="font-bold text-slate-100 text-base">
              {editingCode ? `Edit Gift Code: ${editingCode.code}` : 'Create Gift Code'}
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">Voucher Code</label>
                <input
                  type="text"
                  disabled={!!editingCode}
                  value={codeStr}
                  onChange={(e) => setCodeStr(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono font-bold text-amber-400 uppercase disabled:opacity-60"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">Bonus Value (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">Max Uses</label>
                  <input
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">Validity (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">Min VIP Level</label>
                  <select
                    value={minVipLevel}
                    onChange={(e) => setMinVipLevel(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-bold text-slate-100"
                  >
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        VIP {lvl}+
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editingCode && (
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-slate-300">Code Active Status</span>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-12 h-7 rounded-full p-1 flex items-center transition ${
                      isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white block shadow" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs"
              >
                {editingCode ? 'Save Changes' : 'Create Code'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REDEMPTION HISTORY MODAL */}
      {inspectingCode && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-slate-100 text-base">
                Redemptions: {inspectingCode.code}
              </h4>
              <span className="text-xs font-bold text-amber-400">
                {inspectingCode.usedCount} Claimed
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
              {Object.entries(inspectingCode.claimedBy || {}).length === 0 ? (
                <div className="text-center text-slate-400 py-6">No claims recorded.</div>
              ) : (
                Object.entries(inspectingCode.claimedBy || {}).map(([uid, info]) => {
                  const u = usersMap[uid];
                  const claimedAt = typeof info === 'number' ? info : info.claimedAt;
                  return (
                    <div
                      key={uid}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-100">{u ? u.username : uid}</span>
                        <span className="font-mono text-slate-400 ml-1">({uid})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {new Date(claimedAt).toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => setInspectingCode(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
