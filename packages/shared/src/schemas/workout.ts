import { z } from 'zod'

export const ExerciseSetSchema = z.object({
  reps: z.number(),
  weight: z.number(),
  restDuration: z.number(),
})

export const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.array(ExerciseSetSchema),
})

export const WorkoutSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  timestamp: z.number(),
  muscleGroups: z.array(z.string()),
  exercises: z.array(ExerciseSchema),
  notes: z.string().optional(),
})

export const CreateWorkoutSchema = z.object({
  muscleGroups: z.array(z.string()),
  exercises: z.array(ExerciseSchema),
  notes: z.string().optional(),
})

export type ExerciseSet = z.infer<typeof ExerciseSetSchema>
export type Exercise = z.infer<typeof ExerciseSchema>
export type Workout = z.infer<typeof WorkoutSchema>
export type CreateWorkout = z.infer<typeof CreateWorkoutSchema>
