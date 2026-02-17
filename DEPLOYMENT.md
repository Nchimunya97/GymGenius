# GymGenius - Landing Page & Role-Based Dashboards Setup

## 🎉 What's New

This update includes a beautiful **Landing Page** and **Role-Based Dashboards** for Admin, Trainer, and Trainee users!

### ✨ Features Added

#### 1. **Landing Page** (`/`)

- Responsive hero section with call-to-action buttons
- Features showcase with 6 key features
- User type sections (Trainee, Trainer, Admin)
- Footer with links
- Mobile-friendly design
- Beautiful gradient background with animations

#### 2. **Admin Dashboard** (`/dashboard` for admin role)

- Overview with key metrics (users, trainers, workouts, health)
- User management table with role and status tracking
- Analytics page with user growth and system metrics
- Settings page for system configuration
- Sidebar navigation
- Professional dark theme with amber/orange accents

#### 3. **Trainer Dashboard** (`/dashboard` for trainer role)

- Overview with client metrics and schedule
- My Clients section with progress tracking
- Training Programs management
- Real-time messaging system with clients
- Schedule and client management
- Purple/pink theme accent colors

#### 4. **Trainee Dashboard** (`/dashboard` for trainee role)

- Workout overview with statistics
- Workout tracking and execution
- Progress monitoring with PRs
- Goal tracking
- Trainer connections and messaging
- Green/emerald theme accent colors

#### 5. **Intelligent Routing**

- Landing page for unauthenticated users
- Auth page for login/signup
- Role-based dashboard routing
- Automatic redirection based on user role
- Seamless navigation experience

## 🏗️ Architecture

### Updated User Schema

Added `admin` role to the User schema in `/packages/shared/src/schemas/user.ts`:

```typescript
export const UserRoleSchema = z.enum(['admin', 'trainer', 'trainee'])
```

### New Pages

- **Landing.tsx** - Public landing page
- **AdminDashboard.tsx** - Administrator dashboard
- **TrainerDashboard.tsx** - Trainer dashboard
- **TraineeDashboard.tsx** - Trainee dashboard

### Router Setup

React Router has been integrated with proper authentication flow:

```
/ → Landing (public)
/auth → Authentication (public)
/dashboard → Role-based dashboard (protected)
  ├── Admin → AdminDashboard
  ├── Trainer → TrainerDashboard
  └── Trainee → TraineeDashboard
```

## 🚀 Deployment Setup

### Prerequisites

- Node.js 18+ and pnpm
- Firebase project with Auth and Firestore
- Environment variables configured

### Environment Variables

Create a `.env.local` file in `/apps/web`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck
```

### Production Build

```bash
# Build all packages
pnpm build

# Preview production build
pnpm preview
```

#### Build Artifacts

- **Web App**: `/apps/web/dist` - Static files ready for hosting
- **Functions**: `/apps/functions/lib` - Compiled Cloud Functions

### Deployment Options

#### 1. **Firebase Hosting** (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Deploy
firebase deploy

# This will deploy:
# - Web app to Firebase Hosting
# - Cloud Functions (if configured)
# - Firestore rules
```

#### 2. **Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Point to 'apps/web' directory as root
```

#### 3. **Netlify**

```bash
# Build command
pnpm build

# Publish directory
apps/web/dist

# Deploy with Netlify CLI
netlify deploy --prod
```

#### 4. **Docker** (Custom Deployment)

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/apps/web/dist ./public
COPY --from=builder /app/apps/functions/lib ./functions
EXPOSE 3000
CMD ["npm", "install", "-g", "firebase-tools", "&&", "firebase", "emulators:start"]
```

### Configuration Files

#### `apps/web/vite.config.ts`

Already configured for development and production builds with proper sourcemaps.

#### `apps/web/tsconfig.json`

TypeScript configuration with path aliases and strict type checking.

#### `firebase.json`

Configure hosting and functions deployment:

```json
{
  "hosting": {
    "public": "apps/web/dist",
    "cleanUrls": true,
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "apps/functions",
    "runtime": "nodejs18"
  }
}
```

## 📋 User Roles & Permissions

### Admin

- View system analytics and metrics
- Manage all users
- Configure system settings
- Monitor platform health
- User moderation

### Trainer

- Manage assigned clients
- Create and edit training programs
- Monitor client progress
- Real-time messaging with clients
- Schedule management

### Trainee

- Browse and join training programs
- Track personal workouts
- View progress metrics
- Connect with trainers
- Message trainers for support

## 🔒 Security Features

- Firebase Authentication (Email, Google OAuth)
- Firestore Security Rules for data protection
- Role-based access control
- Protected routes in React Router
- HTTPS enforced in production

## 📦 Dependencies Added

- `react-router-dom@^6.0.0` - Client-side routing

## 🧪 Testing

```bash
# Run tests for all packages
pnpm test

# Run tests for web app only
cd apps/web && pnpm test

# View test coverage
pnpm test -- --coverage
```

## 🐛 Troubleshooting

### Issue: "Cannot find module 'react-router-dom'"

**Solution**: Run `pnpm install` to ensure all dependencies are installed.

### Issue: Firebase configuration not loading

**Solution**: Check `.env.local` file exists in `/apps/web` with correct values.

### Issue: Dashboard shows blank after login

**Solution**:

1. Check browser console for errors
2. Verify user profile exists in Firestore
3. Check that user has a valid `role` field

### Issue: TypeScript errors after changes

**Solution**: Run `pnpm typecheck` to identify issues, then run `pnpm build` to compile.

## 📞 Support

For issues or feature requests, please check the project documentation or open an issue in the repository.

## 🎨 Design System

### Color Scheme

- **Primary**: Amber/Orange (Landing & Admin)
- **Trainer**: Purple/Pink
- **Trainee**: Green/Emerald
- **Background**: Dark Slate (900-950)

### Component Library

- Tailwind CSS for styling
- Shadcn UI components
- Custom gradient backgrounds
- Responsive grid layouts

## 🔄 Next Steps

1. ✅ Landing Page - Complete
2. ✅ Role-Based Dashboards - Complete
3. ✅ Router Configuration - Complete
4. ⏳ Email Notifications - Optional
5. ⏳ Analytics Integration - Optional
6. ⏳ Payment Integration - Optional

---

**Ready to Deploy?** Follow the deployment instructions above for your preferred platform.
