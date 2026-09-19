import clsx from "clsx";
import type { EpicRow } from "../types";
import { isExcluded, isRolledOut, onboardingSignal } from "../lib/onboarding";

export interface Stats {
  total: number;
  ready: number;
  rolled: number;
  noOwner: number;
  notRelevant: number;
}

/** Stats over the epics in scope (a domain, or all). */
export function computeStats(rows: EpicRow[]): Stats {
  const s: Stats = { total: 0, ready: 0, rolled: 0, noOwner: 0, notRelevant: 0 };
  for (const row of rows) {
    if (isExcluded(row)) {
      s.notRelevant++;
      continue;
    }
    s.total++;
    if (isRolledOut(row)) s.rolled++;
    else if (onboardingSignal(row) === "ready") s.ready++;
    if (!isRolledOut(row) && !row.overlay.productOpsOwner && !row.overlay.gtmOwner) {
      s.noOwner++;
    }
  }
  return s;
}

function Card({ label, value, tone, hint }: { label: string; value: number; tone: string; hint?: string }) {
  return (
    <div title={hint} className="flex min-w-[120px] flex-1 flex-col rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-2xl font-semibold tabular-nums text-slate-900">{value}</span>
      <span className={clsx("mt-0.5 text-xs font-medium", tone)}>{label}</span>
    </div>
  );
}

export function StatCards({ stats, scopeLabel }: { stats: Stats; scopeLabel: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Card label={scopeLabel} value={stats.total} tone="text-slate-500" />
      <Card label="Ready to onboard" value={stats.ready} tone="text-amber-600" hint="Done in Jira, not yet rolled out" />
      <Card label="Rolled out" value={stats.rolled} tone="text-emerald-600" hint="Signed off by Product Ops and GTM" />
      <Card label="No ProductOps/GTM owner" value={stats.noOwner} tone="text-rose-600" />
      <Card label="Not relevant" value={stats.notRelevant} tone="text-slate-400" hint="Marked not relevant for rollout" />
    </div>
  );
}
