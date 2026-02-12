import { renderHook, waitFor } from '@testing-library/react'
import { useWorkouts } from './useWorkouts'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as firestore from 'firebase/firestore'

// Mock Firebase Firestore
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore')
  return {
    ...actual,
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    onSnapshot: vi.fn(),
    getFirestore: vi.fn(),
    doc: vi.fn(),
  }
})

vi.mock('@/lib/firebase', () => ({
  db: {},
}))

describe('useWorkouts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array and not loading when valid userId is provided but no data', async () => {
    // Mock onSnapshot to immediately call callback with empty docs
    ;(firestore.onSnapshot as any).mockImplementation((query: any, onNext: any) => {
      onNext({ docs: [] })
      return vi.fn() // unsubscribe
    })

    const { result } = renderHook(() => useWorkouts('user1'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.workouts).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should return workouts when data exists', async () => {
    const mockWorkouts = [
      { id: '1', name: 'Workout 1', date: 1000 },
      { id: '2', name: 'Workout 2', date: 2000 },
    ]

    ;(firestore.onSnapshot as any).mockImplementation((query: any, onNext: any) => {
      onNext({
        docs: mockWorkouts.map(w => ({
          data: () => w,
        })),
      })
      return vi.fn()
    })

    const { result } = renderHook(() => useWorkouts('user1'))

    await waitFor(() => {
      expect(result.current.workouts).toHaveLength(2)
    })

    expect(result.current.workouts[0]).toEqual(mockWorkouts[0])
    expect(result.current.workouts[1]).toEqual(mockWorkouts[1])
  })

  it('should handle errors', async () => {
    const mockError = new Error('Permission denied')
    ;(firestore.onSnapshot as any).mockImplementation((query: any, onNext: any, onError: any) => {
      onError(mockError)
      return vi.fn()
    })

    const { result } = renderHook(() => useWorkouts('user1'))

    await waitFor(() => {
      expect(result.current.error).toBe(mockError)
    })

    expect(result.current.loading).toBe(false)
  })
})
