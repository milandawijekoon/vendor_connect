# Search Architecture

## 1. Principle

**MySQL is the source of truth. Meilisearch is a derived index, not a database.**
The application must remain usable (in degraded form) if Meilisearch is down.

```
MySQL (VendorProfile, approved only)
   ↓ domain event on create/update/approve/delete
Application event handler
   ↓
Meilisearch index: "vendors"
   ↓
GET /vendors search queries hit Meilisearch first, MySQL as fallback
```

## 2. Indexed Document Shape

```json
{
  "id": "vendor_123",
  "businessName": "Studio Lens",
  "slug": "studio-lens",
  "description": "...",
  "categories": ["photography", "videography"],
  "city": "Colombo",
  "priceMin": 50000,
  "priceMax": 200000,
  "avgRating": 4.7,
  "reviewCount": 32,
  "status": "APPROVED"
}
```

Only `status: APPROVED` vendors are indexed — pending/rejected/suspended vendors are
removed from the index immediately on status change.

## 3. Sync Strategy

- A `SearchIndexService` in the backend listens to domain events emitted by
  `VendorsService` (`vendor.created`, `vendor.updated`, `vendor.approved`,
  `vendor.deleted`) via NestJS's `EventEmitter2`.
- On `vendor.approved` → upsert document into Meilisearch
- On `vendor.updated` (already approved) → upsert
- On `vendor.deleted` / `vendor.suspended` / `vendor.rejected` → remove from index
- Indexing failures are caught and logged, **not thrown back to the user** — a vendor
  update should never fail because the search index write failed. A retry/reindex job
  handles eventual consistency.

## 4. Full Reindex Job

A scheduled/manual admin command (`npm run reindex`) rebuilds the entire Meilisearch
index from MySQL — used for initial setup, recovering from drift, or after a schema
change to the indexed fields.

## 5. Search API

```
GET /vendors?q=photographer&category=photography&city=Colombo&minPrice=50000&maxPrice=150000&sort=rating&page=1&limit=20
```

- Backend translates query params into a Meilisearch query (filters + sort + pagination)
- If Meilisearch is unreachable (connection error/timeout), the service catches this and
  falls back to an equivalent MySQL query (basic `LIKE` + `WHERE` filtering, no typo
  tolerance) — degraded but functional, never a 500 to the user.

## 6. Configuration

```
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_API_KEY=...
```

Meilisearch runs as a container in `docker-compose.yml` for local dev; managed
Meilisearch Cloud (or self-hosted) in production.

## 7. Future Extensions

- Typo tolerance tuning per field
- Synonyms (e.g. "photographer" ↔ "photography studio")
- Geo-search once precise vendor coordinates are captured (not MVP — city-level only for now)
