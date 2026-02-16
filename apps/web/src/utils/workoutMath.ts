/**
 * Workout Math Utilities
 * Functions for calculating workout metrics and statistics
 */

export interface Exercise {
  name: string
  sets: number
  reps: number
  weight: number // in pounds
}

/**
 * Calculate total volume for an array of exercises
 * Formula: sum of (sets × reps × weight) for all exercises
 *
 * @example
 * // 2 sets of 10 reps @ 100lbs = 2,000 lbs volume
 * calculateTotalVolume([{ name: 'bench', sets: 2, reps: 10, weight: 100 }])
 * // => 2000
 *
 * @param exercises Array of exercises with sets, reps, and weight
 * @returns Total volume in pounds
 */
export function calculateTotalVolume(exercises: Exercise[]): number {
  return exercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.sets * exercise.reps * exercise.weight
    return total + exerciseVolume
  }, 0)
}

/**
 * Calculate average weight used across exercises
 *
 * @param exercises Array of exercises
 * @returns Average weight in pounds
 */
export function calculateAverageWeight(exercises: Exercise[]): number {
  if (exercises.length === 0) return 0
  const totalWeight = exercises.reduce((sum, ex) => sum + ex.weight, 0)
  return totalWeight / exercises.length
}

/**
 * Calculate total sets and reps
 *
 * @param exercises Array of exercises
 * @returns Object with total sets and total reps
 */
export function calculateTotalSetsAndReps(exercises: Exercise[]): {
  totalSets: number
  totalReps: number
} {
  const totals = exercises.reduce(
    (acc, ex) => ({
      totalSets: acc.totalSets + ex.sets,
      totalReps: acc.totalReps + ex.reps,
    }),
    { totalSets: 0, totalReps: 0 }
  )
  return totals
}

/**
 * Calculate average volume per set
 *
 * @param exercises Array of exercises
 * @returns Average volume per set in pounds
 */
export function calculateAverageVolumePerSet(exercises: Exercise[]): number {
  const totalVolume = calculateTotalVolume(exercises)
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0)

  if (totalSets === 0) return 0
  return totalVolume / totalSets
}

/**
 * Estimate one-rep max using Epley formula
 * 1RM = weight × (1 + reps / 30)
 *
 * @param weight Weight lifted
 * @param reps Number of reps performed
 * @returns Estimated one-rep max
 */
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

/**
 * Calculate daily average volume
 *
 * @param exercises Array of exercises
 * @param durationMinutes Duration of workout in minutes
 * @returns Volume per minute
 */
export function calculateVolumePerMinute(exercises: Exercise[], durationMinutes: number): number {
  if (durationMinutes === 0) return 0
  const totalVolume = calculateTotalVolume(exercises)
  return totalVolume / durationMinutes
}
