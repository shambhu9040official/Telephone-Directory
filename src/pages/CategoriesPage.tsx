import React, { useState, useMemo } from 'react';
import {
  Layers,
  Tag,
  Plus,
  Users,
  Trash2,
  ExternalLink,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { Contact, DEFAULT_CATEGORIES } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Avatar } from '../components/common/Avatar';

interface CategoriesPageProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onFilterByCategory: (category: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  contacts,
  onSelectContact,
  onFilterByCategory,
}) => {
  const { userProfile, updateUserProfileData } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeCategory, setActiveCategory] = useState<string>('Work');
  const [newCategoryName, setNewCategoryName] = useState('');

  const customCategories = userProfile?.customCategories || [];

  const allCategories = useMemo(() => {
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...customCategories]));
  }, [customCategories]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allCategories.forEach((c) => (counts[c] = 0));
    contacts.forEach((c) => {
      const cat = c.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allCategories, contacts]);

  // Contacts in selected category
  const contactsInActive = useMemo(() => {
    return contacts.filter((c) => (c.category || 'General') === activeCategory);
  }, [contacts, activeCategory]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (allCategories.includes(trimmed)) {
      toastError('This category already exists.');
      return;
    }

    try {
      const updated = [...customCategories, trimmed];
      await updateUserProfileData({ customCategories: updated });
      setNewCategoryName('');
      setActiveCategory(trimmed);
      success(`Added category "${trimmed}".`);
    } catch (err: any) {
      toastError(err.message || 'Failed to save custom category.');
    }
  };

  const handleDeleteCustomCategory = async (catName: string) => {
    try {
      const updated = customCategories.filter((c) => c !== catName);
      await updateUserProfileData({ customCategories: updated });
      if (activeCategory === catName) setActiveCategory('General');
      success(`Removed custom category "${catName}".`);
    } catch (err: any) {
      toastError(err.message || 'Failed to remove custom category.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Categories & Directory Groups
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Organize your telephone records into specialized professional & personal groups
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Categories List & Add New */}
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
              All Categories
            </h2>

            <div className="space-y-1">
              {allCategories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isCustom = customCategories.includes(cat);
                const isActive = activeCategory === cat;
                return (
                  <div
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderOpen className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                      <span className="font-semibold text-sm truncate">{cat}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                      {isCustom && !isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomCategory(cat);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded"
                          title="Delete custom category"
                          aria-label={`Delete custom category ${cat}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Category Form */}
          <form
            onSubmit={handleAddCategory}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Create Custom Group
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. C++ Contributors"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Contacts in Active Category */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activeCategory}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold">
                    {contactsInActive.length} contacts
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Records categorized under {activeCategory}
                </p>
              </div>

              {contactsInActive.length > 0 && (
                <button
                  onClick={() => onFilterByCategory(activeCategory)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View in Directory <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {contactsInActive.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No contacts currently in &ldquo;{activeCategory}&rdquo;.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
                {contactsInActive.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => onSelectContact(contact)}
                    className="py-3.5 px-2 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={contact.name} avatarUrl={contact.avatarUrl} size="sm" />
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white block truncate">
                          {contact.name}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="font-mono">{contact.phone}</span>
                          {contact.company && <span className="truncate">{contact.company}</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
