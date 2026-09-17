import { ExternalLink, X } from "lucide-react";
import clsx from "clsx";
import type { EpicOverlay, EpicRow } from "../types";
import { signalMeta, statusCategoryClass } from "../lib/onboarding";
import { TSHIRT_SIZES, ONBOARDING_STATUSES, tshirtClass } from "../lib/options";
import { Badge, InlineSelect } from "./ui";
import { EditableText } from "./EditableText";

type SaveFn = (epicKey: string, patch: Partial<EpicOverlay>) => void;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      {children}
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="text-sm text-slate-800">{value ?? "—"}</div>
    </div>
  );
}

export function EpicDetailDrawer({
  row,
  onClose,
  onSave,
}: {
  row: EpicRow | null;
  onClose: () => void;
  onSave: SaveFn;
}) {
  if (!row) return null;
  const o = row.overlay;
  const meta = signalMeta(row);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/30"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <div className="flex items-center gap-1.5">
              <a
                href={row.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-brand hover:underline"
              >
                {row.key} <ExternalLink size={12} />
              </a>
              <Badge className={statusCategoryClass(row.statusCategory)}>
                {row.status}
              </Badge>
              <Badge className={meta.className}>{meta.label}</Badge>
            </div>
            <h2 className="mt-1 text-base font-semibold text-slate-900">
              {row.summary}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {/* Jira facts (read-only) */}
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
            <ReadOnly label="Project" value={row.project} />
            <ReadOnly label="Priority" value={row.priority} />
            <ReadOnly label="Product Manager" value={row.productManager} />
            <ReadOnly label="PM Owner" value={row.pmOwner} />
            <ReadOnly label="Assignee" value={row.assignee} />
            <ReadOnly label="Story Points" value={row.storyPoints} />
            <ReadOnly label="Exec Status" value={row.executiveStatus} />
            <ReadOnly label="Epic Status" value={row.epicStatus} />
            <ReadOnly label="Target Quarter" value={row.targetQuarter} />
            <ReadOnly label="Fix Version" value={row.fixVersions.join(", ")} />
          </div>

          {row.labels.length > 0 && (
            <Field label="Jira labels">
              <div className="flex flex-wrap gap-1">
                {row.labels.map((l) => (
                  <Badge key={l} className="bg-slate-100 text-slate-600">
                    {l}
                  </Badge>
                ))}
              </div>
            </Field>
          )}

          <div className="h-px bg-slate-200" />
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            GTM / Product Ops overlay
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="T-shirt size">
              <InlineSelect
                value={o.tshirtSize ?? ""}
                options={TSHIRT_SIZES}
                onChange={(v) =>
                  onSave(row.key, { tshirtSize: v as EpicOverlay["tshirtSize"] })
                }
                className={clsx("font-medium", tshirtClass(o.tshirtSize))}
              />
            </Field>
            <Field label="Onboarding status">
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
            </Field>
            <Field label="Product Ops owner">
              <EditableText
                value={o.productOpsOwner ?? ""}
                placeholder="Assign…"
                onCommit={(v) => onSave(row.key, { productOpsOwner: v })}
              />
            </Field>
            <Field label="GTM owner">
              <EditableText
                value={o.gtmOwner ?? ""}
                placeholder="Assign…"
                onCommit={(v) => onSave(row.key, { gtmOwner: v })}
              />
            </Field>
          </div>

          <Field label="GTM labels (comma-separated)">
            <EditableText
              value={(o.gtmLabels ?? []).join(", ")}
              placeholder="e.g. banco, self-serve, emea"
              onCommit={(v) =>
                onSave(row.key, {
                  gtmLabels: v
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={!!o.gtmVisible}
              onChange={(e) => onSave(row.key, { gtmVisible: e.target.checked })}
              className="accent-brand"
            />
            Visible to AE / AM
          </label>

          <Field label="AE / AM notes">
            <EditableText
              value={o.aeAmNotes ?? ""}
              placeholder="What AEs/AMs should know: positioning, availability, caveats…"
              multiline
              onCommit={(v) => onSave(row.key, { aeAmNotes: v })}
            />
          </Field>

          <Field label="Internal notes">
            <EditableText
              value={o.notes ?? ""}
              placeholder="Product Ops / GTM working notes…"
              multiline
              onCommit={(v) => onSave(row.key, { notes: v })}
            />
          </Field>

          {o.updatedAt && (
            <p className="pt-2 text-xs text-slate-400">
              Overlay last updated {new Date(o.updatedAt).toLocaleString()}
              {o.updatedBy ? ` by ${o.updatedBy}` : ""}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
