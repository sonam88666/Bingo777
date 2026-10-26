import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  Bell,
  Megaphone
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';

interface AdminSupportChatProps {
  adminId: string;
}

export const AdminSupportChat: React.FC<AdminSupportChatProps> = ({ adminId }) => {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'broadcast'>('chat');
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Broadcast & Push Notification state
  const currentSettings = store.getAdminSettings();
  const [announcementBanner, setAnnouncementBanner] = useState<string>(currentSettings.announcementText || '');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | string>('all');

  const allMessages = store.getSupportMessages();
  const usersMap = store.getUsers();
  const usersList = Object.values(usersMap);

  // Group messages by user UID
  const threadsByUid = allMessages.reduce((acc, msg) => {
    if (!acc[msg.uid]) acc[msg.uid] = [];
    acc[msg.uid].push(msg);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  const threadUids = Object.keys(threadsByUid).sort((a, b) => {
    const lastA = threadsByUid[a][threadsByUid[a].length - 1]?.timestamp || 0;
    const lastB = threadsByUid[b][threadsByUid[b].length - 1]?.timestamp || 0;
    return lastB - lastA;
  });

  useEffect(() => {
    if (!selectedUid && threadUids.length > 0) {
      setSelectedUid(threadUids[0]);
    }
  }, [threadUids, selectedUid]);

  useEffect(() => {
    if (selectedUid) {
      store.markSupportMessagesRead(selectedUid);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUid, allMessages.length]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUid || !replyText.trim()) return;
    const targetUser = usersMap[selectedUid];
    const username = targetUser ? targetUser.username : 'Player';
    store.sendSupportMessage(selectedUid, username, 'admin', replyText.trim());
    setReplyText('');
  };

  const handleQuickReply = (text: string) => {
    if (!selectedUid) return;
    const targetUser = usersMap[selectedUid];
    const username = targetUser ? targetUser.username : 'Player';
    store.sendSupportMessage(selectedUid, username, 'admin', text);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    store.updateAdminSettings({ announcementText: announcementBanner }, adminId);
    await apiClient.updateSettings({ announcementText: announcementBanner }, adminId).catch(() => {});
    showToast('App marquee announcement updated in real time!', 'success');
  };

  const handleSendPushNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      showToast('Please enter a notification message', 'error');
      return;
    }

    if (broadcastTarget === 'all') {
      usersList.forEach((u) => {
        store.sendSupportMessage(
          u.uid,
          u.username,
          'admin',
          `[OFFICIAL NOTIFICATION] ${broadcastMessage.trim()}`
        );
      });
      store.logAudit({
        actor: adminId,
        category: 'SETTINGS',
        action: 'BROADCAST_NOTIFICATION_SENT',
        details: `Sent push notification to all ${usersList.length} users: "${broadcastMessage.trim()}"`,
        outcome: 'SUCCESS'
      });
      showToast(`Broadcast notification delivered to all ${usersList.length} players!`, 'success');
    } else {
      const targetUser = usersMap[broadcastTarget];
      if (targetUser) {
        store.sendSupportMessage(
          targetUser.uid,
          targetUser.username,
          'admin',
          `[DIRECT NOTIFICATION] ${broadcastMessage.trim()}`
        );
        showToast(`Notification sent to ${targetUser.username} (${targetUser.uid})`, 'success');
      }
    }
    setBroadcastMessage('');
  };

  const filteredUids = threadUids.filter((uid) => {
    const u = usersMap[uid];
    const lastMsg = threadsByUid[uid][threadsByUid[uid].length - 1];
    return (
      uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u && u.phone.includes(searchTerm)) ||
      (lastMsg && lastMsg.text.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const activeThread = selectedUid ? threadsByUid[selectedUid] || [] : [];
  const activeUser = selectedUid ? usersMap[selectedUid] : null;

  return (
    <div className="space-y-4">
      {/* Top Segmented Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('chat')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeSubTab === 'chat'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Live Support Chat ({threadUids.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('broadcast')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeSubTab === 'broadcast'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Push Notifications & Marquee</span>
        </button>
      </div>

      {activeSubTab === 'broadcast' ? (
        <div className="space-y-4">
          {/* App Marquee Banner Configuration */}
          <form
            onSubmit={handleSaveAnnouncement}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
          >
            <div className="flex items-center space-x-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-slate-100 text-sm">User App Live Marquee Announcement</h4>
            </div>
            <textarea
              rows={2}
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
              placeholder="Enter live scrolling announcement banner text..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-sm transition"
            >
              Update Live App Banner
            </button>
          </form>

          {/* Broadcast Notification Dispatcher */}
          <form
            onSubmit={handleSendPushNotification}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
          >
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-slate-100 text-sm">Send Push Notification / In-App Alert</h4>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Recipient Target</label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Registered Users ({usersList.length} Players)</option>
                {usersList.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.username} ({u.uid}) — {u.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Notification Message</label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type official notification or bonus alert message..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Notification</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[560px]">
          {/* Left: User Conversation List */}
          <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Support Threads ({threadUids.length})</span>
                </h3>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
              {filteredUids.map((uid) => {
                const msgs = threadsByUid[uid];
                const lastMsg = msgs[msgs.length - 1];
                const unreadCount = msgs.filter((m) => m.sender === 'user' && !m.read).length;
                const user = usersMap[uid];
                const isSelected = selectedUid === uid;

                return (
                  <button
                    key={uid}
                    type="button"
                    onClick={() => setSelectedUid(uid)}
                    className={`w-full p-3.5 text-left transition flex items-start justify-between ${
                      isSelected ? 'bg-amber-500/15 border-l-4 border-amber-500' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-xs text-amber-400 shrink-0">
                        {(user?.username || lastMsg.username || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-slate-100 truncate">
                            {user?.username || lastMsg.username}
                          </span>
                          {user && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                              VIP {user.vipLevel}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {lastMsg.sender === 'admin' ? 'You: ' : ''}
                          {lastMsg.text}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(lastMsg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {unreadCount > 0 && (
                        <span className="mt-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[9px]">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredUids.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">No support conversations found.</div>
              )}
            </div>
          </div>

          {/* Right: Active Conversation Window */}
          <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col overflow-hidden">
            {selectedUid ? (
              <>
                {/* Thread Header */}
                <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                      {(activeUser?.username || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-100">
                          {activeUser?.username || selectedUid}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">UID: {selectedUid}</span>
                      </div>
                      {activeUser && (
                        <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-0.5">
                          <span>Phone: +91 {activeUser.phone}</span>
                          <span>·</span>
                          <span className="text-amber-400 font-mono font-bold">
                            Balance: ₹{activeUser.balance.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      store.resolveSupportTicket(selectedUid, adminId);
                      showToast(
                        `Support ticket for ${activeUser?.username || selectedUid} marked as resolved & user notified!`,
                        'success'
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center space-x-1.5 transition shrink-0"
                    title="Resolve Ticket & Send Local Notification Alert to Player"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Resolve & Notify</span>
                  </button>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
                  {activeThread.map((m) => {
                    const isAdmin = m.sender === 'admin';
                    return (
                      <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs ${
                            isAdmin
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-br-none shadow-sm'
                              : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <div className="leading-relaxed break-words">{m.text}</div>
                          <div
                            className={`text-[9px] mt-1 flex items-center justify-end space-x-1 ${
                              isAdmin ? 'text-slate-900/75' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(m.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {isAdmin && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Preset Replies */}
                <div className="px-3 py-2 border-t border-slate-800 bg-slate-900 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                  {[
                    'Your UPI deposit has been verified & credited!',
                    'Please share your 12-digit UTR reference number.',
                    'Your withdrawal is approved and settled.',
                    'We have credited a VIP bonus to your wallet!'
                  ].map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickReply(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-amber-300 font-semibold whitespace-nowrap transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Input Box */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 border-t border-slate-800 bg-slate-900 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${activeUser?.username || 'player'} as (${adminId})...`}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Select a conversation from the left panel to respond.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
