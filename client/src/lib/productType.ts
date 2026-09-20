import type { EpicRow, JiraEpic, ProductType } from "../types";

export const PRODUCT_TYPES: ProductType[] = [
  "EOR",
  "Payroll",
  "WF General",
  "Contingent",
  "Contractors",
  "Other",
];

/** Best-guess product type from the epic's text; overridable per epic. */
export function autoProductType(e: JiraEpic): ProductType {
  const t = `${e.summary} ${(e.labels || []).join(" ")} ${e.project}`.toLowerCase();
  if (t.includes("contractor")) return "Contractors";
  if (t.includes("contingent")) return "Contingent";
  if (/\beor\b/.test(t) || t.includes("employer of record")) return "EOR";
  if (t.includes("payroll") || t.includes("payslip") || t.includes("off cycle") || t.includes("off-cycle"))
    return "Payroll";
  if (
    t.includes("workforce") ||
    t.includes("wfos") ||
    t.includes("wos") ||
    t.includes("t&a") ||
    t.includes("attendance") ||
    t.includes("wf_")
  )
    return "WF General";
  return "Other";
}

export function productTypeOf(row: EpicRow): ProductType {
  const p = row.overlay.productType;
  return p ? (p as ProductType) : autoProductType(row);
}

export function productTypeClass(pt: ProductType): string {
  switch (pt) {
    case "EOR":
      return "bg-sky-100 text-sky-800";
    case "Payroll":
      return "bg-indigo-100 text-indigo-800";
    case "WF General":
      return "bg-teal-100 text-teal-800";
    case "Contingent":
      return "bg-amber-100 text-amber-800";
    case "Contractors":
      return "bg-fuchsia-100 text-fuchsia-800";
    default:
      return "bg-slate-100 text-slate-600";
  }
}
