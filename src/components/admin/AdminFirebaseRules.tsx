import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  CheckCircle2,
  FileCode,
  Save
} from 'lucide-react';
import { FIREBASE_REALTIME_DATABASE_RULES_JSON } from '../../services/firebaseRules';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';

export const AdminFirebaseRules: React.FC = () => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const currentConfig = store.getFirebaseConfig();
  const [dbUrl, setDbUrl] = useState(currentConfig.databaseURL);
  const [projectId, setProjectId] = useState(currentConfig.projectId);
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [syncEnabled, setSyncEnabled] = useState(currentConfig.enabled);

  const handleCopy = () => {
    navigator.clipboard.writeText(FIREBASE_REALTIME_DATABASE_RULES_JSON);
    setCopied(true);
    showToast('Copied database.rules.json to clipboard', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateFirebaseConfig(
      {
        databaseUrl: dbUrl.trim(),
        databaseURL: dbUrl.trim(),
        projectId: projectId.trim(),
        apiKey: apiKey.trim(),
        enabled: syncEnabled
      },
      'MasterAdmin_01'
    );
    showToast('Firebase Realtime Database configuration saved!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Live Firebase Realtime Database Connection Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">
                Firebase Realtime Database Synchronization
              </h3>
              <p className="text-xs text-slate-400">
                Project: <span className="font-mono font-bold text-amber-400">{projectId}</span>
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto border ${
              syncEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {syncEnabled ? 'Realtime Sync Active' : 'Local Only'}
          </span>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Firebase Database URL</label>
              <input
                type="url"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Firebase Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Web API Key / Auth Secret</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Optional Firebase Web API key"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
              <span className="font-semibold text-slate-200">Enable Cloud Sync</span>
              <button
                type="button"
                onClick={() => setSyncEnabled(!syncEnabled)}
                className={`w-12 h-7 rounded-full p-1 flex items-center transition ${
                  syncEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow block" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save & Reconnect Firebase</span>
          </button>
        </form>
      </div>

      {/* Security Rules Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-xs text-slate-100">database.rules.json</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Rules JSON'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-100">Master Admin RBAC</div>
              <p className="text-[11px] text-slate-400">
                Verifies <code className="font-mono text-amber-400">root.child(&apos;master_admins&apos;).child(auth.uid)</code>
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-100">Strict User Isolation</div>
              <p className="text-[11px] text-slate-400">
                Users can never read or modify another player&apos;s wallet or ledger
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-100">Audit Retention</div>
              <p className="text-[11px] text-slate-400">
                Redeemed gift codes &amp; financial records cannot be deleted
              </p>
            </div>
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed">
          {FIREBASE_REALTIME_DATABASE_RULES_JSON}
        </pre>
      </div>
    </div>
  );
};
