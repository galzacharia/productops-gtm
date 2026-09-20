import { Fragment } from "react";
import { Ban, ChevronDown, ChevronRight, ExternalLink, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import type { EpicOverlay, EpicRow, ProductType } from "../types";
import { isExcluded, isInternal, isRolledOut, signalMeta, statusCategoryClass } from "../lib/onboarding";
import { domainOf } from "../lib/domain";
import { productTypeOf, productTypeClass } from "../lib/productType";
import { taskProgress } from "../lib/rollout";
import { TSHIRT_SIZES, PRODUCT_OPS_OWNERS, GTM_OWNERS, tshirtClass } from "../lib/options";
import { Badge, InlineSelect } from "./ui";

type SaveFn = (epicKey: string, patch: Partial<EpicOverlay>) => void;

const TH =
  "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap";
const TD = "px-3 py-2 align-top text-sm";
const COLS = 12;

export function DashboardTable({
  rows,
  onSave,
  onSelect,
  onOpenRollout,
  collapsed,
  onToggleCollapse,
}: {
  rows: EpicRow[];
  onSave: SaveFn;
  onSelect: (row: EpicRow) => void;
  onOpenRollout: (row: EpicRow) => void;
  collapsed: Set<string>;
  onToggleCollapse: (pt: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
        No epics here. Try another domain tab or view.
      </div>
    );
  }

  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    const pt = productTypeOf(r);
    counts[pt] = (counts[pt] ?? 0) + 1;
  });

  let lastPt: ProductType | null = null;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full border-collapse">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className={TH}>Epic</th>
            <th className={TH}>Type</th>
            <th className={TH}>Audience</th>
            <th className={TH}>Jira status</th>
            <th className={TH}>Onboarding</th>
            <th className={TH}>Rollout</th>
            <th className={clsx(TH, "w-20")}>T-shirt</th>
            <th className={clsx(TH, "w-36")}>Product Ops</th>
            <th className={clsx(TH, "w-36")}>GTM owner</th>
            <th className={TH}>Sign-off</th>
            <th className={clsx(TH, "text-center")}>AE/AM</th>
            <th className={TH}></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const pt = productTypeOf(row);
            const newGroup = pt !== lastPt;
            lastPt = pt;
            const isCollapsed = collapsed.has(pt);
            const header = newGroup ? (
              <tr
                key={`h-${pt}`}
                className="cursor-pointer bg-slate-50 hover:bg-slate-100"
                onClick={() => onToggleCollapse(pt)}
              >
                <td colSpan={COLS} className="border-y border-slate-200 px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    {isCollapsed ? <ChevronRight size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    <Badge className={productTypeClass(pt)}>{pt}</Badge>
                    <span className="text-xs text-slate-400">
                      {counts[pt]} epic{counts[pt] === 1 ? "" : "s"}
                    </span>
                  </div>
                </td>
              </tr>
            ) : null;

            if (isCollapsed) return header ? <Fragment key={row.key}>{header}</Fragment> : null;

            const meta = signalMeta(row);
            const o = row.overlay;
            const ex = isExcluded(row);
            const internal = isInternal(row);
            const both = isRolledOut(row);
            const pr = taskProgress(row);

            return (
              <Fragment key={row.key}>
                {header}
                <tr className={clsx("hover:bg-slate-50/70", ex && "opacity-60")}>
                  <td className={clsx(TD, "min-w-[240px] max-w-[360px]")}>
                    <div className="flex items-center gap-1.5">
                      <a href={row.url} target="_blank" rel="noreferrer" className="font-mono text-xs font-semibold text-brand hover:underline">
                        {row.key}
                      </a>
                      <a href={row.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600" title="Open in Jira">
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <button onClick={() => onSelect(row)} className="mt-0.5 block text-left text-sm text-slate-800 hover:text-brand">
                      {row.summary}
                    </button>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{domainOf(row)}</span>
                      {internal && (o.internalAudiences?.length ?? 0) > 0 && (
                        <Badge className="bg-violet-100 text-violet-700">
                          {o.internalAudiences!.join(", ")}
                        </Badge>
                      )}
                      {row.labels.slice(0, 2).map((l) => (
                        <Badge key={l} className="bg-slate-100 text-slate-500">{l}</Badge>
                      ))}
                      {(o.gtmLabels ?? []).map((l) => (
                        <Badge key={l} className="bg-brand/10 text-brand">{l}</Badge>
                      ))}
                    </div>
                  </td>

                  <td className={TD}>
                    <Badge className={productTypeClass(pt)}>{pt}</Badge>
                  </td>

                  <td className={TD}>
                    <select
                      value={o.audience ?? ""}
                      onChange={(e) => onSave(row.key, { audience: e.target.value as EpicOverlay["audience"] })}
                      className={clsx(
                        "w-full min-w-[100px] rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand",
                        internal && "bg-violet-50 font-medium text-violet-700",
                        o.audience === "External" && "bg-sky-50 font-medium text-sky-700",
                      )}
                    >
                      <option value="">— set —</option>
                      <option value="External">External</option>
                      <option value="Internal">Internal</option>
                    </select>
                  </td>

                  <td className={TD}>
                    <Badge className={statusCategoryClass(row.statusCategory)} title={row.status}>{row.status}</Badge>
                  </td>

                  <td className={TD}>
                    <Badge className={meta.className} title={meta.description}>{meta.label}</Badge>
                  </td>

                  <td className={clsx(TD, "min-w-[132px]")}>
                    <button onClick={() => onOpenRollout(row)} className="w-full text-left" title="Open rollout checklist">
                      <div className="h-1.5 overflow-hidden rounded bg-slate-100">
                        <div
                          className={clsx("h-full", pr.blockersLeft > 0 ? "bg-amber-500" : "bg-emerald-500")}
                          style={{ width: `${pr.pct}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center gap-2 whitespace-nowrap text-[10.5px] text-slate-500">
                        <span className="tabular-nums">{pr.done}/{pr.total}</span>
                        {pr.goLive ? (
                          <span className="font-bold text-emerald-700">● go-live ready</span>
                        ) : (
                          <span className="font-bold text-rose-600">● {pr.blockersLeft} blocker{pr.blockersLeft === 1 ? "" : "s"}</span>
                        )}
                      </div>
                    </button>
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
                    {internal ? (
                      <span className="text-xs italic text-slate-400">N/A · internal</span>
                    ) : (
                      <InlineSelect
                        value={o.gtmOwner ?? ""}
                        options={GTM_OWNERS}
                        placeholder="Assign…"
                        onChange={(v) => onSave(row.key, { gtmOwner: v })}
                      />
                    )}
                  </td>

                  <td className={TD}>
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
                        <input type="checkbox" className="accent-brand" checked={!!o.productOpsDone} onChange={(e) => onSave(row.key, { productOpsDone: e.target.checked })} />
                        Prod Ops
                      </label>
                      {!internal && (
                        <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
                          <input type="checkbox" className="accent-brand" checked={!!o.gtmDone} onChange={(e) => onSave(row.key, { gtmDone: e.target.checked })} />
                          GTM
                        </label>
                      )}
                      {both && <span className="text-[11px] font-bold text-emerald-700">✓ Rolled out</span>}
                    </div>
                  </td>

                  <td className={clsx(TD, "text-center")}>
                    <button
                      onClick={() => onSave(row.key, { gtmVisible: !o.gtmVisible })}
                      title={o.gtmVisible ? "Visible to AE/AM" : "Hidden from AE/AM"}
                      className={clsx("inline-flex rounded-md p-1.5", o.gtmVisible ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-300 hover:bg-slate-100")}
                    >
                      {o.gtmVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </td>

                  <td className={clsx(TD, "text-center")}>
                    <button
                      onClick={() => onSave(row.key, { notRelevantForRollout: !ex })}
                      title={ex ? "Marked not relevant — click to restore" : "Mark not relevant for rollout"}
                      className={clsx("inline-flex rounded-md p-1.5", ex ? "text-rose-600 hover:bg-rose-50" : "text-slate-300 hover:bg-slate-100")}
                    >
                      <Ban size={15} />
                    </button>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
