import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env from the repo root regardless of where the process is started.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(repoRoot, ".env") });

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return v;
}

export const config = {
  repoRoot,
  port: Number(process.env.PORT ?? 8787),
  labelPrefix: process.env.LABEL_PREFIX ?? "Product",
  epicsOnly: (process.env.EPICS_ONLY ?? "true").toLowerCase() !== "false",
  overlayFile: path.resolve(
    repoRoot,
    process.env.OVERLAY_FILE ?? "./data/overlay.json",
  ),
  jira: {
    // These are only read when a Jira request is actually made, so the server
    // can still boot (and serve a helpful error) without credentials.
    get baseUrl() {
      return required("JIRA_BASE_URL").replace(/\/+$/, "");
    },
    get email() {
      return required("JIRA_EMAIL");
    },
    get apiToken() {
      return required("JIRA_API_TOKEN");
    },
  },
  /**
   * Custom-field ids for the Papaya Jira instance (discovered from live data).
   * Override via env if the instance differs.
   */
  fields: {
    epicName: process.env.CF_EPIC_NAME ?? "customfield_10011",
    epicStatus: process.env.CF_EPIC_STATUS ?? "customfield_10012",
    executiveStatus: process.env.CF_EXECUTIVE_STATUS ?? "customfield_10328",
    productManager: process.env.CF_PRODUCT_MANAGER ?? "customfield_10336",
    pmOwner: process.env.CF_PM_OWNER ?? "customfield_10300",
    storyPoints: process.env.CF_STORY_POINTS ?? "customfield_10026",
    targetQuarter: process.env.CF_TARGET_QUARTER ?? "customfield_10496",
    targetStart: process.env.CF_TARGET_START ?? "customfield_10057",
    targetEnd: process.env.CF_TARGET_END ?? "customfield_10058",
  },
};

/** Build the quarterly label, e.g. quarter=3 year=2026 -> "Product_Q326". */
export function quarterLabel(quarter: number, year: number): string {
  const yy = String(year % 100).padStart(2, "0");
  return `${config.labelPrefix}_Q${quarter}${yy}`;
}
