import { Search } from "lucide-react";
import clsx from "clsx";
import type { FilterState } from "../lib/filters";

export function Filters({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const selectCls =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px]">
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
        value={filters.audience}
        onChange={(e) => set({ audience: e.target.value })}
        className={selectCls}
      >
        <option value="">All audiences</option>
        <option value="External">External</option>
        <option value="Internal">Internal</option>
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
    </div>
  );
}
