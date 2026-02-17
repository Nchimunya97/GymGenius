import { z } from 'zod'

export const UserRoleSchema = z.enum(['admin', 'trainer', 'trainee'])

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  trainerId: z.string().optional(),
  createdAt: z.number(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  profileComplete: z.boolean().optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  fitnessGoal: z.string().optional(),
  // Trainer-specific fields
  specialization: z.string().optional(),
  experience: z.string().optional(),
  certification: z.string().optional(),
  hourlyRate: z.number().optional(),
})

export const CreateUserSchema = z.object({
  email: z.string().email(),
  role: UserRoleSchema,
  displayName: z.string().optional(),
})

export type User = z.infer<typeof UserSchema>
export type UserRole = z.infer<typeof UserRoleSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
