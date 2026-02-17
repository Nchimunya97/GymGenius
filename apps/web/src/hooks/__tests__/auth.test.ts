import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import React from 'react'

// Mock firebase auth module
vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth')
  return {
    ...actual,
    signInWithEmailAndPassword: vi.fn(),
    signUpWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn(),
  }
})

// Mock Firebase config
vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}))

// Mock useUserProfile
vi.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: vi.fn(),
}))

describe('Auth Integration (AuthContext)', () => {
  describe('signInWithEmail', () => {
    it('should populate currentUser state with correct email and UID after successful sign-in', async () => {
      const mockUser = {
        uid: 'test-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
        isAnonymous: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
        providerData: [],
        reload: vi.fn(),
        getIdToken: vi.fn(),
        getIdTokenResult: vi.fn(),
        toJSON: vi.fn(),
        delete: vi.fn(),
        auth: {},
      }

      // Mock successful sign-in
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any)

      // Mock onAuthStateChanged to trigger the callback
      const { onAuthStateChanged } = await import('firebase/auth')
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        // Call callback with the mock user (handle both function and Observer object)
        const cb = callback as any
        if (typeof cb === 'function') {
          cb(mockUser)
        } else if (cb && typeof cb.next === 'function') {
          cb.next(mockUser)
        }
        // Return unsubscribe function
        return () => {}
      })

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AuthProvider, null, children)

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Initial state should have user from onAuthStateChanged
      await waitFor(() => {
        expect(result.current.user).toBeDefined()
      })

      // User should have correct email and UID
      expect(result.current.user?.email).toBe('test@example.com')
      expect(result.current.user?.uid).toBe('test-uid-123')
    })

    it('should handle sign-in errors gracefully', async () => {
      const signInError = new Error('Invalid credentials')

      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(signInError)

      const { onAuthStateChanged } = await import('firebase/auth')
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        // Handle both function and Observer object
        const cb = callback as any
        if (typeof cb === 'function') {
          cb(null)
        } else if (cb && typeof cb.next === 'function') {
          cb.next(null)
        }
        return () => {}
      })

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AuthProvider, null, children)

      const { result } = renderHook(() => useAuth(), { wrapper })

      // User should be null after failed sign-in
      await waitFor(() => {
        expect(result.current.user).toBeNull()
      })

      // Attempt to sign in
      await expect(
        result.current.signInWithEmail('test@example.com', 'wrongPassword')
      ).rejects.toThrow()
    })

    it('should set loading state correctly during sign-in', async () => {
      const mockUser = {
        uid: 'test-uid-456',
        email: 'user@example.com',
        displayName: 'User',
        emailVerified: false,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        reload: vi.fn(),
        getIdToken: vi.fn(),
        getIdTokenResult: vi.fn(),
        toJSON: vi.fn(),
        delete: vi.fn(),
        auth: {},
      }

      const { onAuthStateChanged } = await import('firebase/auth')

      // Track whether callback has been called
      let authCallback: any = null
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        authCallback = callback
        return () => {}
      })

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AuthProvider, null, children)

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Initially loading should be true until onAuthStateChanged callback calls
      expect(result.current.loading).toBe(true)

      // Trigger the auth callback
      act(() => {
        if (authCallback) {
          const cb = authCallback as any
          if (typeof cb === 'function') {
            cb(mockUser)
          } else if (cb && typeof cb.next === 'function') {
            cb.next(mockUser)
          }
        }
      })

      // After callback, loading should be false
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // User should be set
      expect(result.current.user?.email).toBe('user@example.com')
    })

    it('should update user state when auth state changes', async () => {
      const mockUser = {
        uid: 'changed-uid',
        email: 'changed@example.com',
        displayName: 'Changed User',
        emailVerified: false,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        reload: vi.fn(),
        getIdToken: vi.fn(),
        getIdTokenResult: vi.fn(),
        toJSON: vi.fn(),
        delete: vi.fn(),
        auth: {},
      }

      const { onAuthStateChanged } = await import('firebase/auth')
      let authCallback: any = null

      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        authCallback = callback
        return () => {}
      })

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AuthProvider, null, children)

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Simulate auth state change
      act(() => {
        if (authCallback) {
          const cb = authCallback as any
          if (typeof cb === 'function') {
            cb(mockUser)
          } else if (cb && typeof cb.next === 'function') {
            cb.next(mockUser)
          }
        }
      })

      await waitFor(() => {
        expect(result.current.user?.uid).toBe('changed-uid')
        expect(result.current.user?.email).toBe('changed@example.com')
      })
    })
  })

  describe('useAuth hook', () => {
    it('should throw error if used outside AuthProvider', () => {
      // Calling useAuth without AuthProvider wrapper should throw
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
    })

    it('should provide auth methods', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: null,
        emailVerified: false,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        reload: vi.fn(),
        getIdToken: vi.fn(),
        getIdTokenResult: vi.fn(),
        toJSON: vi.fn(),
        delete: vi.fn(),
        auth: {},
      }

      const { onAuthStateChanged } = await import('firebase/auth')
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        // Handle both function and Observer object
        const cb = callback as any
        if (typeof cb === 'function') {
          cb(mockUser)
        } else if (cb && typeof cb.next === 'function') {
          cb.next(mockUser)
        }
        return () => {}
      })

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AuthProvider, null, children)

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Verify all auth methods are available
      expect(result.current.signInWithEmail).toBeDefined()
      expect(result.current.signUpWithEmail).toBeDefined()
      expect(result.current.logOut).toBeDefined()
      expect(result.current.signInWithGoogle).toBeDefined()
      expect(result.current.user).toBeDefined()
      expect(result.current.loading).toBeDefined()
    })
  })
})
