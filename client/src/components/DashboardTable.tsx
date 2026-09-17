import { ExternalLink, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import type { EpicOverlay, EpicRow } from "../types";
import { signalMeta, statusCategoryClass } from "../lib/onboarding";
import { TSHIRT_SIZES, ONBOARDING_STATUSES, tshirtClass } from "../lib/options";
import { Badge, InlineSelect } from "./ui";
import { EditableText } from "./EditableText";

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
        No epics match the current quarter and filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full border-collapse">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className={TH}>Epic</th>
            <th className={TH}>Project</th>
            <th className={TH}>Jira status</th>
            <th className={TH}>Onboarding</th>
            <th className={clsx(TH, "w-24")}>T-shirt</th>
            <th className={clsx(TH, "w-40")}>Product Ops</th>
            <th className={clsx(TH, "w-40")}>GTM owner</th>
            <th className={clsx(TH, "w-44")}>Onboarding status</th>
            <th className={TH}>PM</th>
            <th className={clsx(TH, "text-right")}>SP</th>
            <th className={clsx(TH, "text-center")}>AE/AM</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const meta = signalMeta(row);
            const o = row.overlay;
            return (
              <tr key={row.key} className="hover:bg-slate-50/70">
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
                  {(row.labels.length > 0 || (o.gtmLabels?.length ?? 0) > 0) && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {row.labels.slice(0, 4).map((l) => (
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

                <td className={clsx(TD, "text-slate-600 whitespace-nowrap")}>
                  {row.project}
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
                  <EditableText
                    value={o.productOpsOwner ?? ""}
                    placeholder="Assign…"
                    onCommit={(v) => onSave(row.key, { productOpsOwner: v })}
                  />
                </td>

                <td className={TD}>
                  <EditableText
                    value={o.gtmOwner ?? ""}
                    placeholder="Assign…"
                    onCommit={(v) => onSave(row.key, { gtmOwner: v })}
                  />
                </td>

                <td className={TD}>
                  <InlineSelect
                    value={o.onboardingStatus ?? ""}
                    options={ONBOARDING_STATUSES}
                    placeholder="Auto (from Jira)"
                    onChange={(v) =>
                      onSave(row.key, {
                        onboardingStatus: v as EpicOverlay["onboardingStatus"],
                      })
                    }
                  />
                </td>

                <td className={clsx(TD, "text-slate-600 whitespace-nowrap")}>
                  {row.productManager ?? row.pmOwner ?? "—"}
                </td>

                <td className={clsx(TD, "text-right text-slate-600")}>
                  {row.storyPoints ?? "—"}
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
