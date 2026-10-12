import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  Star,
  Edit2,
  Trash2,
  Copy,
  Clock,
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  Plus,
  CalendarClock,
  Sparkles,
  Check,
  Tag
} from 'lucide-react';
import { Contact, ContactReminder } from '../../types';
import { Avatar } from '../common/Avatar';
import { motion, AnimatePresence } from 'motion/react';
import {
  getContactReminders,
  addContactReminder,
  toggleReminderCompleted,
  deleteReminder,
  REMINDER_PRESETS,
  calculatePresetDate
} from '../../services/reminderService';
import { useToast } from '../../context/ToastContext';

interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact) => void;
  onCopyPhone: (phone: string) => void;
  onCopyEmail: (email: string) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopyPhone,
  onCopyEmail,
}) => {
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'reminders'>('overview');

  // Reminders state
  const [reminders, setReminders] = useState<ContactReminder[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customDueDate, setCustomDueDate] = useState('');
  const [customPriority, setCustomPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [customNotes, setCustomNotes] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Load reminders when modal opens or contact changes
  useEffect(() => {
    if (contact && isOpen) {
      setReminders(getContactReminders(contact.id));
      setActiveTab('overview');
      setShowCustomForm(false);
      // Default custom date to tomorrow 10:00 AM
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      tmrw.setHours(10, 0, 0, 0);
      const isoLocal = new Date(tmrw.getTime() - tmrw.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setCustomDueDate(isoLocal);
    }
  }, [contact, isOpen]);

  if (!isOpen || !contact) return null;

  const pendingRemindersCount = reminders.filter((r) => !r.isCompleted).length;

  const handleApplyPreset = (preset: typeof REMINDER_PRESETS[0]) => {
    const dueIso = calculatePresetDate(preset.daysAhead);
    const newRem = addContactReminder(contact.id, contact.name, {
      title: preset.title,
      dueDate: dueIso,
      preset: preset.label,
      priority: preset.priority,
      notes: `Scheduled via quick preset: ${preset.label}`,
    });
    setReminders(getContactReminders(contact.id));
    success(`Reminder set: "${preset.title}" (${preset.label})`);
  };

  const handleAddCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const dueIso = customDueDate ? new Date(customDueDate).toISOString() : calculatePresetDate(1);
    addContactReminder(contact.id, contact.name, {
      title: customTitle.trim(),
      dueDate: dueIso,
      priority: customPriority,
      notes: customNotes.trim(),
    });

    setReminders(getContactReminders(contact.id));
    setCustomTitle('');
    setCustomNotes('');
    setShowCustomForm(false);
    success(`Follow-up reminder "${customTitle.trim()}" created!`);
  };

  const handleToggleReminder = (remId: string) => {
    const updated = toggleReminderCompleted(remId);
    setReminders(updated.filter((r) => r.contactId === contact.id));
    const target = reminders.find((r) => r.id === remId);
    if (target && !target.isCompleted) {
      success(`Marked "${target.title}" as completed.`);
    } else {
      info('Reminder marked as pending.');
    }
  };

  const handleDeleteReminder = (remId: string) => {
    const updated = deleteReminder(remId);
    setReminders(updated.filter((r) => r.contactId === contact.id));
    info('Reminder removed.');
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatReminderDueDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = d.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

      if (diffMs < 0) {
        return { label: `Overdue (${dateStr})`, isOverdue: true };
      } else if (diffDays <= 1) {
        return { label: `Today / Tomorrow at ${timeStr}`, isDueSoon: true };
      } else {
        return { label: `In ${diffDays} days (${dateStr} at ${timeStr})`, isUpcoming: true };
      }
    } catch {
      return { label: isoString };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Banner with gradient */}
        <div className="relative h-28 bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 p-4 flex items-start justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
            {contact.category}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white backdrop-blur-md transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="px-6 pb-4 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-end gap-4">
            <div className="ring-4 ring-white dark:ring-slate-900 rounded-2xl shadow-lg shrink-0">
              <Avatar name={contact.name} avatarUrl={contact.avatarUrl} size="xl" />
            </div>
            <div className="mb-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {contact.name}
                </h2>
                <button
                  onClick={() => onToggleFavorite(contact)}
                  className={`p-1.5 rounded-xl transition-colors ${
                    contact.isFavorite
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                      : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                  }`}
                  aria-label={contact.isFavorite ? 'Unfavorite' : 'Favorite'}
                >
                  <Star className={`w-5 h-5 ${contact.isFavorite ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              {contact.jobTitle && (
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {contact.jobTitle}
                </p>
              )}
              {contact.company && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5" />
                  {contact.company}
                </p>
              )}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => {
                onClose();
                onEdit(contact);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(contact);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-2 bg-slate-50/50 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span>Overview & Contact</span>
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'reminders'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Reminders & Follow-ups</span>
            {pendingRemindersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-600 text-white">
                {pendingRemindersCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' ? (
            <>
              {/* Quick Connect CTA Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone Call */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      Telephone
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate block">
                      {contact.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                      title="Call telephone"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onCopyPhone(contact.phone)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors border border-indigo-200 dark:border-slate-700"
                      title="Copy telephone"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email Message */}
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                      Email Address
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate block">
                      {contact.email || 'None provided'}
                    </span>
                  </div>
                  {contact.email ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={`mailto:${contact.email}`}
                        className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                        title="Send email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => onCopyEmail(contact.email!)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors border border-blue-200 dark:border-slate-700"
                        title="Copy email"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Mail className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </div>

              {/* Reminders Sneak-Peek Banner */}
              {pendingRemindersCount > 0 && (
                <div
                  onClick={() => setActiveTab('reminders')}
                  className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      You have <strong>{pendingRemindersCount}</strong> pending follow-up reminder
                      {pendingRemindersCount > 1 ? 's' : ''} for {contact.name}.
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline">
                    View &rarr;
                  </span>
                </div>
              )}

              {/* Details list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contact Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {contact.address && (
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-400 block">Address</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {contact.address}
                        </span>
                      </div>
                    </div>
                  )}

                  {contact.birthday && (
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-400 block">Birthday</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {contact.birthday}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {contact.tags && contact.tags.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-400 block mb-2 font-medium">
                      Associated Tags
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {contact.notes && (
                  <div>
                    <span className="text-xs text-slate-400 block mb-2 font-medium">
                      Notes & Details
                    </span>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {contact.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Audit Timestamp Footprint */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Created: {formatDate(contact.createdAt)}
                </span>
                <span>Last Updated: {formatDate(contact.updatedAt)}</span>
              </div>
            </>
          ) : (
            /* Reminders Tab Body */
            <div className="space-y-6">
              {/* Preset Quick Actions */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Quick Follow-up Presets
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    1-Click Scheduling
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {REMINDER_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleApplyPreset(preset)}
                      className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 hover:bg-indigo-50/80 dark:bg-slate-800/50 dark:hover:bg-indigo-950/50 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left flex items-center justify-between group"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block truncate">
                          {preset.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          +{preset.daysAhead} day{preset.daysAhead > 1 ? 's' : ''} from now
                        </span>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reminder Toggle / Form */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {!showCustomForm ? (
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Custom Follow-up Reminder
                  </button>
                ) : (
                  <form
                    onSubmit={handleAddCustomReminder}
                    className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        New Custom Follow-up
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCustomForm(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="e.g. Call back regarding pricing proposal"
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          Due Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={customDueDate}
                          onChange={(e) => setCustomDueDate(e.target.value)}
                          required
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          Priority Level
                        </label>
                        <select
                          value={customPriority}
                          onChange={(e) => setCustomPriority(e.target.value as any)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="Additional notes for this follow-up (optional)..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCustomForm(false)}
                        className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      >
                        Save Reminder
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Reminders List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active & Past Reminders ({reminders.length})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Stored locally in browser cache
                  </span>
                </div>

                {reminders.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <CalendarClock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No reminders scheduled for {contact.name}. Click one of the presets above or create a custom follow-up.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <AnimatePresence mode="popLayout">
                      {reminders.map((rem) => {
                        const dueInfo = formatReminderDueDate(rem.dueDate);
                        return (
                          <motion.div
                            key={rem.id}
                            layout
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                              rem.isCompleted
                                ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                                : dueInfo.isOverdue
                                ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <button
                                onClick={() => handleToggleReminder(rem.id)}
                                className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                                  rem.isCompleted
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                                }`}
                                title={rem.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                              >
                                {rem.isCompleted && <Check className="w-3.5 h-3.5" />}
                              </button>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`font-semibold text-xs text-slate-900 dark:text-white ${
                                      rem.isCompleted ? 'line-through text-slate-400' : ''
                                    }`}
                                  >
                                    {rem.title}
                                  </span>

                                  {rem.priority === 'high' && !rem.isCompleted && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                      High
                                    </span>
                                  )}

                                  {rem.preset && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                      {rem.preset}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 mt-1 text-[11px]">
                                  <span
                                    className={`flex items-center gap-1 font-medium ${
                                      dueInfo.isOverdue && !rem.isCompleted
                                        ? 'text-rose-600 dark:text-rose-400 font-bold'
                                        : 'text-slate-500 dark:text-slate-400'
                                    }`}
                                  >
                                    <Clock className="w-3 h-3" />
                                    {dueInfo.label}
                                  </span>
                                </div>

                                {rem.notes && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                                    {rem.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteReminder(rem.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                              title="Delete reminder"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {activeTab === 'reminders'
              ? `${reminders.length} reminder${reminders.length === 1 ? '' : 's'} logged`
              : `Directory ID: ${contact.id.slice(0, 10)}...`}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
