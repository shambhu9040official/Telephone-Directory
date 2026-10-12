import React from 'react';
import {
  Phone,
  Shield,
  Zap,
  Terminal,
  ArrowRight,
  Database,
  Search,
  Download,
  Users,
  CheckCircle2,
  Sparkles,
  Star,
  ExternalLink,
  Code
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenCppModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenCppModal,
}) => {
  const { user, enterDemoMode } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="h-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <span className="font-bold text-lg font-mono">CS</span>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block">ContactSphere</span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
              Smart Directory System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCppModal}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
          >
            <Terminal className="w-4 h-4" />
            OOP in C++ Origin
          </button>

          <button
            onClick={() => {
              enterDemoMode();
              onGetStarted();
            }}
            className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Try Demo Mode
          </button>

          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <span>{user ? 'Open Dashboard' : 'Sign In / Register'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Academic Micro-Project &bull; C++ Object-Oriented Programming Extended</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight"
        >
          Next-Generation{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            Telephone Directory
          </span>{' '}
          & Contact Management
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Inspired by the C++ Telephone Directory Application micro-project, ContactSphere elevates OOP principles into a modern cloud SaaS platform featuring real-time Firestore sync, instant duplicate detection, and full CSV import/export.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.24 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onGetStarted}
            className="px-8 py-3.5 rounded-2xl text-base font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            <span>Launch Directory</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              enterDemoMode();
              onGetStarted();
            }}
            className="px-8 py-3.5 rounded-2xl text-base font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
          >
            Explore as Guest Evaluator
          </motion.button>
        </motion.div>

        {/* Live UI Mockup Preview with Subtle Floating Hover */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-14 max-w-5xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 sm:p-6 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-mono text-slate-400">
                ContactSphere Directory Engine v2.4 (Cloud ABAC)
              </span>
            </div>
            <span className="text-xs font-mono text-indigo-500">Firebase Firestore Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Records
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Cloud Synchronized
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                Sub-millisecond index lookup
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Security Architecture
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Zero-Trust Rules
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Per-user isolated subcollections
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Data Portability
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                CSV & JSON Backup
              </div>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                Column auto-mapper engine
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Engineered for Precision & Reliability
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
            Everything you need from a modern personal & enterprise directory system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Database,
              title: 'Persistent Cloud Firestore',
              desc: 'Robust database persistence with instant real-time snapshot listeners. Never lose a contact upon refresh.',
            },
            {
              icon: Shield,
              title: 'Multi-Role User Isolation',
              desc: 'Hardened ABAC Firestore security rules mathematically guarantee one user cannot access or tamper with another’s contacts.',
            },
            {
              icon: Zap,
              title: 'Instant Duplicate Detection',
              desc: 'Smart algorithms normalize digits and emails in real-time, warning you before creating accidental double records.',
            },
            {
              icon: Download,
              title: 'Full CSV & JSON Portability',
              desc: 'Import hundreds of telephone records with visual column mapping, validation alerts, and 1-click export backups.',
            },
            {
              icon: Search,
              title: 'Instant Search & Keyboard Shortcuts',
              desc: 'Multi-attribute global lookup with ⌘K / Ctrl+K keyboard switcher, tag filtering, and alphabetical sorting.',
            },
            {
              icon: Star,
              title: 'Favorites & Analytics Dashboard',
              desc: 'Interactive monthly growth charts, category distribution doughnuts, and recent audit activity logs.',
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* C++ OOP Academic Project Connection Section (Mandated Section 13) */}
      <section className="py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-400/30">
              <Terminal className="w-3.5 h-3.5" />
              <span>Academic Engineering Heritage</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
              About This Project: OOP in C++ Telephone Directory
            </h2>

            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              This application was conceived as an advanced extension of the academic micro-project{' '}
              <strong className="text-white">“Telephone Directory Application”</strong> for the course{' '}
              <strong className="text-white">Object Oriented Programming using C++</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-indigo-300 block mb-1 text-sm">
                  C++ OOP Foundations:
                </span>
                Demonstrates classes, constructors, destructor lifecycle, private member variables, and member functions (`display()`, `search()`).
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-indigo-300 block mb-1 text-sm">
                  Modern Cloud Architecture:
                </span>
                Extends terminal file streaming (`fstream`) into a reactive TypeScript architecture backed by Google Cloud Firestore and Firebase Auth.
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenCppModal}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Code className="w-4 h-4" />
                View Original C++ Source & Comparison
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 sm:px-12 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="font-medium text-slate-700 dark:text-slate-300">
          ContactSphere &bull; Smart Telephone Directory & Contact Management System
        </p>
        <p className="mt-1">
          Developed by Shambhuraj Zagade &bull; Built with React, TypeScript, and Google Cloud Firestore
        </p>
      </footer>
    </div>
  );
};
