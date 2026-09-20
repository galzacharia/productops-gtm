import type { Domain, TshirtSize } from "../types";

export const TSHIRT_SIZES: Exclude<TshirtSize, "">[] = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

/** Product domains for grouping epics (Jira projects don't map 1:1). */
export const DOMAINS: Domain[] = ["Payments", "Contingent", "EOR", "Payroll", "Other"];

/** Assignable Product Ops owners. */
export const PRODUCT_OPS_OWNERS = [
  "Orit Neeman",
  "Tom Arad",
  "Golan Lavan",
  "Gal Zacharia",
];

/** Internal audiences for internal-facing features. */
export const INTERNAL_AUDIENCES = ["Support", "Finance", "GPE", "Sales Ops", "CS"];

/** Assignable GTM owners. */
export const GTM_OWNERS = [
  "Elad Ben David",
  "Shai Beres",
  "Jessica Ruyburn",
  "Eric Weaver",
  "Sarah Ilan",
  "Ina Koporcic",
  "Sivanne Fishel",
  "Zara Meller",
];

export function tshirtClass(size?: TshirtSize): string {
  switch (size) {
    case "XS":
    case "S":
      return "bg-teal-100 text-teal-800";
    case "M":
      return "bg-sky-100 text-sky-800";
    case "L":
      return "bg-indigo-100 text-indigo-800";
    case "XL":
    case "XXL":
      return "bg-fuchsia-100 text-fuchsia-800";
    default:
      return "bg-slate-100 text-slate-500";
  }
}
