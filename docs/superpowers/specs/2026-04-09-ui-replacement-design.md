# ShiftSync MVP: UI Integration Design

**Date:** 2026-04-09
**Status:** Approved
**Scope:** Replace current UI with Vite-based design, integrate with Next.js backend, create functional MVP showcase

---

## Executive Summary

Transform the ShiftSync Next.js backend into a complete full-stack MVP by porting a pre-built Vite/React UI. The goal is to create a functional showcase demonstrating the complete worker→leader→boss journey with real AI processing and graceful fallbacks. The boss should be able to click through all three roles, see actual audio recording and AI processing, and view convincing insights in polished charts.

**Key Decision:** Port Vite UI to Next.js (App Router + API Routes) rather than switch frameworks or keep them separate.

**Core Value Prop:** Zero-friction worker input (voice/photo) → AI-powered insights for management.

---

## 1. Architecture & Project Structure

### Framework & Approach

**Chosen Architecture:** Hybrid App Router + API Routes

- **Frontend:** Next.js 15 App Router with Server/Client Components
- **Backend:** Next.js API Routes (`app/api/`) calling existing services
- **Data Storage:** Markdown files + local filesystem (PostgreSQL for users only)
- **AI Processing:** Gemini API + fast-whisper transcription
- **Styling:** Tailwind CSS with existing design system from Vite app

### Directory Structure

```
shiftsync-mvp/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx                  # Login view (simple role selection)
│   ├── (roles)/                            # Role-based routes
│   │   ├── worker/page.tsx                 # Worker dashboard
│   │   ├── leader/page.tsx                 # Shift leader dashboard
│   │   └── boss/page.tsx                   # Boss analytics
│   ├── api/                                # Backend API routes
│   │   ├── upload/route.ts                 # Audio/image upload
│   │   ├── transcribe/route.ts             # Whisper transcription
│   │   ├── process/route.ts                # AI agent workflow
│   │   ├── reports/route.ts                # Get reports (list)
│   │   ├── reports/[id]/route.ts           # Get single report
│   │   ├── shift-summary/route.ts          # Shift aggregation
│   │   └── health/route.ts                 # Health check
│   ├── globals.css                         # Global styles (port from Vite index.css)
│   ├── layout.tsx                          # Root layout with theme provider
│   └── page.tsx                            # Landing page (redirect to login)
├── components/
│   ├── views/                              # Main view components (ported from Vite)
│   │   ├── WorkerView.tsx                  # Audio recording, photo upload
│   │   ├── ShiftLeaderView.tsx             # Shift overview, team status
│   │   ├── BossView.tsx                    # KPI dashboard, analytics
│   │   ├── EmployeeKPIsView.tsx            # Individual worker performance
│   │   ├── FinancialImpactView.tsx         # Cost analysis, delays
│   │   ├── TeamView.tsx                    # Team roster
│   │   ├── ArchiveView.tsx                 # Historical reports database
│   │   ├── SettingsView.tsx                # Theme, API keys, preferences
│   │   ├── TutorialView.tsx                # Onboarding/help
│   │   └── IdeasView.tsx                   # Vision/roadmap (boss only)
│   ├── ui/                                 # Reusable UI components
│   │   ├── AudioRecorder.tsx               # Microphone interface
│   │   ├── ImageUpload.tsx                 # Camera/file upload
│   │   ├── ReportCard.tsx                  # Report display card
│   │   ├── StatusBadge.tsx                 # Status indicators
│   │   └── Charts/                         # Chart components (Recharts)
│   │       ├── KPIChart.tsx
│   │       ├── DelayChart.tsx
│   │       └── FinancialChart.tsx
│   └── providers/
│       └── ThemeProvider.tsx               # Dark/light mode (next-themes)
├── src/                                    # Existing backend (KEEP AS-IS)
│   ├── agents/                             # AI workflow
│   │   ├── index.ts
│   │   ├── workflow.ts
│   │   ├── prompts.ts
│   │   ├── schemas.ts
│   │   └── llm-clients.ts
│   ├── lib/
│   │   ├── whisper.ts                      # Whisper transcription service
│   │   ├── filesystem.ts                   # File operations
│   │   └── api-keys.ts                     # API key management
│   ├── db/
│   │   ├── schema.ts                       # Database schema (users only)
│   │   └── index.ts
│   └── types/
│       └── markdown.ts                     # Markdown types
├── data/
│   ├── reports/                            # Markdown report files
│   ├── media/                              # Audio/image uploads
│   └── fallback/                           # Pre-written demo data
│       ├── sample-reports.json
│       ├── sample-shifts.json
│       └── sample-kpis.json
├── public/
│   └── demo-data.json                      # Additional fallback data
├── .env.local                              # Environment variables (GITIGNORED)
├── .gitignore                              # Updated with .env.local, media files
└── package.json                            # Dependencies (already has React 19, Next.js 15)
```

### Environment Configuration

**.env.local** (gitignored):
```env
GEMINI_API_KEY=AIzaSyCrBTpz7vTAdCv5ldVaD5CvxY2QT56LWic
WHISPER_MODEL_PATH=./whisper-service
DATABASE_URL=postgresql://localhost:5432/shiftsync
NODE_ENV=development
NEXT_PUBLIC_DEMO_MODE=true
```

**.gitignore additions:**
```
# Environment
.env.local
.env*.local

# User data
data/media/*
data/reports/*

# Keep fallback data
!data/fallback/
```

### Key Architectural Decisions

1. **Next.js App Router over Vite:** Preserves existing infrastructure, easier backend integration
2. **API Routes for backend:** Clean separation, similar to Express pattern in Vite app
3. **Existing services untouched:** `src/` directory stays intact, called from API routes
4. **File-based storage:** Markdown files for reports, local filesystem for media (R2 is future work)
5. **Hybrid rendering:** Server Components for data-heavy pages, Client Components for interactivity
6. **Fallback-first:** Every API endpoint has graceful fallback to demo data

---

## 2. Components & UI Layer

### Component Porting Strategy

**From Vite to Next.js:**

1. **Copy files:** Move `docs/schicht-kommunikationstool-stying/src/views/*.tsx` to `components/views/`
2. **Add directives:** Prepend `'use client'` to interactive components (audio, forms, charts)
3. **Update imports:** Remove Vite-specific imports, adjust relative paths
4. **Keep styles:** Tailwind classes remain identical
5. **Replace routing:** Change state-based navigation to Next.js `<Link>` and `useRouter()`

### Component Categories

**View Components** (Main pages, client components):
- `WorkerView.tsx` - Audio recording UI, photo upload, recent entries feed
- `ShiftLeaderView.tsx` - Shift aggregation, worker report summary
- `BossView.tsx` - KPI overview, charts, analytics dashboard
- `EmployeeKPIsView.tsx` - Individual worker performance metrics
- `FinancialImpactView.tsx` - Cost analysis, delay impacts, material costs
- `TeamView.tsx` - Team roster, availability, status
- `ArchiveView.tsx` - Historical reports, markdown database browser
- `SettingsView.tsx` - Theme toggle, API key config (boss only)
- `TutorialView.tsx` - Onboarding guide, help documentation
- `IdeasView.tsx` - Vision board, feature backlog (boss only)

**Shared UI Components** (Extracted/new):
- `AudioRecorder.tsx` - Microphone capture, recording controls, waveform visualization
- `ImageUpload.tsx` - Camera/file upload with preview and cropping
- `ReportCard.tsx` - Markdown report display with metadata badges
- `StatusBadge.tsx` - Status indicators (active, processing, complete, error, demo)
- `Charts/KPIChart.tsx` - Recharts line/bar chart wrapper for KPIs
- `Charts/DelayChart.tsx` - Delay timeline visualization
- `Charts/FinancialChart.tsx` - Cost breakdown and trends

**Layout Components:**
- `RoleLayout.tsx` - Sidebar navigation (Leader/Boss), topbar (all roles)
- `RoleSwitcher.tsx` - Demo-only role toggle (Worker/Leader/Boss tabs)

### Styling & Design System

**Tailwind Configuration** (extend existing):

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          // ... green tones for light mode
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
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  darkMode: 'class',
}
```

**Global styles** (`app/globals.css`):
- Copy custom CSS from Vite's `index.css`
- Luxury card styles, custom scrollbars, micro labels
- Dark/light mode variable overrides
- Animation keyframes (pulse, fade-in, slide-in)

### Navigation & Routing Transformation

**Vite (state-based) → Next.js (route-based):**

```tsx
// OLD (Vite):
const [currentView, setCurrentView] = useState<View>('dashboard');
onClick={() => setCurrentView('kpis')}

// NEW (Next.js):
import Link from 'next/link';
<Link href="/leader/kpis">KPIs</Link>
```

**Route structure:**
- `/login` - Role selection (Worker/Leader/Boss)
- `/worker` - WorkerView
- `/leader` - ShiftLeaderView
- `/leader/kpis` - EmployeeKPIsView
- `/boss` - BossView
- `/boss/financial` - FinancialImpactView
- `/team` - TeamView (shared)
- `/archive` - ArchiveView (shared)
- `/settings` - SettingsView (shared)
- `/tutorial` - TutorialView (worker only)
- `/ideas` - IdeasView (boss only)

**Role-based access:**
- Middleware checks role from cookie/session (MVP: simple, no auth)
- Demo mode: role switcher allows instant switching

---

## 3. Data Flow & Backend Integration

### Primary Data Flow (Happy Path)

```
WORKER INPUT → PROCESSING → STORAGE → DISPLAY

1. Worker clicks microphone button
   ↓
2. Browser records audio (WebRTC MediaRecorder API)
   ↓
3. POST /api/upload (audio blob + metadata)
   → Saves to data/media/{timestamp}-{workerId}.webm
   → Returns { uploadId, audioUrl }
   ↓
4. POST /api/transcribe ({ audioUrl, language: 'pl' })
   → Calls src/lib/whisper.ts
   → Returns { transcript, confidence }
   ↓
5. POST /api/process ({ transcript, workerId, shift, metadata })
   → Calls src/agents/workflow.ts
   → QA Agent: Checks completeness
      - If incomplete → return { needsFollowUp: true, qaQuestion }
      - If complete → continue
   → Cleaner Agent: Formats to markdown
   → Saves to data/reports/{reportId}.md with YAML frontmatter
   → Returns { reportId, needsFollowUp: false }
   ↓
6. Worker sees "Erfasst!" success message
   ↓
7. [Background/Scheduled] Shift Aggregator runs
   → Reads all reports for current shift
   → Generates shift summary markdown
   → Saves to data/reports/shift-{shiftId}-summary.md
   ↓
8. Leader/Boss views refresh
   → GET /api/reports?shift=2&date=2024-04-09
   → Reads markdown files from data/reports/
   → Parses YAML frontmatter
   → Extracts KPIs (delays, material, costs)
   → Returns JSON array for charts
```

### API Route Specifications

#### POST /api/upload

**Purpose:** Accept audio/image files from worker

**Request:**
```typescript
Content-Type: multipart/form-data
{
  audio: File (webm, mp3, wav),
  image?: File (jpg, png),
  workerId: string,
  shift: number,
  timestamp: string
}
```

**Response:**
```typescript
{
  success: true,
  uploadId: string,
  audioUrl: string,      // /media/{filename}
  imageUrl?: string
}
```

**Implementation:**
- Uses Next.js file upload handling
- Saves to `data/media/`
- Generates unique filenames: `{timestamp}-{workerId}-{random}.webm`
- Max file size: 50MB audio, 10MB image
- Fallback: N/A (must succeed or error)

#### POST /api/transcribe

**Purpose:** Transcribe audio using Whisper

**Request:**
```typescript
{
  audioUrl: string,
  language: 'pl' | 'de'
}
```

**Response:**
```typescript
{
  transcript: string,
  confidence: number,
  language: string,
  duration: number
}
```

**Implementation:**
- Calls `src/lib/whisper.ts`
- Uses local Whisper model (whisper-service directory)
- Timeout: 30 seconds
- Fallback: If Whisper fails, return `{ transcript: "[Transkription fehlgeschlagen - bitte Text eingeben]", confidence: 0 }`

#### POST /api/process

**Purpose:** Run AI agent workflow on transcript

**Request:**
```typescript
{
  transcript: string,
  workerId: string,
  workerName: string,
  role: string,
  shift: number,
  metadata: {
    audioUrl: string,
    imageUrl?: string,
    timestamp: string
  }
}
```

**Response:**
```typescript
{
  reportId: string,
  needsFollowUp: boolean,
  qaQuestion?: string,
  usedFallback?: boolean
}
```

**Implementation:**
- Calls `src/agents/workflow.ts`
- Step 1: QA Agent checks completeness
  - Prompt: "Check if this report contains: issue description, time impact, materials needed"
  - If incomplete → return question for worker
- Step 2: Cleaner Agent formats
  - Prompt: "Convert this construction report to clean German, extract KPIs"
  - Structures into sections: Issue, Duration, Material, Costs
- Step 3: Save markdown file
  - YAML frontmatter + markdown content
  - Filename: `{date}-{shift}-{workerId}-{random}.md`
- Fallback: If agents fail, save transcript as-is with minimal formatting

#### GET /api/reports

**Purpose:** Fetch reports for display

**Query params:**
```typescript
?shift=2&date=2024-04-09&role=boss&limit=10&offset=0
```

**Response:**
```typescript
{
  reports: [
    {
      id: string,
      mitarbeiter: string,
      rolle: string,
      datum: string,
      zeit: string,
      schicht: number,
      tags: string[],
      audioUrl: string,
      imageUrls: string[],
      status: string,
      summary: string,
      rawTranscript: string
    }
  ],
  total: number,
  aggregated?: {
    totalDelays: number,
    totalCost: number,
    materialNeeded: string[]
  }
}
```

**Implementation:**
- Reads `data/reports/*.md` files
- Filters by query params
- Parses YAML frontmatter with gray-matter
- Sorts by date/time descending
- Paginates results
- Calculates aggregated metrics for boss view
- Fallback: If no reports, return `data/fallback/sample-reports.json`

#### GET /api/reports/[id]

**Purpose:** Fetch single report

**Response:**
```typescript
{
  id: string,
  metadata: { ... },
  content: string,      // Full markdown content
  kpis: {
    delayHours: number,
    cost: number,
    materials: string[]
  }
}
```

**Fallback:** Return sample report if ID not found

#### POST /api/shift-summary

**Purpose:** Generate shift aggregation (triggered manually or scheduled)

**Request:**
```typescript
{
  shift: number,
  date: string
}
```

**Response:**
```typescript
{
  summaryId: string,
  summary: string,      // Markdown content
  kpis: { ... }
}
```

**Implementation:**
- Fetches all reports for shift/date
- Calls Shift Aggregator Agent (LLM)
- Prompt: "Summarize these construction reports: key issues, total delays, material needs, risks"
- Saves summary markdown to `data/reports/shift-{shift}-{date}-summary.md`
- Fallback: Simple bullet list of report titles

### Markdown File Format

**Worker Report** (`data/reports/{reportId}.md`):

```markdown
---
id: report-2024-04-09-001
mitarbeiter: Piotr Kowalski
workerId: worker-123
rolle: Baggerfahrer
datum: 2024-04-09
zeit: 14:23:00
schicht: 2
gleis: 4
tags: [Verzögerung, Material, Bagger-3]
audio_url: /media/2024-04-09-142300.webm
image_urls: [/media/2024-04-09-142305.jpg]
status: processed
delay_hours: 2
estimated_cost: 800
---

## Original Transkript (Polnisch)
Mieliśmy problem z ukrytą rurą. Koparka 3 musiała się zatrzymać. Straciliśmy około 2 godziny. Potrzebujemy więcej żwiru, około 5 ton.

## Übersetzung & Bereinigung

**Verzögerung durch undokumentiertes Rohr**

- **Betroffen:** Bagger 3, Gleis 4
- **Dauer:** 2 Stunden Stillstand
- **Zusätzliches Material benötigt:**
  - Schotter: ca. 5 Tonnen
- **Geschätzte Mehrkosten:** €800
- **Priorität:** Hoch

**Empfehlung:** Baustellenpläne aktualisieren, Bodenradar für nächsten Abschnitt anfordern.
```

**Shift Summary** (`data/reports/shift-2-2024-04-09-summary.md`):

```markdown
---
id: shift-summary-2024-04-09-schicht2
datum: 2024-04-09
schicht: 2
reports_count: 7
total_delay_hours: 5.5
total_cost: 2400
status: completed
---

## Schicht 2 Zusammenfassung - 2024-04-09

**Übersicht:**
- 7 Berichte erfasst
- Gesamtverzögerung: 5.5 Stunden
- Geschätzte Mehrkosten: €2,400

**Hauptprobleme:**
1. Undokumentiertes Rohr (Gleis 4) - 2h Verzögerung
2. Hydraulikleck Bagger 3 - 1.5h Verzögerung
3. Materialmangel Schotter - 2h Verzögerung

**Materialbedarfe:**
- Schotter: 15 Tonnen
- Hydrauliköl: 20 Liter
- Schwellen: 8 Stück

**Empfehlungen:**
- Wartung Bagger 3 priorisieren
- Materialdisposition verbessern
- Baustellenpläne aktualisieren
```

### Agent Workflow Integration

**Using existing agents** (`src/agents/`):

```typescript
// app/api/process/route.ts
import { qaAgent, cleanerAgent } from '@/src/agents';
import { saveMarkdown } from '@/src/lib/filesystem';

export async function POST(req: Request) {
  const { transcript, workerId, shift, metadata } = await req.json();

  try {
    // Step 1: QA Agent
    const qaResult = await qaAgent({
      transcript,
      context: { workerId, shift }
    });

    if (!qaResult.complete) {
      return Response.json({
        needsFollowUp: true,
        qaQuestion: qaResult.question
      });
    }

    // Step 2: Cleaner Agent
    const cleaned = await cleanerAgent({
      transcript,
      qaData: qaResult.data
    });

    // Step 3: Save markdown
    const reportId = await saveMarkdown({
      content: cleaned.markdown,
      metadata: {
        id: `report-${Date.now()}`,
        mitarbeiter: metadata.workerName,
        workerId,
        schicht: shift,
        datum: new Date().toISOString().split('T')[0],
        zeit: new Date().toISOString().split('T')[1].split('.')[0],
        tags: cleaned.tags,
        audio_url: metadata.audioUrl,
        image_urls: metadata.imageUrl ? [metadata.imageUrl] : [],
        status: 'processed',
        delay_hours: cleaned.kpis.delayHours,
        estimated_cost: cleaned.kpis.cost
      }
    });

    return Response.json({ reportId, needsFollowUp: false });

  } catch (error) {
    console.error('Agent workflow failed:', error);

    // Fallback: Save transcript as-is
    const reportId = await saveMarkdown({
      content: `## Original Transkript\n${transcript}\n\n*(Automatische Verarbeitung fehlgeschlagen)*`,
      metadata: {
        id: `report-${Date.now()}`,
        mitarbeiter: metadata.workerName,
        workerId,
        schicht: shift,
        datum: new Date().toISOString().split('T')[0],
        status: 'fallback',
        audio_url: metadata.audioUrl
      }
    });

    return Response.json({ reportId, usedFallback: true });
  }
}
```

### Fallback Data Strategy

**Pre-written samples** in `data/fallback/`:

**sample-reports.json:**
```json
[
  {
    "id": "demo-001",
    "mitarbeiter": "Piotr Kowalski",
    "rolle": "Baggerfahrer",
    "datum": "2024-04-09",
    "schicht": 2,
    "tags": ["Verzögerung", "Material"],
    "summary": "Verzögerung durch undokumentiertes Rohr - 2h",
    "delay_hours": 2,
    "estimated_cost": 800
  },
  // ... 5-10 realistic samples
]
```

**When to use fallbacks:**
- Whisper unavailable → "[Transkription nicht verfügbar - Demo-Modus]"
- Agent API fails → Save raw transcript, mark as fallback
- No reports exist → Return sample-reports.json with "Demo-Daten" badge
- First load → Pre-populate to show charts immediately
- API timeout → Return cached/sample data, retry in background

---

## 4. Error Handling & User Experience

### Graceful Degradation Strategy

**Three-tier error handling:**

**Tier 1: API Route Level**
```typescript
// Every API route pattern:
try {
  // Real processing
  const result = await realFunction();
  return Response.json(result);
} catch (error) {
  console.error('Error:', error);
  // Return fallback, never throw
  return Response.json({ ...fallbackData, usedFallback: true });
}
```

**Tier 2: UI Error States**
- Show friendly messages, not stack traces
- Always provide retry action
- Never completely block the user
- Example: "Verbindung unterbrochen. Daten werden im Hintergrund gespeichert."

**Tier 3: Optimistic UI**
- Show success immediately, process async
- Worker sees "Erfasst!" right after recording
- Update with real status when available
- Rollback only if critical error (rare)

### Loading & Processing States

**Worker View states:**

```typescript
type RecordingState =
  | 'idle'           // "Sprachnotiz aufnehmen" - big green button
  | 'recording'      // Pulsing animation, timer, red record dot
  | 'uploading'      // "Wird hochgeladen..." spinner
  | 'transcribing'   // "Transkribiere..." progress bar
  | 'processing'     // "KI analysiert..." animated dots
  | 'qa_followup'    // QA question popup
  | 'complete'       // "Erfasst!" checkmark, auto-dismiss 2s
  | 'error'          // "Fehler. Erneut versuchen?" retry button
```

**Boss View states:**

```typescript
// Initial load
1. Show skeleton loaders for charts
2. Load sample data from fallback (marked "Demo-Daten")
3. Fetch real data in background
4. Replace samples when real data arrives
5. Remove "Demo" badge

// No data scenario
- "Keine Berichte für diese Schicht"
- Button: "Demo-Daten anzeigen"
```

### QA Agent Interaction Flow

**When AI needs clarification:**

```
1. Worker submits audio
   ↓
2. API processes, QA Agent detects missing info
   ↓
3. Return { needsFollowUp: true, qaQuestion: "Wie viele Stunden Verzögerung?" }
   ↓
4. UI shows popup modal:
   - Question text
   - Microphone button (record answer)
   - Text input (type answer)
   - "Überspringen" button (save incomplete)
   ↓
5. Worker responds
   ↓
6. Resubmit to /api/process with additional context
   ↓
7. If still incomplete → save anyway, tag for leader review
```

**Demo-friendly QA:**
- First recording → Always trigger pre-written QA question (showcase feature)
- Subsequent recordings → Skip QA unless real incompleteness detected
- Settings toggle: "Strenge KI-Prüfung" ON/OFF

### Demo-Specific Features

**Role switching for showcase:**
```tsx
// Keep from Vite app (remove in production)
<div className="role-switcher">
  <button onClick={() => setRole('worker')}>Arbeiter</button>
  <button onClick={() => setRole('leader')}>Schichtleiter</button>
  <button onClick={() => setRole('boss')}>Executive</button>
</div>
```

**Pre-populated demo data:**
- Seed script: `npm run seed-demo`
- Creates 5 realistic reports in `data/reports/`
- Timestamps: "today", "yesterday", "2 days ago"
- Mix of shifts, workers, issue types
- Boss sees populated charts immediately
- Visual indicator: "Demo-Modus" badge (removable in Settings)

**Performance optimizations:**
- Lazy load charts: `const KPIChart = lazy(() => import('./Charts/KPIChart'))`
- Audio compression: webm format, 32kbps (sufficient for speech)
- Image resize on upload: max 1920px width, 80% quality
- Pagination: 10 reports per page, infinite scroll for archive

### User Feedback & Notifications

**Toast notifications:**
```tsx
// Success
toast.success("Bericht erfolgreich erfasst!")

// Processing
toast.info("Wird verarbeitet...", { autoClose: false, id: 'processing' })

// Error (with retry)
toast.error("Fehler beim Hochladen", {
  action: { label: "Erneut versuchen", onClick: retry }
})

// QA question (modal, blocks until answered)
showModal(<QAModal question={qaQuestion} onAnswer={handleAnswer} />)
```

**Visual feedback:**
- 🟢 Green pulsing dot: "Live" / real-time data
- 🟡 Yellow badge: "Wird verarbeitet"
- ⚪ Gray badge: "Demo-Daten"
- 🔴 Red badge: "Unvollständig" (needs review)
- ⚡ Lightning icon: "KI-verarbeitet"

### Offline/Connection Handling

**MVP approach (simplified):**
- Assume online connection
- If API call fails → use cached/fallback data
- Show toast: "Verbindung prüfen..." but don't block UI
- Retry failed uploads in background
- No offline mode (future feature)

---

## 5. Testing & Validation

### Testing Approach (Pragmatic for MVP)

**Focus: Manual testing of demo flow**

No unit tests, no E2E automation. Manual verification of critical paths.

### Critical Path Testing Checklist

**Worker Journey:**
- [ ] Click microphone button → browser requests permission
- [ ] Record 5 seconds of audio → see timer counting
- [ ] Stop recording → see "Wird hochgeladen..." spinner
- [ ] Upload completes → see "Erfasst!" success message
- [ ] Report appears in "Letzte Einträge" feed
- [ ] QA popup appears with question (first recording)
- [ ] Answer QA question → processing completes
- [ ] Take photo → preview shows, uploads with report

**Leader Journey:**
- [ ] Switch to Leader role → ShiftLeaderView loads
- [ ] See worker reports for current shift
- [ ] Reports show status badges (processed, pending, incomplete)
- [ ] View shift summary/aggregation
- [ ] Click on worker report → full details modal
- [ ] Navigate to Team view → see all workers

**Boss Journey:**
- [ ] Switch to Boss role → BossView loads
- [ ] KPI charts render (delay chart, cost chart, material chart)
- [ ] Charts show data (real or demo)
- [ ] Click "Finanz-Impact" → financial breakdown view
- [ ] Click "Mitarbeiter-KPIs" → individual performance
- [ ] Navigate to Archive → see all historical reports
- [ ] Search/filter reports → results update

**System-wide:**
- [ ] Toggle dark/light mode → all views adapt correctly
- [ ] Theme persists across page reloads
- [ ] Navigation sidebar works (Leader/Boss)
- [ ] Mobile responsive (test on phone)
- [ ] No console errors in browser DevTools
- [ ] API endpoints return data (check Network tab)

### Functionality Verification

**Audio recording:**
- [ ] Browser mic permission granted
- [ ] MediaRecorder API works (Chrome/Edge tested)
- [ ] Audio blob created (check file size > 0)
- [ ] Upload to `/api/upload` succeeds

**Transcription:**
- [ ] Whisper service running (if using real transcription)
- [ ] `/api/transcribe` returns transcript
- [ ] Fallback works if Whisper unavailable

**AI Agents:**
- [ ] Gemini API key valid (test with simple call)
- [ ] QA Agent returns completeness check
- [ ] Cleaner Agent returns formatted markdown
- [ ] Fallback saves raw transcript if agents fail

**Data persistence:**
- [ ] Markdown files created in `data/reports/`
- [ ] Files have valid YAML frontmatter
- [ ] Media files saved to `data/media/`
- [ ] `/api/reports` reads files correctly

**UI/UX:**
- [ ] All views render without errors
- [ ] Charts display data (Recharts working)
- [ ] Framer Motion animations smooth
- [ ] Buttons responsive to clicks
- [ ] Forms submit correctly

### Pre-Demo Setup Checklist

**Before showing to boss:**

1. **Seed demo data:**
   ```bash
   npm run seed-demo
   ```
   Creates 5 realistic reports with varied content

2. **Environment check:**
   - [ ] `.env.local` exists with Gemini API key
   - [ ] `data/` directories exist (`reports/`, `media/`, `fallback/`)
   - [ ] Whisper service running (or fallback enabled)
   - [ ] Development server starts without errors: `npm run dev`

3. **API health check:**
   ```bash
   curl http://localhost:3000/api/health
   # Should return: { status: 'ok', timestamp: '...' }
   ```

4. **Browser setup:**
   - [ ] Chrome browser (best compatibility)
   - [ ] Microphone permission pre-granted (avoid popup during demo)
   - [ ] LocalStorage cleared (fresh state)
   - [ ] Dark mode default (looks better for demo)

5. **Demo script:**
   - Start as Worker
   - Record audio: "Wir haben ein Problem mit Bagger 3, Hydraulikleck, etwa 1 Stunde Verzögerung"
   - Show QA popup interaction
   - Switch to Leader → show shift overview
   - Switch to Boss → show KPI charts
   - Toggle dark/light mode
   - Open Archive → show markdown database
   - **Total time:** 5-7 minutes

### Known Limitations (MVP Scope)

**Explicitly NOT included:**

**Authentication & Users:**
- No real login (role selection is open)
- No user accounts
- No permissions/authorization
- No multi-user sessions

**Backend:**
- No real database (PostgreSQL prepared but unused)
- No real-time updates (no WebSockets)
- No background job queue
- No email notifications

**Features:**
- No video upload (mentioned in backlog)
- No image analysis (future AI feature)
- No RAG/vector search over markdown archive
- No cloud storage (R2 stub only)
- No mobile app (web only)

**Infrastructure:**
- No monitoring/analytics
- No error logging service (console only)
- No CI/CD pipeline
- No staging environment
- No data backup/recovery

**Internationalization:**
- Hard-coded German/Polish (no i18n framework)
- No language switching
- Date/time formats hard-coded

### Technical Debt (Accepted for MVP)

**Code quality:**
- No TypeScript strict mode
- Minimal type coverage (any types allowed)
- No ESLint enforcement
- No code formatting (Prettier optional)

**Testing:**
- Zero test coverage
- No test framework setup
- No CI test runs

**Security:**
- API keys in .env (no secrets manager)
- No rate limiting
- No input sanitization (XSS risk)
- No CSRF protection
- File uploads not validated (extension/MIME type)

**Performance:**
- No caching strategy
- No CDN for media files
- No image optimization
- No lazy loading (except charts)
- No code splitting

**Data:**
- No migration strategy for markdown schema changes
- No data validation on read
- No corrupt file handling
- No backup strategy

### Success Criteria

**Demo is successful if:**

1. **Functionality:** Boss can click through all three roles without crashes
2. **Core value prop:** Audio recording → AI processing → insights flow works
3. **Visual polish:** UI looks professional (Notion-style worker, Grafana-style boss)
4. **Performance:** No white screens, no 5+ second waits
5. **Data:** Charts show convincing data (real or fallback)
6. **Decision:** Boss says "Das will ich!" not "Nee brauchen wir nicht"

**Minimum viable demo flow:**
```
1. Worker records voice note (30 sec)
2. QA popup appears with question
3. Worker answers
4. "Erfasst!" confirmation
5. Switch to Boss
6. See report in KPI charts
7. Click report → full details
8. Boss impressed by ease + insights
```

**If boss approves → Next steps:**
- Real authentication system
- Database migration
- Cloud deployment
- Multi-user support
- Additional AI features (RAG, image analysis)

---

## 6. Implementation Phases

### Phase 1: Foundation (Day 1)

**Goal:** Basic Next.js app with routing and layout

- [ ] Update `.gitignore` with .env.local and media files
- [ ] Create `.env.local` with Gemini API key
- [ ] Set up directory structure (`components/`, `app/api/`, `data/`)
- [ ] Port Tailwind config from Vite app
- [ ] Copy `index.css` to `app/globals.css`
- [ ] Create root layout with ThemeProvider
- [ ] Set up basic routing (`/login`, `/worker`, `/leader`, `/boss`)
- [ ] Test: App runs, routes work, dark mode toggles

### Phase 2: UI Components (Day 2)

**Goal:** All view components ported and rendering

- [ ] Copy all view components from Vite to `components/views/`
- [ ] Add `'use client'` directives where needed
- [ ] Update imports (remove Vite-specific)
- [ ] Replace state-based routing with Next.js `<Link>`
- [ ] Create shared UI components (AudioRecorder, ImageUpload, etc.)
- [ ] Port chart components (Recharts wrappers)
- [ ] Test: All views render, navigation works, no errors

### Phase 3: API Routes - Upload (Day 3)

**Goal:** File upload working

- [ ] Create `/api/upload/route.ts`
- [ ] Implement file upload handling (audio, image)
- [ ] Save files to `data/media/`
- [ ] Return file URLs
- [ ] Test: Upload from WorkerView succeeds

### Phase 4: API Routes - Transcription (Day 3)

**Goal:** Whisper integration

- [ ] Create `/api/transcribe/route.ts`
- [ ] Integrate `src/lib/whisper.ts`
- [ ] Add fallback for Whisper failure
- [ ] Test: Transcription returns text (real or mock)

### Phase 5: API Routes - Agent Processing (Day 4)

**Goal:** AI workflow working

- [ ] Create `/api/process/route.ts`
- [ ] Integrate `src/agents/workflow.ts`
- [ ] Implement QA Agent logic
- [ ] Implement Cleaner Agent logic
- [ ] Save markdown files with frontmatter
- [ ] Add fallback for agent failures
- [ ] Test: Full workflow (audio → transcript → markdown)

### Phase 6: API Routes - Reports (Day 4)

**Goal:** Boss dashboard gets data

- [ ] Create `/api/reports/route.ts`
- [ ] Read markdown files from `data/reports/`
- [ ] Parse YAML frontmatter
- [ ] Implement filtering (shift, date)
- [ ] Calculate aggregated KPIs
- [ ] Add fallback sample data
- [ ] Test: Boss view shows charts with data

### Phase 7: Integration & Polish (Day 5)

**Goal:** End-to-end flow works

- [ ] Connect WorkerView to upload/transcribe/process APIs
- [ ] Connect BossView to reports API
- [ ] Implement QA popup flow
- [ ] Add loading states and error handling
- [ ] Add toast notifications
- [ ] Create seed-demo script
- [ ] Test: Full demo flow works

### Phase 8: Demo Prep (Day 5)

**Goal:** Ready to show

- [ ] Run seed-demo to populate data
- [ ] Test all critical paths manually
- [ ] Check browser compatibility (Chrome)
- [ ] Verify mic permissions
- [ ] Practice demo script
- [ ] Document any known issues
- [ ] **DEMO READY**

---

## Appendix A: File Inventory

### Files to Create

**App Router:**
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `app/(auth)/login/page.tsx`
- `app/(roles)/worker/page.tsx`
- `app/(roles)/leader/page.tsx`
- `app/(roles)/boss/page.tsx`

**API Routes:**
- `app/api/upload/route.ts`
- `app/api/transcribe/route.ts`
- `app/api/process/route.ts`
- `app/api/reports/route.ts`
- `app/api/reports/[id]/route.ts`
- `app/api/shift-summary/route.ts`
- `app/api/health/route.ts`

**Components (ported):**
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

**Components (new):**
- `components/ui/AudioRecorder.tsx`
- `components/ui/ImageUpload.tsx`
- `components/ui/ReportCard.tsx`
- `components/ui/StatusBadge.tsx`
- `components/ui/Charts/KPIChart.tsx`
- `components/ui/Charts/DelayChart.tsx`
- `components/ui/Charts/FinancialChart.tsx`
- `components/providers/ThemeProvider.tsx`
- `components/layout/RoleLayout.tsx`
- `components/layout/RoleSwitcher.tsx`

**Data:**
- `data/fallback/sample-reports.json`
- `data/fallback/sample-shifts.json`
- `data/fallback/sample-kpis.json`

**Config:**
- `.env.local` (gitignored)
- `.gitignore` (updated)
- `tailwind.config.js` (updated)

**Scripts:**
- `scripts/seed-demo.ts` (generate sample data)

### Files to Keep (Unchanged)

**Existing backend:**
- `src/agents/*`
- `src/lib/*`
- `src/db/*`
- `src/types/*`

**Existing config:**
- `package.json` (may add dependencies)
- `tsconfig.json`
- `next.config.js`

---

## Appendix B: Dependencies

### Already Installed
```json
{
  "@anthropic-ai/sdk": "^0.32.1",
  "@google/generative-ai": "^0.21.0",
  "drizzle-orm": "^0.36.4",
  "echarts": "^5.5.0",
  "echarts-for-react": "^3.0.2",
  "gray-matter": "^4.0.3",
  "next": "15.1.3",
  "next-themes": "^0.4.4",
  "openai": "^4.77.3",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "tailwindcss": "^3.4.17"
}
```

### Need to Add
```json
{
  "framer-motion": "^12.38.0",
  "lucide-react": "^0.546.0",
  "recharts": "^3.8.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.5.0",
  "date-fns": "^4.1.0"
}
```

Install:
```bash
npm install framer-motion lucide-react recharts clsx tailwind-merge date-fns
```

---

## Summary

This design transforms the ShiftSync Next.js backend into a complete MVP by porting a polished Vite/React UI. The architecture balances modern Next.js patterns with pragmatic MVP constraints: real AI processing with fallback data, file-based storage with database preparation, and demo-friendly features for showcasing.

**Key innovations:**
1. **Hybrid architecture:** App Router + API Routes = clean separation, easy integration
2. **Fallback-first:** Every layer has graceful degradation for smooth demo
3. **Optimistic UI:** Show success immediately, process in background
4. **Demo-aware:** Pre-populated data, role switching, visual indicators

**Next step:** Create detailed implementation plan with task breakdown for sub-agent execution.
