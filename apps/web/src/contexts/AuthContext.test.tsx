import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { auth } from '@/lib/firebase'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'

// Mock Firebase Auth
vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
}))

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    ;(onAuthStateChanged as any).mockImplementation(() => vi.fn())

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
  })

  it('should update user state when auth changes', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' }
    ;(onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
      callback(mockUser)
      return vi.fn()
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toEqual(mockUser)
  })

  it('should call signInWithPopup on signInWithGoogle', async () => {
    ;(onAuthStateChanged as any).mockImplementation(() => vi.fn())

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(signInWithPopup).toHaveBeenCalled()
  })

  it('should call signInWithEmailAndPassword on signInWithEmail', async () => {
    ;(onAuthStateChanged as any).mockImplementation(() => vi.fn())

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await result.current.signInWithEmail('test@example.com', 'password123')
    })

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123')
  })

  it('should call createUserWithEmailAndPassword on signUpWithEmail', async () => {
    ;(onAuthStateChanged as any).mockImplementation(() => vi.fn())

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await result.current.signUpWithEmail('test@example.com', 'password123')
    })

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'test@example.com',
      'password123'
    )
  })

  it('should call signOut on logOut', async () => {
    ;(onAuthStateChanged as any).mockImplementation(() => vi.fn())

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await result.current.logOut()
    })

    expect(signOut).toHaveBeenCalled()
  })
})
