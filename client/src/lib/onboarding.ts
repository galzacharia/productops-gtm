import type { EpicRow } from "../types";

/**
 * The onboarding signal tells Product Ops / GTM when to act, derived from the
 * epic's Jira status and the rollout sign-off recorded in the overlay.
 */
export type OnboardingSignal =
  | "rolledout" // both Product Ops and GTM have signed off
  | "ready" // Jira epic is Done -> time to onboard, not yet rolled out
  | "not-ready"; // still To Do / In Progress in Jira

export interface SignalMeta {
  signal: OnboardingSignal;
  label: string;
  className: string;
  description: string;
  urgency: number;
}

export function isInternal(row: EpicRow): boolean {
  return row.overlay.audience === "Internal";
}

export function isRolledOut(row: EpicRow): boolean {
  const o = row.overlay;
  // Internal features don't need GTM sign-off.
  return isInternal(row) ? !!o.productOpsDone : !!(o.productOpsDone && o.gtmDone);
}

export function isExcluded(row: EpicRow): boolean {
  return !!row.overlay.notRelevantForRollout;
}

export function onboardingSignal(row: EpicRow): OnboardingSignal {
  if (isRolledOut(row)) return "rolledout";
  if (row.statusCategory === "Done") return "ready";
  return "not-ready";
}

const META: Record<OnboardingSignal, Omit<SignalMeta, "signal">> = {
  ready: {
    label: "Ready to onboard",
    className: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
    description: "Epic is Done in Jira — initiate onboarding.",
    urgency: 100,
  },
  rolledout: {
    label: "Rolled out ✓",
    className: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
    description: "Rollout complete from both Product Ops and GTM.",
    urgency: 10,
  },
  "not-ready": {
    label: "In development",
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-300",
    description: "Still in progress in Jira.",
    urgency: 30,
  },
};

export function signalMeta(row: EpicRow): SignalMeta {
  const signal = onboardingSignal(row);
  return { signal, ...META[signal] };
}

export function statusCategoryClass(cat: EpicRow["statusCategory"]): string {
  switch (cat) {
    case "Done":
      return "bg-emerald-100 text-emerald-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-slate-100 text-slate-600";
  }
}
