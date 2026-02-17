import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import type { User as FirebaseUser } from '@repo/shared'

export function useAdminStats() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    try {
      const stats = {
        totalUsers: 0,
        activeTrainers: 0,
        totalWorkouts: 0,
        systemHealth: '99.9%',
      }
      setData(stats)
      setIsLoading(false)
    } catch (err) {
      console.error('Error fetching admin stats:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setIsLoading(false)
    }
  }, [])

  return { data, isLoading, error }
}

export function useAllUsers() {
  const [data, setData] = useState<any>({
    users: [],
    stats: {
      total: 0,
      trainers: 0,
      trainees: 0,
      admins: 0,
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)

    try {
      const usersRef = collection(db, 'users')

      // Real-time listener for all users
      const unsubscribe = onSnapshot(usersRef, snapshot => {
        const users = snapshot.docs.map(doc => ({
          ...(doc.data() as FirebaseUser),
          uid: doc.id,
        }))

        setData({
          users,
          stats: {
            total: users.length,
            trainers: users.filter(u => u.role === 'trainer').length,
            trainees: users.filter(u => u.role === 'trainee').length,
            admins: users.filter(u => u.role === 'admin').length,
          },
        })
        setIsLoading(false)
        setError(null)
      })

      return () => unsubscribe()
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setData({
        users: [],
        stats: {
          total: 0,
          trainers: 0,
          trainees: 0,
          admins: 0,
        },
      })
      setIsLoading(false)
    }
  }, [])

  return { data, isLoading, error }
}
