import clsx from "clsx";
import type { Domain } from "../types";
import { DOMAINS } from "../lib/options";

export type DomainTab = Domain | "All";

export function DomainTabs({
  current,
  counts,
  onChange,
}: {
  current: DomainTab;
  counts: Record<string, number>;
  onChange: (d: DomainTab) => void;
}) {
  const tabs: DomainTab[] = ["All", ...DOMAINS];
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {tabs.map((d) => {
        const active = d === current;
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            aria-pressed={active}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {d}
            <span
              className={clsx(
                "rounded-full px-1.5 text-[11px] font-bold tabular-nums",
                active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500",
              )}
            >
              {counts[d] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
