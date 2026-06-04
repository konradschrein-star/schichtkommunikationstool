'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE = 'uid';

/**
 * "Login" = remember which seeded account is active (zero-friction, no password
 * — exactly as the spec demands). Sets a long-lived cookie and redirects to the
 * account's home view.
 */
export async function login(userId: string, redirectTo: string): Promise<void> {
  const c = await cookies();
  c.set(COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect(redirectTo);
}

export async function logout(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE);
  redirect('/');
}
