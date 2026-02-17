import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import type { Workout, CreateWorkout } from '@repo/shared'

export function useWorkouts(userId: string | undefined) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // 1. Critical: If no userId, stop and clear the list
    if (!userId) {
      setWorkouts([])
      setLoading(false)
      return
    }

    setLoading(true)

    // 2. Build the query to match your NEW Security Rules
    const q = query(
      collection(db, 'workouts'),
      where('ownerId', '==', userId), // Matches "ownerId" in rules
      orderBy('timestamp', 'desc')
    )

    // 3. Set up the Real-time Listener
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const newWorkouts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Workout[]

        console.log(`Loaded ${newWorkouts.length} workouts for user ${userId}`)
        setWorkouts(newWorkouts)
        setLoading(false)
      },
      err => {
        console.error('Firestore Subscription Error:', err)
        setError(err)
        setLoading(false)
      }
    )

    // 4. Cleanup on unmount or when userId changes
    return () => unsubscribe()
  }, [userId]) // Properly re-runs when the user logs in after a reload

  const createWorkout = async (data: CreateWorkout): Promise<Workout> => {
    if (!userId) throw new Error('No authenticated user ID provided')

    const workoutData = {
      ...data,
      ownerId: userId, // Ensures data matches your query and rules
      timestamp: Date.now(),
    }

    const docRef = await addDoc(collection(db, 'workouts'), workoutData)
    return { id: docRef.id, ...workoutData } as Workout
  }

  const updateWorkout = async (id: string, updates: Partial<Workout>): Promise<void> => {
    if (!userId) throw new Error('No authenticated user ID provided')
    
    const workoutRef = doc(db, 'workouts', id)
    await updateDoc(workoutRef, {
      ...updates,
      ownerId: userId, // Ensure ownerId stays the same
    })
  }

  const deleteWorkout = async (id: string): Promise<void> => {
    const workoutRef = doc(db, 'workouts', id)
    await deleteDoc(workoutRef)
  }

  return { workouts, loading, error, createWorkout, updateWorkout, deleteWorkout }
}
