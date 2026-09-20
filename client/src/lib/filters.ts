import type { Domain, EpicRow } from "../types";
import { isExcluded, isRolledOut } from "./onboarding";
import { domainOf } from "./domain";
import { productTypeOf } from "./productType";

export type ViewMode = "active" | "rolledout" | "notrelevant" | "all";

export interface FilterState {
  search: string;
  statusCategory: string; // "" = all
  audience: string; // "" = all
  gtmVisibleOnly: boolean;
}

export const emptyFilters: FilterState = {
  search: "",
  statusCategory: "",
  audience: "",
  gtmVisibleOnly: false,
};

/** Whether a row belongs in the given view. */
export function inView(row: EpicRow, view: ViewMode): boolean {
  if (view === "all") return true;
  if (view === "notrelevant") return isExcluded(row);
  if (isExcluded(row)) return false;
  if (view === "rolledout") return isRolledOut(row);
  return !isRolledOut(row); // active
}

export function passFilters(row: EpicRow, f: FilterState): boolean {
  if (f.statusCategory && row.statusCategory !== f.statusCategory) return false;
  if (f.audience && (row.overlay.audience ?? "") !== f.audience) return false;
  if (f.gtmVisibleOnly && !row.overlay.gtmVisible) return false;
  const q = f.search.trim().toLowerCase();
  if (q) {
    const hay = [
      row.key,
      row.summary,
      row.project,
      row.assignee,
      row.productManager,
      row.overlay.productOpsOwner,
      row.overlay.gtmOwner,
      domainOf(row),
      productTypeOf(row),
      ...row.labels,
      ...(row.overlay.gtmLabels ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

/** Rows passing the current view + filters, before the domain tab is applied. */
export function baseRows(
  rows: EpicRow[],
  view: ViewMode,
  f: FilterState,
): EpicRow[] {
  return rows.filter((r) => inView(r, view) && passFilters(r, f));
}

export function inDomain(row: EpicRow, domain: Domain | "All"): boolean {
  return domain === "All" || domainOf(row) === domain;
}
