import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import type { Workout } from '@repo/shared/schemas'

const WORKOUTS_COLLECTION = 'workouts'

// Helper to convert Firestore timestamp to number (if needed) or keep as number
// In this app, we store dates as numbers (time since epoch) in the schema,
// so we should ensure consistency.
// However, the schema says `date: z.number()`.

export async function createWorkout(workout: Workout): Promise<void> {
  const workoutRef = doc(db, WORKOUTS_COLLECTION, workout.id)
  await setDoc(workoutRef, workout)
}

export async function getWorkout(id: string): Promise<Workout | null> {
  const workoutRef = doc(db, WORKOUTS_COLLECTION, id)
  const snap = await getDoc(workoutRef)

  if (snap.exists()) {
    return snap.data() as Workout
  }
  return null
}

export async function getWorkoutsForUser(userId: string): Promise<Workout[]> {
  const q = query(
    collection(db, WORKOUTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => doc.data() as Workout)
}

export async function updateWorkout(id: string, updates: Partial<Workout>): Promise<void> {
  const workoutRef = doc(db, WORKOUTS_COLLECTION, id)
  await updateDoc(workoutRef, updates)
}

export async function deleteWorkout(id: string): Promise<void> {
  const workoutRef = doc(db, WORKOUTS_COLLECTION, id)
  await deleteDoc(workoutRef)
}
