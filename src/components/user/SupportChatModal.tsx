import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, CheckCheck, ExternalLink, Copy } from 'lucide-react';
import { UserRecord, ChatMessage } from '../../types';
import { store } from '../../services/store';
import { soundFx } from '../../services/soundFx';
import { useToast } from '../common/Toast';

interface SupportChatModalProps {
  user: UserRecord | null;
  onClose: () => void;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({ user, onClose }) => {
  const { showToast } = useToast();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const settings = store.getAdminSettings();
  const rawTelegram = settings.supportTelegram || '@colourWinAdmin';
  const telegramHandle = rawTelegram.startsWith('@') ? rawTelegram : `@${rawTelegram}`;
  const telegramUsername = telegramHandle.replace(/^@/, '');
  const telegramUrl = `https://t.me/${telegramUsername}`;

  const refreshMessages = () => {
    if (!user) return;
    const all = store.getSupportMessages();
    setMessages(all.filter((m) => m.uid === user.uid));
  };

  useEffect(() => {
    if (!user) return;
    refreshMessages();
    store.markMessagesAsRead(user.uid);
    const unsubscribe = store.subscribe(() => {
      refreshMessages();
    });
    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopyTelegram = () => {
    navigator.clipboard.writeText(telegramHandle);
    showToast(`Copied ${telegramHandle} to clipboard!`, 'success');
  };

  const handleSend = (textToSend?: string) => {
    if (!user) return;
    const text = textToSend || inputText;
    if (!text.trim()) return;

    soundFx.playNotification();
    store.sendSupportMessage(user.uid, user.username, 'user', text.trim());
    setInputText('');
  };

  const quickPrompts = [
    'Check deposit status',
    'Withdrawal processing time',
    'Refer & Earn bonus query',
    'Gift code inquiry'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[580px]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-sky-500/20">
                TG
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 flex items-center space-x-1.5">
                <span>Bingo777 Official Support</span>
              </div>
              <div className="text-[11px] text-sky-400 font-mono font-bold">
                Telegram Only: {telegramHandle}
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

        {/* Official Telegram Banner */}
        <div className="p-3.5 bg-gradient-to-r from-sky-950/80 via-slate-900 to-sky-950/80 border-b border-sky-500/30 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 block">
              OFFICIAL TELEGRAM SUPPORT
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="font-mono font-black text-sm text-white truncate">
                {telegramHandle}
              </span>
              <button
                type="button"
                onClick={handleCopyTelegram}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition"
                title="Copy Telegram Username"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-sky-500/25 flex items-center space-x-1.5 shrink-0 active:scale-95 transition"
          >
            <span>Open Telegram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
          {!user ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs space-y-3">
              <MessageSquare className="w-10 h-10 text-sky-400/50" />
              <p className="font-bold text-slate-200 text-sm">Contact Official Telegram Support</p>
              <p className="text-xs text-slate-400">
                For instant help with deposits, withdrawals, or account queries, message us on Telegram at{' '}
                <span className="font-mono font-bold text-sky-400">{telegramHandle}</span>.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-amber-500/40" />
              <p className="font-semibold text-slate-200">Official Support: {telegramHandle}</p>
              <p className="text-[11px] text-slate-400">
                Contact <span className="font-mono font-bold text-sky-400">{telegramHandle}</span> on Telegram or leave a message for Master Admin below.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                      isUser
                        ? 'bg-amber-500 text-slate-950 rounded-tr-none font-medium shadow-md shadow-amber-500/10'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    <p className="leading-relaxed break-words">{msg.text}</p>
                    <div
                      className={`text-[9px] mt-1 flex items-center justify-end space-x-1 ${
                        isUser ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isUser && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {user && (
          <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-[10px] whitespace-nowrap bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 px-2.5 py-1 rounded-full border border-slate-700/60 transition shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        {user && (
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder={`Message Admin or contact ${telegramHandle}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 flex items-center justify-center font-bold shadow-md transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
