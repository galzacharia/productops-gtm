import type { EpicRow } from "../types";

/**
 * The onboarding signal is the heart of the tool: it tells Product Ops / GTM
 * when to initiate onboarding, derived from the epic's Jira status and any
 * onboarding lifecycle the team has recorded in the overlay.
 */
export type OnboardingSignal =
  | "live" // GTM has finished onboarding
  | "onboarding" // GTM onboarding in progress
  | "blocked" // explicitly blocked by the team
  | "ready" // Jira epic is Done -> time to onboard, not yet handled
  | "not-ready"; // still To Do / In Progress in Jira

export interface SignalMeta {
  signal: OnboardingSignal;
  label: string;
  /** Tailwind classes for a badge. */
  className: string;
  description: string;
  /** Higher = more attention needed; used for sorting. */
  urgency: number;
}

export function onboardingSignal(row: EpicRow): OnboardingSignal {
  const s = row.overlay.onboardingStatus;
  if (s === "Live") return "live";
  if (s === "Blocked") return "blocked";
  if (s === "Onboarding") return "onboarding";
  // No explicit lifecycle recorded (or "Ready to Onboard"/"Not Started"):
  // derive from Jira. A Done epic means the feature is built -> onboard now.
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
  blocked: {
    label: "Blocked",
    className: "bg-red-100 text-red-800 ring-1 ring-red-300",
    description: "Onboarding is blocked.",
    urgency: 90,
  },
  onboarding: {
    label: "Onboarding",
    className: "bg-blue-100 text-blue-800 ring-1 ring-blue-300",
    description: "GTM onboarding is in progress.",
    urgency: 60,
  },
  live: {
    label: "Live",
    className: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
    description: "Onboarding complete — feature is live for GTM.",
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
