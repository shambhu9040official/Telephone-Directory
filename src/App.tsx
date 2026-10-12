import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Contact, ContactFormData, ActivityLog } from './types';
import {
  subscribeToContacts,
  addContact,
  updateContact,
  deleteContact,
  deleteMultipleContacts,
  toggleContactFavorite,
  seedStarterContacts
} from './services/contactService';
import { subscribeToActivity } from './services/activityService';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { ContactDetailModal } from './components/contacts/ContactDetailModal';
import { ContactForm } from './components/contacts/ContactForm';
import { ConfirmModal } from './components/common/ConfirmModal';
import { CppProjectModal } from './components/cpp/CppProjectModal';
import { motion, AnimatePresence } from 'motion/react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ContactsPage } from './pages/ContactsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { user, userProfile, loading: authLoading, isDemoMode, logout } = useAuth();
  const { success, error: toastError, info } = useToast();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('landing');

  // Contacts & Activity State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Layout UI State
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('contactsphere_theme') === 'dark' ||
      (!('contactsphere_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  // Modals State
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [cppModalOpen, setCppModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [detailModalContact, setDetailModalContact] = useState<Contact | null>(null);

  // Deletion modals state
  const [deleteTargetContact, setDeleteTargetContact] = useState<Contact | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Sync Dark Theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('contactsphere_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('contactsphere_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Sync Contacts & Activity when user or demo mode is ready
  useEffect(() => {
    const userId = user?.uid || (isDemoMode ? 'demo_student_evaluator' : null);

    if (!userId) {
      setContacts([]);
      setActivityLogs([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    const unsubContacts = subscribeToContacts(userId, isDemoMode, (newContacts) => {
      setContacts(newContacts);
      setDataLoading(false);
    });

    const unsubActivity = subscribeToActivity(userId, isDemoMode, (newLogs) => {
      setActivityLogs(newLogs);
    });

    return () => {
      unsubContacts();
      unsubActivity();
    };
  }, [user, isDemoMode]);

  // If user signs in and is on landing or auth page, auto navigate to dashboard
  useEffect(() => {
    if ((user || isDemoMode) && (currentPage === 'landing' || currentPage === 'auth')) {
      setCurrentPage('dashboard');
    }
  }, [user, isDemoMode, currentPage]);

  // Global Keyboard Shortcuts (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick Action Handlers
  const handleCopyPhone = useCallback((phone: string) => {
    navigator.clipboard.writeText(phone);
    success(`Copied "${phone}" to clipboard!`);
  }, [success]);

  const handleCopyEmail = useCallback((email: string) => {
    navigator.clipboard.writeText(email);
    success(`Copied "${email}" to clipboard!`);
  }, [success]);

  const handleToggleFavorite = useCallback(async (contact: Contact) => {
    const userId = user?.uid || (isDemoMode ? 'demo_student_evaluator' : null);
    if (!userId) return;

    try {
      const isFav = await toggleContactFavorite(userId, isDemoMode, contact);
      if (isFav) {
        success(`Starred ${contact.name} as favorite.`);
      } else {
        info(`Unstarred ${contact.name}.`);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update favorite status.');
    }
  }, [user, isDemoMode, success, info, toastError]);

  const handleSaveContactForm = async (formData: ContactFormData) => {
    const userId = user?.uid || (isDemoMode ? 'demo_student_evaluator' : null);
    if (!userId) return;

    try {
      if (editingContact) {
        await updateContact(userId, isDemoMode, editingContact.id, formData);
        success(`Updated ${formData.name}'s contact details.`);
      } else {
        await addContact(userId, isDemoMode, formData);
        success(`Added ${formData.name} to your directory!`);
      }
      setContactModalOpen(false);
      setEditingContact(null);
    } catch (err: any) {
      toastError(err.message || 'Failed to save contact.');
    }
  };

  const handleConfirmSingleDelete = async () => {
    if (!deleteTargetContact) return;
    const userId = user?.uid || (isDemoMode ? 'demo_student_evaluator' : null);
    if (!userId) return;

    setIsDeleting(true);
    try {
      await deleteContact(
        userId,
        isDemoMode,
        deleteTargetContact.id,
        deleteTargetContact.name
      );
      success(`Deleted contact "${deleteTargetContact.name}".`);
      setDeleteTargetContact(null);
      if (detailModalContact?.id === deleteTargetContact.id) {
        setDetailModalContact(null);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete contact.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return;
    const userId = user?.uid || (isDemoMode ? 'demo_student_evaluator' : null);
    if (!userId) return;

    setIsDeleting(true);
    try {
      const count = await deleteMultipleContacts(userId, isDemoMode, bulkDeleteIds);
      success(`Permanently deleted ${count} contacts.`);
      setBulkDeleteIds([]);
    } catch (err: any) {
      toastError(err.message || 'Failed to delete contacts.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedSampleData = async () => {
    const userId = user?.uid || (isDemoMode ? 'demo_student_evaluator' : null);
    if (!userId) return;

    setIsSeeding(true);
    try {
      const count = await seedStarterContacts(userId, isDemoMode);
      success(`Loaded ${count} sample telephone directory records!`);
    } catch (err: any) {
      toastError(err.message || 'Failed to seed sample contacts.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearAllContacts = async () => {
    const userId = user?.uid || (isDemoMode ? 'demo_student_evaluator' : null);
    if (!userId) return;

    setIsDeleting(true);
    try {
      const allIds = contacts.map((c) => c.id);
      await deleteMultipleContacts(userId, isDemoMode, allIds);
      success('Purged all contacts from your directory.');
    } catch (err: any) {
      toastError(err.message || 'Failed to purge contacts.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Initial Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl font-mono animate-pulse shadow-lg shadow-indigo-600/30">
          CS
        </div>
        <p className="text-xs text-slate-500 font-mono">Initializing ContactSphere...</p>
      </div>
    );
  }

  // Render Landing Page if unauthenticated or explicitly visiting
  if (currentPage === 'landing' && !user && !isDemoMode) {
    return (
      <>
        <LandingPage
          onGetStarted={() => setCurrentPage('auth')}
          onOpenCppModal={() => setCppModalOpen(true)}
        />
        <CppProjectModal isOpen={cppModalOpen} onClose={() => setCppModalOpen(false)} />
      </>
    );
  }

  // Render Auth Page if visiting auth
  if (currentPage === 'auth') {
    return (
      <AuthPage
        onSuccess={() => setCurrentPage('dashboard')}
        onBackToHome={() => setCurrentPage('landing')}
      />
    );
  }

  // Protected Dashboard Application Layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        contacts={contacts}
        isOpen={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenCppModal={() => setCppModalOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenNewContact={() => {
            setEditingContact(null);
            setContactModalOpen(true);
          }}
          onOpenCppModal={() => setCppModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onNavigate={setCurrentPage}
          onSelectContactById={(id) => {
            const found = contacts.find((c) => c.id === id);
            if (found) setDetailModalContact(found);
          }}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {currentPage === 'dashboard' && (
            <DashboardPage
              contacts={contacts}
              activityLogs={activityLogs}
              onNavigate={setCurrentPage}
              onOpenNewContact={() => {
                setEditingContact(null);
                setContactModalOpen(true);
              }}
              onSelectContact={(c) => setDetailModalContact(c)}
              onSeedSampleData={handleSeedSampleData}
              isLoadingSeed={isSeeding}
            />
          )}

          {currentPage === 'contacts' && (
            <ContactsPage
              contacts={contacts}
              onOpenNewContact={() => {
                setEditingContact(null);
                setContactModalOpen(true);
              }}
              onSelectContact={(c) => setDetailModalContact(c)}
              onEditContact={(c) => {
                setEditingContact(c);
                setContactModalOpen(true);
              }}
              onDeleteContact={(c) => setDeleteTargetContact(c)}
              onBulkDelete={(ids) => setBulkDeleteIds(ids)}
              onToggleFavorite={handleToggleFavorite}
              onCopyPhone={handleCopyPhone}
              customCategories={userProfile?.customCategories}
            />
          )}

          {currentPage === 'favorites' && (
            <FavoritesPage
              contacts={contacts}
              onOpenNewContact={() => {
                setEditingContact(null);
                setContactModalOpen(true);
              }}
              onSelectContact={(c) => setDetailModalContact(c)}
              onEditContact={(c) => {
                setEditingContact(c);
                setContactModalOpen(true);
              }}
              onDeleteContact={(c) => setDeleteTargetContact(c)}
              onToggleFavorite={handleToggleFavorite}
              onCopyPhone={handleCopyPhone}
            />
          )}

          {currentPage === 'categories' && (
            <CategoriesPage
              contacts={contacts}
              onSelectContact={(c) => setDetailModalContact(c)}
              onFilterByCategory={(cat) => {
                setCurrentPage('contacts');
              }}
            />
          )}

          {currentPage === 'import-export' && (
            <ImportExportPage
              contacts={contacts}
              onImportCompleted={() => {
                setCurrentPage('contacts');
              }}
            />
          )}

          {currentPage === 'profile' && (
            <ProfilePage
              contacts={contacts}
              onLogout={async () => {
                await logout();
                setCurrentPage('landing');
              }}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
              onSeedSampleData={handleSeedSampleData}
              onClearAllContacts={handleClearAllContacts}
              isLoadingAction={isDeleting || isSeeding}
            />
          )}

          {![
            'dashboard',
            'contacts',
            'favorites',
            'categories',
            'import-export',
            'profile',
            'settings',
          ].includes(currentPage) && (
            <NotFoundPage onReturnHome={() => setCurrentPage('dashboard')} />
          )}
        </main>
      </div>

      {/* Global Quick Search Modal (⌘K) */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        contacts={contacts}
        onSelectContact={(c) => setDetailModalContact(c)}
      />

      {/* C++ Academic Project Foundation Modal */}
      <CppProjectModal
        isOpen={cppModalOpen}
        onClose={() => setCppModalOpen(false)}
      />

      {/* Contact Details Full Profile Modal */}
      <ContactDetailModal
        contact={detailModalContact}
        isOpen={Boolean(detailModalContact)}
        onClose={() => setDetailModalContact(null)}
        onEdit={(c) => {
          setEditingContact(c);
          setContactModalOpen(true);
        }}
        onDelete={(c) => setDeleteTargetContact(c)}
        onToggleFavorite={handleToggleFavorite}
        onCopyPhone={handleCopyPhone}
        onCopyEmail={handleCopyEmail}
      />

      {/* Add / Edit Contact Form Modal */}
      <AnimatePresence>
        {contactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                {editingContact ? 'Edit Contact Information' : 'Add New Directory Record'}
              </h2>
              <ContactForm
                initialData={editingContact || undefined}
                existingContacts={contacts}
                customCategories={userProfile?.customCategories}
                onSubmit={handleSaveContactForm}
                onCancel={() => {
                  setContactModalOpen(false);
                  setEditingContact(null);
                }}
                onViewDuplicate={(dup) => {
                  setDetailModalContact(dup);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Single Contact Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetContact)}
        title="Delete Contact Record?"
        message={`Are you sure you want to permanently delete "${deleteTargetContact?.name}" (${deleteTargetContact?.phone}) from your directory?`}
        confirmText="Yes, Delete Contact"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmSingleDelete}
        onCancel={() => setDeleteTargetContact(null)}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteIds.length > 0}
        title={`Delete ${bulkDeleteIds.length} Selected Contacts?`}
        message={`This will permanently remove ${bulkDeleteIds.length} contacts from your directory. This action cannot be reversed.`}
        confirmText={`Delete ${bulkDeleteIds.length} Contacts`}
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeleteIds([])}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
