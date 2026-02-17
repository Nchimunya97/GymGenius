import { describe, it, expect } from 'vitest'
import {
  calculateTotalVolume,
  calculateAverageWeight,
  calculateTotalSetsAndReps,
  calculateAverageVolumePerSet,
  estimateOneRepMax,
  calculateVolumePerMinute,
  type Exercise,
} from '@/utils/workoutMath'

describe('Workout Math Utilities', () => {
  describe('calculateTotalVolume', () => {
    it('should calculate total volume as sets × reps × weight', () => {
      const exercises: Exercise[] = [{ name: 'Bench Press', sets: 2, reps: 10, weight: 100 }]

      const volume = calculateTotalVolume(exercises)

      // 2 sets × 10 reps × 100 lbs = 2,000 lbs
      expect(volume).toBe(2000)
    })

    it('should sum volume across multiple exercises', () => {
      const exercises: Exercise[] = [
        { name: 'Bench Press', sets: 2, reps: 10, weight: 100 },
        { name: 'Squats', sets: 3, reps: 8, weight: 200 },
        { name: 'Deadlifts', sets: 1, reps: 5, weight: 300 },
      ]

      const volume = calculateTotalVolume(exercises)

      // (2×10×100) + (3×8×200) + (1×5×300) = 2,000 + 4,800 + 1,500 = 8,300
      expect(volume).toBe(8300)
    })

    it('should return 0 for empty exercises array', () => {
      const exercises: Exercise[] = []

      const volume = calculateTotalVolume(exercises)

      expect(volume).toBe(0)
    })

    it('should handle single set exercises', () => {
      const exercises: Exercise[] = [{ name: 'Pull-ups', sets: 1, reps: 15, weight: 50 }]

      const volume = calculateTotalVolume(exercises)

      // 1 × 15 × 50 = 750
      expect(volume).toBe(750)
    })

    it('should handle exercises with fractional weights', () => {
      const exercises: Exercise[] = [{ name: 'Dumbbell Press', sets: 3, reps: 12, weight: 25.5 }]

      const volume = calculateTotalVolume(exercises)

      // 3 × 12 × 25.5 = 918
      expect(volume).toBe(918)
    })

    it('should handle zero weights', () => {
      const exercises: Exercise[] = [{ name: 'Bodyweight Exercise', sets: 3, reps: 20, weight: 0 }]

      const volume = calculateTotalVolume(exercises)

      expect(volume).toBe(0)
    })
  })

  describe('calculateAverageWeight', () => {
    it('should calculate average weight across exercises', () => {
      const exercises: Exercise[] = [
        { name: 'Exercise 1', sets: 1, reps: 1, weight: 100 },
        { name: 'Exercise 2', sets: 1, reps: 1, weight: 200 },
        { name: 'Exercise 3', sets: 1, reps: 1, weight: 300 },
      ]

      const average = calculateAverageWeight(exercises)

      // (100 + 200 + 300) / 3 = 200
      expect(average).toBe(200)
    })

    it('should return 0 for empty exercises array', () => {
      const exercises: Exercise[] = []

      const average = calculateAverageWeight(exercises)

      expect(average).toBe(0)
    })

    it('should handle single exercise', () => {
      const exercises: Exercise[] = [{ name: 'Exercise', sets: 1, reps: 1, weight: 150 }]

      const average = calculateAverageWeight(exercises)

      expect(average).toBe(150)
    })
  })

  describe('calculateTotalSetsAndReps', () => {
    it('should calculate total sets and reps', () => {
      const exercises: Exercise[] = [
        { name: 'Exercise 1', sets: 3, reps: 10, weight: 100 },
        { name: 'Exercise 2', sets: 4, reps: 8, weight: 150 },
      ]

      const result = calculateTotalSetsAndReps(exercises)

      expect(result.totalSets).toBe(7) // 3 + 4
      expect(result.totalReps).toBe(18) // 10 + 8
    })

    it('should return zero totals for empty exercises', () => {
      const exercises: Exercise[] = []

      const result = calculateTotalSetsAndReps(exercises)

      expect(result.totalSets).toBe(0)
      expect(result.totalReps).toBe(0)
    })

    it('should count reps across different set counts', () => {
      const exercises: Exercise[] = [
        { name: 'Exercise 1', sets: 2, reps: 12, weight: 100 },
        { name: 'Exercise 2', sets: 5, reps: 5, weight: 200 },
      ]

      const result = calculateTotalSetsAndReps(exercises)

      // Total reps is sets × reps for each exercise
      expect(result.totalSets).toBe(7)
      expect(result.totalReps).toBe(17) // 12 + 5, not total set×rep
    })
  })

  describe('calculateAverageVolumePerSet', () => {
    it('should calculate average volume per set', () => {
      // 2 sets × 10 reps × 100 lbs = 2000 lbs total, 1000 per set
      const exercises: Exercise[] = [{ name: 'Exercise', sets: 2, reps: 10, weight: 100 }]

      const average = calculateAverageVolumePerSet(exercises)

      expect(average).toBe(1000)
    })

    it('should handle multiple exercises', () => {
      // Total volume: 2000 + 2400 = 4400, total sets: 5
      const exercises: Exercise[] = [
        { name: 'Exercise 1', sets: 2, reps: 10, weight: 100 },
        { name: 'Exercise 2', sets: 3, reps: 8, weight: 100 },
      ]

      const average = calculateAverageVolumePerSet(exercises)

      // (2000 + 2400) / 5 = 880
      expect(average).toBe(880)
    })

    it('should return 0 for empty exercises', () => {
      const exercises: Exercise[] = []

      const average = calculateAverageVolumePerSet(exercises)

      expect(average).toBe(0)
    })

    it('should return 0 when total sets is zero', () => {
      const exercises: Exercise[] = [{ name: 'Exercise', sets: 0, reps: 10, weight: 100 }]

      const average = calculateAverageVolumePerSet(exercises)

      expect(average).toBe(0)
    })
  })

  describe('estimateOneRepMax', () => {
    it('should return weight as 1RM when reps = 1', () => {
      const oneRepMax = estimateOneRepMax(225, 1)

      expect(oneRepMax).toBe(225)
    })

    it('should estimate one rep max using Epley formula', () => {
      // 1RM = weight × (1 + reps / 30)
      // 185 × (1 + 5 / 30) = 185 × 1.1667 = 215.84
      const oneRepMax = estimateOneRepMax(185, 5)

      expect(Math.round(oneRepMax * 100) / 100).toBe(215.83)
    })

    it('should handle higher rep counts', () => {
      // 135 × (1 + 10 / 30) = 135 × 1.333 = 180
      const oneRepMax = estimateOneRepMax(135, 10)

      expect(Math.round(oneRepMax * 100) / 100).toBe(180)
    })

    it('should handle fractional weights', () => {
      const oneRepMax = estimateOneRepMax(95.5, 3)

      expect(oneRepMax).toBeCloseTo(95.5 * (1 + 3 / 30), 2)
    })
  })

  describe('calculateVolumePerMinute', () => {
    it('should calculate volume per minute', () => {
      // Total volume = 2000, duration = 20 minutes
      const exercises: Exercise[] = [{ name: 'Exercise', sets: 2, reps: 10, weight: 100 }]

      const volumePerMinute = calculateVolumePerMinute(exercises, 20)

      // 2000 / 20 = 100
      expect(volumePerMinute).toBe(100)
    })

    it('should handle multiple exercises', () => {
      // Total volume = 2000 + 2400 = 4400, duration = 44 minutes
      const exercises: Exercise[] = [
        { name: 'Exercise 1', sets: 2, reps: 10, weight: 100 },
        { name: 'Exercise 2', sets: 3, reps: 8, weight: 100 },
      ]

      const volumePerMinute = calculateVolumePerMinute(exercises, 44)

      // 4400 / 44 = 100
      expect(volumePerMinute).toBe(100)
    })

    it('should return 0 when duration is zero', () => {
      const exercises: Exercise[] = [{ name: 'Exercise', sets: 2, reps: 10, weight: 100 }]

      const volumePerMinute = calculateVolumePerMinute(exercises, 0)

      expect(volumePerMinute).toBe(0)
    })

    it('should return 0 for empty exercises', () => {
      const exercises: Exercise[] = []

      const volumePerMinute = calculateVolumePerMinute(exercises, 30)

      expect(volumePerMinute).toBe(0)
    })

    it('should handle fractional durations', () => {
      const exercises: Exercise[] = [{ name: 'Exercise', sets: 1, reps: 10, weight: 100 }]

      // Volume = 1 × 10 × 100 = 1000
      const volumePerMinute = calculateVolumePerMinute(exercises, 12.5)

      // 1000 / 12.5 = 80
      expect(volumePerMinute).toBe(80)
    })
  })

  describe('Integration tests', () => {
    it('should handle a realistic workout scenario', () => {
      const exercises: Exercise[] = [
        { name: 'Bench Press', sets: 4, reps: 6, weight: 225 },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 8, weight: 100 },
        { name: 'Barbell Rows', sets: 4, reps: 6, weight: 275 },
        { name: 'Lat Pulldowns', sets: 3, reps: 10, weight: 150 },
        { name: 'Face Pulls', sets: 3, reps: 15, weight: 40 },
      ]

      const totalVolume = calculateTotalVolume(exercises)
      const avgWeight = calculateAverageWeight(exercises)
      const { totalSets, totalReps } = calculateTotalSetsAndReps(exercises)
      const volumePerSet = calculateAverageVolumePerSet(exercises)

      // Verify all metrics are calculated
      expect(totalVolume).toBeGreaterThan(0)
      expect(avgWeight).toBeGreaterThan(0)
      expect(totalSets).toBe(17) // 4+3+4+3+3
      expect(totalReps).toBe(45) // 6+8+6+10+15
      expect(volumePerSet).toBeGreaterThan(0)
    })
  })
})
