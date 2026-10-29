import { UserProfile } from '../types/auth';

const STORAGE_KEY = 'fabify_cad_user_session';

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserSession(user: UserProfile | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error('Failed to save user session:', err);
  }
}

export function loginWithGoogle(
  email: string = 'judymariecurie@gmail.com',
  name: string = 'Judy Curie'
): UserProfile {
  const user: UserProfile = {
    id: `user-g-${Date.now()}`,
    email,
    name,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
    provider: 'google',
    joinedAt: Date.now(),
  };
  saveUserSession(user);
  return user;
}

export function loginWithEmail(email: string, name?: string): UserProfile {
  const trimmed = email.trim();
  const displayName = name?.trim() || trimmed.split('@')[0] || 'Maker';
  const user: UserProfile = {
    id: `user-e-${Date.now()}`,
    email: trimmed,
    name: displayName,
    provider: 'email',
    joinedAt: Date.now(),
  };
  saveUserSession(user);
  return user;
}

export function logoutUser(): void {
  saveUserSession(null);
}
