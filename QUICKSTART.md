# GymGenius - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Clone and Install

```bash
# Clone the repository (if not already done)
# Install dependencies
pnpm install
```

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Enable:
   - Authentication (Email/Password + Google OAuth)
   - Firestore Database
   - Cloud Storage (optional)
4. Copy your Firebase config

### Step 3: Environment Configuration

Create `.env.local` in `/apps/web`:

```env
VITE_FIREBASE_API_KEY=AIzaSyD...your_api_key
VITE_FIREBASE_AUTH_DOMAIN=gymgenius-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gymgenius-xxx
VITE_FIREBASE_STORAGE_BUCKET=gymgenius-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### Step 4: Run Development Server

```bash
# From project root
pnpm dev

# Navigate to http://localhost:5173
```

### Step 5: Create Test Users

In Firebase Console → Authentication:

1. Create a test user with email/password
2. Set their custom claim for role:
   - Admin: `{ "role": "admin" }`
   - Trainer: `{ "role": "trainer" }`
   - Trainee: `{ "role": "trainee" }`

Or use the web interface to set roles (app will create profile in Firestore)

---

## 🎯 Key Features Overview

### Landing Page (`/`)

- **Features**: 6 key features showcase
- **Call-to-Action**: "Get Started" buttons
- **Responsive**: Mobile, tablet, desktop

### Authentication (`/auth`)

- Email/Password signup and login
- Google OAuth integration
- Beautiful dark theme UI

### Role-Based Dashboards (`/dashboard`)

Different UI/features based on user role:

#### Admin Dashboard

- 📊 System analytics
- 👥 User management
- ⚙️ System settings
- 📈 Performance metrics

#### Trainer Dashboard

- 👥 Client management
- 📋 Program creation
- 💬 Client messaging
- 📅 Schedule management

#### Trainee Dashboard

- 🏋️ Workout tracking
- 📈 Progress monitoring
- 🎯 Goal setting
- 👨‍🏫 Trainer connection

---

## 📚 File Structure

```
apps/web/src/
├── pages/
│   ├── Landing.tsx          ← Landing page
│   ├── Auth.tsx             ← Authentication
│   ├── AdminDashboard.tsx   ← Admin dashboard
│   ├── TrainerDashboard.tsx ← Trainer dashboard
│   ├── TraineeDashboard.tsx ← Trainee dashboard
│   └── Dashboard.tsx        ← Legacy/default
├── contexts/
│   └── AuthContext.tsx      ← Authentication state
├── lib/
│   ├── firebase/            ← Firebase config
│   └── trpc.ts              ← tRPC client
├── App.tsx                  ← Router setup
└── main.tsx                 ← Entry point
```

---

## 🔧 Development Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript check
pnpm test         # Run tests

# Production
pnpm build        # Build for production
pnpm preview      # Preview production build

# Firebase
firebase login    # Login to Firebase
firebase deploy   # Deploy to Firebase
```

---

## 🌐 Deployment Checklist

- [ ] Create Firebase project
- [ ] Configure Firestore rules
- [ ] Setup authentication methods
- [ ] Create admin user
- [ ] Setup environment variables
- [ ] Test all dashboards
- [ ] Build and test production build
- [ ] Deploy to hosting platform

---

## 💡 Common Tasks

### Create a New Admin User

```typescript
// In Firebase Console or via script
const adminUser = {
  uid: 'user123',
  email: 'admin@example.com',
  role: 'admin',
  createdAt: Date.now(),
}
```

### Add User to Firestore (Auto-created on first login)

The app automatically creates user profiles in Firestore on first authentication.

### Change User Role

In Firebase Console → Firestore → users/{uid} → role field

---

## 🆘 Troubleshooting

| Issue           | Solution                                                           |
| --------------- | ------------------------------------------------------------------ |
| Blank dashboard | Check Firestore user profile exists                                |
| Auth fails      | Verify Firebase credentials in .env.local                          |
| Routing issues  | Ensure React Router is installed (`pnpm install react-router-dom`) |
| Build errors    | Run `pnpm typecheck` and `pnpm lint`                               |

---

## 📖 Next Steps

1. Customize colors/branding in `style.css` and components
2. Add email notifications
3. Integrate with analytics
4. Setup CI/CD pipeline
5. Add more features (payments, advanced analytics, etc.)

---

**Questions?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive guides.
