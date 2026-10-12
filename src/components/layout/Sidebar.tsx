import React from 'react';
import {
  LayoutDashboard,
  Users,
  Star,
  Tags,
  ArrowUpDown,
  UserCheck,
  Settings,
  Terminal,
  ShieldCheck,
  ChevronLeft,
  BookOpen
} from 'lucide-react';
import { Contact } from '../../types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  contacts: Contact[];
  isOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCppModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  contacts,
  isOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  onOpenCppModal,
}) => {
  const totalCount = contacts.length;
  const favCount = contacts.filter((c) => c.isFavorite).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contacts', label: 'All Contacts', icon: Users, badge: totalCount },
    { id: 'favorites', label: 'Favorites', icon: Star, badge: favCount },
    { id: 'categories', label: 'Categories & Tags', icon: Tags },
    { id: 'import-export', label: 'Import & Export', icon: ArrowUpDown },
    { id: 'profile', label: 'My Profile', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (pageId: string) => {
    onNavigate(pageId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'w-64 lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => handleItemClick('dashboard')}
            className="flex items-center gap-3 overflow-hidden text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
              <span className="font-bold text-lg font-mono">CS</span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight block truncate">
                  ContactSphere
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold block">
                  Smart Directory
                </span>
              </div>
            )}
          </button>

          {/* Desktop Collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'
                  }`}
                />
                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {typeof item.badge === 'number' && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}

          {/* Academic micro-project highlight card */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                onOpenCppModal();
                onCloseMobile();
              }}
              title={isCollapsed ? 'OOP C++ Project Origin' : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100/70 transition-all ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              {!isCollapsed && (
                <div className="text-left min-w-0">
                  <span className="block truncate font-bold">C++ OOP Foundation</span>
                  <span className="block text-[10px] text-indigo-500/80 dark:text-indigo-400/70 truncate">
                    Classes & Encapsulation
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Security & System Info Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="font-medium block truncate text-slate-700 dark:text-slate-300">
                  Cloud Firestore Sync
                </span>
                <span className="text-[10px] block truncate text-slate-400">
                  Zero-Trust ABAC Security
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Zero-Trust ABAC Security Active">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
