import clsx from "clsx";
import type { ViewMode } from "../lib/filters";

const VIEWS: { value: ViewMode; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "rolledout", label: "Rolled out" },
  { value: "notrelevant", label: "Not relevant" },
  { value: "all", label: "All" },
];

export function ViewSwitch({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
      {VIEWS.map((v) => (
        <button
          key={v.value}
          onClick={() => onChange(v.value)}
          aria-pressed={view === v.value}
          className={clsx(
            "border-r border-slate-200 px-3 py-2 text-xs font-semibold last:border-r-0 transition-colors",
            view === v.value
              ? "bg-brand/10 text-brand"
              : "bg-white text-slate-600 hover:bg-slate-50",
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
