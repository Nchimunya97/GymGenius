# GymGenius - Technical Design Document

## 1. OVERVIEW

**One-Sentence Pitch:** A collaborative freemium SaaS platform connecting trainees and trainers through real-time workout tracking and muscle-group analytics.

**Goal:** Bridge the gap between casual tracking and professional coaching via a shared Firestore-backed dashboard.

## 2. TECH STACK (CLIENT-CENTRIC GOLDEN PATH)

- **Runtime/Language:** Node.js + TypeScript (Strict)
- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **State/Data Fetching:** TanStack Query (for real-time Firestore sync)
- **Backend:** Firebase Auth & Cloud Firestore
- **Validation:** Zod (Schema enforcement on the frontend)

**Constraint:** NO SQL and NO Firebase Functions. Business logic is handled in the React app; security is enforced via Firestore Security Rules.

## 3. DATA MODEL (NOSQL)

### Collections

**users:**

```typescript
{
  uid: string;
  email: string;
  role: 'trainer' | 'trainee';
  trainerId?: string;
  createdAt: Timestamp;
}
```

**workouts:**

```typescript
{
  id: string;
  ownerId: string;
  timestamp: Timestamp;
  muscleGroups: string[];
  notes?: string;
}
```

**exercises (Sub-collection of workouts):**

```typescript
{
  name: string;
  sets: Array<{
    reps: number;
    weight: number;
    restDuration: number;
  }>;
}
```

**connections:**

```typescript
{
  trainerId: string;
  traineeId: string;
  status: "active" | "pending";
}
```

## 4. ENGINEERING WORKFLOW (TEST-FIRST)

**Logic:** Follow Test-Driven Development (TDD): Red-Green-Refactor

1. **Step 1 (Red):** Write a failing Vitest or Playwright test for the feature
2. **Step 2 (Green):** Write the minimal code to pass the test
3. **Step 3 (Refactor):** Clean the code while maintaining test integrity

## KEY CONSTRAINTS

- ❌ NO Firebase Functions
- ❌ NO SQL databases
- ✅ All business logic in React app
- ✅ Security via Firestore Security Rules
- ✅ Test-First approach (TDD)
