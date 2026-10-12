# ContactSphere — Smart Telephone Directory & Contact Management System

**ContactSphere** is a modern, production-grade cloud contact directory and CRM application built with React, TypeScript, Tailwind CSS, and Google Cloud Firestore.

The project is an extended full-stack realization inspired by the academic micro-project **“Telephone Directory Application”** created for the **Object Oriented Programming (OOP) in C++** curriculum.

---

## 1. Features & Capabilities

- **Secure Firebase Cloud Firestore Storage**: Real-time snapshot listeners keep contact data synced across tabs and devices.
- **Zero-Trust ABAC Security**: Hardened security rules with strict ownership checks (`request.auth.uid == userId`) and input validation.
- **Real-Time Duplicate Detection**: Smart telephone digit normalization and email matching alerts you before creating duplicate records.
- **Visual Analytics Dashboard**:
  - 6 Key metric cards (Total Contacts, Favorites, Recently Added, Added This Month, Group Counts, Missing Info).
  - Monthly growth chart (`Recharts` AreaChart).
  - Category distribution donut chart (`Recharts` PieChart).
  - Real-time audit activity feed.
- **Complete CRUD Operations**:
  - Full Name, Phone (international format support), Email, Company, Job Title, Postal Address, Category, Tags, Birthday, Notes, Avatar, and Favorite star.
  - Table and Grid card view switcher.
  - Column sorting, multi-attribute search, tag filtering, and pagination.
  - Bulk operations: select all, bulk delete with confirmation, and bulk CSV export.
- **Data Portability (CSV & JSON)**:
  - Drag-and-drop CSV importer with visual column mapping and row-level validation.
  - Instant CSV export and raw JSON backup export.
  - Downloadable CSV template for sample formatting.
- **OOP C++ Heritage Showcase**:
  - Interactive modal explaining core OOP principles: Classes, Objects, Constructors, Destructors, Encapsulation, and Member Functions.
  - Code comparison showing the original C++ class structure alongside the modern Cloud TypeScript architecture.
- **User Experience**:
  - Global quick-switcher with keyboard shortcut (`⌘K` / `Ctrl+K`).
  - Dark mode and light mode toggle.
  - Responsive layout with collapsible sidebar and mobile drawer.
  - Guest Evaluator Demo mode for instant testing without registration.

---

## 2. Architecture & File Structure

```
├── firebase-blueprint.json         # Data model definitions & Firestore path specifications
├── firebase-applet-config.json     # Firebase project credentials
├── firestore.rules                 # Zero-Trust ABAC security rules
├── security_spec.md                # Data invariants and threat audit spec
├── index.html                      # HTML entry with Plus Jakarta Sans & JetBrains Mono
├── package.json                    # Project dependencies
├── src/
│   ├── firebase.ts                 # Firebase client initialization, error handler & testConnection
│   ├── types.ts                    # TypeScript models (Contact, UserProfile, ActivityLog, etc.)
│   ├── context/
│   │   ├── AuthContext.tsx         # User session, Google OAuth, Email/Password & Demo Mode
│   │   └── ToastContext.tsx        # Toast notification system
│   ├── services/
│   │   ├── contactService.ts       # Firestore CRUD, duplicate detection, batch deletes
│   │   ├── activityService.ts      # User activity audit logging
│   │   └── csvService.ts           # CSV parser, generator, template download
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.tsx          # Initial-based dynamic color avatar
│   │   │   ├── ConfirmModal.tsx    # Accessible confirmation dialog
│   │   │   └── SkeletonLoader.tsx  # Pulse skeleton loaders
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Top bar with search trigger, theme toggle, user menu
│   │   │   ├── Sidebar.tsx         # Collapsible navigation sidebar
│   │   │   └── GlobalSearchModal.tsx # Keyboard-driven ⌘K quick switcher
│   │   ├── contacts/
│   │   │   ├── ContactCard.tsx     # Card view item with quick dialer and copy
│   │   │   ├── ContactTable.tsx    # Table view with column sorting & bulk selection
│   │   │   ├── ContactForm.tsx     # Form with duplicate detector and tag manager
│   │   │   ├── ContactDetailModal.tsx # Full profile viewer with quick dialer
│   │   │   └── DuplicateWarning.tsx # Non-blocking duplicate alert
│   │   └── cpp/
│   │       └── CppProjectModal.tsx # Academic C++ OOP foundation modal
│   ├── pages/
│   │   ├── LandingPage.tsx         # Public overview & project history
│   │   ├── AuthPage.tsx            # Login, Sign-up, Password Reset & Demo entry
│   │   ├── DashboardPage.tsx       # Live stats, Recharts growth & category donut
│   │   ├── ContactsPage.tsx        # Complete directory with filters & table/grid
│   │   ├── FavoritesPage.tsx       # Starred contacts
│   │   ├── CategoriesPage.tsx      # Group & tag management
│   │   ├── ImportExportPage.tsx    # CSV mapper & JSON backup hub
│   │   ├── ProfilePage.tsx         # Account preferences & format options
│   │   ├── SettingsPage.tsx        # Diagnostics, latency test, & theme toggle
│   │   └── NotFoundPage.tsx        # 404 handler
│   ├── App.tsx                     # Top-level routing & modal state management
│   ├── main.tsx                    # React DOM entry
│   └── index.css                   # Tailwind CSS imports & custom scrollbar
```

---

## 3. Local Development & Setup

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## 4. Firebase Configuration & Deployment

1. The project uses Firebase Cloud Firestore and Authentication configured via `firebase-applet-config.json`.
2. For production deployments in your own Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com).
   - Create a project and enable **Firestore Database**.
   - Under **Authentication**, enable **Google** and **Email/Password** sign-in providers.
   - Add your domain to **Authorized Domains** under Authentication settings.
   - Deploy `firestore.rules` using the Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```

---

## 5. Verification & Testing Checklist

- [x] **Authentication**: Google Sign-In, Email registration, password reset, and Guest Demo mode function properly.
- [x] **Data Isolation**: Each user can only view, mutate, and delete contacts located in their own `/users/{userId}/contacts` subcollection.
- [x] **CRUD Operations**: Adding, editing, starring, and deleting contacts immediately update Firestore and UI.
- [x] **Duplicate Detection**: Entering an existing telephone number or email highlights a warning badge without blocking save.
- [x] **Charts & Stats**: Dashboard statistics reflect the user's real database records.
- [x] **CSV Import/Export**: Column mapping accurately assigns CSV headers to contact properties; CSV export generates compliant files.
- [x] **Keyboard Navigation**: Pressing `⌘K` or `Ctrl+K` launches the instant global switcher.
- [x] **Dark / Light Theme**: Theme persists across sessions and page refreshes.
- [x] **OOP in C++ Connection**: Dedicated modal and landing page section explain the academic origins and OOP concepts.
