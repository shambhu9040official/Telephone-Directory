import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Contact, ContactFormData } from '../types';
import { logActivity } from './activityService';

const DEMO_STORAGE_KEY = 'contactsphere_demo_contacts';

export const INITIAL_SAMPLE_CONTACTS: Omit<Contact, 'id'>[] = [
  {
    name: 'Dr. Bjarne Stroustrup',
    phone: '+1 212-555-0199',
    email: 'bjarne@morganstanley.com',
    company: 'Columbia University & Morgan Stanley',
    jobTitle: 'Creator of C++ / Professor',
    category: 'Work',
    tags: ['C++', 'OOP', 'Academic', 'Keynote'],
    address: 'New York, NY 10027, USA',
    birthday: '1950-12-30',
    notes: 'Father of C++ programming language. Micro-project inspiration: classes, objects, and memory management.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    name: 'Sarah Chen, VP Eng',
    phone: '+1 415-890-2341',
    email: 'sarah.chen@innovatetech.io',
    company: 'Innovate Systems',
    jobTitle: 'VP of Engineering',
    category: 'VIP Clients',
    tags: ['Enterprise', 'Cloud', 'Contract Signed'],
    address: '450 Mission St, San Francisco, CA',
    birthday: '1988-06-15',
    notes: 'Key stakeholder for quarterly enterprise software review.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    name: 'Prof. Ramesh Zagade',
    phone: '+91 98220-45678',
    email: 'prof.zagade@enggcollege.edu',
    company: 'Department of Computer Engineering',
    jobTitle: 'Head of Department',
    category: 'Work',
    tags: ['OOP Guide', 'Mentor', 'College Guide'],
    address: 'Pune, Maharashtra, India',
    birthday: '1974-08-22',
    notes: 'Micro-project mentor for C++ Telephone Directory Application.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    name: 'Elena Rostova',
    phone: '+44 20 7946 0921',
    email: 'elena.rostova@nexusgroup.co.uk',
    company: 'Nexus Global Logistics',
    jobTitle: 'Head of Operations',
    category: 'Clients',
    tags: ['Logistics', 'London Office'],
    address: '22 Bishopsgate, London EC2N 4BQ',
    birthday: '1992-03-11',
    notes: 'Discussed directory synchronization integration for cross-border teams.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    name: 'Marcus Vance',
    phone: '+1 312-702-8840',
    email: 'marcus@vancecapital.com',
    company: 'Vance Capital Partners',
    jobTitle: 'Managing Partner',
    category: 'VIP Clients',
    tags: ['Fintech', 'Investor'],
    address: '111 S Wacker Dr, Chicago, IL',
    birthday: '1981-11-04',
    notes: 'Follow up on directory database migration project.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    name: 'Priya Patel',
    phone: '+91 94231-11223',
    email: 'priya.patel@designstudio.in',
    company: 'Studio Pixel & Craft',
    jobTitle: 'Creative Director',
    category: 'Personal',
    tags: ['Design', 'UI/UX'],
    address: 'Bandra West, Mumbai, India',
    birthday: '1995-09-18',
    notes: 'Helped design the design system and color palette for ContactSphere.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    name: 'Alexandre Dubois',
    phone: '+33 1 42 68 55 00',
    email: 'a.dubois@aeroparis.fr',
    company: 'AéroParis Solutions',
    jobTitle: 'Security Systems Architect',
    category: 'Colleagues',
    tags: ['Security', 'EU Compliance'],
    address: '8 Boulevard Haussmann, Paris, France',
    birthday: '1986-04-02',
    notes: 'Specialist in role-based access control and zero-trust verification.',
    avatarUrl: '',
    isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    name: 'Aisha Al-Mansoor',
    phone: '+971 4 362 7000',
    email: 'aisha@dubaitechhub.ae',
    company: 'Dubai Future Labs',
    jobTitle: 'Product Lead',
    category: 'Work',
    tags: ['AI Studio', 'Smart Directory'],
    address: 'DIFC Gate Tower, Dubai, UAE',
    birthday: '1991-01-25',
    notes: 'Evaluating telephone directory SaaS for enterprise communication.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

export function subscribeToContacts(
  userId: string,
  isDemo: boolean,
  callback: (contacts: Contact[]) => void
): () => void {
  if (isDemo || userId === 'demo_student_evaluator') {
    const loadDemoContacts = () => {
      const raw = localStorage.getItem(DEMO_STORAGE_KEY);
      if (raw) {
        callback(JSON.parse(raw));
      } else {
        const initialWithIds: Contact[] = INITIAL_SAMPLE_CONTACTS.map((c, i) => ({
          ...c,
          id: `demo_c_${i + 1}`,
        }));
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initialWithIds));
        callback(initialWithIds);
      }
    };
    loadDemoContacts();
    const interval = setInterval(loadDemoContacts, 1500);
    return () => clearInterval(interval);
  }

  const path = `users/${userId}/contacts`;
  const q = query(collection(db, path), orderBy('name', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const contacts: Contact[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Contact, 'id'>),
      }));
      callback(contacts);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function addContact(
  userId: string,
  isDemo: boolean,
  formData: ContactFormData
): Promise<string> {
  const now = new Date().toISOString();
  const contactData = {
    name: formData.name.trim(),
    phone: formData.phone.trim(),
    email: formData.email?.trim() || '',
    address: formData.address?.trim() || '',
    company: formData.company?.trim() || '',
    jobTitle: formData.jobTitle?.trim() || '',
    category: formData.category || 'General',
    tags: formData.tags || [],
    birthday: formData.birthday || '',
    notes: formData.notes?.trim() || '',
    avatarUrl: formData.avatarUrl?.trim() || '',
    isFavorite: Boolean(formData.isFavorite),
    createdAt: now,
    updatedAt: now,
  };

  if (isDemo || userId === 'demo_student_evaluator') {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    const list: Contact[] = raw ? JSON.parse(raw) : [];
    const id = `demo_c_${Date.now()}`;
    const newContact: Contact = { id, ...contactData };
    list.unshift(newContact);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(list));
    await logActivity(userId, true, 'create', `Added contact ${contactData.name}`, contactData.name, id);
    return id;
  }

  const path = `users/${userId}/contacts`;
  try {
    const ref = await addDoc(collection(db, path), contactData);
    await logActivity(userId, false, 'create', `Created contact ${contactData.name}`, contactData.name, ref.id);
    return ref.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateContact(
  userId: string,
  isDemo: boolean,
  contactId: string,
  formData: Partial<ContactFormData>
): Promise<void> {
  const now = new Date().toISOString();
  const updates: any = {
    ...formData,
    updatedAt: now,
  };
  if (formData.name) updates.name = formData.name.trim();
  if (formData.phone) updates.phone = formData.phone.trim();
  if (formData.email !== undefined) updates.email = formData.email.trim();

  if (isDemo || userId === 'demo_student_evaluator') {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    const list: Contact[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((c) => c.id === contactId);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(list));
      await logActivity(userId, true, 'update', `Updated contact ${list[index].name}`, list[index].name, contactId);
    }
    return;
  }

  const path = `users/${userId}/contacts/${contactId}`;
  try {
    const contactRef = doc(db, 'users', userId, 'contacts', contactId);
    await updateDoc(contactRef, updates);
    await logActivity(userId, false, 'update', `Updated contact details`, updates.name, contactId);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteContact(
  userId: string,
  isDemo: boolean,
  contactId: string,
  contactName?: string
): Promise<void> {
  if (isDemo || userId === 'demo_student_evaluator') {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    const list: Contact[] = raw ? JSON.parse(raw) : [];
    const target = list.find((c) => c.id === contactId);
    const filtered = list.filter((c) => c.id !== contactId);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(filtered));
    await logActivity(userId, true, 'delete', `Deleted contact ${target?.name || contactName || ''}`, target?.name || contactName, contactId);
    return;
  }

  const path = `users/${userId}/contacts/${contactId}`;
  try {
    const contactRef = doc(db, 'users', userId, 'contacts', contactId);
    await deleteDoc(contactRef);
    await logActivity(userId, false, 'delete', `Deleted contact ${contactName || ''}`, contactName, contactId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function deleteMultipleContacts(
  userId: string,
  isDemo: boolean,
  contactIds: string[]
): Promise<number> {
  if (contactIds.length === 0) return 0;

  if (isDemo || userId === 'demo_student_evaluator') {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    const list: Contact[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((c) => !contactIds.includes(c.id));
    const deletedCount = list.length - filtered.length;
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(filtered));
    await logActivity(userId, true, 'delete', `Bulk deleted ${deletedCount} contacts`);
    return deletedCount;
  }

  const path = `users/${userId}/contacts`;
  try {
    const batch = writeBatch(db);
    contactIds.forEach((id) => {
      const ref = doc(db, 'users', userId, 'contacts', id);
      batch.delete(ref);
    });
    await batch.commit();
    await logActivity(userId, false, 'delete', `Bulk deleted ${contactIds.length} contacts`);
    return contactIds.length;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function toggleContactFavorite(
  userId: string,
  isDemo: boolean,
  contact: Contact
): Promise<boolean> {
  const newFav = !contact.isFavorite;
  await updateContact(userId, isDemo, contact.id, { isFavorite: newFav });
  await logActivity(
    userId,
    isDemo,
    newFav ? 'favorite' : 'unfavorite',
    `${newFav ? 'Starred' : 'Unstarred'} ${contact.name}`,
    contact.name,
    contact.id
  );
  return newFav;
}

export function normalizePhoneForComparison(phone: string): string {
  // Strip spaces, dashes, parentheses, plus
  return phone.replace(/[^0-9]/g, '');
}

export function detectDuplicates(
  allContacts: Contact[],
  phone: string,
  email?: string,
  excludeId?: string
): { phoneMatch?: Contact; emailMatch?: Contact } {
  const normPhone = normalizePhoneForComparison(phone);
  const normEmail = email?.trim().toLowerCase();

  let phoneMatch: Contact | undefined;
  let emailMatch: Contact | undefined;

  for (const c of allContacts) {
    if (excludeId && c.id === excludeId) continue;

    if (normPhone && normalizePhoneForComparison(c.phone) === normPhone) {
      phoneMatch = c;
    }
    if (normEmail && c.email && c.email.trim().toLowerCase() === normEmail) {
      emailMatch = c;
    }
  }

  return { phoneMatch, emailMatch };
}

export async function seedStarterContacts(userId: string, isDemo: boolean): Promise<number> {
  let count = 0;
  for (const contactData of INITIAL_SAMPLE_CONTACTS) {
    await addContact(userId, isDemo, contactData);
    count++;
  }
  return count;
}
