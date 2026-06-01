# Next.js 14 Demo: Multi-tenant Middleware + PostGIS + Socket.io

This project demonstrates all required filters in a single Next.js 14 App Router app:

1. Multi-tenant middleware with subdomain extraction from `Host`
2. PostGIS geofence check via Prisma `$queryRaw` + `ST_Contains`
3. Real-time cross-tab counter update using Socket.io

## Demo subdomains:

acme, globex

## Stack

- Next.js `14.2.5` (App Router)
- Prisma `5.x`
- PostgreSQL + PostGIS (Docker)
- Socket.io

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Environment

```bash
cp .env.example .env
```

Default `DATABASE_URL` points to local Docker Postgres/PostGIS.

### 3) Start PostGIS

```bash
docker compose up -d
```

### 4) Generate Prisma client

```bash
npm run prisma:generate
```

### 5) Run the app

```bash
npm run dev
```

Server runs on `http://localhost:3000`.

## Local subdomain testing

Use wildcard localhost subdomains directly:

- `http://acme.localhost:3000`
- `http://globex.localhost:3000`

Unknown subdomain example (should 404):

- `http://unknown.localhost:3000`

No subdomain (should 404):

- `http://localhost:3000`

## Requirement Mapping

### 1) Multi-tenant middleware

- File: `middleware.js`
- Extracts subdomain from `Host` header
- Looks up subdomain in mock Redis store (`lib/mock-redis.js`)
- Injects tenant context into request headers:
  - `x-tenant-id`
  - `x-tenant-subdomain`
- Returns `404` for missing/unknown subdomains

Tenant echo endpoint:

```bash
curl -H "Host: acme.localhost:3000" http://127.0.0.1:3000/api/tenant
```

### 2) PostGIS geofence API

- File: `app/api/geofence/route.js`
- Method: `POST`
- Input JSON: `{ "lat": number, "lng": number }`
- Executes raw SQL through Prisma `$queryRaw` using:
  - `ST_GeomFromText` (hardcoded polygon)
  - `ST_SetSRID(ST_MakePoint(...), 4326)`
  - `ST_Contains(...)`

Example request:

```bash
curl -X POST http://acme.localhost:3000/api/geofence \
  -H "Content-Type: application/json" \
  -d '{"lat":40.72,"lng":-74.0}'
```

### 3) Real-time update under 500ms

- Custom Node server: `server.js`
- Socket.io server maintains shared in-memory counter
- UI page (`app/page.js`) connects via `socket.io-client`
- Clicking **Increment Counter** emits `counter:increment`
- Server broadcasts `counter:update` to all tabs immediately

Test:

1. Open `http://acme.localhost:3000` in two tabs
2. Click increment in tab A
3. Counter updates in tab B in real time (local latency typically well under 500ms)

## Notes

- Prisma requires at least one model in `prisma/schema.prisma` for client generation; `PrismaClientBootstrap` exists only for that purpose.
- Geofence logic does not depend on Prisma models; it uses raw PostGIS SQL.

## Build check

```bash
npm run build
```

Build succeeds with all routes and middleware enabled.
