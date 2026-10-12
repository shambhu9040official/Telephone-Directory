import { Contact, ContactFormData } from '../types';

export interface CSVParseResult {
  validRows: ContactFormData[];
  invalidRows: { rowNumber: number; reason: string; rawData: Record<string, string> }[];
  duplicateWarnings: { rowNumber: number; contact: ContactFormData; matchedWith: string }[];
  headers: string[];
}

export function parseCSVText(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows: string[][] = [];

  for (let i = 1; i < lines.length; i++) {
    const parsed = parseLine(lines[i]);
    if (parsed.some((cell) => cell.length > 0)) {
      rows.push(parsed);
    }
  }

  return { headers, rows };
}

export function processImportedData(
  headers: string[],
  rows: string[][],
  columnMap: Record<string, string>, // targetField -> csvHeader
  existingContacts: Contact[]
): CSVParseResult {
  const validRows: ContactFormData[] = [];
  const invalidRows: { rowNumber: number; reason: string; rawData: Record<string, string> }[] = [];
  const duplicateWarnings: { rowNumber: number; contact: ContactFormData; matchedWith: string }[] = [];

  const existingPhones = new Set(
    existingContacts.map((c) => c.phone.replace(/[^0-9]/g, ''))
  );
  const existingEmails = new Set(
    existingContacts.map((c) => c.email?.toLowerCase().trim()).filter(Boolean)
  );

  rows.forEach((row, idx) => {
    const rowNumber = idx + 2; // 1-indexed, header is line 1
    const rawData: Record<string, string> = {};
    headers.forEach((h, hIdx) => {
      rawData[h] = row[hIdx] || '';
    });

    const getValue = (targetField: string): string => {
      const mappedHeader = columnMap[targetField];
      if (!mappedHeader) return '';
      const colIndex = headers.indexOf(mappedHeader);
      return colIndex !== -1 ? row[colIndex] || '' : '';
    };

    const name = getValue('name').trim();
    const phone = getValue('phone').trim();

    if (!name) {
      invalidRows.push({ rowNumber, reason: 'Missing required full name', rawData });
      return;
    }

    if (!phone) {
      invalidRows.push({ rowNumber, reason: 'Missing required telephone number', rawData });
      return;
    }

    const email = getValue('email').trim();
    const address = getValue('address').trim();
    const company = getValue('company').trim();
    const jobTitle = getValue('jobTitle').trim();
    const category = getValue('category').trim() || 'General';
    const rawTags = getValue('tags').trim();
    const tags = rawTags ? rawTags.split(/[;,|]/).map((t) => t.trim()).filter(Boolean) : [];
    const birthday = getValue('birthday').trim();
    const notes = getValue('notes').trim();
    const isFavoriteStr = getValue('isFavorite').toLowerCase();
    const isFavorite = ['true', 'yes', '1', 'fav', 'favorite'].includes(isFavoriteStr);

    const contactData: ContactFormData = {
      name,
      phone,
      email,
      address,
      company,
      jobTitle,
      category,
      tags,
      birthday,
      notes,
      avatarUrl: '',
      isFavorite,
    };

    // Duplicate check
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone && existingPhones.has(cleanPhone)) {
      duplicateWarnings.push({
        rowNumber,
        contact: contactData,
        matchedWith: `Phone number matches an existing contact`,
      });
    } else if (email && existingEmails.has(email.toLowerCase())) {
      duplicateWarnings.push({
        rowNumber,
        contact: contactData,
        matchedWith: `Email address matches an existing contact`,
      });
    }

    validRows.push(contactData);
  });

  return { validRows, invalidRows, duplicateWarnings, headers };
}

export function exportContactsToCSV(contacts: Contact[]): void {
  const headers = [
    'Name',
    'Phone',
    'Email',
    'Company',
    'Job Title',
    'Category',
    'Tags',
    'Address',
    'Birthday',
    'Notes',
    'Favorite',
    'Created At',
  ];

  const escapeCSV = (value: string | undefined | null) => {
    if (!value) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = contacts.map((c) => [
    escapeCSV(c.name),
    escapeCSV(c.phone),
    escapeCSV(c.email),
    escapeCSV(c.company),
    escapeCSV(c.jobTitle),
    escapeCSV(c.category),
    escapeCSV((c.tags || []).join('; ')),
    escapeCSV(c.address),
    escapeCSV(c.birthday),
    escapeCSV(c.notes),
    escapeCSV(c.isFavorite ? 'Yes' : 'No'),
    escapeCSV(c.createdAt),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contactsphere_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportContactsToJSON(contacts: Contact[]): void {
  const jsonContent = JSON.stringify(contacts, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contactsphere_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCSVTemplate(): void {
  const headers = [
    'Full Name',
    'Phone Number',
    'Email Address',
    'Company',
    'Job Title',
    'Category',
    'Tags (semicolon-separated)',
    'Postal Address',
    'Birthday (YYYY-MM-DD)',
    'Notes',
    'Favorite (yes/no)'
  ];

  const sampleRows = [
    [
      '"Dr. Alan Kay"',
      '"+1 310-555-0143"',
      '"alan.kay@viewport.org"',
      '"Viewpoints Research"',
      '"Pioneer of OOP"',
      '"Work"',
      '"OOP; Smalltalk; Turing Award"',
      '"Los Angeles, California"',
      '"1940-05-17"',
      '"Coined the term Object-Oriented Programming."',
      '"Yes"'
    ],
    [
      '"Ada Lovelace"',
      '"+44 20 7123 4567"',
      '"ada@computational.ac.uk"',
      '"Analytical Engine Society"',
      '"First Programmer"',
      '"Academic"',
      '"Mathematics; Algorithms"',
      '"London, United Kingdom"',
      '"1815-12-10"',
      '"First computer algorithm visionary."',
      '"Yes"'
    ]
  ];

  const csvContent = [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'contactsphere_import_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
