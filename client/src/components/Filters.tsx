import { Search, X } from "lucide-react";
import clsx from "clsx";
import type { FilterState } from "../lib/filters";
import { emptyFilters } from "../lib/filters";

const SIGNALS: { value: FilterState["signal"]; label: string }[] = [
  { value: "", label: "All onboarding" },
  { value: "ready", label: "Ready to onboard" },
  { value: "onboarding", label: "Onboarding" },
  { value: "live", label: "Live" },
  { value: "blocked", label: "Blocked" },
  { value: "not-ready", label: "In development" },
];

export function Filters({
  filters,
  projects,
  onChange,
}: {
  filters: FilterState;
  projects: string[];
  onChange: (next: FilterState) => void;
}) {
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const dirty =
    JSON.stringify(filters) !== JSON.stringify(emptyFilters);

  const selectCls =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search epics, owners, labels…"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <select
        value={filters.project}
        onChange={(e) => set({ project: e.target.value })}
        className={selectCls}
      >
        <option value="">All projects</option>
        {projects.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select
        value={filters.statusCategory}
        onChange={(e) => set({ statusCategory: e.target.value })}
        className={selectCls}
      >
        <option value="">All statuses</option>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>

      <select
        value={filters.signal}
        onChange={(e) => set({ signal: e.target.value as FilterState["signal"] })}
        className={selectCls}
      >
        {SIGNALS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <label
        className={clsx(
          "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
          filters.gtmVisibleOnly
            ? "border-brand bg-brand/5 text-brand"
            : "border-slate-300 bg-white text-slate-600",
        )}
      >
        <input
          type="checkbox"
          checked={filters.gtmVisibleOnly}
          onChange={(e) => set({ gtmVisibleOnly: e.target.checked })}
          className="accent-brand"
        />
        AE/AM visible only
      </label>

      {dirty && (
        <button
          onClick={() => onChange(emptyFilters)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <X size={15} /> Clear
        </button>
      )}
    </div>
  );
}
