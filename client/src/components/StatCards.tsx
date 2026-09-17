import clsx from "clsx";
import type { EpicRow } from "../types";
import { onboardingSignal } from "../lib/onboarding";

export interface Stats {
  total: number;
  done: number;
  inProgress: number;
  toDo: number;
  readyToOnboard: number;
  onboarding: number;
  live: number;
  unassigned: number;
}

export function computeStats(rows: EpicRow[]): Stats {
  const s: Stats = {
    total: rows.length,
    done: 0,
    inProgress: 0,
    toDo: 0,
    readyToOnboard: 0,
    onboarding: 0,
    live: 0,
    unassigned: 0,
  };
  for (const row of rows) {
    if (row.statusCategory === "Done") s.done++;
    else if (row.statusCategory === "In Progress") s.inProgress++;
    else s.toDo++;

    const sig = onboardingSignal(row);
    if (sig === "ready") s.readyToOnboard++;
    if (sig === "onboarding") s.onboarding++;
    if (sig === "live") s.live++;

    if (!row.overlay.productOpsOwner && !row.overlay.gtmOwner) s.unassigned++;
  }
  return s;
}

function Card({
  label,
  value,
  tone,
  active,
  onClick,
  hint,
}: {
  label: string;
  value: number;
  tone: string;
  active?: boolean;
  onClick?: () => void;
  hint?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={hint}
      className={clsx(
        "flex min-w-[120px] flex-1 flex-col rounded-xl border bg-white px-4 py-3 text-left transition-shadow",
        active ? "border-brand ring-1 ring-brand" : "border-slate-200",
        onClick && "hover:shadow-sm",
      )}
    >
      <span className="text-2xl font-semibold text-slate-900">{value}</span>
      <span className={clsx("mt-0.5 text-xs font-medium", tone)}>{label}</span>
    </button>
  );
}

export function StatCards({
  stats,
  readyFilterActive,
  onToggleReady,
}: {
  stats: Stats;
  readyFilterActive: boolean;
  onToggleReady: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Card label="Epics this quarter" value={stats.total} tone="text-slate-500" />
      <Card label="In development" value={stats.inProgress + stats.toDo} tone="text-blue-600" />
      <Card label="Done in Jira" value={stats.done} tone="text-emerald-600" />
      <Card
        label="Ready to onboard"
        value={stats.readyToOnboard}
        tone="text-amber-600"
        active={readyFilterActive}
        onClick={onToggleReady}
        hint="Epics Done in Jira that GTM hasn't onboarded yet — click to filter"
      />
      <Card label="Onboarding" value={stats.onboarding} tone="text-blue-600" />
      <Card label="Live" value={stats.live} tone="text-emerald-600" />
      <Card
        label="No ProductOps/GTM owner"
        value={stats.unassigned}
        tone="text-rose-600"
        hint="Epics with neither a Product Ops nor a GTM owner assigned"
      />
    </div>
  );
}
