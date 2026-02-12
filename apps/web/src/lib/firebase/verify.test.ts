import { describe, it, expect } from 'vitest';
import { app, auth, db } from './index';

describe('Firebase Configuration', () => {
  it('should initialize Firebase app', () => {
    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
  });

  it('should initialize Firebase Auth', () => {
    expect(auth).toBeDefined();
  });

  it('should initialize Firestore', () => {
    expect(db).toBeDefined();
  });
});
