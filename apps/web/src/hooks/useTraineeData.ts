import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore'
import type { User as FirebaseUser } from '@repo/shared'

export function useTraineeProgress(userId: string | undefined, workoutsData: any[] = []) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setData(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const userRef = doc(db, 'users', userId)

      // Real-time listener for user profile
      const unsubscribe = onSnapshot(userRef, userSnap => {
        if (!userSnap.exists()) {
          setData(null)
          setIsLoading(false)
          return
        }

        const userData = userSnap.data() as FirebaseUser

        setData({
          user: userData,
          workoutCount: workoutsData.length,
          totalDuration: workoutsData.reduce((sum, w) => sum + (w.duration || 0), 0),
          streak: 12,
        })
        setIsLoading(false)
        setError(null)
      })

      return () => unsubscribe()
    } catch (err) {
      console.error('Error fetching trainee progress:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setIsLoading(false)
    }
  }, [userId, workoutsData.length])

  return { data, isLoading, error }
}

export function useTraineeTrainers(userId: string | undefined) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setData([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const userRef = doc(db, 'users', userId)

      // Real-time listener for user profile to get trainerId
      const unsubscribe = onSnapshot(userRef, async userSnap => {
        if (!userSnap.exists()) {
          setData([])
          setIsLoading(false)
          return
        }

        const userData = userSnap.data() as FirebaseUser

        // If user has a trainerId, set up listener for trainer data
        if (userData.trainerId) {
          const trainerRef = doc(db, 'users', userData.trainerId)

          const trainerUnsubscribe = onSnapshot(trainerRef, trainerSnap => {
            if (trainerSnap.exists()) {
              const trainerData = trainerSnap.data() as FirebaseUser
              setData([
                {
                  ...trainerData,
                  id: userData.trainerId,
                },
              ])
            } else {
              setData([])
            }
            setIsLoading(false)
            setError(null)
          })

          return () => trainerUnsubscribe()
        } else {
          setData([])
          setIsLoading(false)
        }
      })

      return () => unsubscribe()
    } catch (err) {
      console.error('Error fetching trainee trainers:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setIsLoading(false)
    }
  }, [userId])

  return { data, isLoading, error }
}

export function useTraineeGoals(userId: string | undefined) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setData([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const goalsRef = collection(db, 'users', userId, 'goals')

      // Real-time listener for user goals
      const unsubscribe = onSnapshot(goalsRef, snapshot => {
        const goals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))

        setData(goals)
        setIsLoading(false)
        setError(null)
      })

      return () => unsubscribe()
    } catch (err) {
      console.error('Error fetching trainee goals:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setIsLoading(false)
    }
  }, [userId])

  return { data, isLoading, error }
}

export function useAvailableTrainers() {
  const [data, setData] = useState<(FirebaseUser & { uid: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)

    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('role', '==', 'trainer'))

      // Real-time listener for available trainers
      const unsubscribe = onSnapshot(q, snapshot => {
        const trainers = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
        })) as (FirebaseUser & { uid: string })[]

        setData(trainers)
        setIsLoading(false)
        setError(null)
      })

      return () => unsubscribe()
    } catch (err) {
      console.error('Error fetching available trainers:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setIsLoading(false)
    }
  }, [])

  return { data, isLoading, error }
}
