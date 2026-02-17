import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import type { User as FirebaseUser } from '@repo/shared'

export interface TrainerProgram {
  id: string
  trainerId?: string
  name?: string
  duration?: string
  clients?: number
  difficulty?: string
  description?: string
  exercises?: any[]
  [key: string]: any
}

export function useTrainerClients(trainerId: string | undefined) {
  const [data, setData] = useState<(FirebaseUser & { uid: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!trainerId) {
      setData([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // Real-time listener for all users
      const usersRef = collection(db, 'users')
      const unsubscribe = onSnapshot(usersRef, snapshot => {
        const clients = snapshot.docs
          .map(doc => ({
            ...(doc.data() as FirebaseUser),
            uid: doc.id,
          }))
          .filter(user => user.trainerId === trainerId && user.role === 'trainee')

        setData(clients)
        setIsLoading(false)
        setError(null)
      })

      return () => unsubscribe()
    } catch (err) {
      console.error('Error fetching trainer clients:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setIsLoading(false)
    }
  }, [trainerId])

  return { data, isLoading, error }
}

export function useTrainerPrograms(trainerId: string | undefined) {
  const [data, setData] = useState<TrainerProgram[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!trainerId) {
      setData([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // Real-time listener for trainer programs
      const programsRef = collection(db, 'programs')
      const q = query(programsRef, where('trainerId', '==', trainerId))

      const unsubscribe = onSnapshot(q, snapshot => {
        const programs: TrainerProgram[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<TrainerProgram, 'id'>),
        }))

        setData(programs)
        setIsLoading(false)
        setError(null)
      })

      return () => unsubscribe()
    } catch (err) {
      console.error('Error fetching trainer programs:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setIsLoading(false)
    }
  }, [trainerId])

  return { data, isLoading, error }
}
