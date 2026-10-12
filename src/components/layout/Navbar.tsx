import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Menu,
  Terminal,
  LogOut,
  User as UserIcon,
  Settings,
  Sparkles,
  ChevronDown,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { loadAllReminders, toggleReminderCompleted } from '../../services/reminderService';
import { ContactReminder } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenNewContact: () => void;
  onOpenCppModal: () => void;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigate: (page: string) => void;
  onSelectContactById?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenNewContact,
  onOpenCppModal,
  onToggleSidebar,
  isDarkMode,
  onToggleTheme,
  onNavigate,
  onSelectContactById,
}) => {
  const { user, userProfile, isDemoMode, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [remindersMenuOpen, setRemindersMenuOpen] = useState(false);
  const [reminders, setReminders] = useState<ContactReminder[]>([]);

  // Reload reminders
  const refreshReminders = () => {
    setReminders(loadAllReminders());
  };

  useEffect(() => {
    refreshReminders();
    window.addEventListener('contactsphere_reminders_updated', refreshReminders);
    return () => window.removeEventListener('contactsphere_reminders_updated', refreshReminders);
  }, []);

  const pendingReminders = reminders.filter((r) => !r.isCompleted);
  const overdueCount = pendingReminders.filter(
    (r) => new Date(r.dueDate).getTime() < Date.now()
  ).length;

  const displayName = userProfile?.displayName || user?.displayName || (isDemoMode ? 'Demo Guest' : 'User');
  const userEmail = userProfile?.email || user?.email || (isDemoMode ? 'demo@contactsphere.app' : '');

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search trigger bar */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium transition-all w-44 sm:w-64 md:w-80 border border-slate-200/60 dark:border-slate-700/60 text-left"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">Search directory...</span>
          <span className="hidden sm:inline-block ml-auto text-[11px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400">
            ⌘K
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* About C++ Project link */}
        <button
          onClick={onOpenCppModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>C++ OOP Project</span>
        </button>

        {/* Follow-up Reminders Bell dropdown */}
        <div className="relative">
          <button
            onClick={() => setRemindersMenuOpen(!remindersMenuOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Follow-up Reminders"
            aria-label="View Follow-up Reminders"
          >
            <Bell className="w-5 h-5" />
            {pendingReminders.length > 0 && (
              <span
                className={`absolute top-1 right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center text-white ${
                  overdueCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'
                }`}
              >
                {pendingReminders.length}
              </span>
            )}
          </button>

          {remindersMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRemindersMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      Follow-up Reminders
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {pendingReminders.length} pending reminder{pendingReminders.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  {overdueCount > 0 && (
                    <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                      {overdueCount} overdue
                    </span>
                  )}
                </div>

                {pendingReminders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    All follow-up reminders are caught up!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {pendingReminders.slice(0, 6).map((rem) => {
                      const isOverdue = new Date(rem.dueDate).getTime() < Date.now();
                      const dateStr = new Date(rem.dueDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      });
                      return (
                        <div
                          key={rem.id}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-xs text-slate-900 dark:text-white block truncate">
                                {rem.title}
                              </span>
                              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block truncate">
                                For: {rem.contactName}
                              </span>
                              <span
                                className={`text-[10px] flex items-center gap-1 mt-0.5 font-medium ${
                                  isOverdue ? 'text-rose-500' : 'text-slate-400'
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                {isOverdue ? `Overdue (${dateStr})` : `Due: ${dateStr}`}
                              </span>
                            </div>

                            {onSelectContactById && (
                              <button
                                onClick={() => {
                                  setRemindersMenuOpen(false);
                                  onSelectContactById(rem.contactId);
                                }}
                                className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 bg-indigo-50 dark:bg-indigo-950 rounded-lg shrink-0"
                              >
                                Open
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Add Contact quick button */}
        <button
          onClick={onOpenNewContact}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-sm shadow-indigo-600/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Contact</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle color theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Avatar name={displayName} avatarUrl={userProfile?.photoURL || user?.photoURL || undefined} size="sm" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {displayName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {userEmail}
                  </div>
                  {isDemoMode && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                      Demo Mode Active
                    </span>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    Profile & Account
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Settings & Preferences
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenCppModal();
                    }}
                    className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                  >
                    <Terminal className="w-4 h-4 text-indigo-500" />
                    About C++ OOP Project
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await logout();
                      onNavigate('landing');
                    }}
                    className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
