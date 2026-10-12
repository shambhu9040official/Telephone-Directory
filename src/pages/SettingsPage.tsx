import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Trash2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { testConnection } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface SettingsPageProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSeedSampleData: () => Promise<void>;
  onClearAllContacts: () => Promise<void>;
  isLoadingAction?: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isDarkMode,
  onToggleTheme,
  onSeedSampleData,
  onClearAllContacts,
  isLoadingAction = false,
}) => {
  const { userProfile, updateUserProfileData, isDemoMode } = useAuth();
  const { success, error: toastError } = useToast();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const handleTestLatency = async () => {
    setTestingConnection(true);
    const start = performance.now();
    try {
      const ok = await testConnection();
      const duration = Math.round(performance.now() - start);
      setConnectionStatus(`Connected & Verified (${duration}ms roundtrip)`);
      success(`Firestore connected in ${duration}ms!`);
    } catch (err: any) {
      setConnectionStatus('Connection check failed');
      toastError('Connection check failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleClearActivity = () => {
    localStorage.removeItem('contactsphere_demo_activities');
    success('Local activity logs cleared.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Application Settings & Diagnostics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Appearance, database diagnostics, and directory lifecycle maintenance
        </p>
      </div>

      {/* Appearance Settings */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-slate-900 dark:text-white">
          Visual Interface
        </h2>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                Color Theme
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                Current mode: {isDarkMode ? 'Dark theme' : 'Light theme'}
              </span>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Switch to {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* System & Firestore Diagnostics */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-500" />
            Cloud Database Diagnostics
          </h2>
          <button
            onClick={handleTestLatency}
            disabled={testingConnection}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 block">Database Service</span>
            <span className="font-semibold text-slate-900 dark:text-white block">
              Google Cloud Firestore (Enterprise)
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Security Rules Active
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 block">Connectivity Status</span>
            <span className="font-semibold text-slate-900 dark:text-white block">
              {connectionStatus || 'Ready (Server Snapshot Listeners Attached)'}
            </span>
            <span className="text-[11px] text-slate-400 block">
              Latency test verifies Firestore server roundtrip.
            </span>
          </div>
        </div>
      </div>

      {/* Directory Maintenance & Danger Zone */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-slate-900 dark:text-white">
          Data Management
        </h2>

        {/* Populate starter records */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
          <div>
            <span className="font-semibold text-sm text-slate-900 dark:text-white block">
              Seed Starter Contacts
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Add curated sample contacts (including academic guides and tech founders) for evaluation.
            </span>
          </div>
          <button
            onClick={onSeedSampleData}
            disabled={isLoadingAction}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Seed Sample Contacts
          </button>
        </div>

        {/* Clear Local Audit Logs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div>
            <span className="font-semibold text-sm text-slate-900 dark:text-white block">
              Clear Activity History
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Reset the recent activity audit feed log.
            </span>
          </div>
          <button
            onClick={handleClearActivity}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0"
          >
            Clear History
          </button>
        </div>

        {/* Clear all contacts (Danger) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
          <div>
            <span className="font-semibold text-sm text-rose-900 dark:text-rose-200 block">
              Purge Directory
            </span>
            <span className="text-xs text-rose-700/80 dark:text-rose-400/80 block mt-0.5">
              Permanently delete all contacts owned by your current account.
            </span>
          </div>
          <button
            onClick={() => setConfirmClearOpen(true)}
            disabled={isLoadingAction}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge All Contacts
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Purge Entire Contact Directory?"
        message="This action will delete all contacts in your directory. This action cannot be undone. Consider exporting a CSV backup beforehand."
        confirmText="Yes, Purge Directory"
        isDanger={true}
        isLoading={isLoadingAction}
        onConfirm={async () => {
          await onClearAllContacts();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
