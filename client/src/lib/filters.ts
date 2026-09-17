import type { EpicRow } from "../types";
import { onboardingSignal, type OnboardingSignal } from "./onboarding";

export interface FilterState {
  search: string;
  project: string; // "" = all
  statusCategory: string; // "" = all
  signal: OnboardingSignal | ""; // "" = all
  gtmVisibleOnly: boolean;
}

export const emptyFilters: FilterState = {
  search: "",
  project: "",
  statusCategory: "",
  signal: "",
  gtmVisibleOnly: false,
};

export function applyFilters(rows: EpicRow[], f: FilterState): EpicRow[] {
  const q = f.search.trim().toLowerCase();
  return rows.filter((row) => {
    if (f.project && row.project !== f.project) return false;
    if (f.statusCategory && row.statusCategory !== f.statusCategory) return false;
    if (f.signal && onboardingSignal(row) !== f.signal) return false;
    if (f.gtmVisibleOnly && !row.overlay.gtmVisible) return false;
    if (q) {
      const hay = [
        row.key,
        row.summary,
        row.project,
        row.assignee,
        row.productManager,
        row.overlay.productOpsOwner,
        row.overlay.gtmOwner,
        ...row.labels,
        ...(row.overlay.gtmLabels ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function distinctProjects(rows: EpicRow[]): string[] {
  return Array.from(new Set(rows.map((r) => r.project).filter(Boolean))).sort();
}
