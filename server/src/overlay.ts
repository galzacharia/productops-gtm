import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "./config.js";
import type { EpicOverlay, OverlayStore, MetaStore } from "./types.js";

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

// ---- Meta store (manuals + product types) ----
const DEFAULT_META: MetaStore = {
  manuals: [],
  productTypes: ["EOR", "Payroll", "WF General", "Contingent", "Contractors", "Other"],
};
let metaChain: Promise<unknown> = Promise.resolve();

export async function readMeta(): Promise<MetaStore> {
  try {
    const raw = await fs.readFile(config.metaFile, "utf8");
    const parsed = JSON.parse(raw);
    return {
      manuals: Array.isArray(parsed?.manuals) ? parsed.manuals : [],
      productTypes:
        Array.isArray(parsed?.productTypes) && parsed.productTypes.length
          ? parsed.productTypes
          : DEFAULT_META.productTypes,
    };
  } catch (err: any) {
    if (err?.code === "ENOENT") return { ...DEFAULT_META };
    throw err;
  }
}

/** Merge patch ({manuals?, productTypes?}) into the meta store and persist. */
export function writeMeta(patch: Partial<MetaStore>): Promise<MetaStore> {
  const run = metaChain.then(async () => {
    const cur = await readMeta();
    const next: MetaStore = {
      manuals: patch.manuals ?? cur.manuals,
      productTypes: patch.productTypes ?? cur.productTypes,
    };
    await fs.mkdir(path.dirname(config.metaFile), { recursive: true });
    const tmp = `${config.metaFile}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
    await fs.rename(tmp, config.metaFile);
    return next;
  });
  metaChain = run.catch(() => undefined);
  return run;
}
