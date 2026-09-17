# ProductOps × GTM — Quarterly Epic Tracker

A lightweight internal app that connects to **Jira** and gives **Product Operations**
and **Go-To-Market** a shared view of the features planned for each quarter — so they
know **what's coming**, **where each epic stands**, and **when to initiate onboarding**.

It mirrors the logic of the R&D/Product "Queue Forecast" tool: epics are pulled by a
quarterly Jira label. On top of the read-only Jira data, this app adds a **GTM overlay**
— t-shirt size, Product Ops owner, GTM owner, onboarding status, AE/AM visibility and
notes — that Jira doesn't track.

---

## How epics are pulled

Epics are fetched by the label **`<PREFIX>_Q<quarter><two-digit-year>`**:

| Quarter | Label (2026) |
|---|---|
| Q1 | `Product_Q126` |
| Q2 | `Product_Q226` |
| Q3 | `Product_Q326` |
| Q4 | `Product_Q426` |

> The prefix defaults to `Product` and is configurable via `LABEL_PREFIX`.
> (Verified against the live Papaya Jira: the convention is `Product_Q326`, i.e. a
> two-digit year, **not** `Product_Q32026`.)

Switch the quarter/year in the header and the app pulls the matching label live.

## What you can do

- **Monitor** every epic planned for a quarter, grouped and filterable by project,
  status, and onboarding stage.
- **Track epic status** straight from Jira (To Do / In Progress / Done), plus PM,
  story points, executive status, target quarter and fix version.
- **Know when to onboard** — any epic that is **Done in Jira** is flagged
  **"Ready to onboard"** until GTM marks it Onboarding → Live.
- **Assign Product Ops and GTM owners** per epic.
- **Set a t-shirt size** and **GTM labels** per epic.
- **Give AE/AM visibility** — flag epics as visible to AE/AM and attach notes for them.
- **Export** the current (filtered) view to CSV.

Jira is **read-only**; the GTM overlay is stored app-side (see below). The Jira client
is structured so overlay fields could be written back to Jira labels/fields later.

---

## Architecture

```
client/   Vite + React + TypeScript + Tailwind (the dashboard)
server/   Express + TypeScript — Jira proxy (read-only) + overlay store
data/     overlay.json — the app-side GTM/ProductOps overlay (git-ignored)
```

- The **server** holds the Jira API token and proxies read requests, so credentials
  never reach the browser and there are no CORS issues.
- The **overlay** (t-shirt size, owners, onboarding status, AE/AM notes, …) is saved to
  a JSON file (`data/overlay.json`), keyed by epic. Zero extra infrastructure; easy to
  migrate to a database later.

### API

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/config` | Label prefix + current quarter/year |
| `GET` | `/api/epics?quarter=3&year=2026` | Epics for a quarter + their overlays |
| `GET` | `/api/overlay` | The full overlay store |
| `PUT` | `/api/overlay/:epicKey` | Upsert an overlay for one epic |

---

## Getting started

Requires **Node 18.18+**.

```bash
# 1. Install (installs both workspaces)
npm install

# 2. Configure Jira access
cp .env.example .env
#   then edit .env and set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN
#   (create a token at https://id.atlassian.com/manage-profile/security/api-tokens)

# 3. Run in development (server on :8787, client on :8080)
npm run dev
#   open http://localhost:8080
```

### Production

```bash
npm run build      # builds server + client
npm start          # serves the built client from the Express server on PORT (default 8787)
```

### Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Run server + client with hot reload |
| `npm run build` | Type-check and build both |
| `npm start` | Serve the built app |
| `npm run typecheck` | Type-check both workspaces |

---

## Configuration reference

All configuration is via `.env` (see `.env.example`):

| Variable | Default | Notes |
|---|---|---|
| `JIRA_BASE_URL` | — | e.g. `https://papayaglobal.atlassian.net` |
| `JIRA_EMAIL` | — | Account that owns the API token |
| `JIRA_API_TOKEN` | — | Atlassian API token |
| `LABEL_PREFIX` | `Product` | Quarterly label prefix |
| `EPICS_ONLY` | `true` | Restrict to `issuetype = Epic` |
| `PORT` | `8787` | Server port |
| `OVERLAY_FILE` | `./data/overlay.json` | Overlay store location |

The Jira custom-field ids (Story Points, PM Owner, Executive Status, …) default to the
values discovered on the Papaya instance and can be overridden with `CF_*` env vars
(see `server/src/config.ts`).
