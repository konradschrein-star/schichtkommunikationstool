import Link from 'next/link';
import { logout } from '@/app/actions/session';
import { getCurrentUser } from '@/lib/session';

/**
 * Shared top navigation. Renders role-appropriate links and a "switch account"
 * (logout) action. Server component — reads the current account from the cookie.
 */
export default async function AppNav({ active }: { active?: string }) {
  const user = await getCurrentUser();
  const role = user?.role;

  const linkClass = (key: string) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      active === key ? 'bg-white/15 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
    }`;

  return (
    <nav className="bg-slate-900 text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-1">
        <Link href="/" className="font-black mr-4 tracking-tight">
          Shift<span className="text-sky-400">Sync</span>
        </Link>

        {role === 'BOSS' && (
          <Link href="/boss/dashboard" className={linkClass('boss')}>
            Chef-Dashboard
          </Link>
        )}
        {(role === 'BOSS' || role === 'SHIFT_LEADER') && (
          <Link href="/shift-leader" className={linkClass('leader')}>
            Schichtübergabe
          </Link>
        )}
        {role === 'WORKER' && (
          <Link href="/worker" className={linkClass('worker')}>
            Aufnahme
          </Link>
        )}
        {role === 'BOSS' && (
          <Link href="/settings" className={linkClass('settings')}>
            Einstellungen
          </Link>
        )}
        {role === 'BOSS' && (
          <Link href="/ideas" className={linkClass('ideas')}>
            Ideen
          </Link>
        )}

        <div className="ml-auto flex items-center gap-3">
          {user && (
            <span className="text-sm text-slate-300 hidden sm:inline">
              {user.name} · <span className="text-slate-400">{user.profession}</span>
            </span>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
            >
              Konto wechseln
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
