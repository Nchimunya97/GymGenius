import { describe, it, expect } from 'vitest'
import { WorkoutSchema, ExerciseSchema, ExerciseSetSchema } from './workout'

describe('Workout Schemas', () => {
  it('should validate a valid exercise set', () => {
    const validSet = {
      id: 'set1',
      reps: 10,
      weight: 50,
      completed: true,
    }
    expect(ExerciseSetSchema.parse(validSet)).toEqual(validSet)
  })

  it('should validate a valid exercise', () => {
    const validExercise = {
      id: 'ex1',
      name: 'Bench Press',
      sets: [
        { id: 'set1', reps: 10, weight: 50, completed: true },
        { id: 'set2', reps: 8, weight: 55, completed: false },
      ],
    }
    expect(ExerciseSchema.parse(validExercise)).toEqual(validExercise)
  })

  it('should validate a valid workout', () => {
    const validWorkout = {
      id: 'workout1',
      userId: 'user1',
      name: 'Chest Day',
      date: Date.now(),
      exercises: [],
      status: 'active',
    }
    expect(WorkoutSchema.parse(validWorkout)).toEqual(validWorkout)
  })

  it('should fail on invalid data', () => {
    const invalidSet = {
      id: 'set1',
      reps: -5, // Invalid: negative reps
      weight: 50,
    }
    expect(() => ExerciseSetSchema.parse(invalidSet)).toThrow()
  })
})
