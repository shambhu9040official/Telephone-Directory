import React from 'react';
import {
  Phone,
  Mail,
  Building,
  Star,
  Edit2,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Contact, SortField, SortOrder } from '../../types';
import { Avatar } from '../common/Avatar';

interface ContactTableProps {
  contacts: Contact[];
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: string) => void;
  onSelectContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact) => void;
  onCopyPhone: (phone: string) => void;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onToggleFavorite,
  onCopyPhone,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const allSelected = contacts.length > 0 && selectedIds.length === contacts.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < contacts.length;

  const renderSortIndicator = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
            {/* Selection Checkbox */}
            <th className="py-4 pl-5 pr-2 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={onToggleSelectAll}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                aria-label="Select all contacts on page"
              />
            </th>

            {/* Favorite Star */}
            <th className="py-4 px-2 w-10 text-center">
              <Star className="w-4 h-4 mx-auto text-slate-400" />
            </th>

            {/* Name Column */}
            <th
              onClick={() => onSortChange('name')}
              className="py-4 px-4 cursor-pointer group select-none hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Contact Name</span>
                {renderSortIndicator('name')}
              </div>
            </th>

            {/* Telephone */}
            <th
              onClick={() => onSortChange('phone')}
              className="py-4 px-4 cursor-pointer group select-none hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Telephone</span>
                {renderSortIndicator('phone')}
              </div>
            </th>

            {/* Email */}
            <th className="py-4 px-4 hidden md:table-cell">Email Address</th>

            {/* Category */}
            <th className="py-4 px-4 hidden lg:table-cell">Category</th>

            {/* Company */}
            <th
              onClick={() => onSortChange('company')}
              className="py-4 px-4 hidden xl:table-cell cursor-pointer group select-none hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Organization</span>
                {renderSortIndicator('company')}
              </div>
            </th>

            {/* Actions */}
            <th className="py-4 pr-5 pl-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
          <AnimatePresence>
            {contacts.map((contact, idx) => {
              const isSelected = selectedIds.includes(contact.id);
              return (
                <motion.tr
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
                  className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                    isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3.5 pl-5 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectOne(contact.id)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      aria-label={`Select ${contact.name}`}
                    />
                  </td>

                  {/* Favorite */}
                  <td className="py-3.5 px-2 text-center">
                    <motion.button
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => onToggleFavorite(contact)}
                      className={`p-1 rounded-lg transition-colors ${
                        contact.isFavorite
                          ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                          : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                      }`}
                      aria-label={contact.isFavorite ? 'Unfavorite' : 'Favorite'}
                    >
                      <Star className={`w-4 h-4 ${contact.isFavorite ? 'fill-amber-400' : ''}`} />
                    </motion.button>
                  </td>

                  {/* Name & Avatar */}
                  <td
                    onClick={() => onSelectContact(contact)}
                    className="py-3.5 px-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={contact.name} avatarUrl={contact.avatarUrl} size="sm" />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate">
                          {contact.name}
                        </span>
                        {contact.jobTitle && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                            {contact.jobTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Telephone */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${contact.phone}`}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1.5"
                        title="Open dialer"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{contact.phone}</span>
                      </a>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onCopyPhone(contact.phone)}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                        title="Copy telephone"
                      >
                        <Copy className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-600 dark:text-slate-300">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1.5 truncate max-w-[200px]"
                        title="Send email"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 italic">None</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 hidden lg:table-cell">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      {contact.category}
                    </span>
                  </td>

                  {/* Organization */}
                  <td className="py-3.5 px-4 hidden xl:table-cell text-xs text-slate-600 dark:text-slate-300">
                    {contact.company ? (
                      <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{contact.company}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 italic">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pr-5 pl-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEditContact(contact)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit contact"
                        aria-label={`Edit ${contact.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDeleteContact(contact)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete contact"
                        aria-label={`Delete ${contact.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};
