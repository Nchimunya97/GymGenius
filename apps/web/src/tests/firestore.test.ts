import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing'

let testEnv: RulesTestEnvironment

describe('Firestore Security Rules', () => {
  beforeAll(async () => {
    // Load the Firestore rules file
    const rules = readFileSync(resolve(__dirname, '../../../firestore.rules'), 'utf8')

    // Initialize the test environment with the rules
    testEnv = await initializeTestEnvironment({
      projectId: 'gymgenius-test',
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080,
      },
    })
  })

  afterAll(async () => {
    await testEnv.cleanup()
  })

  describe('Workout Access Control', () => {
    it("should deny User A from reading User B's workout documents", async () => {
      const db = testEnv.authenticatedContext('userA').firestore()
      const otherUserId = 'userB'
      const workoutId = 'workout123'

      // Try to read User B's workout
      await assertFails(db.collection('workouts').doc(workoutId).get())
    })

    it('should allow User A to read their own workout documents', async () => {
      const userId = 'userA'
      const db = testEnv.authenticatedContext(userId).firestore()

      // First, create a workout as userA
      const workoutRef = db.collection('workouts').doc('ownWorkout')
      await assertSucceeds(
        workoutRef.set({
          ownerId: userId,
          timestamp: Date.now(),
          muscleGroups: ['chest', 'triceps'],
        })
      )

      // Then, verify userA can read their own workout
      await assertSucceeds(workoutRef.get())
    })

    it('should deny unauthenticated users from reading workouts', async () => {
      const db = testEnv.unauthenticatedContext().firestore()

      // Try to read any workout without authentication
      await assertFails(db.collection('workouts').doc('anyWorkout').get())
    })

    it("should deny User A from writing to User B's workout documents", async () => {
      const userADb = testEnv.authenticatedContext('userA').firestore()

      // Try to update User B's workout
      await assertFails(
        userADb.collection('workouts').doc('userBWorkout').update({
          status: 'completed',
        })
      )
    })

    it('should allow User A to create a workout with their own UID', async () => {
      const userId = 'userA'
      const db = testEnv.authenticatedContext(userId).firestore()

      await assertSucceeds(
        db
          .collection('workouts')
          .doc('newWorkout')
          .set({
            ownerId: userId,
            timestamp: Date.now(),
            muscleGroups: ['back'],
          })
      )
    })

    it("should deny User A from creating a workout with User B's UID", async () => {
      const userId = 'userA'
      const db = testEnv.authenticatedContext(userId).firestore()

      // Try to create a workout with a different userId
      await assertFails(
        db
          .collection('workouts')
          .doc('fraudWorkout')
          .set({
            ownerId: 'userB',
            timestamp: Date.now(),
            muscleGroups: ['legs'],
          })
      )
    })

    it("should deny User A from deleting User B's workout documents", async () => {
      const db = testEnv.authenticatedContext('userA').firestore()

      // Try to delete User B's workout
      await assertFails(db.collection('workouts').doc('userBWorkout').delete())
    })

    it('should allow User A to delete their own workout documents', async () => {
      const userId = 'userA'
      const db = testEnv.authenticatedContext(userId).firestore()

      // First, create a workout
      const workoutRef = db.collection('workouts').doc('workoutToDelete')
      await assertSucceeds(
        workoutRef.set({
          ownerId: userId,
          timestamp: Date.now(),
          muscleGroups: ['legs'],
        })
      )

      // Then, verify userA can delete their own workout
      await assertSucceeds(workoutRef.delete())
    })
  })

  describe('User Profile Privacy', () => {
    it("should deny User A from reading User B's profile", async () => {
      const db = testEnv.authenticatedContext('userA').firestore()

      // Try to read User B's profile
      await assertFails(db.collection('users').doc('userB').get())
    })

    it('should allow User A to read their own profile', async () => {
      const userId = 'userA'
      const db = testEnv.authenticatedContext(userId).firestore()

      // First, create a user profile
      const userRef = db.collection('users').doc(userId)
      await assertSucceeds(
        userRef.set({
          email: 'userA@example.com',
          role: 'trainee',
          createdAt: Date.now(),
        })
      )

      // Then, verify userA can read their own profile
      await assertSucceeds(userRef.get())
    })

    it('should deny invalid user profile creation (missing required fields)', async () => {
      const userId = 'userC'
      const db = testEnv.authenticatedContext(userId).firestore()

      // Try to create a profile without required fields
      await assertFails(
        db.collection('users').doc(userId).set({
          role: 'trainee',
          // Missing 'email' and 'createdAt'
        })
      )
    })

    it('should allow valid user profile creation', async () => {
      const userId = 'userD'
      const db = testEnv.authenticatedContext(userId).firestore()

      // Create a valid profile
      await assertSucceeds(
        db.collection('users').doc(userId).set({
          email: 'userD@example.com',
          role: 'trainee',
          createdAt: Date.now(),
        })
      )
    })
  })
})
