import express from "express";
import cors from "cors";
import path from "node:path";
import { existsSync } from "node:fs";
import { config, quarterLabel } from "./config.js";
import { fetchEpicsByLabel, JiraError } from "./jira.js";
import { readStore, upsertOverlay } from "./overlay.js";
import type { EpicOverlay } from "./types.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

function currentQuarter(date = new Date()): { quarter: number; year: number } {
  return { quarter: Math.floor(date.getMonth() / 3) + 1, year: date.getFullYear() };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/config", (_req, res) => {
  const now = currentQuarter();
  res.json({
    labelPrefix: config.labelPrefix,
    epicsOnly: config.epicsOnly,
    currentQuarter: now.quarter,
    currentYear: now.year,
    exampleLabel: quarterLabel(now.quarter, now.year),
  });
});

/** GET /api/epics?quarter=3&year=2026 -> { label, epics, overlays } */
app.get("/api/epics", async (req, res) => {
  const now = currentQuarter();
  const quarter = Number(req.query.quarter ?? now.quarter);
  const year = Number(req.query.year ?? now.year);

  if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
    return res.status(400).json({ error: "quarter must be 1-4" });
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return res.status(400).json({ error: "year is out of range" });
  }

  const label = quarterLabel(quarter, year);
  try {
    const [epics, store] = await Promise.all([
      fetchEpicsByLabel(label),
      readStore(),
    ]);
    const overlays: Record<string, EpicOverlay> = {};
    for (const epic of epics) {
      if (store[epic.key]) overlays[epic.key] = store[epic.key];
    }
    res.json({ label, quarter, year, epics, overlays });
  } catch (err) {
    if (err instanceof JiraError) {
      return res.status(502).json({ error: err.message, jiraStatus: err.status });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/epics failed:", message);
    res.status(500).json({ error: message });
  }
});

app.get("/api/overlay", async (_req, res) => {
  try {
    res.json(await readStore());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

/** PUT /api/overlay/:epicKey  body: Partial<EpicOverlay> */
app.put("/api/overlay/:epicKey", async (req, res) => {
  const epicKey = req.params.epicKey;
  if (!/^[A-Z][A-Z0-9]+-\d+$/.test(epicKey)) {
    return res.status(400).json({ error: "invalid epic key" });
  }
  const { epicKey: _ignore, updatedAt: _ts, ...patch } =
    (req.body ?? {}) as Partial<EpicOverlay> & Record<string, unknown>;
  try {
    const saved = await upsertOverlay(epicKey, patch as Partial<EpicOverlay>);
    res.json(saved);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// ---- Serve the built client in production ----
const clientDist = path.resolve(config.repoRoot, "client", "dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(config.port, () => {
  console.log(`ProductOps × GTM server listening on http://localhost:${config.port}`);
  console.log(`Label convention: ${config.labelPrefix}_Q<quarter><yy> (e.g. ${quarterLabel(currentQuarter().quarter, currentQuarter().year)})`);
});
