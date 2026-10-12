import React, { useState, useMemo } from 'react';
import {
  User,
  Phone,
  Mail,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  Tag,
  Star,
  FileText,
  Image as ImageIcon,
  Plus,
  X,
  Check
} from 'lucide-react';
import { Contact, ContactFormData, DEFAULT_CATEGORIES } from '../../types';
import { detectDuplicates } from '../../services/contactService';
import { DuplicateWarning } from './DuplicateWarning';

interface ContactFormProps {
  initialData?: Contact;
  existingContacts: Contact[];
  customCategories?: string[];
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  onViewDuplicate?: (contact: Contact) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  initialData,
  existingContacts,
  customCategories = [],
  onSubmit,
  onCancel,
  isLoading = false,
  onViewDuplicate,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [company, setCompany] = useState(initialData?.company || '');
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [category, setCategory] = useState(initialData?.category || 'General');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [birthday, setBirthday] = useState(initialData?.birthday || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || '');
  const [isFavorite, setIsFavorite] = useState(initialData?.isFavorite || false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Combined categories list
  const allCategories = useMemo(() => {
    const list = [...DEFAULT_CATEGORIES, ...customCategories];
    return Array.from(new Set(list));
  }, [customCategories]);

  // Live duplicate detection
  const duplicates = useMemo(() => {
    if (!phone && !email) return { phoneMatch: undefined, emailMatch: undefined };
    return detectDuplicates(existingContacts, phone, email, initialData?.id);
  }, [existingContacts, phone, email, initialData?.id]);

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length > 120) {
      newErrors.name = 'Name must be 120 characters or less';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Telephone number is required';
    } else if (phone.trim().replace(/[^0-9]/g, '').length < 3) {
      newErrors.phone = 'Please enter a valid telephone number';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (notes && notes.length > 2000) {
      newErrors.notes = 'Notes cannot exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      category,
      tags,
      birthday,
      notes: notes.trim(),
      avatarUrl: avatarUrl.trim(),
      isFavorite,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Duplicate Warning Banner */}
      <DuplicateWarning
        phoneMatch={duplicates.phoneMatch}
        emailMatch={duplicates.emailMatch}
        onViewContact={onViewDuplicate}
      />

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Dr. Bjarne Stroustrup"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${
                errors.name
                  ? 'border-rose-300 focus:border-rose-500 ring-2 ring-rose-100 dark:ring-rose-950/40'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50'
              }`}
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name}</p>}
        </div>

        {/* Telephone Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Telephone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder="e.g. +1 212-555-0199 or +91 98220 45678"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono ${
                errors.phone
                  ? 'border-rose-300 focus:border-rose-500 ring-2 ring-rose-100 dark:ring-rose-950/40'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50'
              }`}
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.phone}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="name@domain.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${
                errors.email
                  ? 'border-rose-300 focus:border-rose-500 ring-2 ring-rose-100 dark:ring-rose-950/40'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50'
              }`}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Category / Group
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all"
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Company / Organization */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Company / Organization
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Building className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Morgan Stanley / Columbia University"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all"
            />
          </div>
        </div>

        {/* Job Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Job Title
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Managing Director / Research Fellow"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all"
            />
          </div>
        </div>

        {/* Physical Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Postal / Office Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, Country"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all"
            />
          </div>
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Birthday
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tags section */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Tags & Keywords
        </label>
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-rose-500 transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1 min-w-[140px] flex-1">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag and press Enter..."
              className="w-full py-1 px-2 text-xs bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {newTagInput && (
              <button
                type="button"
                onClick={handleAddTag}
                className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Image URL */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Profile Photo URL (Optional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all"
          />
        </div>
      </div>

      {/* Notes / C++ OOP details */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Notes & History
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add background notes, meeting discussions, or academic project references..."
            className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all resize-none"
          />
        </div>
      </div>

      {/* Favorite Toggle */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-xl transition-all ${
              isFavorite
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-500 shadow-sm'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 hover:text-amber-500'
            }`}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
          <div>
            <span className="font-semibold text-sm text-slate-900 dark:text-white block">
              Star as Favorite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              Quick access from the Favorites tab and dashboard cards
            </span>
          </div>
        </div>

        <input
          type="checkbox"
          checked={isFavorite}
          onChange={(e) => setIsFavorite(e.target.checked)}
          className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
        />
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {initialData ? 'Save Changes' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
};
