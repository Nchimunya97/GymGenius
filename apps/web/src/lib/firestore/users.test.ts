import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUser, getUser } from './users'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { User } from '@repo/shared'

// Mock Firebase Firestore
vi.mock('@/lib/firebase', () => ({
  db: {},
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  getFirestore: vi.fn(),
}))

describe('User Service', () => {
  const mockUser: User = {
    uid: '123',
    email: 'test@example.com',
    role: 'trainee',
    createdAt: 1234567890,
    displayName: 'Test User',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createUser', () => {
    it('should create a user document if it does not exist', async () => {
      // Mock doc to return a ref
      ;(doc as any).mockReturnValue('docRef')

      // Mock getDoc to return exists: false
      ;(getDoc as any).mockResolvedValue({
        exists: () => false,
      })

      await createUser(mockUser)

      expect(doc).toHaveBeenCalledWith(db, 'users', mockUser.uid)
      expect(getDoc).toHaveBeenCalledWith('docRef')
      expect(setDoc).toHaveBeenCalledWith('docRef', mockUser)
    })

    it('should throws if user already exists', async () => {
      ;(doc as any).mockReturnValue('docRef')
      ;(getDoc as any).mockResolvedValue({
        exists: () => true,
      })

      // Should we throw or just return?
      // Plan said "Creates user document in Firestore if not exists", usually idempotent or check.
      // Let's assume we want to avoid overwriting.
      await expect(createUser(mockUser)).rejects.toThrow('User already exists')
    })
  })

  describe('getUser', () => {
    it('should return user data if exists', async () => {
      ;(doc as any).mockReturnValue('docRef')
      ;(getDoc as any).mockResolvedValue({
        exists: () => true,
        data: () => mockUser,
      })

      const result = await getUser('123')
      expect(result).toEqual(mockUser)
    })

    it('should return null if user does not exist', async () => {
      ;(doc as any).mockReturnValue('docRef')
      ;(getDoc as any).mockResolvedValue({
        exists: () => false,
      })

      const result = await getUser('999')
      expect(result).toBeNull()
    })
  })
})
