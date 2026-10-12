import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Info
} from 'lucide-react';
import { Contact, ContactFormData } from '../types';
import {
  parseCSVText,
  processImportedData,
  exportContactsToCSV,
  exportContactsToJSON,
  downloadCSVTemplate,
  CSVParseResult
} from '../services/csvService';
import { addContact } from '../services/contactService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ImportExportPageProps {
  contacts: Contact[];
  onImportCompleted: () => void;
}

const TARGET_FIELDS = [
  { key: 'name', label: 'Full Name', required: true },
  { key: 'phone', label: 'Telephone Number', required: true },
  { key: 'email', label: 'Email Address', required: false },
  { key: 'company', label: 'Company / Org', required: false },
  { key: 'jobTitle', label: 'Job Title', required: false },
  { key: 'category', label: 'Category / Group', required: false },
  { key: 'address', label: 'Postal Address', required: false },
  { key: 'tags', label: 'Tags', required: false },
  { key: 'birthday', label: 'Birthday', required: false },
  { key: 'notes', label: 'Notes', required: false },
  { key: 'isFavorite', label: 'Favorite (Yes/No)', required: false },
];

export const ImportExportPage: React.FC<ImportExportPageProps> = ({
  contacts,
  onImportCompleted,
}) => {
  const { user, isDemoMode } = useAuth();
  const { success, error: toastError } = useToast();

  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);

  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    success: number;
    skipped: number;
    failed: number;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const { headers, rows } = parseCSVText(text);
      if (headers.length === 0 || rows.length === 0) {
        toastError('The selected file appears to be empty or unreadable.');
        return;
      }

      setRawHeaders(headers);
      setRawRows(rows);

      // Guess column mapping automatically
      const autoMap: Record<string, string> = {};
      TARGET_FIELDS.forEach((target) => {
        const found = headers.find((h) => {
          const lowerH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
          const lowerT = target.label.toLowerCase().replace(/[^a-z0-9]/g, '');
          const lowerK = target.key.toLowerCase();
          return lowerH.includes(lowerK) || lowerH.includes(lowerT);
        });
        if (found) autoMap[target.key] = found;
      });

      // Default name/phone if not matched
      if (!autoMap.name && headers[0]) autoMap.name = headers[0];
      if (!autoMap.phone && headers[1]) autoMap.phone = headers[1];

      setColumnMap(autoMap);

      // Process initial preview
      const result = processImportedData(headers, rows, autoMap, contacts);
      setParseResult(result);
      setImportSummary(null);
    };

    reader.readAsText(file);
  };

  const handleColumnMapChange = (fieldKey: string, headerValue: string) => {
    const newMap = { ...columnMap, [fieldKey]: headerValue };
    setColumnMap(newMap);
    if (rawHeaders.length > 0 && rawRows.length > 0) {
      const result = processImportedData(rawHeaders, rawRows, newMap, contacts);
      setParseResult(result);
    }
  };

  const handleExecuteImport = async () => {
    if (!parseResult || parseResult.validRows.length === 0) return;
    setImporting(true);

    const userId = user?.uid || 'demo_student_evaluator';
    let successCount = 0;
    let failCount = 0;

    for (const row of parseResult.validRows) {
      try {
        await addContact(userId, isDemoMode, row);
        successCount++;
      } catch (err) {
        console.error('Import row failure:', err);
        failCount++;
      }
    }

    setImportSummary({
      success: successCount,
      skipped: parseResult.invalidRows.length,
      failed: failCount,
    });
    setImporting(false);
    success(`Successfully imported ${successCount} contacts into your directory!`);
    onImportCompleted();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Data Import & Backup Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Bulk import records from spreadsheets, export encrypted backups, or download templates
        </p>
      </div>

      {/* Export & Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CSV Export */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Export to CSV
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Standard comma-separated file compatible with Excel, Google Sheets, and phone dialers.
            </p>
          </div>
          <button
            onClick={() => exportContactsToCSV(contacts)}
            disabled={contacts.length === 0}
            className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export {contacts.length} Records (CSV)
          </button>
        </div>

        {/* JSON Backup Export */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
              <FileJson className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Export Complete JSON
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Raw structured JSON dump including full timestamps, tags, and category metadata.
            </p>
          </div>
          <button
            onClick={() => exportContactsToJSON(contacts)}
            disabled={contacts.length === 0}
            className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export JSON Backup
          </button>
        </div>

        {/* Download CSV Template */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Download CSV Template
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Pre-formatted spreadsheet template with sample headers for zero-hassle importing.
            </p>
          </div>
          <button
            onClick={downloadCSVTemplate}
            className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Sample Template
          </button>
        </div>
      </div>

      {/* CSV Import Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-500" />
            Import Contacts from CSV File
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload your CSV file, map fields to ContactSphere properties, and preview before saving.
          </p>
        </div>

        {/* File Drag and Drop Box */}
        <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/30 group">
          <Upload className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 transition-colors mb-3" />
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
            Click or drag CSV file here to upload
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Supports .csv files up to 10MB
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Column Mapping Section if file loaded */}
        {rawHeaders.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Step 2: Map CSV Columns
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Match each directory field with the header from your CSV file.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {TARGET_FIELDS.map((target) => (
                <div
                  key={target.key}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {target.label}{' '}
                    {target.required && <span className="text-rose-500">*</span>}
                  </label>
                  <select
                    value={columnMap[target.key] || ''}
                    onChange={(e) => handleColumnMapChange(target.key, e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">(None / Ignore)</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Validation & Preview Summary */}
            {parseResult && (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Step 3: Validation & Row Preview
                    </h3>
                    <div className="flex items-center gap-4 text-xs mt-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {parseResult.validRows.length} Valid Rows
                      </span>
                      {parseResult.duplicateWarnings.length > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {parseResult.duplicateWarnings.length} Potential Duplicates
                        </span>
                      )}
                      {parseResult.invalidRows.length > 0 && (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {parseResult.invalidRows.length} Invalid / Skipped Rows
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleExecuteImport}
                    disabled={importing || parseResult.validRows.length === 0}
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import {parseResult.validRows.length} Contacts
                      </>
                    )}
                  </button>
                </div>

                {/* Preview Table */}
                <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Company</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {parseResult.validRows.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
                          <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                            {row.name}
                          </td>
                          <td className="py-2 px-3 font-mono">{row.phone}</td>
                          <td className="py-2 px-3 text-slate-500">{row.email || '—'}</td>
                          <td className="py-2 px-3 text-slate-500">{row.company || '—'}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              Ready
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Import Completion Summary Alert */}
                {importSummary && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Import Process Completed</span>
                      <p className="mt-0.5">
                        Imported: <strong>{importSummary.success}</strong> records | Skipped:{' '}
                        <strong>{importSummary.skipped}</strong> invalid rows | Errors:{' '}
                        <strong>{importSummary.failed}</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Future Roadmap Enhancement note as required by Section 8 */}
      <div className="p-5 rounded-3xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">
            Future Enhancement: vCard (.vcf) & PBX Telephony Integration
          </span>
          <p className="mt-0.5 leading-relaxed">
            Direct Apple iOS/Android vCard (.vcf) binary synchronization and VoIP SIP dialer integration are designated for upcoming release v2.5 to preserve strict RFC 6350 telephone compliance.
          </p>
        </div>
      </div>
    </div>
  );
};
