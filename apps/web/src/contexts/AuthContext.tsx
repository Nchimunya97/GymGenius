import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useUserProfile } from '@/hooks/useUserProfile'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signUpWithEmail: (email: string, password: string, role?: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Automatically create user profile in Firestore when user authenticates
  useUserProfile(user)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const signUpWithEmail = async (email: string, password: string, role: string = 'trainee') => {
    const result = await createUserWithEmailAndPassword(auth, email, password)

    // Store role in Firestore
    try {
      const userRef = doc(db, 'users', result.user.uid)
      await setDoc(
        userRef,
        {
          uid: result.user.uid,
          email: result.user.email || '',
          role: role,
          createdAt: Date.now(),
          profileComplete: false,
        },
        { merge: true }
      )
    } catch (error) {
      console.error('Error setting user role:', error)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const logOut = async () => {
    await signOut(auth)
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    logOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
