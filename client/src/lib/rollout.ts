import type { EpicRow } from "../types";
import { isInternal } from "./onboarding";

export interface RolloutTask {
  id: string;
  ph: number;
  title: string;
  team: string;
  /** Must be done before go-live. */
  blocker?: boolean;
  /** External go-to-market task — hidden for internal features. */
  gtm?: boolean;
}

export const PHASES: { n: number; name: string }[] = [
  { n: 1, name: "Discovery & Scoping" },
  { n: 2, name: "Build & QA" },
  { n: 3, name: "Pre-Launch Readiness — Content & Enablement" },
  { n: 4, name: "Beta / Design Partners" },
  { n: 5, name: "GA Launch" },
  { n: 6, name: "Post-Launch & Monitoring" },
];

// Shortened from the Slack rollout tracker (52 → 38 tasks; marketing/enablement duplicates merged).
export const TASK_TEMPLATE: RolloutTask[] = [
  { id: "t1", ph: 1, title: "Define scope, goals & success metrics (KPIs)", team: "PM" },
  { id: "t2", ph: 1, title: "Confirm rollout scope — orgs / roles / countries / segments", team: "PM·PO" },
  { id: "t3", ph: 1, title: "Align on naming & terminology", team: "PMM·PO" },
  { id: "t4", ph: 1, title: "Map dependencies, risks & compliance needs", team: "PM" },
  { id: "t5", ph: 1, title: "Define rollout phases & timeline (beta → GA)", team: "PO" },
  { id: "t6", ph: 2, title: "QA / end-to-end testing passed in staging", team: "QA·R&D", blocker: true },
  { id: "t7", ph: 2, title: "Configure feature flags (per-org capable)", team: "R&D" },
  { id: "t8", ph: 2, title: "Configure permissions & roles", team: "R&D·PO", blocker: true },
  { id: "t9", ph: 2, title: "Security review", team: "R&D", blocker: true },
  { id: "t10", ph: 2, title: "Instrument analytics events (Pendo / Mixpanel)", team: "DATA·PM" },
  { id: "t11", ph: 2, title: "Set up monitoring & failure alerts", team: "R&D·PO" },
  { id: "t12", ph: 2, title: "Confirm pricing / packaging (if applicable)", team: "PM·FIN" },
  { id: "t13", ph: 2, title: "Legal / contract review (if applicable)", team: "LEGAL" },
  { id: "t14", ph: 3, title: "Write & publish support article(s) + KB / coverage pages", team: "SUP", blocker: true },
  { id: "t15", ph: 3, title: "Build & publish Pendo in-app guides", team: "PO·DATA" },
  { id: "t16", ph: 3, title: "GTM materials — two-pager, battle card, sales deck", team: "PMM", gtm: true },
  { id: "t17", ph: 3, title: "Prepare demo environment & script", team: "PM·PMM" },
  { id: "t18", ph: 3, title: "Sales enablement — AE & AM/IM sessions", team: "GTM", gtm: true },
  { id: "t19", ph: 3, title: "Internal announcement + FAQ", team: "PO" },
  { id: "t20", ph: 3, title: "Produce explainer / demo video", team: "MKT·PMM", gtm: true },
  { id: "t21", ph: 3, title: "Update website / platform page", team: "MKT", gtm: true },
  { id: "t22", ph: 4, title: "Finalize beta / design-partner customer list", team: "PO·PM" },
  { id: "t23", ph: 4, title: "AM outreach & confirm AMs ready", team: "PO·GTM", gtm: true },
  { id: "t24", ph: 4, title: "Enable feature flags for beta orgs", team: "R&D" },
  { id: "t25", ph: 4, title: "Beta feedback loop — collect, monitor, iterate", team: "PO·PM" },
  { id: "t26", ph: 5, title: "Go / no-go decision", team: "PM·PO", blocker: true },
  { id: "t27", ph: 5, title: "Enable feature flags for full GA segment", team: "R&D", blocker: true },
  { id: "t28", ph: 5, title: "Publish support content live / remove restrictions", team: "SUP" },
  { id: "t29", ph: 5, title: "Send client communication email", team: "PO·GTM", gtm: true },
  { id: "t30", ph: 5, title: "Marketing — social posts & launch video", team: "MKT", gtm: true },
  { id: "t31", ph: 5, title: "Post internal launch announcement", team: "PO" },
  { id: "t32", ph: 5, title: "Confirm sales team notified & materials live", team: "GTM", gtm: true },
  { id: "t33", ph: 6, title: "Monitor adoption metrics vs KPIs", team: "DATA·PM" },
  { id: "t34", ph: 6, title: "Monitor failure alerts & support tickets", team: "PO·SUP" },
  { id: "t35", ph: 6, title: "Post weekly rollout status update", team: "PO" },
  { id: "t36", ph: 6, title: "Collect customer feedback / satisfaction", team: "PO·PM" },
  { id: "t37", ph: 6, title: "Run retro / lessons learned", team: "PO" },
  { id: "t38", ph: 6, title: "Hand off to BAU / confirm ongoing ownership", team: "PO·PM" },
];

/** Tasks that apply to this epic — GTM tasks are dropped for internal features. */
export function applicableTasks(row: EpicRow): RolloutTask[] {
  const internal = isInternal(row);
  return TASK_TEMPLATE.filter((t) => !(internal && t.gtm));
}

export interface RolloutProgress {
  done: number;
  total: number;
  pct: number;
  blockersLeft: number;
  goLive: boolean;
}

export function taskProgress(row: EpicRow): RolloutProgress {
  const tasks = applicableTasks(row);
  const st = row.overlay.tasks ?? {};
  const done = tasks.filter((t) => st[t.id]?.done).length;
  const blockers = tasks.filter((t) => t.blocker);
  const blockersLeft = blockers.length - blockers.filter((t) => st[t.id]?.done).length;
  return {
    done,
    total: tasks.length,
    pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    blockersLeft,
    goLive: blockersLeft === 0,
  };
}
