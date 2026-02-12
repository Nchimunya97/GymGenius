import { describe, it, expect } from 'vitest';
import { UserSchema, UserRoleSchema } from './user';

describe('User Schema', () => {
  it('should validate a valid trainee user', () => {
    const validUser = {
      uid: '123',
      email: 'test@example.com',
      role: 'trainee',
      createdAt: Date.now(),
      displayName: 'John Doe'
    };
    
    const result = UserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should validate a valid trainer user', () => {
    const validTrainer = {
      uid: '456',
      email: 'trainer@example.com',
      role: 'trainer',
      createdAt: Date.now(),
      photoURL: 'https://example.com/photo.jpg'
    };
    
    const result = UserSchema.safeParse(validTrainer);
    expect(result.success).toBe(true);
  });

  it('should load user roles correctly', () => {
    expect(UserRoleSchema.parse('trainee')).toBe('trainee');
    expect(UserRoleSchema.parse('trainer')).toBe('trainer');
    expect(() => UserRoleSchema.parse('admin')).toThrow();
  });

  it('should fail on invalid email', () => {
    const invalidUser = {
      uid: '123',
      email: 'not-an-email',
      role: 'trainee',
      createdAt: Date.now(),
    };
    
    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should fail on missing required fields', () => {
    const incompleteUser = {
      uid: '123',
      // email missing
      role: 'trainee',
    };
    
    const result = UserSchema.safeParse(incompleteUser);
    expect(result.success).toBe(false);
  });

  it('should fail on invalid role', () => {
    const invalidRoleUser = {
      uid: '123',
      email: 'test@example.com',
      role: 'admin', // invalid role
      createdAt: Date.now(),
    };
    
    const result = UserSchema.safeParse(invalidRoleUser);
    expect(result.success).toBe(false);
  });
});
