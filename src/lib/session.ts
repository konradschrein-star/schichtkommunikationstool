import { cookies } from 'next/headers';
import { getUser, type StoredUser, type Role } from './store';

/**
 * Resolves the currently "logged in" account from the cookie.
 * Server-only (reads next/headers).
 */
export async function getCurrentUser(): Promise<StoredUser | undefined> {
  const c = await cookies();
  const uid = c.get('uid')?.value;
  if (!uid) return undefined;
  return getUser(uid);
}

export function homeForRole(role: Role): string {
  switch (role) {
    case 'BOSS':
      return '/boss/dashboard';
    case 'SHIFT_LEADER':
      return '/shift-leader';
    case 'WORKER':
    default:
      return '/worker';
  }
}
