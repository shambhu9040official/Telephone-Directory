import React, { useState, useMemo } from 'react';
import { Star, Search, Plus, Phone, Mail, Building, ExternalLink } from 'lucide-react';
import { Contact } from '../types';
import { ContactCard } from '../components/contacts/ContactCard';

interface FavoritesPageProps {
  contacts: Contact[];
  onOpenNewContact: () => void;
  onSelectContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact) => void;
  onCopyPhone: (phone: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  contacts,
  onOpenNewContact,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onToggleFavorite,
  onCopyPhone,
}) => {
  const [search, setSearch] = useState('');

  const favorites = useMemo(() => {
    return contacts.filter((c) => c.isFavorite);
  }, [contacts]);

  const filtered = useMemo(() => {
    if (!search.trim()) return favorites;
    const q = search.toLowerCase().trim();
    return favorites.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q)
    );
  }, [favorites, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Starred Favorites
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
              {favorites.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Quick priority access to your most important contacts
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search favorites..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Grid or Empty */}
      {favorites.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center mx-auto">
            <Star className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No favorite contacts yet
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Star contacts in your directory or when adding new records to keep them handy here.
          </p>
          <button
            onClick={onOpenNewContact}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Contact
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No favorites matching &ldquo;{search}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onSelect={onSelectContact}
              onEdit={onEditContact}
              onDelete={onDeleteContact}
              onToggleFavorite={onToggleFavorite}
              onCopyPhone={onCopyPhone}
            />
          ))}
        </div>
      )}
    </div>
  );
};
