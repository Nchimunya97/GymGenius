import { z } from 'zod';

export const UserRoleSchema = z.enum(['trainer', 'trainee']);

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  trainerId: z.string().optional(),
  createdAt: z.number(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  role: UserRoleSchema,
  displayName: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
