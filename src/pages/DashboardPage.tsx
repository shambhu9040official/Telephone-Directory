import React, { useMemo } from 'react';
import {
  Users,
  Star,
  Clock,
  Calendar,
  Layers,
  AlertCircle,
  Plus,
  ArrowUpDown,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  Phone,
  Mail,
  Activity,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Contact, ActivityLog } from '../types';
import { Avatar } from '../components/common/Avatar';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardPageProps {
  contacts: Contact[];
  activityLogs: ActivityLog[];
  onNavigate: (page: string) => void;
  onOpenNewContact: () => void;
  onSelectContact: (contact: Contact) => void;
  onSeedSampleData: () => Promise<void>;
  isLoadingSeed?: boolean;
}

const CATEGORY_COLORS = [
  '#4f46e5', // indigo
  '#2563eb', // blue
  '#7c3aed', // violet
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#8b5cf6', // purple
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  contacts,
  activityLogs,
  onNavigate,
  onOpenNewContact,
  onSelectContact,
  onSeedSampleData,
  isLoadingSeed = false,
}) => {
  // Real-time statistics derived from actual contacts list
  const totalContacts = contacts.length;
  const favoriteContacts = contacts.filter((c) => c.isFavorite);
  const favoritesCount = favoriteContacts.length;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const contactsThisMonth = useMemo(() => {
    return contacts.filter((c) => {
      try {
        const d = new Date(c.createdAt);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      } catch {
        return false;
      }
    }).length;
  }, [contacts, currentYear, currentMonth]);

  const sevenDaysAgo = now.getTime() - 7 * 86400000;
  const recentlyAddedCount = useMemo(() => {
    return contacts.filter((c) => {
      try {
        const d = new Date(c.createdAt).getTime();
        return d >= sevenDaysAgo;
      } catch {
        return false;
      }
    }).length;
  }, [contacts, sevenDaysAgo]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(contacts.map((c) => c.category || 'General'));
    return Array.from(cats);
  }, [contacts]);

  const missingInfoCount = useMemo(() => {
    return contacts.filter((c) => !c.email || !c.company || !c.address).length;
  }, [contacts]);

  // Growth by month calculation
  const growthData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts: Record<string, number> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyCounts[label] = 0;
    }

    contacts.forEach((c) => {
      try {
        const d = new Date(c.createdAt);
        const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
        if (monthlyCounts[label] !== undefined) {
          monthlyCounts[label] += 1;
        }
      } catch {
        // skip unparsable
      }
    });

    return Object.entries(monthlyCounts).map(([month, count]) => ({
      month,
      contacts: count,
    }));
  }, [contacts, now]);

  // Category distribution data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach((c) => {
      const cat = c.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [contacts]);

  // Recently added contacts sorted
  const recentContacts = useMemo(() => {
    return [...contacts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [contacts]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive CRM & Telephone Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Directory Overview & Real-Time Stats
          </h1>
          <p className="mt-2 text-indigo-100/80 text-xs sm:text-sm leading-relaxed">
            All metrics are calculated dynamically from your personal Firestore records. Use quick actions below to manage your contact database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={onOpenNewContact}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white text-indigo-900 hover:bg-indigo-50 shadow-md shadow-black/10 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            Add Contact
          </button>
          <button
            onClick={() => onNavigate('import-export')}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-700/80 hover:bg-indigo-700 text-white border border-indigo-500/50 transition-colors flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            Import / Export
          </button>
          {contacts.length === 0 && (
            <button
              onClick={onSeedSampleData}
              disabled={isLoadingSeed}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoadingSeed ? 'Populating...' : 'Seed Sample Contacts'}
            </button>
          )}
        </div>
      </div>

      {/* 6 Statistic Cards Grid with Live Motion */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Total Contacts',
            value: totalContacts,
            icon: Users,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-950/50',
            border: 'border-indigo-100 dark:border-indigo-900/60',
          },
          {
            label: 'Favorites',
            value: favoritesCount,
            icon: Star,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-950/50',
            border: 'border-amber-100 dark:border-amber-900/60',
          },
          {
            label: 'Added (7 Days)',
            value: recentlyAddedCount,
            icon: Clock,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/50',
            border: 'border-blue-100 dark:border-blue-900/60',
          },
          {
            label: 'This Month',
            value: contactsThisMonth,
            icon: Calendar,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/50',
            border: 'border-emerald-100 dark:border-emerald-900/60',
          },
          {
            label: 'Categories',
            value: uniqueCategories.length,
            icon: Layers,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-50 dark:bg-violet-950/50',
            border: 'border-violet-100 dark:border-violet-900/60',
          },
          {
            label: 'Incomplete Info',
            value: missingInfoCount,
            icon: AlertCircle,
            color: 'text-rose-500',
            bg: 'bg-rose-50 dark:bg-rose-950/50',
            border: 'border-rose-100 dark:border-rose-900/60',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border ${card.border} shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {card.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth by Month (Area Chart) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Contact Directory Growth
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                New records cataloged by month
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="contacts"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#growthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution (Donut Chart) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-500" />
                Category Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Proportion by contact group
              </p>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-xs text-slate-400">
              <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <span>No contact records available to visualize</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-2 mt-2 max-h-24 overflow-y-auto">
                {categoryData.map((cat, i) => (
                  <span
                    key={cat.name}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    />
                    {cat.name} ({cat.value})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Columns: Recently Added & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Recently Added Contacts
              </h2>
              <button
                onClick={() => onNavigate('contacts')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentContacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No contacts saved yet. Click &ldquo;Add Contact&rdquo; to begin your directory.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recentContacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectContact(c)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={c.name} avatarUrl={c.avatarUrl} size="sm" />
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white truncate block">
                          {c.name}
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate block">
                          {c.phone}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {c.category}
                      </span>
                      <a
                        href={`tel:${c.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Audit Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Recent Directory Activity
              </h2>
              <span className="text-xs text-slate-400">Real-time audit</span>
            </div>

            {activityLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent actions recorded.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {activityLogs.slice(0, 6).map((log, index) => {
                    const formatTime = (ts: string) => {
                      try {
                        return new Date(ts).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      } catch {
                        return '';
                      }
                    };
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                        whileHover={{ x: 3, transition: { duration: 0.15 } }}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs"
                      >
                        <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 dark:text-slate-200 font-medium">
                            {log.description}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {formatTime(log.timestamp)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
