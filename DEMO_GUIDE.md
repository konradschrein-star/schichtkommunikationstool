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
