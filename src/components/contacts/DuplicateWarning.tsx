import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Contact } from '../../types';

interface DuplicateWarningProps {
  phoneMatch?: Contact;
  emailMatch?: Contact;
  onViewContact?: (contact: Contact) => void;
}

export const DuplicateWarning: React.FC<DuplicateWarningProps> = ({
  phoneMatch,
  emailMatch,
  onViewContact,
}) => {
  if (!phoneMatch && !emailMatch) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex items-start gap-3 animate-in fade-in">
      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 text-xs sm:text-sm">
        <span className="font-semibold block mb-0.5">
          Possible Duplicate Detected:
        </span>
        {phoneMatch && (
          <div className="mt-1 flex items-center justify-between gap-2">
            <span>
              Phone number matches <strong>{phoneMatch.name}</strong> ({phoneMatch.phone})
            </span>
            {onViewContact && (
              <button
                type="button"
                onClick={() => onViewContact(phoneMatch)}
                className="text-amber-700 dark:text-amber-300 font-semibold underline hover:no-underline flex items-center gap-1 shrink-0"
              >
                View <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        {emailMatch && emailMatch.id !== phoneMatch?.id && (
          <div className="mt-1 flex items-center justify-between gap-2">
            <span>
              Email matches <strong>{emailMatch.name}</strong> ({emailMatch.email})
            </span>
            {onViewContact && (
              <button
                type="button"
                onClick={() => onViewContact(emailMatch)}
                className="text-amber-700 dark:text-amber-300 font-semibold underline hover:no-underline flex items-center gap-1 shrink-0"
              >
                View <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        <span className="block text-[11px] text-amber-700 dark:text-amber-400 mt-1">
          You can still proceed with saving if this is a separate contact.
        </span>
      </div>
    </div>
  );
};
