export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  jobTitle?: string;
  category: string;
  tags: string[];
  birthday?: string;
  notes?: string;
  avatarUrl?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ContactFormData = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  theme?: 'light' | 'dark' | 'system';
  phoneFormat?: string;
  customCategories?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'favorite' | 'unfavorite' | 'import' | 'export';
  description: string;
  contactName?: string;
  contactId?: string;
  timestamp: string;
}

export type SortField = 'name' | 'phone' | 'company' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface ContactFilters {
  searchQuery: string;
  category: string; // 'all' or specific
  onlyFavorites: boolean;
  recentlyAddedOnly: boolean;
  sortBy: SortField;
  sortOrder: SortOrder;
  tag?: string;
}

export type ViewMode = 'table' | 'grid';

export const DEFAULT_CATEGORIES = [
  'General',
  'Work',
  'Personal',
  'Family',
  'VIP Clients',
  'Colleagues',
  'Emergency',
  'Vendors'
] as const;

export interface ContactReminder {
  id: string;
  contactId: string;
  contactName: string;
  title: string;
  dueDate: string; // ISO date-time string
  preset?: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}
