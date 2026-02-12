import { useEffect } from 'react'
import { User } from 'firebase/auth'
import { db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import type { CreateUser } from '@repo/shared'

export function useUserProfile(user: User | null) {
  useEffect(() => {
    if (!user) return

    const ensureUserProfile = async () => {
      try {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        // If user profile doesn't exist, create it
        if (!userSnap.exists()) {
          console.log('Creating user profile for:', user.uid)
          const newUserData: any = {
            uid: user.uid,
            email: user.email || '',
            role: 'trainee', // Default role
            createdAt: Date.now(),
          }

          // Only include displayName if it exists (Firestore doesn't allow undefined)
          if (user.displayName) {
            newUserData.displayName = user.displayName
          }

          await setDoc(userRef, newUserData)
          console.log('User profile created successfully')
        } else {
          console.log('User profile already exists')
        }
      } catch (error) {
        console.error('Error ensuring user profile:', error)
      }
    }

    ensureUserProfile()
  }, [user])
}
