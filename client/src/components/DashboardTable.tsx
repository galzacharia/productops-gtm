import { Ban, ExternalLink, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import type { EpicOverlay, EpicRow } from "../types";
import { isExcluded, signalMeta, statusCategoryClass } from "../lib/onboarding";
import { domainOf } from "../lib/domain";
import { TSHIRT_SIZES, PRODUCT_OPS_OWNERS, GTM_OWNERS, tshirtClass } from "../lib/options";
import { Badge, InlineSelect } from "./ui";

type SaveFn = (epicKey: string, patch: Partial<EpicOverlay>) => void;

const TH =
  "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap";
const TD = "px-3 py-2 align-top text-sm";

export function DashboardTable({
  rows,
  onSave,
  onSelect,
}: {
  rows: EpicRow[];
  onSave: SaveFn;
  onSelect: (row: EpicRow) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
        No epics here. Try another domain tab or view.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full border-collapse">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className={TH}>Epic</th>
            <th className={TH}>Jira status</th>
            <th className={TH}>Onboarding</th>
            <th className={clsx(TH, "w-24")}>T-shirt</th>
            <th className={clsx(TH, "w-40")}>Product Ops</th>
            <th className={clsx(TH, "w-40")}>GTM owner</th>
            <th className={TH}>Rollout sign-off</th>
            <th className={clsx(TH, "text-center")}>AE/AM</th>
            <th className={TH}></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const meta = signalMeta(row);
            const o = row.overlay;
            const ex = isExcluded(row);
            const both = o.productOpsDone && o.gtmDone;
            return (
              <tr key={row.key} className={clsx("hover:bg-slate-50/70", ex && "opacity-60")}>
                <td className={clsx(TD, "min-w-[260px] max-w-[380px]")}>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-xs font-semibold text-brand hover:underline"
                    >
                      {row.key}
                    </a>
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-slate-600"
                      title="Open in Jira"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <button
                    onClick={() => onSelect(row)}
                    className="mt-0.5 block text-left text-sm text-slate-800 hover:text-brand"
                  >
                    {row.summary}
                  </button>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {domainOf(row)}
                  </span>
                  {(row.labels.length > 0 || (o.gtmLabels?.length ?? 0) > 0) && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {row.labels.slice(0, 3).map((l) => (
                        <Badge key={l} className="bg-slate-100 text-slate-500">
                          {l}
                        </Badge>
                      ))}
                      {(o.gtmLabels ?? []).map((l) => (
                        <Badge key={l} className="bg-brand/10 text-brand">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  )}
                </td>

                <td className={TD}>
                  <Badge className={statusCategoryClass(row.statusCategory)} title={row.status}>
                    {row.status}
                  </Badge>
                </td>

                <td className={TD}>
                  <Badge className={meta.className} title={meta.description}>
                    {meta.label}
                  </Badge>
                </td>

                <td className={TD}>
                  <InlineSelect
                    value={o.tshirtSize ?? ""}
                    options={TSHIRT_SIZES}
                    onChange={(v) => onSave(row.key, { tshirtSize: v as EpicOverlay["tshirtSize"] })}
                    className={clsx("font-medium", tshirtClass(o.tshirtSize))}
                  />
                </td>

                <td className={TD}>
                  <InlineSelect
                    value={o.productOpsOwner ?? ""}
                    options={PRODUCT_OPS_OWNERS}
                    placeholder="Assign…"
                    onChange={(v) => onSave(row.key, { productOpsOwner: v })}
                  />
                </td>

                <td className={TD}>
                  <InlineSelect
                    value={o.gtmOwner ?? ""}
                    options={GTM_OWNERS}
                    placeholder="Assign…"
                    onChange={(v) => onSave(row.key, { gtmOwner: v })}
                  />
                </td>

                <td className={TD}>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
                      <input
                        type="checkbox"
                        className="accent-brand"
                        checked={!!o.productOpsDone}
                        onChange={(e) => onSave(row.key, { productOpsDone: e.target.checked })}
                      />
                      Product Ops
                    </label>
                    <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
                      <input
                        type="checkbox"
                        className="accent-brand"
                        checked={!!o.gtmDone}
                        onChange={(e) => onSave(row.key, { gtmDone: e.target.checked })}
                      />
                      GTM
                    </label>
                    {both && (
                      <span className="text-[11px] font-bold text-emerald-700">✓ Rolled out</span>
                    )}
                  </div>
                </td>

                <td className={clsx(TD, "text-center")}>
                  <button
                    onClick={() => onSave(row.key, { gtmVisible: !o.gtmVisible })}
                    title={o.gtmVisible ? "Visible to AE/AM" : "Hidden from AE/AM"}
                    className={clsx(
                      "inline-flex rounded-md p-1.5",
                      o.gtmVisible
                        ? "text-emerald-600 hover:bg-emerald-50"
                        : "text-slate-300 hover:bg-slate-100",
                    )}
                  >
                    {o.gtmVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </td>

                <td className={clsx(TD, "text-center")}>
                  <button
                    onClick={() => onSave(row.key, { notRelevantForRollout: !ex })}
                    title={ex ? "Marked not relevant — click to restore" : "Mark not relevant for rollout"}
                    className={clsx(
                      "inline-flex rounded-md p-1.5",
                      ex ? "text-rose-600 hover:bg-rose-50" : "text-slate-300 hover:bg-slate-100",
                    )}
                  >
                    <Ban size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
