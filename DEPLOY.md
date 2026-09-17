# Deploying ProductOps × GTM

This app is a small Node service that serves the dashboard **and** proxies Jira.
It runs anywhere that can run a container. Below are three paths, easiest first.

Whoever deploys needs to set three secret values (the Jira connection). They are
entered into the **hosting platform's settings**, never committed to the repo:

| Variable | Value |
|---|---|
| `JIRA_BASE_URL` | `https://papayaglobal.atlassian.net` |
| `JIRA_EMAIL` | the account that owns the API token |
| `JIRA_API_TOKEN` | the Atlassian API token |

> Any cloud host can reach Jira, so the network restriction seen in Claude Code's
> web sandbox does **not** apply once this is deployed.

---

## Option 1 — Render (easiest, ~5 min, no server admin)

1. Create a free account at https://render.com and connect the GitHub repo
   `galzacharia/productops-gtm`.
2. Click **New +  →  Blueprint**, pick this repo. Render reads `render.yaml`
   automatically.
3. It will prompt for `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` — paste them.
4. Click **Apply**. In a few minutes you get a URL like
   `https://productops-gtm.onrender.com` — share that with the team.

The blueprint already includes a 1 GB persistent disk so the GTM overlay
(t-shirt sizes, owners, notes) survives redeploys.

## Option 2 — Azure (fits Papaya's Microsoft stack)

Use **Azure App Service (Web App for Containers)** or **Azure Container Apps**:

1. Build & push the image (or point Azure at the repo's `Dockerfile`).
2. Set the three env vars above in the app's **Configuration / Settings**.
3. Add a persistent mount for `/app/data` (Azure Files) and set
   `OVERLAY_FILE=/app/data/overlay.json` so overlay edits persist.
4. Restrict access to Papaya staff via **Azure AD / Entra ID** authentication
   (App Service → Authentication) — recommended for an internal tool.

## Option 3 — Any Docker host

```bash
docker build -t productops-gtm .
docker run -p 8787:8787 \
  -e JIRA_BASE_URL=https://papayaglobal.atlassian.net \
  -e JIRA_EMAIL=you@papayaglobal.com \
  -e JIRA_API_TOKEN=*** \
  -v productops_data:/app/data \
  productops-gtm
# open http://localhost:8787
```

---

## Notes

- **Access control:** the app itself has no login. For an internal tool, put it
  behind your platform's auth (Render access controls, Azure AD, an SSO proxy,
  or a VPN). Ask IT which they prefer.
- **Persistence:** the overlay is a JSON file on `/app/data`. Always mount a
  persistent volume there in production (Options 1 and 2 do this). It can be
  swapped for a database later without touching the UI.
- **Health check:** `GET /api/health` returns `{ "ok": true }`.
