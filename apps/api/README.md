# VinoBuzz API

FastAPI backend for the VinoBuzz AI Sommelier. Single endpoint: `POST /api/chat`.

---

## Prerequisites

- Python 3.9+
- Redis running on `localhost:6379` (see below)
- Supabase project with a `wines` table (see below)
- OpenAI API key

---

## 1. Redis

Redis must be running before you start the API.

**Option A — Already running natively (macOS):**
```bash
# Check if Redis is already running
redis-cli ping   # should return PONG

# If not, start it
brew services start redis
```

**Option B — Docker (from monorepo root):**
```bash
docker-compose up redis -d
```

---

## 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `apps/api/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
OPENAI_API_KEY=sk-...
REDIS_URL=redis://localhost:6379
```

---

## 3. Install Dependencies

```bash
cd apps/api
pip3 install -r requirements.txt
```

---

## 4. Run the API

```bash
cd apps/api
python run.py
```

Server starts at `http://localhost:8000`.
Interactive docs at `http://localhost:8000/docs`.

---

## 5. Supabase — Create the wines table

Run this SQL in your Supabase project's SQL editor:

```sql
CREATE TABLE wines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  region        TEXT NOT NULL,
  country       TEXT NOT NULL,
  type          TEXT NOT NULL,         -- Red, White, Sparkling, Rosé
  variety       TEXT,
  price_hkd     INTEGER NOT NULL,
  score         INTEGER,               -- 0–100
  body          TEXT,                  -- light, medium, full
  tasting_notes TEXT,
  occasions     TEXT[],                -- e.g. ARRAY['business','dinner']
  food_pairings TEXT[],
  in_stock      BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wines_price   ON wines(price_hkd);
CREATE INDEX idx_wines_type    ON wines(type);
CREATE INDEX idx_wines_country ON wines(country);
```

Seed some test wines:

```sql
INSERT INTO wines (name, region, country, type, price_hkd, score, tasting_notes, occasions, in_stock)
VALUES
  ('Château Test Rouge',        'Bordeaux',    'France',      'Red',      450, 88, 'Dark fruit, cedar, smooth tannins',        ARRAY['business','dinner'],     true),
  ('Cloudy Bay Sauvignon Blanc','Marlborough', 'New Zealand', 'White',    320, 91, 'Citrus, passionfruit, crisp finish',        ARRAY['casual','gift'],         true),
  ('Moët & Chandon Brut',       'Champagne',   'France',      'Sparkling',680, 90, 'Brioche, apple, persistent bubbles',        ARRAY['celebration','gift'],    true);
```

---

## 6. API Usage

### `POST /api/chat`

```json
// Request
{
  "session_id": "any-uuid-string",
  "message": "I need a red wine for a business dinner under HKD 500"
}

// Response
{
  "reply": "Here are my recommendations...",
  "slots": {
    "budget_hkd": 500,
    "occasion": "business dinner",
    "wine_type": "Red",
    "region": null,
    "food_pairing": null
  },
  "recommendations": [
    {
      "id": "...",
      "name": "Château Test Rouge",
      "region": "Bordeaux",
      "country": "France",
      "type": "Red",
      "price_hkd": 450,
      "score": 88,
      "tasting_notes": "Dark fruit, cedar, smooth tannins"
    }
  ],
  "done": true
}
```

The API is conversational — send multiple turns with the same `session_id` and it will accumulate slots until it has enough info to recommend.

---

## Project Structure

```
apps/api/src/
├── main.py                  # FastAPI app entry
├── config.py                # Settings (env vars)
├── models/
│   ├── slots.py             # SlotState — budget, occasion, wine_type, region, food_pairing
│   ├── wine.py              # Wine, Recommendation
│   └── session.py           # SessionData (slots + history + turn_count)
├── db/
│   └── supabase.py          # Sync Supabase client
├── session/
│   └── redis.py             # Async Redis get/save (TTL 30 min)
├── services/
│   ├── slot_extractor.py    # LangChain: message → SlotState
│   ├── recommender.py       # LangChain: generate recommendation or follow-up
│   └── wine_query.py        # Supabase query: filter wines by slots
└── routers/
    └── chat.py              # POST /api/chat
```
