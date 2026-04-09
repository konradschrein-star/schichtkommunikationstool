# ShiftSync MVP - Construction Site Documentation Platform

Ein Zero-Friction SaaS-MVP für Baudokumentation im Gleisbau/Tiefbau mit Voice-First-Interface, KI-basierter Multi-Agenten-Pipeline und spezialiserten Dashboards.

## 🎯 Problem

Ein Gleisbau/Tiefbau-Unternehmen (~60 Mitarbeiter, Tag-/Nachtschicht) verliert jährlich bis zu €200.000 durch:
- Undokumentierte Mehrarbeit (VOB/B §6 Behinderungsanzeigen nicht rechtzeitig)
- Mangelhafte Schichtübergaben
- Fehlerhafte Kommunikation zwischen polnischen Arbeitern und deutschem Management

## 🚀 Solution Stack

### Frontend
- Next.js 15 (App Router, React Server Components)
- TypeScript 5+ (Strict Mode)
- Tailwind CSS + shadcn/ui
- 3 spezialisierte UI-Designs:
  - **Worker**: Mobile-first, Ampel-Green (#5ce155), Clean Monochrome
  - **Shift Leader**: Editorial Notion-Style, Monochrome, Kanban-View
  - **Boss**: Cyber-Corporate Dark Mode, Purple/Blue, Glassmorphism, Real-Time Charts

### Backend
- PostgreSQL 16+ (Drizzle ORM)
- Node.js 20+ (Next.js API Routes)
- Hybrid Data Architecture:
  - SQL: Users, RBAC, API Keys (KMS-encrypted)
  - Markdown Flat-Files: Worker Reports (YAML Frontmatter)
  - Local Filesystem: Audio/Images

### AI Pipeline
- **fast-whisper** (Python FastAPI Service) - Transcription (Polish/German, VAD für Baustellenlärm)
- **Multi-Agent LLM**:
  1. QA-Agent: Validates completeness
  2. Cleaner-Agent: Transforms slang → professional language
  3. Shift-Aggregator: Creates shift handover summary
  4. Boss-Agent: Extracts KPIs (delays, costs, productivity)
- Supports: Anthropic Claude / OpenAI GPT / Google Gemini (user-configurable)

## 📁 Project Structure

```
├── src/
│   ├── db/
│   │   ├── schema.ts          # Drizzle ORM schema (Users, Shifts, Reports)
│   │   └── index.ts           # Database client
│   ├── types/
│   │   └── markdown.ts        # YAML Frontmatter types & validators
│   ├── lib/
│   │   ├── filesystem.ts      # File I/O helpers (Markdown, Media)
│   │   ├── api-keys.ts        # KMS encryption/decryption
│   │   └── whisper.ts         # Fast-Whisper client
│   └── agents/
│       ├── prompts.ts         # German system prompts
│       ├── schemas.ts         # Zod schemas for structured outputs
│       ├── llm-clients.ts     # LLM SDK wrappers
│       ├── workflow.ts        # Agent orchestration
│       └── index.ts           # Public API
├── whisper-service/
│   ├── main.py                # FastAPI Whisper service
│   ├── requirements.txt
│   └── Dockerfile
├── data/                      # Data root (gitignored)
│   ├── reports/               # Worker Markdown reports
│   ├── aggregations/          # Shift summaries
│   └── media/                 # Audio/Images
└── docs/
    └── research/              # Domain research (VOB/B, KPIs, etc.)
```

## 🛠️ Setup

### 1. Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Python 3.11+ (for Whisper service)
- (Optional) NVIDIA GPU with CUDA for faster transcription

### 2. Installation

```bash
# Install Node dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
```

### 3. Database Setup

```bash
# Generate encryption key
openssl rand -base64 32

# Add to .env:
# ENCRYPTION_KEY=<generated-key>
# DATABASE_URL=postgresql://user:password@localhost:5432/shiftsync

# Generate and run migrations
npm run db:generate
npm run db:migrate
```

### 4. Whisper Service Setup

```bash
cd whisper-service

# Install Python dependencies
pip install -r requirements.txt

# Run service (CPU)
python main.py

# Or with Docker
docker build -t whisper-service .
docker run -p 8000:8000 whisper-service
```

For GPU acceleration:
```bash
docker run --gpus all -p 8000:8000 \
  -e WHISPER_DEVICE=cuda \
  -e WHISPER_COMPUTE_TYPE=float16 \
  whisper-service
```

### 5. Development

```bash
# Start Next.js dev server
npm run dev

# In separate terminal: Start Whisper service
cd whisper-service && python main.py
```

## 🔑 Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL`: PostgreSQL connection string
- `ENCRYPTION_KEY`: 32-byte base64 key for API key encryption
- `WHISPER_SERVICE_URL`: Whisper service endpoint (default: http://localhost:8000)
- `DATA_ROOT_PATH`: Data directory path
- `DEFAULT_LLM_PROVIDER`: anthropic | openai | gemini
- `DEFAULT_LLM_API_KEY`: Fallback API key (boss can override in settings)

## 🧪 Testing Phase 1 & 2

### Test Database Schema

```bash
npm run db:studio
# Opens Drizzle Studio at http://localhost:4983
```

### Test Filesystem Helpers

```typescript
import { saveWorkerReport, readWorkerReport } from '@/lib/filesystem';

// Create test report
const filePath = await saveWorkerReport(
  'worker-uuid',
  new Date(),
  frontmatterData,
  { rawTranscript: '...', cleanedText: '...' }
);

// Read back
const { frontmatter, content } = await readWorkerReport(filePath);
```

### Test Whisper Service

```bash
# Health check
curl http://localhost:8000/health

# Transcribe
curl -X POST http://localhost:8000/v2/transcribe \
  -F "file=@test-audio.webm" \
  -F "language=de" \
  -F "vad_filter=true"
```

### Test Agents

```typescript
import { runQAAgent, runCleanerAgent } from '@/agents';

// Test QA
const qaResult = await runQAAgent(
  "Ich habe im Sektor B gegraben...",
  process.env.DEFAULT_LLM_API_KEY!,
  'anthropic'
);

// Test Cleaner
const cleanerResult = await runCleanerAgent(
  { transcript: '...', frontmatter: { ... } },
  process.env.DEFAULT_LLM_API_KEY!,
  'anthropic'
);
```

## 📊 VOB/B Compliance

✅ Automatic hindrance detection (`hindrance: true` flag)
✅ Immutable timestamps (Markdown frontmatter + DB `createdAt`)
✅ Original transcripts stored (evidence preservation)
✅ Location/section mandatory (QA-Agent validation)
✅ Material consumption documented
✅ Machine hours tracked

## 🚦 Phase Status

- ✅ **Phase 1: Foundation** - Database, Filesystem, Whisper Service, API Keys
- ✅ **Phase 2: Agents** - QA, Cleaner, Aggregator, Boss KPI
- 🔜 **Phase 3: Server Actions** - Worker upload, Shift completion, Audio API
- 🔜 **Phase 4: UI Integration** - Worker mobile, Boss dashboard, Shift leader view

## 📝 License

Proprietary - Internal MVP

## 🤝 Contact

For questions about implementation or domain requirements, see `/docs/research/`.
