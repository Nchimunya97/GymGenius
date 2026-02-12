import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  addDoc,
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import type { Workout, Exercise, CreateWorkout } from '@repo/shared'

export function useWorkouts(userId: string | undefined) {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setWorkouts([])
      setLoading(false)
      return
    }

    setLoading(true)
    let unsubscribe: Unsubscribe

    try {
      const q = query(
        collection(db, 'workouts'),
        where('ownerId', '==', userId),
        orderBy('timestamp', 'desc')
      )

      unsubscribe = onSnapshot(
        q,
        snapshot => {
          const newWorkouts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Workout[]
          setWorkouts(newWorkouts)
          setLoading(false)
        },
        err => {
          console.error('Error fetching workouts:', err)
          setError(err)
          setLoading(false)
        }
      )
    } catch (err) {
      console.error('Error setting up subscription:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [userId])

  const createWorkout = async (data: CreateWorkout): Promise<Workout> => {
    if (!user) throw new Error('No authenticated user')

    const workoutData = {
      ownerId: user.uid,
      timestamp: Date.now(),
      ...data,
    }

    const docRef = await addDoc(collection(db, 'workouts'), workoutData)
    return {
      id: docRef.id,
      ...workoutData,
    } as Workout
  }

  return { workouts, loading, error, createWorkout }
}
