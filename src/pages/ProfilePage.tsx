import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Image as ImageIcon,
  KeyRound,
  LogOut,
  Save,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Avatar } from '../components/common/Avatar';
import { Contact } from '../types';

interface ProfilePageProps {
  contacts: Contact[];
  onLogout: () => Promise<void>;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ contacts, onLogout }) => {
  const { user, userProfile, isDemoMode, updateUserProfileData, sendPasswordReset } = useAuth();
  const { success, error: toastError } = useToast();

  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || user?.displayName || ''
  );
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || user?.photoURL || '');
  const [phoneFormat, setPhoneFormat] = useState(userProfile?.phoneFormat || 'INTERNATIONAL');
  const [isSaving, setIsSaving] = useState(false);

  const totalContacts = contacts.length;
  const favContacts = contacts.filter((c) => c.isFavorite).length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfileData({
        displayName: displayName.trim(),
        photoURL: photoURL.trim(),
        phoneFormat,
      });
      success('User profile updated successfully!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    const emailToUse = user?.email || userProfile?.email;
    if (!emailToUse) {
      toastError('No email linked to send password reset link.');
      return;
    }
    try {
      await sendPasswordReset(emailToUse);
      success(`Password reset link sent to ${emailToUse}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Account & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal credentials, contact display format, and security settings
        </p>
      </div>

      {/* Header Profile Badge */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <Avatar
          name={displayName || 'User'}
          avatarUrl={photoURL || undefined}
          size="xl"
          className="ring-4 ring-indigo-50 dark:ring-indigo-950"
        />

        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
              {displayName || 'Directory User'}
            </h2>
            {isDemoMode ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                Demo Evaluator
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                Verified Cloud User
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
            {user?.email || userProfile?.email || 'demo@contactsphere.app'}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
            <span>
              <strong>{totalContacts}</strong> Contacts Stored
            </span>
            <span>&bull;</span>
            <span>
              <strong>{favContacts}</strong> Starred
            </span>
            <span>&bull;</span>
            <span className="font-mono text-[11px] text-slate-400 truncate max-w-[140px]">
              UID: {user?.uid ? `${user.uid.slice(0, 8)}...` : 'DEMO_SANDBOX'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Profile Information
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={user?.email || userProfile?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Avatar Photo URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number Display Format
            </label>
            <select
              value={phoneFormat}
              onChange={(e) => setPhoneFormat(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500"
            >
              <option value="INTERNATIONAL">International Standard (e.g. +1 212-555-0199)</option>
              <option value="NATIONAL">National / Local (e.g. 212-555-0199)</option>
              <option value="RFC3966">RFC 3966 Dialable URI (e.g. tel:+1-212-555-0199)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Actions */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Security & Password Management
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div>
            <span className="font-semibold text-sm text-slate-900 dark:text-white block">
              Change Account Password
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Sends an authenticated reset link to your email address.
            </span>
          </div>
          <button
            onClick={handlePasswordReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Send Reset Email
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of ContactSphere
          </button>
        </div>
      </div>
    </div>
  );
};
