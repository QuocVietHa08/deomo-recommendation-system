<h1 align="center">Recommendation System</h1>

<p align="center">
  A conversational AI recommendation system that asks the right questions, extracts your preferences, and recommends items from a real database.
</p>

---

## Architecture

![Architecture](architecture.svg)

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, file-based routing, API rewrites |
| Backend | FastAPI (Python) | Async, fast, auto Swagger docs |
| AI / NLP | LangChain + GPT-4o-mini | Structured slot extraction + natural language replies |
| Session | Redis (30 min TTL) | Fast in-memory state, no DB writes per turn |
| Database | Supabase (Postgres) | Managed Postgres, instant REST API, free tier |
| Monorepo | Turborepo + pnpm | Parallel builds, caching, single dev command |

## Design Decisions & Trade-offs

- **Slot-filling over RAG** — The bot asks specific questions (budget, occasion, type) and filters wines by SQL. Simple, predictable, and easy to debug. RAG would be overkill for a structured wine catalogue.
- **Redis for sessions** — Chat state is temporary, so storing it in fast in-memory Redis (not the database) keeps each turn snappy. Auto-expires after 30 min.
- **GPT-4o-mini** — Good enough for extracting a few fields from a message. 10x cheaper than GPT-4o with no quality difference for this task.

| Decision | Upside | Downside |
|---|---|---|
| Sync Supabase client | Simpler code | Slightly slower DB calls |
| No vector search | Zero extra cost | Can't match by vibe/tasting notes |
| Single `/api/chat` endpoint | Easy to follow | No streaming responses |
| Redis-only sessions | Fast, self-cleaning | Lost if Redis restarts |

## Getting Started

### 1. Redis

Check if Redis is already running on your machine:

```bash
redis-cli ping
# PONG → already running, skip to step 2
# Error → start it below
```

**If Redis is running locally** (e.g. installed via Homebrew):
```bash
# Nothing to do — already running
```

**If Redis is NOT running / you don't have it installed** — use Docker:
```bash
docker-compose up redis -d
```

This works on any machine with Docker, so the codebase runs in every environment.

---

### 2. Start everything

**Option A — start both at once (recommended):**
```bash
pnpm dev
```

**Option B — start separately:**
```bash
# Terminal 1
cd apps/api && python run.py

# Terminal 2
pnpm --filter web dev
```

Ports: `localhost:3000` (web) · `localhost:8000` (api) · `localhost:8000/docs` (swagger)

### Environment Variables

```bash
# apps/api/.env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=...
REDIS_URL=redis://localhost:6379

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Debugging

### Common errors

| Error | Cause | Fix |
|---|---|---|
| `Connection refused` on port 6379 | Redis not running | Run `redis-server`, `brew services start redis`, or `docker-compose up redis -d` |
| `OPENAI_API_KEY` missing | `.env` not loaded | Check `apps/api/.env` exists and has the key |
| `relation "wines" does not exist` | Supabase table not created | Run the SQL from task.md section 5 in Supabase SQL editor |
| `Cannot connect to Supabase` | Wrong URL/key | Double-check `SUPABASE_URL` and `SUPABASE_KEY` in `.env` |
| Next.js shows `Failed to fetch` | FastAPI not running | Make sure `python run.py` is running on `:8000` |


### Test the API directly

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test-123", "message": "I need a red wine under 300 HKD"}'
```
