import type { Domain, EpicRow, JiraEpic } from "../types";

/**
 * Auto-classify an epic into a product domain from its Jira project + text.
 * Jira projects don't map 1:1 (Contingent/EOR both live in the Payroll project),
 * so this is a best guess; users can override per epic via the overlay `domain`.
 */
export function autoDomain(e: JiraEpic): Domain {
  const t = `${e.summary} ${(e.labels || []).join(" ")} ${e.project}`.toLowerCase();
  if (e.project === "Payments" || e.project === "Bettina") return "Payments";
  if (t.includes("contingent")) return "Contingent";
  if (/\beor\b/.test(t) || t.includes("employer of record")) return "EOR";
  if (
    e.project === "Payroll" ||
    t.includes("payroll") ||
    t.includes("t&a") ||
    t.includes("payslip") ||
    t.includes("off cycle") ||
    t.includes("off-cycle")
  ) {
    return "Payroll";
  }
  return "Other";
}

/** Effective domain: the manual override if set, else the auto guess. */
export function domainOf(row: EpicRow): Domain {
  const d = row.overlay.domain;
  return d ? (d as Domain) : autoDomain(row);
}
