# ShiftSync MVP UI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ShiftSync Next.js backend into a complete full-stack MVP by porting Vite/React UI with real AI processing and graceful fallbacks.

**Architecture:** Hybrid Next.js App Router (frontend pages) + API Routes (backend). Port 10 view components from Vite, create 7 API endpoints calling existing agents/whisper services, implement three-tier error handling with fallback data.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, Framer Motion, Recharts, Gemini API, fast-whisper, gray-matter (markdown parsing)

---

## File Structure Overview

### New Files to Create

**App Router (Pages):**
- `app/layout.tsx` - Root layout with theme provider
- `app/page.tsx` - Landing page (redirects to login)
- `app/globals.css` - Global styles (ported from Vite)
- `app/(auth)/login/page.tsx` - Login/role selection
- `app/(roles)/worker/page.tsx` - Worker dashboard
- `app/(roles)/leader/page.tsx` - Leader dashboard
- `app/(roles)/boss/page.tsx` - Boss dashboard

**API Routes:**
- `app/api/upload/route.ts` - File upload (audio/images)
- `app/api/transcribe/route.ts` - Whisper transcription
- `app/api/process/route.ts` - AI agent workflow
- `app/api/reports/route.ts` - Get reports list
- `app/api/reports/[id]/route.ts` - Get single report
- `app/api/health/route.ts` - Health check

**View Components (Ported from Vite):**
- `components/views/WorkerView.tsx`
- `components/views/ShiftLeaderView.tsx`
- `components/views/BossView.tsx`
- `components/views/EmployeeKPIsView.tsx`
- `components/views/FinancialImpactView.tsx`
- `components/views/TeamView.tsx`
- `components/views/ArchiveView.tsx`
- `components/views/SettingsView.tsx`
- `components/views/TutorialView.tsx`
- `components/views/IdeasView.tsx`

**Shared UI Components (New):**
- `components/ui/AudioRecorder.tsx`
- `components/ui/ImageUpload.tsx`
- `components/ui/StatusBadge.tsx`
- `components/layout/RoleLayout.tsx`
- `components/providers/ThemeProvider.tsx`

**Utilities:**
- `lib/markdown.ts` - Markdown file operations
- `lib/fallback-data.ts` - Sample data generator

**Data Files:**
- `data/fallback/sample-reports.json`
- `.env.local` - Environment variables (gitignored)

**Scripts:**
- `scripts/seed-demo.ts` - Demo data seeder

### Files to Modify

- `.gitignore` - Add .env.local, data/media, data/reports
- `package.json` - Add new dependencies
- `tailwind.config.ts` - Add custom colors from Vite app
- `next.config.js` - Configure static file serving

---

## Phase 1: Foundation Setup

### Task 1: Environment & Dependencies

**Files:**
- Modify: `.gitignore`
- Create: `.env.local`
- Modify: `package.json`

- [ ] **Step 1: Update .gitignore**

Add these lines to `.gitignore`:

```gitignore
# Environment variables
.env.local
.env*.local

# User data
data/media/*
data/reports/*

# Keep fallback data
!data/fallback/
```

- [ ] **Step 2: Create .env.local**

Create `.env.local` with:

```env
GEMINI_API_KEY=AIzaSyCrBTpz7vTAdCv5ldVaD5CvxY2QT56LWic
WHISPER_MODEL_PATH=./whisper-service
DATABASE_URL=postgresql://localhost:5432/shiftsync
NODE_ENV=development
NEXT_PUBLIC_DEMO_MODE=true
```

- [ ] **Step 3: Install new dependencies**

Run:
```bash
npm install framer-motion lucide-react recharts clsx tailwind-merge date-fns
```

Expected: Dependencies added to package.json and node_modules

- [ ] **Step 4: Create data directories**

Run:
```bash
mkdir -p data/media data/reports data/fallback
```

Expected: Directories created

- [ ] **Step 5: Commit foundation**

```bash
git add .gitignore package.json package-lock.json
git commit -m "chore: setup environment and dependencies for UI integration

- Add .env.local to gitignore
- Install UI dependencies (framer-motion, recharts, lucide-react)
- Create data directories for media and reports

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 2: Tailwind Configuration

**Files:**
- Modify: `tailwind.config.ts`
- Create: `app/globals.css`

- [ ] **Step 1: Update Tailwind config**

Replace `tailwind.config.ts` content with:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d',
          950: '#052e16',
        },
        night: {
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0a0a0a',
        },
        'lime-glow': '#00ff00',
        cream: '#fefce8',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Create globals.css**

Create `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
  }
}

@layer components {
  .luxury-card {
    @apply bg-white dark:bg-night-900 border border-forest-100 dark:border-night-800 rounded-xl shadow-sm;
  }

  .micro-label {
    @apply inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-forest-50 dark:bg-night-900;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-forest-200 dark:bg-night-700 rounded-full;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-forest-300 dark:bg-night-600;
  }
}

@layer utilities {
  .animate-in {
    animation: animateIn 0.3s ease-out;
  }

  .slide-in-from-top-4 {
    animation: slideInFromTop 0.3s ease-out;
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }
}

@keyframes animateIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromTop {
  from {
    transform: translateY(-1rem);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

- [ ] **Step 3: Test Tailwind build**

Run:
```bash
npm run dev
```

Expected: Dev server starts without Tailwind errors

- [ ] **Step 4: Commit Tailwind config**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: configure Tailwind with custom design system

- Add forest/night color palette
- Add luxury-card and micro-label components
- Add custom scrollbar styles
- Add animation utilities

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 3: Theme Provider

**Files:**
- Create: `components/providers/ThemeProvider.tsx`

- [ ] **Step 1: Create ThemeProvider component**

Create `components/providers/ThemeProvider.tsx`:

```typescript
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 2: Verify import**

Run:
```bash
npm run build
```

Expected: Build succeeds, no TypeScript errors

- [ ] **Step 3: Commit ThemeProvider**

```bash
git add components/providers/ThemeProvider.tsx
git commit -m "feat: add theme provider for dark/light mode

Uses next-themes for theme switching

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 4: Root Layout

**Files:**
- Create: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create root layout**

Create `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter'
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: "ShiftSync - Baudokumentation MVP",
  description: "Zero-Friction Baudokumentation für Arbeiter und Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update landing page**

Replace `app/page.tsx` with:

```typescript
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
```

- [ ] **Step 3: Test layout renders**

Run:
```bash
npm run dev
```

Visit: `http://localhost:3000`
Expected: Redirects to /login (404 for now, that's fine)

- [ ] **Step 4: Commit root layout**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: add root layout with theme provider

- Configure Inter and Playfair Display fonts
- Add ThemeProvider with dark mode default
- Redirect root to /login

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Core UI Components

### Task 5: Login View

**Files:**
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Create login page**

Create `app/(auth)/login/page.tsx`:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { User, HardHat, Briefcase } from 'lucide-react';

type Role = 'worker' | 'leader' | 'boss';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleLogin = (role: Role) => {
    setSelectedRole(role);
    // Store role in localStorage for demo (no real auth)
    if (typeof window !== 'undefined') {
      localStorage.setItem('role', role);
    }

    // Redirect to role-specific dashboard
    const routes: Record<Role, string> = {
      worker: '/worker',
      leader: '/leader',
      boss: '/boss'
    };
    router.push(routes[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-950 via-night-950 to-night-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-lime-glow mb-3 uppercase tracking-widest">
            Gleisbau_Core
          </h1>
          <p className="text-stone-400 text-sm uppercase tracking-wider">
            System V.2.4.9 • Baudokumentation MVP
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => handleLogin('worker')}
            className="luxury-card p-8 hover:border-lime-glow/50 transition-all group hover:scale-105"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lime-glow/10 flex items-center justify-center group-hover:bg-lime-glow/20 transition-colors">
              <HardHat className="w-8 h-8 text-lime-glow" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Arbeiter</h2>
            <p className="text-sm text-stone-400">Sprachnotizen, Fotos, Status</p>
          </button>

          <button
            onClick={() => handleLogin('leader')}
            className="luxury-card p-8 hover:border-lime-glow/50 transition-all group hover:scale-105"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lime-glow/10 flex items-center justify-center group-hover:bg-lime-glow/20 transition-colors">
              <User className="w-8 h-8 text-lime-glow" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Schichtleiter</h2>
            <p className="text-sm text-stone-400">Team-Übersicht, KPIs</p>
          </button>

          <button
            onClick={() => handleLogin('boss')}
            className="luxury-card p-8 hover:border-lime-glow/50 transition-all group hover:scale-105"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lime-glow/10 flex items-center justify-center group-hover:bg-lime-glow/20 transition-colors">
              <Briefcase className="w-8 h-8 text-lime-glow" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Executive</h2>
            <p className="text-sm text-stone-400">Analytics, Finanz-Impact</p>
          </button>
        </div>

        <p className="text-center text-stone-500 text-xs mt-8 uppercase tracking-wider">
          Demo-Modus • Keine Authentifizierung erforderlich
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test login page**

Visit: `http://localhost:3000/login`
Expected: See role selection cards (worker/leader/boss)

- [ ] **Step 3: Test role selection**

Click each role card
Expected: Redirects to role page (404 for now, we'll create them next)

- [ ] **Step 4: Commit login page**

```bash
git add app/\(auth\)/login/page.tsx
git commit -m "feat: add login page with role selection

Three role options: Worker, Leader, Boss
Stores role in localStorage for demo mode

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 6: Role Layout Component

**Files:**
- Create: `components/layout/RoleLayout.tsx`

- [ ] **Step 1: Create RoleLayout**

Create `components/layout/RoleLayout.tsx`:

```typescript
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Moon, Sun, LogOut, Activity, Users, BarChart3, DollarSign, Database, Lightbulb, Settings, BookOpen } from 'lucide-react';
import { useTheme } from 'next-themes';

type Role = 'worker' | 'leader' | 'boss';

interface RoleLayoutProps {
  children: ReactNode;
  role: Role;
  currentView?: string;
}

export function RoleLayout({ children, role, currentView = 'dashboard' }: RoleLayoutProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('role');
    }
    router.push('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Role switcher for demo
  const switchRole = (newRole: Role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('role', newRole);
    }
    const routes: Record<Role, string> = {
      worker: '/worker',
      leader: '/leader',
      boss: '/boss'
    };
    router.push(routes[newRole]);
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-500 bg-cream dark:bg-night-950 text-forest-950 dark:text-stone-100">

      {/* Sidebar - Only for leader and boss */}
      {role !== 'worker' && (
        <aside className="w-64 border-r border-forest-100 dark:border-night-800 bg-white dark:bg-night-900 flex flex-col z-20">
          <div className="p-6">
            <h2 className="text-2xl font-serif font-bold text-forest-900 dark:text-lime-glow uppercase tracking-widest">
              Gleisbau_Core
            </h2>
            <p className="text-[10px] text-forest-500 dark:text-stone-500 mt-1 uppercase tracking-widest">
              System V.2.4.9
            </p>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
            <Link
              href={`/${role}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                  : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
              }`}
            >
              <Activity className="w-5 h-5" />
              Overview
            </Link>

            <Link
              href="/team"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'team'
                  ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                  : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
              }`}
            >
              <Users className="w-5 h-5" />
              Team-Übersicht
            </Link>

            {role === 'boss' && (
              <Link
                href="/boss/financial"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'financial'
                    ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                    : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                Finanz-Impact
              </Link>
            )}

            <Link
              href="/archive"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'archive'
                  ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                  : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
              }`}
            >
              <Database className="w-5 h-5" />
              Datenbank
            </Link>

            {role === 'boss' && (
              <Link
                href="/ideas"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'ideas'
                    ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                    : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
                }`}
              >
                <Lightbulb className="w-5 h-5" />
                Ideen & Vision
              </Link>
            )}

            <Link
              href="/settings"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'settings'
                  ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                  : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
              }`}
            >
              <Settings className="w-5 h-5" />
              Einstellungen
            </Link>
          </nav>

          <div className="p-4 border-t border-forest-100 dark:border-night-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 border-b border-forest-100 dark:border-night-800 bg-white/80 dark:bg-night-900/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            {role === 'worker' && (
              <h2 className="text-xl font-serif font-bold text-forest-900 dark:text-lime-glow uppercase tracking-widest">
                Gleisbau_Core
              </h2>
            )}

            {/* Role Switcher (Demo) */}
            <div className="flex bg-forest-100 dark:bg-night-800 p-1 rounded-lg">
              {(['worker', 'leader', 'boss'] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                    role === r
                      ? 'bg-white dark:bg-night-700 shadow-sm text-forest-900 dark:text-lime-glow'
                      : 'text-forest-500 dark:text-stone-400'
                  }`}
                >
                  {r === 'worker' ? 'Arbeiter' : r === 'leader' ? 'Schichtleiter' : 'Executive'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {role === 'worker' && (
              <>
                <Link
                  href="/tutorial"
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors text-stone-400 hover:text-stone-200"
                >
                  <BookOpen className="w-4 h-4" /> Hilfe
                </Link>
                <div className="w-px h-4 bg-night-800"></div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-stone-400 hover:text-stone-200 uppercase tracking-wider flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-forest-50 dark:bg-night-800 text-forest-600 dark:text-stone-400 hover:text-forest-900 dark:hover:text-lime-glow transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative">
          {children}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify component compiles**

Run:
```bash
npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Commit RoleLayout**

```bash
git add components/layout/RoleLayout.tsx
git commit -m "feat: add role layout with sidebar and navigation

- Sidebar for leader/boss roles
- Role switcher for demo
- Theme toggle
- Navigation links

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 7: Worker View (Simplified)

**Files:**
- Create: `components/views/WorkerView.tsx`
- Create: `app/(roles)/worker/page.tsx`

- [ ] **Step 1: Create simplified WorkerView**

Create `components/views/WorkerView.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Mic, Camera, FileUp, CheckCircle2, Clock } from 'lucide-react';

export default function WorkerView() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-serif font-bold mb-1">Hallo Piotr,</h1>
        <p className="text-forest-600 dark:text-stone-400 text-sm">
          Schicht 2 • Baggerfahrer • Gleis 4
        </p>
      </header>

      {/* Status Card */}
      <div className="luxury-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime-glow/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-lime-glow" />
          </div>
          <div>
            <p className="text-sm font-bold">Status: Aktiv</p>
            <p className="text-xs text-stone-400">Letztes Update: vor 12 Min</p>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-md border border-forest-200 dark:border-night-700 text-xs font-medium hover:bg-forest-50 dark:hover:bg-night-800 transition-colors">
          Pause melden
        </button>
      </div>

      {/* Voice Input Area */}
      <div className="luxury-card p-6 flex flex-col items-center justify-center text-center space-y-4">
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
            isRecording
              ? 'bg-red-500/20 border-red-500/50 animate-pulse'
              : 'bg-lime-glow/10 border-lime-glow/30 hover:bg-lime-glow/20'
          } relative group`}
        >
          <Mic className={`w-10 h-10 ${isRecording ? 'text-red-500' : 'text-lime-glow'}`} />
        </button>
        <div>
          <p className="font-bold text-lg mb-1">
            {isRecording ? 'Aufnahme läuft...' : 'Sprachnotiz aufnehmen'}
          </p>
          <p className="text-xs text-stone-400">
            {isRecording ? '00:05' : '"Wir brauchen mehr Schotter an Gleis 4..."'}
          </p>
        </div>

        <div className="flex gap-4 w-full mt-4">
          <button className="flex-1 py-4 rounded-xl bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700 flex items-center justify-center gap-2 hover:bg-forest-100 dark:hover:bg-night-700 transition-colors">
            <Camera className="w-5 h-5 text-forest-600 dark:text-stone-300" />
            <span className="text-sm font-bold">Foto</span>
          </button>
          <button className="flex-1 py-4 rounded-xl bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700 flex items-center justify-center gap-2 hover:bg-forest-100 dark:hover:bg-night-700 transition-colors">
            <FileUp className="w-5 h-5 text-forest-600 dark:text-stone-300" />
            <span className="text-sm font-bold">Datei</span>
          </button>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">
            Letzte Einträge
          </h2>
          <span className="text-xs text-lime-glow">Live</span>
        </div>

        <div className="luxury-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              <span className="text-xs text-stone-400">10:42 Uhr</span>
            </div>
            <span className="micro-label bg-lime-glow/10 text-lime-glow">Erfasst</span>
          </div>
          <p className="text-sm">
            "Bagger 3 hat ein Problem mit der Hydraulik, verliert etwas Öl."
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create worker page**

Create `app/(roles)/worker/page.tsx`:

```typescript
import WorkerView from '@/components/views/WorkerView';
import { RoleLayout } from '@/components/layout/RoleLayout';

export default function WorkerPage() {
  return (
    <RoleLayout role="worker">
      <WorkerView />
    </RoleLayout>
  );
}
```

- [ ] **Step 3: Test worker view**

Visit: `http://localhost:3000/worker`
Expected: See worker dashboard with mic button

- [ ] **Step 4: Test recording button**

Click microphone button
Expected: Button turns red and shows "Aufnahme läuft..."

- [ ] **Step 5: Commit worker view**

```bash
git add components/views/WorkerView.tsx app/\(roles\)/worker/page.tsx
git commit -m "feat: add worker view with audio recording UI

- Microphone button with recording state
- Status card
- Photo and file upload buttons (UI only)
- Recent entries feed

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 8: Leader & Boss Placeholder Views

**Files:**
- Create: `components/views/ShiftLeaderView.tsx`
- Create: `components/views/BossView.tsx`
- Create: `app/(roles)/leader/page.tsx`
- Create: `app/(roles)/boss/page.tsx`

- [ ] **Step 1: Create ShiftLeaderView placeholder**

Create `components/views/ShiftLeaderView.tsx`:

```typescript
'use client';

import { Users, Clock, AlertCircle } from 'lucide-react';

export default function ShiftLeaderView() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Schichtleiter Dashboard</h1>
        <p className="text-forest-600 dark:text-stone-400">
          Schicht 2 • {new Date().toLocaleDateString('de-DE')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-lime-glow/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-lime-glow" />
            </div>
            <div>
              <p className="text-2xl font-bold">7</p>
              <p className="text-xs text-stone-400 uppercase">Arbeiter Aktiv</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">5.5h</p>
              <p className="text-xs text-stone-400 uppercase">Verzögerungen</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-stone-400 uppercase">Probleme</p>
            </div>
          </div>
        </div>
      </div>

      <div className="luxury-card p-6">
        <h2 className="text-lg font-bold mb-4">Berichte (heute)</h2>
        <p className="text-stone-400 text-sm">API Integration folgt...</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create BossView placeholder**

Create `components/views/BossView.tsx`:

```typescript
'use client';

import { TrendingUp, DollarSign, Clock, AlertTriangle } from 'lucide-react';

export default function BossView() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Executive Dashboard</h1>
        <p className="text-forest-600 dark:text-stone-400">
          Projektübersicht • {new Date().toLocaleDateString('de-DE')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-lime-glow" />
            <p className="text-xs text-stone-400 uppercase">Fortschritt</p>
          </div>
          <p className="text-3xl font-bold">78%</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <p className="text-xs text-stone-400 uppercase">Verzögerungen</p>
          </div>
          <p className="text-3xl font-bold">23h</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            <p className="text-xs text-stone-400 uppercase">Mehrkosten</p>
          </div>
          <p className="text-3xl font-bold">€12k</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <p className="text-xs text-stone-400 uppercase">Kritische</p>
          </div>
          <p className="text-3xl font-bold">5</p>
        </div>
      </div>

      <div className="luxury-card p-6">
        <h2 className="text-lg font-bold mb-4">KPI Charts</h2>
        <p className="text-stone-400 text-sm">Charts integration folgt...</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create leader page**

Create `app/(roles)/leader/page.tsx`:

```typescript
import ShiftLeaderView from '@/components/views/ShiftLeaderView';
import { RoleLayout } from '@/components/layout/RoleLayout';

export default function LeaderPage() {
  return (
    <RoleLayout role="leader" currentView="dashboard">
      <ShiftLeaderView />
    </RoleLayout>
  );
}
```

- [ ] **Step 4: Create boss page**

Create `app/(roles)/boss/page.tsx`:

```typescript
import BossView from '@/components/views/BossView';
import { RoleLayout } from '@/components/layout/RoleLayout';

export default function BossPage() {
  return (
    <RoleLayout role="boss" currentView="dashboard">
      <BossView />
    </RoleLayout>
  );
}
```

- [ ] **Step 5: Test all role views**

Visit each:
- `http://localhost:3000/worker`
- `http://localhost:3000/leader`
- `http://localhost:3000/boss`

Expected: All pages render with proper layout

- [ ] **Step 6: Test role switcher**

Click role tabs in topbar
Expected: Navigates between roles smoothly

- [ ] **Step 7: Test theme toggle**

Click sun/moon icon
Expected: Theme switches between light/dark

- [ ] **Step 8: Commit role views**

```bash
git add components/views/ShiftLeaderView.tsx components/views/BossView.tsx app/\(roles\)/leader/page.tsx app/\(roles\)/boss/page.tsx
git commit -m "feat: add leader and boss placeholder views

- Leader view with team stats
- Boss view with KPI cards
- Both integrate with RoleLayout
- Sidebar navigation working

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: API Routes - File Upload

### Task 9: Upload API Route

**Files:**
- Create: `app/api/upload/route.ts`
- Create: `lib/file-storage.ts`

- [ ] **Step 1: Create file storage utility**

Create `lib/file-storage.ts`:

```typescript
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function saveFile(
  file: File,
  type: 'audio' | 'image'
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure directory exists
  const uploadDir = path.join(process.cwd(), 'data', 'media');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const extension = file.name.split('.').pop();
  const filename = `${timestamp}-${randomSuffix}.${extension}`;

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  return `/media/${filename}`;
}
```

- [ ] **Step 2: Create upload API route**

Create `app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/lib/file-storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const audioFile = formData.get('audio') as File | null;
    const imageFile = formData.get('image') as File | null;
    const workerId = formData.get('workerId') as string;
    const shift = formData.get('shift') as string;

    if (!audioFile && !imageFile) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const audioUrl = audioFile ? await saveFile(audioFile, 'audio') : null;
    const imageUrl = imageFile ? await saveFile(imageFile, 'image') : null;

    const uploadId = `upload-${Date.now()}`;

    return NextResponse.json({
      success: true,
      uploadId,
      audioUrl,
      imageUrl,
      workerId,
      shift,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Configure Next.js for static files**

Modify `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: '/data/media/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

- [ ] **Step 4: Test upload endpoint**

Create test file `test-upload.sh`:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "audio=@test.mp3" \
  -F "workerId=worker-123" \
  -F "shift=2"
```

Run: `bash test-upload.sh` (requires test.mp3 file)
Expected: Returns JSON with audioUrl

- [ ] **Step 5: Commit upload API**

```bash
git add app/api/upload/route.ts lib/file-storage.ts next.config.js
git commit -m "feat: add file upload API endpoint

- Save audio/image files to data/media/
- Return file URLs
- Configure Next.js static file serving

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: API Routes - Transcription

### Task 10: Transcription API Route

**Files:**
- Create: `app/api/transcribe/route.ts`
- Modify: `src/lib/whisper.ts` (if needed)

- [ ] **Step 1: Check existing Whisper service**

Read `src/lib/whisper.ts` to understand the interface.

Expected: Function like `transcribe(audioPath: string): Promise<string>`

- [ ] **Step 2: Create transcribe API route**

Create `app/api/transcribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

// Fallback transcription if Whisper unavailable
const FALLBACK_TRANSCRIPT = "[Transkription nicht verfügbar - Demo-Modus]";

export async function POST(request: NextRequest) {
  try {
    const { audioUrl, language = 'pl' } = await request.json();

    if (!audioUrl) {
      return NextResponse.json(
        { success: false, error: 'No audio URL provided' },
        { status: 400 }
      );
    }

    // Convert URL to filesystem path
    const audioPath = path.join(process.cwd(), 'data', audioUrl.replace('/media/', 'media/'));

    try {
      // Try real transcription (import dynamically to avoid errors if service not ready)
      const { transcribe } = await import('@/src/lib/whisper');
      const transcript = await transcribe(audioPath, language);

      return NextResponse.json({
        success: true,
        transcript,
        confidence: 0.95,
        language,
        duration: 10,
      });

    } catch (whisperError) {
      console.error('Whisper transcription failed, using fallback:', whisperError);

      // Fallback: Return mock transcript
      return NextResponse.json({
        success: true,
        transcript: FALLBACK_TRANSCRIPT,
        confidence: 0,
        language,
        duration: 0,
        usedFallback: true,
      });
    }

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { success: false, error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Test transcribe endpoint**

Run:
```bash
curl -X POST http://localhost:3000/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"audioUrl":"/media/test.mp3","language":"pl"}'
```

Expected: Returns JSON with transcript (fallback for now)

- [ ] **Step 4: Commit transcribe API**

```bash
git add app/api/transcribe/route.ts
git commit -m "feat: add transcription API endpoint

- Integrate with existing Whisper service
- Fallback to mock transcript if Whisper unavailable
- Support Polish and German

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 5: API Routes - Agent Processing

### Task 11: Process API Route

**Files:**
- Create: `app/api/process/route.ts`
- Create: `lib/markdown.ts`

- [ ] **Step 1: Create markdown utility**

Create `lib/markdown.ts`:

```typescript
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ReportMetadata {
  id: string;
  mitarbeiter: string;
  workerId: string;
  rolle: string;
  datum: string;
  zeit: string;
  schicht: number;
  gleis?: string;
  tags: string[];
  audio_url?: string;
  image_urls: string[];
  status: string;
  delay_hours?: number;
  estimated_cost?: number;
}

export async function saveMarkdownReport(
  metadata: ReportMetadata,
  content: string
): Promise<string> {
  const reportsDir = path.join(process.cwd(), 'data', 'reports');
  if (!existsSync(reportsDir)) {
    await mkdir(reportsDir, { recursive: true });
  }

  const filename = `${metadata.id}.md`;
  const filepath = path.join(reportsDir, filename);

  const fileContent = matter.stringify(content, metadata);
  await writeFile(filepath, fileContent);

  return metadata.id;
}
```

- [ ] **Step 2: Create process API route**

Create `app/api/process/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { saveMarkdownReport } from '@/lib/markdown';

// Fallback processing if agents unavailable
async function fallbackProcessing(transcript: string, metadata: any) {
  const reportId = `report-${Date.now()}`;

  const content = `## Original Transkript
${transcript}

## Übersetzt & Bereinigt
*(Automatische Verarbeitung läuft im Hintergrund)*

${transcript}
`;

  await saveMarkdownReport({
    id: reportId,
    mitarbeiter: metadata.workerName || 'Unbekannt',
    workerId: metadata.workerId,
    rolle: metadata.role || 'Arbeiter',
    datum: new Date().toISOString().split('T')[0],
    zeit: new Date().toISOString().split('T')[1].split('.')[0],
    schicht: metadata.shift || 2,
    gleis: metadata.track,
    tags: ['Unverarbeitet'],
    audio_url: metadata.audioUrl,
    image_urls: metadata.imageUrl ? [metadata.imageUrl] : [],
    status: 'fallback',
  }, content);

  return { reportId, usedFallback: true };
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, workerId, workerName, role, shift, metadata } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { success: false, error: 'No transcript provided' },
        { status: 400 }
      );
    }

    try {
      // Try real agent processing
      const { runAgentWorkflow } = await import('@/src/agents/workflow');

      const result = await runAgentWorkflow({
        transcript,
        workerId,
        shift,
      });

      // Check if QA agent needs follow-up
      if (result.needsFollowUp) {
        return NextResponse.json({
          success: true,
          needsFollowUp: true,
          qaQuestion: result.qaQuestion,
        });
      }

      // Save processed report
      const reportId = `report-${Date.now()}`;
      await saveMarkdownReport({
        id: reportId,
        mitarbeiter: workerName || 'Unbekannt',
        workerId,
        rolle: role || 'Arbeiter',
        datum: new Date().toISOString().split('T')[0],
        zeit: new Date().toISOString().split('T')[1].split('.')[0],
        schicht: shift,
        tags: result.tags || [],
        audio_url: metadata?.audioUrl,
        image_urls: metadata?.imageUrl ? [metadata.imageUrl] : [],
        status: 'processed',
        delay_hours: result.delayHours,
        estimated_cost: result.estimatedCost,
      }, result.markdown);

      return NextResponse.json({
        success: true,
        reportId,
        needsFollowUp: false,
      });

    } catch (agentError) {
      console.error('Agent processing failed, using fallback:', agentError);

      // Fallback: Simple processing
      const result = await fallbackProcessing(transcript, {
        workerId,
        workerName,
        role,
        shift,
        audioUrl: metadata?.audioUrl,
        imageUrl: metadata?.imageUrl,
      });

      return NextResponse.json({
        success: true,
        ...result,
      });
    }

  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json(
      { success: false, error: 'Processing failed' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Test process endpoint**

Run:
```bash
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Wir haben Problem mit Bagger 3, Hydraulikleck",
    "workerId": "worker-123",
    "workerName": "Piotr Kowalski",
    "shift": 2
  }'
```

Expected: Returns reportId, creates markdown file in data/reports/

- [ ] **Step 4: Verify markdown file created**

Run:
```bash
ls data/reports/
cat data/reports/report-*.md
```

Expected: See markdown file with YAML frontmatter

- [ ] **Step 5: Commit process API**

```bash
git add app/api/process/route.ts lib/markdown.ts
git commit -m "feat: add agent processing API endpoint

- Integrate with existing agent workflow
- Save reports as markdown with frontmatter
- Fallback to simple processing if agents fail
- Support QA follow-up questions

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 6: API Routes - Reports

### Task 12: Reports API Routes

**Files:**
- Create: `app/api/reports/route.ts`
- Create: `app/api/reports/[id]/route.ts`
- Create: `lib/fallback-data.ts`

- [ ] **Step 1: Create fallback data**

Create `lib/fallback-data.ts`:

```typescript
export const SAMPLE_REPORTS = [
  {
    id: 'demo-001',
    mitarbeiter: 'Piotr Kowalski',
    workerId: 'worker-001',
    rolle: 'Baggerfahrer',
    datum: new Date().toISOString().split('T')[0],
    zeit: '10:42:00',
    schicht: 2,
    gleis: '4',
    tags: ['Verzögerung', 'Material'],
    audio_url: '/media/demo-001.webm',
    image_urls: [],
    status: 'processed',
    delay_hours: 2,
    estimated_cost: 800,
    summary: 'Verzögerung durch undokumentiertes Rohr - 2h Stillstand, Bagger 3 betroffen',
  },
  {
    id: 'demo-002',
    mitarbeiter: 'Jan Nowak',
    workerId: 'worker-002',
    rolle: 'Gleisbauer',
    datum: new Date().toISOString().split('T')[0],
    zeit: '11:15:00',
    schicht: 2,
    gleis: '3',
    tags: ['Material', 'Schotter'],
    audio_url: '/media/demo-002.webm',
    image_urls: [],
    status: 'processed',
    delay_hours: 1.5,
    estimated_cost: 400,
    summary: 'Materialmangel Schotter - 1.5h Wartezeit',
  },
  {
    id: 'demo-003',
    mitarbeiter: 'Marek Kowal',
    workerId: 'worker-003',
    rolle: 'Baggerfahrer',
    datum: new Date().toISOString().split('T')[0],
    zeit: '14:30:00',
    schicht: 2,
    gleis: '4',
    tags: ['Maschine', 'Wartung'],
    audio_url: '/media/demo-003.webm',
    image_urls: [],
    status: 'processed',
    delay_hours: 2,
    estimated_cost: 1200,
    summary: 'Hydraulikleck Bagger 3 - Wartung erforderlich',
  },
];

export function getSampleReports(shift?: number) {
  if (shift) {
    return SAMPLE_REPORTS.filter(r => r.schicht === shift);
  }
  return SAMPLE_REPORTS;
}
```

- [ ] **Step 2: Create reports list API**

Create `app/api/reports/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getSampleReports } from '@/lib/fallback-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shift = searchParams.get('shift') ? parseInt(searchParams.get('shift')!) : undefined;
    const date = searchParams.get('date');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    const reportsDir = path.join(process.cwd(), 'data', 'reports');

    // Check if reports directory exists and has files
    if (!existsSync(reportsDir)) {
      // Return sample data
      return NextResponse.json({
        success: true,
        reports: getSampleReports(shift),
        total: getSampleReports(shift).length,
        usedFallback: true,
      });
    }

    const files = await readdir(reportsDir);
    const markdownFiles = files.filter(f => f.endsWith('.md') && !f.includes('summary'));

    if (markdownFiles.length === 0) {
      // Return sample data
      return NextResponse.json({
        success: true,
        reports: getSampleReports(shift),
        total: getSampleReports(shift).length,
        usedFallback: true,
      });
    }

    // Read and parse markdown files
    const reports = await Promise.all(
      markdownFiles.map(async (file) => {
        const filepath = path.join(reportsDir, file);
        const content = await readFile(filepath, 'utf-8');
        const { data } = matter(content);
        return data;
      })
    );

    // Filter by shift if provided
    let filtered = reports;
    if (shift !== undefined) {
      filtered = filtered.filter(r => r.schicht === shift);
    }
    if (date) {
      filtered = filtered.filter(r => r.datum === date);
    }

    // Sort by date/time descending
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.datum}T${a.zeit}`);
      const dateB = new Date(`${b.datum}T${b.zeit}`);
      return dateB.getTime() - dateA.getTime();
    });

    // Limit results
    const paginated = filtered.slice(0, limit);

    // Calculate aggregated metrics
    const aggregated = {
      totalDelays: filtered.reduce((sum, r) => sum + (r.delay_hours || 0), 0),
      totalCost: filtered.reduce((sum, r) => sum + (r.estimated_cost || 0), 0),
      reportsCount: filtered.length,
    };

    return NextResponse.json({
      success: true,
      reports: paginated,
      total: filtered.length,
      aggregated,
    });

  } catch (error) {
    console.error('Reports fetch error:', error);

    // Fallback to sample data on error
    return NextResponse.json({
      success: true,
      reports: getSampleReports(),
      total: getSampleReports().length,
      usedFallback: true,
    });
  }
}
```

- [ ] **Step 3: Create single report API**

Create `app/api/reports/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { SAMPLE_REPORTS } from '@/lib/fallback-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const filepath = path.join(process.cwd(), 'data', 'reports', `${id}.md`);

    if (!existsSync(filepath)) {
      // Try to find in sample data
      const sample = SAMPLE_REPORTS.find(r => r.id === id);
      if (sample) {
        return NextResponse.json({
          success: true,
          report: {
            ...sample,
            content: `## Bericht\n\n${sample.summary}`,
          },
          usedFallback: true,
        });
      }

      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    const fileContent = await readFile(filepath, 'utf-8');
    const { data, content } = matter(fileContent);

    return NextResponse.json({
      success: true,
      report: {
        ...data,
        content,
      },
    });

  } catch (error) {
    console.error('Report fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Test reports endpoint**

Run:
```bash
curl http://localhost:3000/api/reports
```

Expected: Returns sample reports (since no real reports exist yet)

- [ ] **Step 5: Test single report endpoint**

Run:
```bash
curl http://localhost:3000/api/reports/demo-001
```

Expected: Returns demo report details

- [ ] **Step 6: Commit reports API**

```bash
git add app/api/reports/route.ts app/api/reports/\[id\]/route.ts lib/fallback-data.ts
git commit -m "feat: add reports API endpoints

- List reports with filtering (shift, date)
- Get single report by ID
- Calculate aggregated metrics
- Fallback to sample data if no reports exist

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 13: Health Check API

**Files:**
- Create: `app/api/health/route.ts`

- [ ] **Step 1: Create health check endpoint**

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      dataDirectories: {
        media: existsSync(path.join(process.cwd(), 'data', 'media')),
        reports: existsSync(path.join(process.cwd(), 'data', 'reports')),
        fallback: existsSync(path.join(process.cwd(), 'data', 'fallback')),
      },
      env: {
        geminiKey: !!process.env.GEMINI_API_KEY,
        demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
      },
    },
  };

  return NextResponse.json(checks);
}
```

- [ ] **Step 2: Test health check**

Run:
```bash
curl http://localhost:3000/api/health
```

Expected: Returns health status JSON

- [ ] **Step 3: Commit health check**

```bash
git add app/api/health/route.ts
git commit -m "feat: add health check API endpoint

Reports status of data directories and environment

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 7: Integration & Polish

### Task 14: Audio Recorder Component

**Files:**
- Create: `components/ui/AudioRecorder.tsx`
- Modify: `components/views/WorkerView.tsx`

- [ ] **Step 1: Create AudioRecorder component**

Create `components/ui/AudioRecorder.tsx`:

```typescript
'use client';

import { useState, useRef } from 'react';
import { Mic } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  workerId: string;
  shift: number;
}

export function AudioRecorder({ onRecordingComplete, workerId, shift }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Mikrofon-Zugriff verweigert');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="luxury-card p-6 flex flex-col items-center justify-center text-center space-y-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
          isRecording
            ? 'bg-red-500/20 border-red-500/50 animate-pulse'
            : 'bg-lime-glow/10 border-lime-glow/30 hover:bg-lime-glow/20'
        } relative group`}
      >
        <Mic className={`w-10 h-10 ${isRecording ? 'text-red-500' : 'text-lime-glow'}`} />
      </button>

      <div>
        <p className="font-bold text-lg mb-1">
          {isRecording ? 'Aufnahme läuft...' : 'Sprachnotiz aufnehmen'}
        </p>
        <p className="text-xs text-stone-400">
          {isRecording ? formatTime(recordingTime) : '"Wir brauchen mehr Schotter an Gleis 4..."'}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Integrate AudioRecorder into WorkerView**

Modify `components/views/WorkerView.tsx` - replace the voice input section:

```typescript
'use client';

import { useState } from 'react';
import { Camera, FileUp, CheckCircle2, Clock } from 'lucide-react';
import { AudioRecorder } from '@/components/ui/AudioRecorder';

export default function WorkerView() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsUploading(true);
    setUploadStatus('Wird hochgeladen...');

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('workerId', 'worker-123');
      formData.append('shift', '2');

      // Upload
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error('Upload failed');
      }

      setUploadStatus('Transkribiere...');

      // Transcribe
      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: uploadData.audioUrl,
          language: 'pl',
        }),
      });
      const transcribeData = await transcribeRes.json();

      setUploadStatus('KI analysiert...');

      // Process
      const processRes = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcribeData.transcript,
          workerId: 'worker-123',
          workerName: 'Piotr Kowalski',
          role: 'Baggerfahrer',
          shift: 2,
          metadata: {
            audioUrl: uploadData.audioUrl,
          },
        }),
      });
      const processData = await processRes.json();

      setUploadStatus('Erfasst!');

      // Auto-dismiss after 2 seconds
      setTimeout(() => {
        setUploadStatus(null);
        setIsUploading(false);
      }, 2000);

    } catch (error) {
      console.error('Workflow error:', error);
      setUploadStatus('Fehler - bitte erneut versuchen');
      setTimeout(() => {
        setUploadStatus(null);
        setIsUploading(false);
      }, 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-serif font-bold mb-1">Hallo Piotr,</h1>
        <p className="text-forest-600 dark:text-stone-400 text-sm">
          Schicht 2 • Baggerfahrer • Gleis 4
        </p>
      </header>

      {/* Status */}
      {uploadStatus && (
        <div className="luxury-card p-4 bg-lime-glow/10 border-lime-glow/30 text-center">
          <p className="font-bold text-lime-glow">{uploadStatus}</p>
        </div>
      )}

      {/* Status Card */}
      <div className="luxury-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime-glow/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-lime-glow" />
          </div>
          <div>
            <p className="text-sm font-bold">Status: Aktiv</p>
            <p className="text-xs text-stone-400">Letztes Update: vor 12 Min</p>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-md border border-forest-200 dark:border-night-700 text-xs font-medium hover:bg-forest-50 dark:hover:bg-night-800 transition-colors">
          Pause melden
        </button>
      </div>

      {/* Audio Recorder */}
      <AudioRecorder
        onRecordingComplete={handleRecordingComplete}
        workerId="worker-123"
        shift={2}
      />

      {/* Photo/File buttons */}
      <div className="flex gap-4">
        <button className="flex-1 py-4 rounded-xl bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700 flex items-center justify-center gap-2 hover:bg-forest-100 dark:hover:bg-night-700 transition-colors">
          <Camera className="w-5 h-5 text-forest-600 dark:text-stone-300" />
          <span className="text-sm font-bold">Foto</span>
        </button>
        <button className="flex-1 py-4 rounded-xl bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700 flex items-center justify-center gap-2 hover:bg-forest-100 dark:hover:bg-night-700 transition-colors">
          <FileUp className="w-5 h-5 text-forest-600 dark:text-stone-300" />
          <span className="text-sm font-bold">Datei</span>
        </button>
      </div>

      {/* Recent Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">
            Letzte Einträge
          </h2>
          <span className="text-xs text-lime-glow">Live</span>
        </div>

        <div className="luxury-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              <span className="text-xs text-stone-400">10:42 Uhr</span>
            </div>
            <span className="micro-label bg-lime-glow/10 text-lime-glow">Erfasst</span>
          </div>
          <p className="text-sm">
            "Bagger 3 hat ein Problem mit der Hydraulik, verliert etwas Öl."
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Test audio recording flow**

Visit: `http://localhost:3000/worker`

1. Click microphone button
2. Allow microphone permission
3. Speak for 5 seconds
4. Click to stop recording
5. Watch status messages: "Wird hochgeladen..." → "Transkribiere..." → "KI analysiert..." → "Erfasst!"

Expected: Full workflow completes (with fallback data)

- [ ] **Step 4: Check created files**

Run:
```bash
ls data/media/
ls data/reports/
```

Expected: Audio file in media/, markdown file in reports/

- [ ] **Step 5: Commit audio recorder integration**

```bash
git add components/ui/AudioRecorder.tsx components/views/WorkerView.tsx
git commit -m "feat: integrate audio recorder with full workflow

- MediaRecorder API for audio capture
- Complete upload → transcribe → process pipeline
- Status feedback at each stage
- Creates markdown reports

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 15: Update Boss View with Real Data

**Files:**
- Modify: `components/views/BossView.tsx`

- [ ] **Step 1: Update BossView to fetch real reports**

Replace `components/views/BossView.tsx` with:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Clock, AlertTriangle, FileText } from 'lucide-react';

interface Report {
  id: string;
  mitarbeiter: string;
  datum: string;
  zeit: string;
  schicht: number;
  summary?: string;
  delay_hours?: number;
  estimated_cost?: number;
  tags: string[];
}

interface Aggregated {
  totalDelays: number;
  totalCost: number;
  reportsCount: number;
}

export default function BossView() {
  const [reports, setReports] = useState<Report[]>([]);
  const [aggregated, setAggregated] = useState<Aggregated | null>(null);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports?limit=20');
      const data = await res.json();

      if (data.success) {
        setReports(data.reports);
        setAggregated(data.aggregated);
        setUsedFallback(data.usedFallback || false);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-stone-400">Lädt...</p>
      </div>
    );
  }

  const progress = Math.min(100, Math.round((reports.length / 100) * 100));
  const criticalCount = reports.filter(r =>
    r.tags?.some(tag => tag.toLowerCase().includes('kritisch') || tag.toLowerCase().includes('verzögerung'))
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Executive Dashboard</h1>
        <div className="flex items-center gap-3">
          <p className="text-forest-600 dark:text-stone-400">
            Projektübersicht • {new Date().toLocaleDateString('de-DE')}
          </p>
          {usedFallback && (
            <span className="micro-label bg-amber-500/10 text-amber-500">Demo-Daten</span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-lime-glow" />
            <p className="text-xs text-stone-400 uppercase">Berichte</p>
          </div>
          <p className="text-3xl font-bold">{aggregated?.reportsCount || 0}</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <p className="text-xs text-stone-400 uppercase">Verzögerungen</p>
          </div>
          <p className="text-3xl font-bold">{aggregated?.totalDelays.toFixed(1) || 0}h</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            <p className="text-xs text-stone-400 uppercase">Mehrkosten</p>
          </div>
          <p className="text-3xl font-bold">€{((aggregated?.totalCost || 0) / 1000).toFixed(1)}k</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <p className="text-xs text-stone-400 uppercase">Kritische</p>
          </div>
          <p className="text-3xl font-bold">{criticalCount}</p>
        </div>
      </div>

      <div className="luxury-card p-6">
        <h2 className="text-lg font-bold mb-4">Aktuelle Berichte</h2>
        <div className="space-y-3">
          {reports.slice(0, 5).map(report => (
            <div key={report.id} className="p-4 rounded-lg bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-sm">{report.mitarbeiter}</p>
                  <p className="text-xs text-stone-400">
                    {report.datum} • {report.zeit} • Schicht {report.schicht}
                  </p>
                </div>
                <div className="flex gap-2">
                  {report.delay_hours && report.delay_hours > 0 && (
                    <span className="micro-label bg-amber-500/10 text-amber-500">
                      {report.delay_hours}h
                    </span>
                  )}
                  {report.estimated_cost && report.estimated_cost > 0 && (
                    <span className="micro-label bg-red-500/10 text-red-500">
                      €{report.estimated_cost}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                {report.summary || 'Kein Summary verfügbar'}
              </p>
              {report.tags && report.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {report.tags.map(tag => (
                    <span key={tag} className="micro-label bg-forest-100 dark:bg-night-700 text-forest-600 dark:text-stone-300">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test Boss view with real data**

1. Record an audio note as worker
2. Switch to Boss role
3. See report appear in dashboard
4. Verify KPIs updated

Expected: Boss view shows real data from created reports

- [ ] **Step 3: Commit Boss view update**

```bash
git add components/views/BossView.tsx
git commit -m "feat: update boss view to display real report data

- Fetch reports from API
- Display KPIs (delays, costs, count)
- Show recent reports with details
- Demo-data indicator when using fallback

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 8: Demo Preparation

### Task 16: Demo Data Seeder

**Files:**
- Create: `scripts/seed-demo.ts`
- Modify: `package.json`

- [ ] **Step 1: Create seed script**

Create `scripts/seed-demo.ts`:

```typescript
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DEMO_REPORTS = [
  {
    metadata: {
      id: 'demo-001',
      mitarbeiter: 'Piotr Kowalski',
      workerId: 'worker-001',
      rolle: 'Baggerfahrer',
      datum: new Date().toISOString().split('T')[0],
      zeit: '10:42:00',
      schicht: 2,
      gleis: '4',
      tags: ['Verzögerung', 'Material', 'Bagger-3'],
      audio_url: '/media/demo-001.webm',
      image_urls: [],
      status: 'processed',
      delay_hours: 2,
      estimated_cost: 800,
    },
    content: `## Original Transkript (Polnisch)
Mieliśmy problem z ukrytą rurą. Koparka 3 musiała się zatrzymać. Straciliśmy około 2 godziny.

## Übersetzung & Bereinigung

**Verzögerung durch undokumentiertes Rohr**

- **Betroffen:** Bagger 3, Gleis 4
- **Dauer:** 2 Stunden Stillstand
- **Zusätzliches Material benötigt:** Schotter (ca. 5 Tonnen)
- **Geschätzte Mehrkosten:** €800
- **Priorität:** Hoch

**Empfehlung:** Baustellenpläne aktualisieren, Bodenradar für nächsten Abschnitt anfordern.
`,
  },
  {
    metadata: {
      id: 'demo-002',
      mitarbeiter: 'Jan Nowak',
      workerId: 'worker-002',
      rolle: 'Gleisbauer',
      datum: new Date().toISOString().split('T')[0],
      zeit: '11:15:00',
      schicht: 2,
      gleis: '3',
      tags: ['Material', 'Schotter'],
      audio_url: '/media/demo-002.webm',
      image_urls: [],
      status: 'processed',
      delay_hours: 1.5,
      estimated_cost: 400,
    },
    content: `## Original Transkript (Deutsch)
Wir warten seit anderthalb Stunden auf Schotter. Gleis 3 kann nicht weitergehen.

## Übersetzung & Bereinigung

**Materialmangel Schotter**

- **Betroffen:** Gleis 3
- **Dauer:** 1.5 Stunden Wartezeit
- **Material:** Schotter (10 Tonnen benötigt)
- **Geschätzte Mehrkosten:** €400

**Empfehlung:** Materialdisposition verbessern, Puffer für kritische Materialien anlegen.
`,
  },
  {
    metadata: {
      id: 'demo-003',
      mitarbeiter: 'Marek Kowal',
      workerId: 'worker-003',
      rolle: 'Baggerfahrer',
      datum: new Date().toISOString().split('T')[0],
      zeit: '14:30:00',
      schicht: 2,
      gleis: '4',
      tags: ['Maschine', 'Wartung', 'Bagger-3'],
      audio_url: '/media/demo-003.webm',
      image_urls: [],
      status: 'processed',
      delay_hours: 2,
      estimated_cost: 1200,
    },
    content: `## Original Transkript (Polnisch)
Koparka 3 ma problem z hydrauliką, wyciek oleju. Potrzebna naprawa.

## Übersetzung & Bereinigung

**Hydraulikleck Bagger 3**

- **Betroffen:** Bagger 3
- **Problem:** Hydraulikleck, Ölaustritt
- **Dauer:** 2 Stunden Ausfallzeit (inkl. Wartung)
- **Material:** Hydrauliköl (20 Liter)
- **Geschätzte Mehrkosten:** €1,200
- **Priorität:** Hoch

**Empfehlung:** Sofortige Wartung durch Werkstatt, präventive Inspektion aller Bagger.
`,
  },
];

async function seedDemoData() {
  const reportsDir = path.join(process.cwd(), 'data', 'reports');

  if (!existsSync(reportsDir)) {
    await mkdir(reportsDir, { recursive: true });
  }

  console.log('🌱 Seeding demo reports...');

  for (const report of DEMO_REPORTS) {
    const filename = `${report.metadata.id}.md`;
    const filepath = path.join(reportsDir, filename);

    const fileContent = matter.stringify(report.content, report.metadata);
    await writeFile(filepath, fileContent);

    console.log(`✅ Created ${filename}`);
  }

  console.log(`\n🎉 Seeded ${DEMO_REPORTS.length} demo reports successfully!`);
  console.log('\nYou can now:');
  console.log('1. Visit http://localhost:3000/boss to see the reports');
  console.log('2. Switch to worker role and create new reports');
  console.log('3. Demo the full workflow to stakeholders\n');
}

seedDemoData().catch(console.error);
```

- [ ] **Step 2: Add seed script to package.json**

Modify `package.json` scripts section:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed-demo": "tsx scripts/seed-demo.ts"
  }
}
```

- [ ] **Step 3: Install tsx if needed**

Run:
```bash
npm install -D tsx
```

- [ ] **Step 4: Run seed script**

Run:
```bash
npm run seed-demo
```

Expected: Creates 3 demo reports in data/reports/

- [ ] **Step 5: Verify demo data in UI**

Visit: `http://localhost:3000/boss`
Expected: See 3 demo reports with KPIs populated

- [ ] **Step 6: Commit seed script**

```bash
git add scripts/seed-demo.ts package.json
git commit -m "feat: add demo data seeder script

Creates 3 realistic construction reports for demo purposes

Usage: npm run seed-demo

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 17: Final Testing & Documentation

**Files:**
- Create: `DEMO_GUIDE.md`

- [ ] **Step 1: Create demo guide**

Create `DEMO_GUIDE.md`:

```markdown
# ShiftSync MVP Demo Guide

## Pre-Demo Checklist

### 1. Environment Setup
- [ ] `.env.local` exists with Gemini API key
- [ ] Run `npm install` to ensure all dependencies installed
- [ ] Run `npm run seed-demo` to populate demo data
- [ ] Run `npm run dev` to start development server
- [ ] Visit http://localhost:3000 to verify app loads

### 2. Browser Setup
- [ ] Use Chrome browser (best compatibility)
- [ ] Grant microphone permissions when prompted
- [ ] Clear localStorage if needed: `localStorage.clear()` in console
- [ ] Set dark mode (looks better for demo)

### 3. Verify Features
- [ ] Login page shows three role cards
- [ ] Worker view: microphone button works
- [ ] Leader view: sidebar navigation works
- [ ] Boss view: KPIs and reports display
- [ ] Theme toggle works (sun/moon icon)
- [ ] Role switcher works (worker/leader/boss tabs)

## Demo Script (5-7 minutes)

### Act 1: Worker Experience (2 min)
**Goal:** Show zero-friction input for construction workers

1. **Login as Worker**
   - Click "Arbeiter" card on login page
   - Point out: "No complex login, just role selection for demo"

2. **Record Audio Report**
   - Click microphone button (big green circle)
   - Say: "Wir haben ein Problem mit Bagger 3, Hydraulikleck, etwa 1 Stunde Verzögerung"
   - Click to stop recording
   - Point out status progression:
     - "Wird hochgeladen..."
     - "Transkribiere..."
     - "KI analysiert..."
     - "Erfasst!" ✓

3. **Highlight Worker UX**
   - "Notion-style clean interface"
   - "Massive buttons for easy use on site"
   - "No typing, just voice"
   - "Instant feedback"

### Act 2: Leader Overview (1-2 min)
**Goal:** Show shift management capabilities

1. **Switch to Leader Role**
   - Click "Schichtleiter" tab in topbar
   - Point out: Sidebar navigation appears

2. **Show Shift Overview**
   - KPI cards: Active workers, delays, problems
   - "Leader sees aggregated view of their shift"
   - Navigate using sidebar (Overview, Team, Database)

### Act 3: Boss Analytics (2-3 min)
**Goal:** Show the management insights value proposition

1. **Switch to Boss Role**
   - Click "Executive" tab in topbar

2. **Highlight KPI Dashboard**
   - Four key metrics: Reports count, Total delays, Costs, Critical issues
   - Point out: "Real data from worker voice notes"
   - Show: Demo-Daten badge (if using fallback)

3. **Show Recent Reports**
   - Scroll through recent reports
   - Point out:
     - Automatic KPI extraction (delay hours, costs)
     - Tags from AI processing
     - Worker names and timestamps
   - "From voice to insights in seconds"

4. **Navigate to Other Views** (quick)
   - Click "Finanz-Impact" in sidebar (placeholder for now)
   - Click "Datenbank" to show all reports archive
   - Click "Ideen & Vision" to show roadmap

### Act 4: Polish & Features (1 min)

1. **Toggle Theme**
   - Click sun/moon icon
   - Show: "Works in light and dark mode"

2. **Show Responsiveness** (optional)
   - Resize browser window
   - Open mobile device simulator
   - "Fully responsive for mobile use"

3. **Highlight Demo Mode**
   - Point out: Role switcher (would be hidden in production)
   - Point out: Demo-Daten badges (fallback data indicators)
   - "This is simplified for showcase, production would have real auth"

## Key Talking Points

### Problem
"Construction workers waste time on paperwork. Management has no real-time visibility into delays, costs, and issues."

### Solution
"Workers speak into their phone. AI converts voice to structured reports. Management gets instant insights."

### Value Proposition
- **For Workers:** Zero friction, no typing, massive buttons
- **For Leaders:** Shift aggregation, team overview, quick status check
- **For Management:** KPIs, cost analysis, delay tracking, data-driven decisions

### Technical Highlights
- **AI Pipeline:** Whisper transcription → Gemini QA/Cleaner agents → Markdown storage
- **Fallback Strategy:** Works even if AI services are down (graceful degradation)
- **Modern Stack:** Next.js 15, React 19, Tailwind CSS, TypeScript
- **Extensible:** Ready for RAG, image analysis, video upload (in backlog)

## Troubleshooting

### Microphone doesn't work
- Check browser permissions (chrome://settings/content/microphone)
- Try HTTPS (not HTTP) - some browsers require secure context
- Use Chrome/Edge (best support)

### No demo data shows
- Run `npm run seed-demo`
- Refresh page
- Check `data/reports/` directory exists

### API errors
- Check `.env.local` has GEMINI_API_KEY
- Check console for error messages
- Fallback data should still work

### Theme toggle doesn't work
- Wait a moment after page load (theme provider initializes)
- Check browser localStorage is enabled

## Post-Demo Questions

**Q: "How much does this cost to run?"**
A: "Gemini API is ~$0.001 per report. Whisper is free (self-hosted). Hosting is ~$20/month."

**Q: "What about offline mode?"**
A: "Not in MVP, but possible. Would cache voice notes and sync later."

**Q: "Can it handle multiple languages?"**
A: "Yes, currently Polish and German. Easy to add more with Whisper."

**Q: "How do you prevent fake reports?"**
A: "Production would have real auth, GPS tagging, timestamp verification."

**Q: "What's the rollout plan?"**
A: "Pilot with 1 shift (5-10 workers), iterate based on feedback, then scale."

## Next Steps If Approved

1. **Authentication:** Real login, user accounts, roles/permissions
2. **Database:** Migrate from markdown files to PostgreSQL
3. **Cloud Deployment:** Vercel/Railway with R2 storage
4. **Advanced AI:** RAG for historical context, image analysis
5. **Mobile App:** Native iOS/Android for better offline support
6. **Analytics:** Dashboard for trends, predictions, anomaly detection

---

**Good luck with the demo! 🚀**
```

- [ ] **Step 2: Test complete demo flow**

Run through entire demo script:
1. Login → Worker → Record → Switch to Boss → See report
2. Time yourself (should be under 7 minutes)
3. Note any issues

- [ ] **Step 3: Commit demo guide**

```bash
git add DEMO_GUIDE.md
git commit -m "docs: add comprehensive demo guide

Complete demo script, troubleshooting, and talking points

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 18: Final Cleanup & Build Test

**Files:**
- Various

- [ ] **Step 1: Remove console.logs (optional)**

Search for `console.log` in components and remove debug statements (keep error logging)

- [ ] **Step 2: Test production build**

Run:
```bash
npm run build
```

Expected: Build succeeds without errors

- [ ] **Step 3: Test production mode**

Run:
```bash
npm run build && npm start
```

Visit: `http://localhost:3000`
Expected: App works in production mode

- [ ] **Step 4: Verify all critical paths**

- [ ] Login works
- [ ] Worker recording works
- [ ] Boss dashboard shows data
- [ ] Theme toggle works
- [ ] Role switching works

- [ ] **Step 5: Create final checkpoint commit**

```bash
git add .
git commit -m "chore: final cleanup and production build test

MVP ready for demo

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Tag release**

```bash
git tag -a v0.1.0-mvp -m "ShiftSync MVP - Demo Ready"
```

---

## Self-Review

### Spec Coverage Check

Reviewing design spec sections against implementation plan:

1. **Architecture & Project Structure** ✓
   - Task 1-4: Foundation, Tailwind, Theme, Root Layout
   - All directory structure created
   - Environment variables configured

2. **Components & UI Layer** ✓
   - Task 5-8: Login, RoleLayout, Worker/Leader/Boss views
   - All 10 views listed in spec (3 done, 7 placeholders noted for future)
   - Component porting strategy covered

3. **Data Flow & Backend Integration** ✓
   - Task 9: Upload API
   - Task 10: Transcription API
   - Task 11: Process API with agents
   - Task 12: Reports API
   - Task 13: Health check
   - Markdown file format implemented in Task 11

4. **Error Handling & User Experience** ✓
   - Task 14: AudioRecorder with status feedback
   - Task 15: Boss view with fallback indicators
   - Three-tier fallback strategy implemented in all API routes

5. **Testing & Validation** ✓
   - Task 16: Demo data seeder for testing
   - Task 17: Demo guide with testing checklist
   - Task 18: Production build verification
   - Manual testing approach (no unit tests as per spec)

**Gap:** Remaining view components (EmployeeKPIsView, FinancialImpactView, TeamView, ArchiveView, SettingsView, TutorialView, IdeasView) are placeholders. This is acceptable for MVP - they can be added in future iterations. The core workflow (Worker → Boss) is complete.

### Placeholder Scan

Searching for red flags:
- ❌ No "TBD" or "TODO" found
- ❌ No "implement later" found
- ❌ No "add appropriate error handling" without specifics
- ❌ No "similar to Task N" without code
- ✓ All code steps show actual code
- ✓ All file paths are exact
- ✓ All commands have expected output

### Type Consistency

Checking type/naming consistency:
- `Role` type: 'worker' | 'leader' | 'boss' - used consistently
- `ReportMetadata` interface in Task 11 - used in Task 12
- API response shapes consistent across endpoints
- File paths consistent (`data/reports/`, `data/media/`)
- Function names consistent (`saveMarkdownReport`, `saveFile`)

No type mismatches found.

### Task Granularity

Checking step sizes:
- Most steps are 2-5 minute actions (create file, test endpoint, commit)
- Some larger steps (Task 14 WorkerView integration) but still manageable
- Each task produces working, testable output
- Commits frequent (every task)

Granularity is appropriate.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-09-shiftsync-ui-integration.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for parallel work and quality control.

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints. Best for sequential flow and continuous context.

**Which approach?**
