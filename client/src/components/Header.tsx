import { RefreshCw } from "lucide-react";
import clsx from "clsx";
import { QUARTERS, quarterLabel, yearOptions } from "../lib/quarter";

export function Header({
  labelPrefix,
  quarter,
  year,
  currentYear,
  onChange,
  onRefresh,
  isFetching,
}: {
  labelPrefix: string;
  quarter: number;
  year: number;
  currentYear: number;
  onChange: (next: { quarter: number; year: number }) => void;
  onRefresh: () => void;
  isFetching: boolean;
}) {
  const label = quarterLabel(labelPrefix, quarter, year);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            ProductOps <span className="text-brand">×</span> GTM
          </h1>
          <p className="text-sm text-slate-500">
            Quarterly epic tracker &amp; onboarding readiness
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-slate-300">
            {QUARTERS.map((q) => (
              <button
                key={q}
                onClick={() => onChange({ quarter: q, year })}
                className={clsx(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  q === quarter
                    ? "bg-brand text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                Q{q}
              </button>
            ))}
          </div>

          <select
            value={year}
            onChange={(e) => onChange({ quarter, year: Number(e.target.value) })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {yearOptions(currentYear).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <span
            className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm text-slate-700"
            title="Jira label pulled for this quarter"
          >
            {label}
          </span>

          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw
              size={15}
              className={clsx(isFetching && "animate-spin")}
            />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
