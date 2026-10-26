import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  XCircle,
  Search
} from 'lucide-react';
import { UserRecord, DeviceRecord } from '../../types';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';

interface AdminDeviceApprovalProps {
  adminId: string;
}

interface FlatDeviceItem {
  user: UserRecord;
  device: DeviceRecord;
}

export const AdminDeviceApproval: React.FC<AdminDeviceApprovalProps> = ({ adminId }) => {
  const { showToast } = useToast();
  const [, setTick] = useState(0);
  React.useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectingItem, setRejectingItem] = useState<FlatDeviceItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const users = Object.values(store.getUsers());

  const allDevices: FlatDeviceItem[] = [];
  users.forEach((u) => {
    Object.values(u.devices || {}).forEach((d) => {
      if (d && d.deviceId) {
        allDevices.push({ user: u, device: d });
      }
    });
  });

  allDevices.sort(
    (a, b) =>
      (b.device.requestedAt || b.device.registeredAt || b.device.lastUsedAt || 0) -
      (a.device.requestedAt || a.device.registeredAt || a.device.lastUsedAt || 0)
  );

  const q = searchTerm.toLowerCase();
  const filtered = allDevices.filter((item) => {
    const matchesStatus = filter === 'all' || item.device.status === filter;
    const modelStr = (item.device.deviceModel || item.device.deviceName || '').toLowerCase();
    const matchesSearch =
      (item.user.username || '').toLowerCase().includes(q) ||
      (item.user.phone || '').includes(searchTerm) ||
      (item.device.deviceId || '').toLowerCase().includes(q) ||
      modelStr.includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (uid: string, deviceId: string) => {
    const ok = store.approveDevice(uid, deviceId, adminId);
    if (ok) {
      showToast(
        `Approved device ${deviceId} for ${uid} & revoked any previous device (1 Number = 1 Device policy)`,
        'success'
      );
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;
    const reason = rejectReason.trim() || 'Unverified hardware signature';
    store.rejectDevice(rejectingItem.user.uid, rejectingItem.device.deviceId, adminId, reason);
    showToast(`Rejected device ${rejectingItem.device.deviceId}`, 'info');
    setRejectingItem(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-4">
      {/* 1 Number = 1 Device Policy Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-black text-amber-400">🔒 Strict 1 Number = 1 Device Policy: </span>
          <span>
            Ek mobile number sirf 1 device me login ho sakta hai. Dusre device se login karne par request yahan Pending me aayegi. Jab aap Approve karenge, purana device apne aap logout/revoke ho jayega.
          </span>
        </div>
      </div>

      {/* Segmented Status Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl grid grid-cols-4 gap-1">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={`py-2 px-2 rounded-xl text-xs font-bold uppercase transition ${
              filter === st
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {st} ({allDevices.filter((x) => st === 'all' || x.device.status === st).length})
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search user, phone, or device ID..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 shadow-inner focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Device Cards List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-xs">
            No {filter === 'all' ? '' : filter} device authorization requests found.
          </div>
        ) : (
          filtered.map(({ user, device }) => (
            <div
              key={`${user.uid}_${device.deviceId}`}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    device.status === 'pending'
                      ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                      : device.status === 'approved'
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">
                      {user.username} ({user.uid})
                    </span>
                    <span className="text-xs font-mono text-slate-400">+91 {user.phone}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        device.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : device.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {device.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Model: <strong className="text-slate-100">{device.deviceModel || device.deviceName || 'Device'}</strong> · OS: {device.osVersion || device.os || 'Unknown'} · ID:{' '}
                    <span className="font-mono text-amber-300">{device.deviceId}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {device.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(user.uid, device.deviceId)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve (1-Device Lock)</span>
                  </button>
                )}
                {device.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingItem({ user, device });
                      setRejectReason('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Device Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReject}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100"
          >
            <h4 className="font-bold text-slate-100 text-base">
              Reject Device ({rejectingItem.device.deviceId})
            </h4>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Rejection Reason</label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Unrecognized emulator / multiple account hardware"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Confirm Reject
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
