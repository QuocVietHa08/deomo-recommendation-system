"""
Seed the Supabase wines table from Vivino JSON files.
Run from apps/api/:  .venv/bin/python scripts/seed_wines.py
"""
import json
import random
import sys
from pathlib import Path

# Allow importing src.* from apps/api/
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.db.supabase import get_supabase_client  # noqa: E402

# ---------------------------------------------------------------------------
# Enrichment data
# ---------------------------------------------------------------------------

OCCASIONS_BY_TYPE = {
    "Red":      [["casual", "business"], ["gift", "business"], ["casual"], ["gift", "celebration"]],
    "Rosé":     [["casual", "celebration"], ["casual"], ["celebration", "gift"]],
    "Sparkling":[["celebration", "gift"], ["casual", "celebration"], ["gift"]],
    "White":    [["casual", "business"], ["casual"], ["business"]],
}

FOOD_BY_TYPE = {
    "Red":      [["steak", "lamb"], ["bbq", "pasta"], ["cheese", "charcuterie"], ["beef", "venison"]],
    "Rosé":     [["salmon", "cheese"], ["salad", "seafood"], ["chicken", "tapas"]],
    "Sparkling":[["oysters", "sushi"], ["canapes", "fruit"], ["seafood", "chicken"]],
    "White":    [["seafood", "salad"], ["chicken", "pasta"], ["sushi", "light appetizers"]],
}

TASTING_BY_TYPE = {
    "Red": [
        "Dark fruit, earthy notes, firm tannins with a long finish",
        "Blackberry, plum, hints of oak and vanilla, smooth texture",
        "Red cherry, leather, spice, medium-bodied with good structure",
        "Cassis, tobacco, cedar, well-integrated tannins",
        "Blueberry, violet, mocha, silky mouthfeel",
    ],
    "Rosé": [
        "Strawberry, peach, mineral, elegant and refreshing",
        "Rose petal, watermelon, crisp acidity, light finish",
        "Red berry, citrus zest, delicate floral notes",
    ],
    "Sparkling": [
        "Fine bubbles, brioche, citrus, creamy mousse",
        "Apple, pear, toasty notes, persistent effervescence",
        "Raspberry, cream, lively acidity, celebratory finish",
    ],
    "White": [
        "Tropical fruit, passionfruit, crisp acidity, clean finish",
        "Pear, green apple, subtle honey, light body",
        "Citrus, green herbs, mineral, refreshing and dry",
    ],
}

BODY_BY_TYPE = {
    "Red": ["medium", "full"],
    "Rosé": ["light"],
    "Sparkling": ["light"],
    "White": ["light", "medium"],
}


def detect_type(name: str, default: str) -> str:
    name_lower = name.lower()
    if "sparkling" in name_lower:
        return "Sparkling"
    if "rosé" in name_lower or "rose" in name_lower or "blanc de noir" in name_lower:
        return "Rosé"
    return default


def extract_variety(name: str) -> str:
    """Pull the grape variety from the wine name (best effort)."""
    keywords = [
        "Malbec", "Cabernet Sauvignon", "Cabernet - Malbec", "Cabernet Malbec",
        "Pinot Noir", "Pinot Gris", "Pinot Blanc",
        "Chardonnay", "Sauvignon Blanc", "Shiraz", "Grenache",
        "Bonarda", "Nebbiolo", "Sangiovese",
    ]
    name_lower = name.lower()
    for kw in keywords:
        if kw.lower() in name_lower:
            return kw
    # fallback: last word(s) before common suffixes
    return name.split()[-1]


def enrich(entry: dict, default_type: str) -> dict:
    wine_type = detect_type(entry["name"], default_type)
    price_usd = float(entry.get("price", 0))
    price_hkd = round(price_usd * 7.8)
    avg_rating = float(entry.get("average_rating", 3.5))
    score = min(100, round(avg_rating * 20))

    return {
        "name": entry["name"],
        "country": entry["country"],
        "region": entry["region"],
        "type": wine_type,
        "variety": extract_variety(entry["name"]),
        "price_hkd": price_hkd,
        "score": score,
        "body": random.choice(BODY_BY_TYPE.get(wine_type, ["medium"])),
        "tasting_notes": random.choice(TASTING_BY_TYPE.get(wine_type, TASTING_BY_TYPE["Red"])),
        "occasions": random.choice(OCCASIONS_BY_TYPE.get(wine_type, OCCASIONS_BY_TYPE["Red"])),
        "food_pairings": random.choice(FOOD_BY_TYPE.get(wine_type, FOOD_BY_TYPE["Red"])),
        "in_stock": True,
        "thumb_url": entry.get("thumb"),
    }


def load_file(path: Path, default_type: str) -> list[dict]:
    with open(path) as f:
        data = json.load(f)
    return [enrich(e, default_type) for e in data]


def main():
    base = Path(__file__).parent.parent
    malbec_path = base / "malbec-10-25-4.json"
    pinot_path  = base / "Pinot-noir-10-30-4-250.json"

    wines = []
    if malbec_path.exists():
        batch = load_file(malbec_path, "Red")
        wines.extend(batch)
        print(f"Loaded {len(batch)} Malbec wines")
    else:
        print(f"WARNING: {malbec_path} not found, skipping")

    if pinot_path.exists():
        batch = load_file(pinot_path, "Red")
        wines.extend(batch)
        print(f"Loaded {len(batch)} Pinot Noir wines")
    else:
        print(f"WARNING: {pinot_path} not found, skipping")

    if not wines:
        print("No wines to insert. Exiting.")
        return

    print(f"\nInserting {len(wines)} wines into Supabase...")
    client = get_supabase_client()

    # Insert in batches of 20 to avoid request size limits
    batch_size = 20
    inserted = 0
    for i in range(0, len(wines), batch_size):
        batch = wines[i:i + batch_size]
        result = client.table("wines").insert(batch).execute()
        inserted += len(result.data)
        print(f"  Batch {i // batch_size + 1}: inserted {len(result.data)} rows")

    print(f"\nDone! Inserted {inserted} wines successfully.")


if __name__ == "__main__":
    main()
