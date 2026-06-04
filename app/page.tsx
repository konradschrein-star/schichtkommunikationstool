import { listUsers, type Role, type StoredUser } from '@/lib/store';
import { login } from '@/app/actions/session';
import { homeForRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

const ROLE_META: Record<Role, { label: string; accent: string; chip: string; icon: string }> = {
  BOSS: { label: 'Geschäftsführung', accent: 'from-violet-600 to-sky-500', chip: 'bg-violet-100 text-violet-700', icon: '📊' },
  SHIFT_LEADER: { label: 'Schichtleitung', accent: 'from-amber-500 to-orange-500', chip: 'bg-amber-100 text-amber-700', icon: '📋' },
  WORKER: { label: 'Mitarbeiter', accent: 'from-emerald-500 to-green-600', chip: 'bg-emerald-100 text-emerald-700', icon: '🎙️' },
};

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default async function HomePage() {
  const users = await listUsers();
  const byRole = (role: Role) => users.filter((u) => u.role === role);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wide uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Schichtkommunikation · Gleis- & Tiefbau
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            Schicht<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-sky-500">Sync</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Die Nachtschicht spricht. Die KI macht daraus saubere Berichte, eine lückenlose Übergabe
            für die Tagschicht und KPIs für den Chef — damit keine Mehrarbeit mehr unbezahlt verloren geht.
          </p>
        </header>

        <div className="text-center mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Konto wählen</h2>
        </div>

        <div className="space-y-10">
          {(['BOSS', 'SHIFT_LEADER', 'WORKER'] as Role[]).map((role) => {
            const meta = ROLE_META[role];
            const list = byRole(role);
            if (list.length === 0) return null;
            return (
              <section key={role}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{meta.icon}</span>
                  <h3 className="text-lg font-bold text-slate-800">{meta.label}</h3>
                  <span className="text-sm text-slate-400">({list.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map((u) => (
                    <AccountButton key={u.id} user={u} meta={meta} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-16 text-center text-sm text-slate-400">
          MVP · läuft lokal &amp; kostenlos · Berichte als getaggte Markdown-Dateien
        </footer>
      </div>
    </div>
  );
}

function AccountButton({
  user,
  meta,
}: {
  user: StoredUser;
  meta: { accent: string; chip: string };
}) {
  const target = homeForRole(user.role);
  return (
    <form action={login.bind(null, user.id, target)}>
      <button
        type="submit"
        className="w-full text-left bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all rounded-2xl border border-slate-200 p-4 flex items-center gap-4"
      >
        <div
          className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${meta.accent} text-white font-bold flex items-center justify-center`}
        >
          {initials(user.name)}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 truncate">{user.name}</div>
          <div className="text-sm text-slate-500 truncate">{user.profession}</div>
        </div>
        {user.language === 'pl' && (
          <span className="ml-auto text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-500">PL</span>
        )}
      </button>
    </form>
  );
}
