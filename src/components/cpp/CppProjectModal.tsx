import React, { useState } from 'react';
import { Code, BookOpen, Layers, Terminal, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CppProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CppProjectModal: React.FC<CppProjectModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cpp-code' | 'evolution'>('overview');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-violet-50/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-violet-950/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  About This Project
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  C++ OOP Micro-Project
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                From C++ Console Telephone Directory to Cloud SaaS Full-Stack Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-2 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Academic Background
          </button>
          <button
            onClick={() => setActiveTab('cpp-code')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'cpp-code'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" /> Original C++ OOP Code
          </button>
          <button
            onClick={() => setActiveTab('evolution')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'evolution'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Architectural Evolution
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 dark:text-slate-300">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Academic Foundation & Objectives
                </h3>
                <p className="mt-2 text-sm text-indigo-950/80 dark:text-indigo-300/90 leading-relaxed">
                  This web application is based directly on the classic academic micro-project:{' '}
                  <strong>“Telephone Directory Application”</strong> created for the course{' '}
                  <strong>Object Oriented Programming (OOP) using C++</strong>.
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-indigo-100/80 dark:border-indigo-900/40">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                      Subject
                    </span>
                    Object Oriented Programming with C++ (Data Structures & OOP Principles)
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-indigo-100/80 dark:border-indigo-900/40">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                      Project Origin
                    </span>
                    Console-based C++ Class & File Stream telephone record manager
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Core OOP Concepts Demonstrated
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      title: 'Classes & Objects',
                      desc: 'Encapsulated Contact entities containing state (name, phone, email) and behaviors.',
                    },
                    {
                      title: 'Constructors & Destructors',
                      desc: 'Lifecycle management of contact objects, parameter initialization, and resource cleanup.',
                    },
                    {
                      title: 'Encapsulation & Information Hiding',
                      desc: 'Private member variables protected from direct external tampering; access via getters/setters.',
                    },
                    {
                      title: 'Member Functions',
                      desc: 'Operations like insertContact(), searchByName(), updateRecord(), and displayAll().',
                    },
                  ].map((concept, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        {concept.title}
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        {concept.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-slate-200">
                  Note on Browser Execution:
                </span>{' '}
                This web application is a full-stack, cloud-native implementation inspired by the original C++ project, modernizing its terminal interface and file operations with React, TypeScript, and Google Cloud Firestore. It is not an emulated C++ binary running in WebAssembly.
              </div>
            </div>
          )}

          {activeTab === 'cpp-code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Original C++ Implementation (`directory.cpp` excerpt):</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  g++ -std=c++17 directory.cpp -o directory
                </span>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono leading-relaxed overflow-x-auto border border-slate-800">
{`#include <iostream>
#include <fstream>
#include <string>
#include <vector>

using namespace std;

// Class definition demonstrating Encapsulation & OOP principles
class Contact {
private:
    string name;
    string phone;
    string email;
    string category;

public:
    // Parameterized Constructor
    Contact(string n = "", string p = "", string e = "", string c = "General")
        : name(n), phone(p), email(e), category(c) {}

    // Member functions (Getters)
    string getName() const { return name; }
    string getPhone() const { return phone; }
    string getEmail() const { return email; }
    string getCategory() const { return category; }

    // Mutator
    void updateDetails(string n, string p, string e, string c) {
        name = n; phone = p; email = e; category = c;
    }

    void display() const {
        cout << "Name: " << name << " | Tel: " << phone
             << " | Email: " << email << " | Group: " << category << endl;
    }
};

// Manager class handling operations
class TelephoneDirectory {
private:
    vector<Contact> records;
    string filename = "contacts.dat";

public:
    void addContact(const Contact& c) {
        records.push_back(c);
        cout << "[OK] Contact saved to directory object." << endl;
    }

    void searchByName(const string& query) {
        bool found = false;
        for (const auto& c : records) {
            if (c.getName().find(query) != string::npos) {
                c.display();
                found = true;
            }
        }
        if (!found) cout << "[Notice] No record matching '" << query << "'" << endl;
    }
};`}
              </pre>
            </div>
          )}

          {activeTab === 'evolution' && (
            <div className="space-y-5">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                How Modern Cloud Architecture Extends the C++ Model
              </h4>
              <div className="space-y-3">
                {[
                  {
                    stage: 'Original C++ Console',
                    storage: 'Local flat files (fstream / binary .dat)',
                    access: 'Single terminal session, local machine only',
                    search: 'Linear O(n) loop scan',
                    auth: 'None (local process)',
                  },
                  {
                    stage: 'ContactSphere Cloud Web',
                    storage: 'Google Cloud Firestore with real-time multi-device sync',
                    access: 'Responsive web application across desktop & mobile',
                    search: 'Real-time multi-attribute instant filtering & indexing',
                    auth: 'Firebase Auth (Email, Google OAuth) with per-user data isolation',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${
                      idx === 1
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>{item.stage}</span>
                      {idx === 1 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600 text-white font-medium">
                          Current Implementation
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Persistence:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.storage}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Search & Filtering:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.search}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Security & Access:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.auth}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                  Future Roadmap & Academic Extensions:
                </span>
                <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                  <li>Direct vCard / .vcf synchronization for native mobile contacts integration.</li>
                  <li>Caller-ID lookup and webhook integration for PBX telephone switchboards.</li>
                  <li>Hierarchical enterprise organization trees and team contact sharing permissions.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Author / Student: Shambhuraj Zagade • C++ OOP Micro-Project
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
          >
            Close Overview
          </button>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
