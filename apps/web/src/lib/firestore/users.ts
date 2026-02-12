import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { User } from '@repo/shared'

export async function createUser(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    throw new Error('User already exists')
  }

  await setDoc(userRef, user)
}

export async function getUser(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    return userSnap.data() as User
  }

  return null
}
