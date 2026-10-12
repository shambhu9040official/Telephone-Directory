import { ContactReminder } from '../types';

const REMINDERS_STORAGE_KEY = 'contactsphere_local_reminders';

export const REMINDER_PRESETS = [
  {
    label: 'Call Back in 2 Days',
    title: 'Call Back',
    daysAhead: 2,
    priority: 'medium' as const,
  },
  {
    label: 'Follow up on proposal',
    title: 'Follow up on proposal',
    daysAhead: 3,
    priority: 'high' as const,
  },
  {
    label: 'Send Documents / Contract',
    title: 'Send Documents / Contract',
    daysAhead: 1,
    priority: 'high' as const,
  },
  {
    label: 'Weekly Catch-up Call',
    title: 'Weekly Catch-up Call',
    daysAhead: 7,
    priority: 'low' as const,
  },
  {
    label: 'Quarterly Check-in',
    title: 'Quarterly Check-in',
    daysAhead: 30,
    priority: 'low' as const,
  },
];

export function loadAllReminders(): ContactReminder[] {
  try {
    const raw = localStorage.getItem(REMINDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse reminders from localStorage:', err);
    return [];
  }
}

export function saveAllReminders(reminders: ContactReminder[]): void {
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
    // Dispatch a storage event so active components can update live
    window.dispatchEvent(new Event('contactsphere_reminders_updated'));
  } catch (err) {
    console.error('Failed to save reminders to localStorage:', err);
  }
}

export function getContactReminders(contactId: string): ContactReminder[] {
  const all = loadAllReminders();
  return all
    .filter((r) => r.contactId === contactId)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function addContactReminder(
  contactId: string,
  contactName: string,
  data: {
    title: string;
    dueDate: string;
    preset?: string;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
  }
): ContactReminder {
  const all = loadAllReminders();
  const newReminder: ContactReminder = {
    id: 'rem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    contactId,
    contactName,
    title: data.title.trim(),
    dueDate: data.dueDate,
    preset: data.preset,
    notes: data.notes?.trim() || '',
    priority: data.priority || 'medium',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };

  all.unshift(newReminder);
  saveAllReminders(all);

  // Request browser notification permission non-intrusively if supported
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }

  return newReminder;
}

export function toggleReminderCompleted(reminderId: string): ContactReminder[] {
  const all = loadAllReminders();
  const updated = all.map((r) =>
    r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r
  );
  saveAllReminders(updated);
  return updated;
}

export function deleteReminder(reminderId: string): ContactReminder[] {
  const all = loadAllReminders();
  const updated = all.filter((r) => r.id !== reminderId);
  saveAllReminders(updated);
  return updated;
}

export function getDueReminders(): { overdue: ContactReminder[]; upcomingToday: ContactReminder[] } {
  const all = loadAllReminders();
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const pending = all.filter((r) => !r.isCompleted);
  const overdue: ContactReminder[] = [];
  const upcomingToday: ContactReminder[] = [];

  pending.forEach((r) => {
    const due = new Date(r.dueDate);
    if (due < now) {
      overdue.push(r);
    } else if (due <= endOfDay) {
      upcomingToday.push(r);
    }
  });

  return { overdue, upcomingToday };
}

export function calculatePresetDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(10, 0, 0, 0); // Default to 10:00 AM on the target date
  return d.toISOString();
}
