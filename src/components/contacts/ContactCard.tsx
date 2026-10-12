import React from 'react';
import {
  Phone,
  Mail,
  Building,
  Star,
  Edit2,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { Contact } from '../../types';
import { Avatar } from '../common/Avatar';

interface ContactCardProps {
  contact: Contact;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onSelect: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact) => void;
  onCopyPhone: (phone: string) => void;
  index?: number;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isSelected = false,
  onToggleSelect,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopyPhone,
  index = 0,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className={`group relative bg-white dark:bg-slate-900 rounded-3xl border transition-colors duration-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-lg ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="mt-1 w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0"
              aria-label={`Select ${contact.name}`}
            />
          )}

          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(contact)}
            className="cursor-pointer shrink-0"
          >
            <Avatar name={contact.name} avatarUrl={contact.avatarUrl} size="md" />
          </motion.div>

          <div className="min-w-0 cursor-pointer" onClick={() => onSelect(contact)}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-slate-900 dark:text-white text-base truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {contact.name}
              </h3>
            </div>
            {contact.jobTitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {contact.jobTitle}
              </p>
            )}
            {contact.company && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate flex items-center gap-1 mt-0.5">
                <Building className="w-3 h-3 shrink-0" />
                {contact.company}
              </p>
            )}
          </div>
        </div>

        {/* Favorite Star Button with Live Pop */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(contact);
          }}
          className={`p-2 rounded-xl transition-colors shrink-0 ${
            contact.isFavorite
              ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          aria-label={contact.isFavorite ? 'Unfavorite contact' : 'Favorite contact'}
        >
          <Star className={`w-4 h-4 ${contact.isFavorite ? 'fill-amber-400' : ''}`} />
        </motion.button>
      </div>

      {/* Middle: Phone, Email & Category */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
        {/* Telephone with Copy */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-mono">
          <a
            href={`tel:${contact.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
            title="Open dialer"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{contact.phone}</span>
          </a>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onCopyPhone(contact.phone);
            }}
            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
            title="Copy telephone number"
          >
            <Copy className="w-3 h-3" />
          </motion.button>
        </div>

        {/* Email */}
        {contact.email ? (
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <a
              href={`mailto:${contact.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
              title="Send email"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600 italic">
            <Mail className="w-3.5 h-3.5 opacity-50 shrink-0" />
            <span>No email registered</span>
          </div>
        )}
      </div>

      {/* Category and Tags */}
      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
          {contact.category}
        </span>

        {contact.tags && contact.tags.length > 0 && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            #{contact.tags[0]}
            {contact.tags.length > 1 ? ` +${contact.tags.length - 1}` : ''}
          </span>
        )}
      </div>

      {/* Bottom Actions Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <motion.button
          whileHover={{ x: 2 }}
          onClick={() => onSelect(contact)}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          View Profile <ExternalLink className="w-3 h-3" />
        </motion.button>

        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(contact)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit contact"
            aria-label={`Edit ${contact.name}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(contact)}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            title="Delete contact"
            aria-label={`Delete ${contact.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
