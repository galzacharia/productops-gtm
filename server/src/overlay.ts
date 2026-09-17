import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "./config.js";
import type { EpicOverlay, OverlayStore } from "./types.js";

/**
 * A tiny file-backed key-value store for the GTM / Product Ops overlay.
 * Writes are serialized so concurrent PUTs never corrupt the JSON file.
 */
let writeChain: Promise<unknown> = Promise.resolve();

async function ensureDir(): Promise<void> {
  await fs.mkdir(path.dirname(config.overlayFile), { recursive: true });
}

export async function readStore(): Promise<OverlayStore> {
  try {
    const raw = await fs.readFile(config.overlayFile, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as OverlayStore) : {};
  } catch (err: any) {
    if (err?.code === "ENOENT") return {};
    throw err;
  }
}

async function writeStore(store: OverlayStore): Promise<void> {
  await ensureDir();
  const tmp = `${config.overlayFile}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, config.overlayFile);
}

/** Merge a partial overlay for one epic and persist. Returns the stored record. */
export function upsertOverlay(
  epicKey: string,
  patch: Partial<EpicOverlay>,
  updatedBy?: string,
): Promise<EpicOverlay> {
  const run = writeChain.then(async () => {
    const store = await readStore();
    const existing = store[epicKey] ?? { epicKey };
    const merged: EpicOverlay = {
      ...existing,
      ...patch,
      epicKey,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy ?? patch.updatedBy ?? existing.updatedBy,
    };
    store[epicKey] = merged;
    await writeStore(store);
    return merged;
  });
  // Keep the chain alive even if this write rejects.
  writeChain = run.catch(() => undefined);
  return run;
}
