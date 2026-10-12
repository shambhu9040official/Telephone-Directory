import React from 'react';

export const ContactCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm animate-pulse flex flex-col gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5" />
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800/60">
      <td className="py-4 px-4">
        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="space-y-1.5">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
      </td>
      <td className="py-4 px-4 hidden md:table-cell">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36" />
      </td>
      <td className="py-4 px-4 hidden lg:table-cell">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-20" />
      </td>
      <td className="py-4 px-4 text-right">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-16 ml-auto" />
      </td>
    </tr>
  );
};
