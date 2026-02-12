import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { CreateUserSchema, UserSchema } from '@repo/shared'

export const userRouter = router({
  create: publicProcedure
    .input(CreateUserSchema)
    .output(UserSchema)
    .mutation(({ input }) => ({
      uid: 'dummy-id',
      email: input.email,
      role: input.role,
      displayName: input.displayName,
      createdAt: Date.now(),
    })),

  getById: publicProcedure
    .input(z.string())
    .output(UserSchema)
    .query(({ input }) => ({
      uid: input,
      email: 'test@example.com',
      role: 'trainee' as const,
      displayName: 'Test User',
      createdAt: Date.now(),
    })),

  list: publicProcedure.output(z.array(UserSchema)).query(() => [
    {
      uid: 'user-1',
      email: 'user1@example.com',
      role: 'trainee' as const,
      displayName: 'User One',
      createdAt: Date.now(),
    },
    {
      uid: 'user-2',
      email: 'user2@example.com',
      role: 'trainer' as const,
      displayName: 'User Two',
      createdAt: Date.now(),
    },
  ]),
})
