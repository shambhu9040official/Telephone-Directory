import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Clock,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckSquare
} from 'lucide-react';
import { Contact, SortField, SortOrder, ViewMode, DEFAULT_CATEGORIES } from '../types';
import { ContactCard } from '../components/contacts/ContactCard';
import { ContactTable } from '../components/contacts/ContactTable';
import { exportContactsToCSV } from '../services/csvService';

interface ContactsPageProps {
  contacts: Contact[];
  onOpenNewContact: () => void;
  onSelectContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
  onBulkDelete: (ids: string[]) => void;
  onToggleFavorite: (contact: Contact) => void;
  onCopyPhone: (phone: string) => void;
  customCategories?: string[];
  initialFavoriteFilter?: boolean;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({
  contacts,
  onOpenNewContact,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onBulkDelete,
  onToggleFavorite,
  onCopyPhone,
  customCategories = [],
  initialFavoriteFilter = false,
}) => {
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(initialFavoriteFilter);
  const [recentlyAddedOnly, setRecentlyAddedOnly] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Sorting
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Categories list
  const allCategories = useMemo(() => {
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...customCategories]));
  }, [customCategories]);

  // All unique tags in contacts
  const allTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => {
      c.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set).slice(0, 15);
  }, [contacts]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== 'all') count++;
    if (onlyFavorites) count++;
    if (recentlyAddedOnly) count++;
    if (selectedTag) count++;
    return count;
  }, [searchQuery, selectedCategory, onlyFavorites, recentlyAddedOnly, selectedTag]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setOnlyFavorites(false);
    setRecentlyAddedOnly(false);
    setSelectedTag('');
    setCurrentPage(1);
  };

  // Filtered and Sorted contacts
  const filteredContacts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const sevenDaysAgo = Date.now() - 7 * 86400000;

    return contacts
      .filter((c) => {
        // Query match
        if (q) {
          const matchName = c.name.toLowerCase().includes(q);
          const matchPhone = c.phone.toLowerCase().includes(q);
          const matchEmail = c.email?.toLowerCase().includes(q);
          const matchCompany = c.company?.toLowerCase().includes(q);
          const matchTags = c.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchPhone && !matchEmail && !matchCompany && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && c.category !== selectedCategory) {
          return false;
        }

        // Favorites only
        if (onlyFavorites && !c.isFavorite) {
          return false;
        }

        // Recently added
        if (recentlyAddedOnly) {
          const createdTime = new Date(c.createdAt).getTime();
          if (createdTime < sevenDaysAgo) return false;
        }

        // Tag filter
        if (selectedTag && !c.tags?.includes(selectedTag)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortBy] || '';
        let valB: any = b[sortBy] || '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [contacts, searchQuery, selectedCategory, onlyFavorites, recentlyAddedOnly, selectedTag, sortBy, sortOrder]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / itemsPerPage));
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContacts.slice(start, start + itemsPerPage);
  }, [filteredContacts, currentPage, itemsPerPage]);

  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Bulk selection helpers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedContacts.map((c) => c.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    const selectedRecords = contacts.filter((c) => selectedIds.includes(c.id));
    exportContactsToCSV(selectedRecords.length > 0 ? selectedRecords : filteredContacts);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Telephone Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, search, and organize all {contacts.length} saved telephone contacts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Table / Grid view switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table view"
              aria-label="Switch to table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Grid card view"
              aria-label="Switch to grid card view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewContact}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, phone, email, organization, or tag..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Favorite toggle */}
            <button
              onClick={() => {
                setOnlyFavorites(!onlyFavorites);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                onlyFavorites
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400' : ''}`} />
              Favorites Only
            </button>

            {/* Recent Only */}
            <button
              onClick={() => {
                setRecentlyAddedOnly(!recentlyAddedOnly);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                recentlyAddedOnly
                  ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Recently Added
            </button>

            {/* Clear All */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tags pills row */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold shrink-0">Filter by Tag:</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(selectedTag === tag ? '' : tag);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all shrink-0 ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Status / Matching indicator & Bulk Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>
              Showing <strong>{filteredContacts.length}</strong> of {contacts.length} contacts
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px]">
                {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 animate-in fade-in">
              <span className="text-indigo-900 dark:text-indigo-200 font-semibold px-2">
                {selectedIds.length} selected
              </span>
              <button
                onClick={handleExportSelected}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold shadow-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={() => {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }}
                className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Directory Records Display */}
      {paginatedContacts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-500 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No matching contacts found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            We couldn&apos;t find any contact records matching your current search or filter combination.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {activeFiltersCount > 0 ? (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={onOpenNewContact}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Add Your First Contact
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <ContactTable
          contacts={paginatedContacts}
          selectedIds={selectedIds}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectOne={handleToggleSelectOne}
          onSelectContact={onSelectContact}
          onEditContact={onEditContact}
          onDeleteContact={onDeleteContact}
          onToggleFavorite={onToggleFavorite}
          onCopyPhone={onCopyPhone}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              isSelected={selectedIds.includes(contact.id)}
              onToggleSelect={() => handleToggleSelectOne(contact.id)}
              onSelect={onSelectContact}
              onEdit={onEditContact}
              onDelete={onDeleteContact}
              onToggleFavorite={onToggleFavorite}
              onCopyPhone={onCopyPhone}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-semibold transition-all ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
