import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import clsx from "clsx";
import type { EpicRow, TaskState } from "../types";
import { isInternal, statusCategoryClass } from "../lib/onboarding";
import { productTypeOf, productTypeClass } from "../lib/productType";
import { PHASES, applicableTasks, taskProgress, type RolloutTask } from "../lib/rollout";
import { Badge } from "./ui";

type SaveTaskFn = (epicKey: string, taskId: string, patch: Partial<TaskState>) => void;

/** Owner field for a task — commits on blur to avoid a save per keystroke. */
function TaskOwner({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <input
      value={draft}
      placeholder="Owner…"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft !== value && onCommit(draft)}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className="w-40 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
    />
  );
}

function TaskRow({
  task,
  state,
  onSave,
}: {
  task: RolloutTask;
  state: TaskState;
  onSave: (patch: Partial<TaskState>) => void;
}) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 border-b border-slate-100 px-3.5 py-2.5 last:border-b-0",
        state.done && "bg-emerald-50/60",
      )}
    >
      <input
        type="checkbox"
        checked={!!state.done}
        onChange={(e) => onSave({ done: e.target.checked })}
        className="h-4 w-4 shrink-0 accent-emerald-600"
        aria-label="Done"
      />
      <div className="min-w-0 flex-1">
        <div className={clsx("text-sm", state.done && "text-slate-400 line-through")}>
          {task.title}
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Badge className="bg-slate-100 text-slate-600">{task.team}</Badge>
          {task.blocker && (
            <Badge className="bg-red-100 text-red-700">GO-LIVE BLOCKER</Badge>
          )}
          {task.gtm && <Badge className="bg-slate-100 text-slate-500">GTM</Badge>}
        </div>
      </div>
      <TaskOwner value={state.owner ?? ""} onCommit={(v) => onSave({ owner: v })} />
    </div>
  );
}

export function RolloutPage({
  row,
  onBack,
  onSaveTask,
}: {
  row: EpicRow;
  onBack: () => void;
  onSaveTask: SaveTaskFn;
}) {
  const pr = taskProgress(row);
  const st = row.overlay.tasks ?? {};
  const tasks = applicableTasks(row);
  const internal = isInternal(row);

  return (
    <div className="mx-auto max-w-[1000px] space-y-4 px-4 py-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
      >
        <ArrowLeft size={15} /> Back to list
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={row.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-brand hover:underline"
          >
            {row.key} <ExternalLink size={12} />
          </a>
          <Badge className={productTypeClass(productTypeOf(row))}>{productTypeOf(row)}</Badge>
          <Badge className={statusCategoryClass(row.statusCategory)}>{row.status}</Badge>
          {row.overlay.audience && (
            <Badge
              className={
                internal ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"
              }
            >
              {row.overlay.audience}
            </Badge>
          )}
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">{row.summary}</h2>

        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1.5 flex justify-between text-sm text-slate-500">
              <span>Rollout progress</span>
              <span>
                <b className="tabular-nums text-slate-800">{pr.done}</b> / {pr.total} tasks ·{" "}
                <b className="tabular-nums text-slate-800">{pr.pct}%</b>
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-lg bg-slate-100">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pr.pct}%` }} />
            </div>
          </div>
          <div
            className={clsx(
              "rounded-lg px-3.5 py-3 text-sm font-semibold",
              pr.goLive ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
            )}
          >
            {pr.goLive
              ? "✓ Go-live blockers cleared — this feature can go live."
              : `⛔ ${pr.blockersLeft} go-live blocker${pr.blockersLeft === 1 ? "" : "s"} remaining — cannot go live yet.`}
          </div>
          {internal && (
            <p className="text-xs italic text-slate-400">
              Internal audience — GTM / marketing tasks are hidden for this feature.
            </p>
          )}
        </div>
      </div>

      {PHASES.map((ph) => {
        const phaseTasks = tasks.filter((t) => t.ph === ph.n);
        if (phaseTasks.length === 0) return null;
        const done = phaseTasks.filter((t) => st[t.id]?.done).length;
        return (
          <div key={ph.n}>
            <div className="mb-2 flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-900 text-xs font-bold text-white">
                {ph.n}
              </span>
              <h3 className="text-sm font-semibold">{ph.name}</h3>
              <span className="ml-auto text-xs tabular-nums text-slate-500">
                {done}/{phaseTasks.length}
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {phaseTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  state={st[t.id] ?? {}}
                  onSave={(patch) => onSaveTask(row.key, t.id, patch)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
