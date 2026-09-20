import type { EpicRow } from "../types";
import { signalMeta } from "./onboarding";
import { domainOf } from "./domain";
import { productTypeOf } from "./productType";
import { taskProgress } from "./rollout";

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function rowsToCsv(rows: EpicRow[]): string {
  const headers = [
    "Epic",
    "Summary",
    "Product Type",
    "Domain",
    "Audience",
    "Internal Audiences",
    "Project",
    "Jira Status",
    "Onboarding",
    "Rollout %",
    "Go-live Blockers Left",
    "T-shirt",
    "Product Ops Owner",
    "GTM Owner",
    "Product Ops Done",
    "GTM Done",
    "Not Relevant",
    "AE/AM Visible",
    "Jira Labels",
    "GTM Labels",
    "URL",
  ];
  const lines = rows.map((r) => {
    const o = r.overlay;
    const pr = taskProgress(r);
    return [
      r.key,
      r.summary,
      productTypeOf(r),
      domainOf(r),
      o.audience ?? "",
      (o.internalAudiences ?? []).join(" "),
      r.project,
      r.status,
      signalMeta(r).label,
      `${pr.pct}%`,
      pr.blockersLeft,
      o.tshirtSize ?? "",
      o.productOpsOwner ?? "",
      o.gtmOwner ?? "",
      o.productOpsDone ? "Yes" : "No",
      o.gtmDone ? "Yes" : "No",
      o.notRelevantForRollout ? "Yes" : "No",
      o.gtmVisible ? "Yes" : "No",
      r.labels.join(" "),
      (o.gtmLabels ?? []).join(" "),
      r.url,
    ]
      .map(esc)
      .join(",");
  });
  return [headers.join(","), ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
