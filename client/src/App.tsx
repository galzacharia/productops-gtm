import { useMemo, useState } from "react";
import { AlertTriangle, Download, Loader2 } from "lucide-react";
import { Header } from "./components/Header";
import { StatCards, computeStats } from "./components/StatCards";
import { Filters } from "./components/Filters";
import { DashboardTable } from "./components/DashboardTable";
import { EpicDetailDrawer } from "./components/EpicDetailDrawer";
import { useAppConfig, useEpics, useSaveOverlay, toRows } from "./hooks/useEpics";
import { applyFilters, distinctProjects, emptyFilters } from "./lib/filters";
import { signalMeta } from "./lib/onboarding";
import { currentQuarter, quarterLabel } from "./lib/quarter";
import { downloadCsv, rowsToCsv } from "./lib/csv";
import type { EpicOverlay, EpicRow } from "./types";

export default function App() {
  const configQuery = useAppConfig();
  const now = currentQuarter();

  const [period, setPeriod] = useState({
    quarter: now.quarter,
    year: now.year,
  });
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const epicsQuery = useEpics(period.quarter, period.year);
  const saveMutation = useSaveOverlay(period.quarter, period.year);

  const rows = useMemo(() => toRows(epicsQuery.data), [epicsQuery.data]);
  const projects = useMemo(() => distinctProjects(rows), [rows]);
  const stats = useMemo(() => computeStats(rows), [rows]);

  const visibleRows = useMemo(() => {
    const filtered = applyFilters(rows, filters);
    return [...filtered].sort((a, b) => {
      const u = signalMeta(b).urgency - signalMeta(a).urgency;
      if (u !== 0) return u;
      return (b.updated ?? "").localeCompare(a.updated ?? "");
    });
  }, [rows, filters]);

  const selected: EpicRow | null =
    visibleRows.find((r) => r.key === selectedKey) ??
    rows.find((r) => r.key === selectedKey) ??
    null;

  const labelPrefix = configQuery.data?.labelPrefix ?? "Product";
  const label = quarterLabel(labelPrefix, period.quarter, period.year);

  const handleSave = (epicKey: string, patch: Partial<EpicOverlay>) =>
    saveMutation.mutate({ epicKey, patch });

  const readyFilterActive = filters.signal === "ready";

  return (
    <div className="min-h-full">
      <Header
        labelPrefix={labelPrefix}
        quarter={period.quarter}
        year={period.year}
        currentYear={configQuery.data?.currentYear ?? now.year}
        onChange={setPeriod}
        onRefresh={() => epicsQuery.refetch()}
        isFetching={epicsQuery.isFetching}
      />

      <main className="mx-auto max-w-[1400px] space-y-4 px-4 py-5">
        {epicsQuery.isError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Couldn't load epics from Jira.</p>
              <p className="mt-0.5 text-red-700">
                {(epicsQuery.error as Error)?.message}
              </p>
              <p className="mt-1 text-red-600">
                Check that <code>.env</code> has valid <code>JIRA_BASE_URL</code>,{" "}
                <code>JIRA_EMAIL</code> and <code>JIRA_API_TOKEN</code>, then
                refresh.
              </p>
            </div>
          </div>
        )}

        <StatCards
          stats={stats}
          readyFilterActive={readyFilterActive}
          onToggleReady={() =>
            setFilters((f) => ({
              ...f,
              signal: f.signal === "ready" ? "" : "ready",
            }))
          }
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Filters filters={filters} projects={projects} onChange={setFilters} />
          <button
            onClick={() =>
              downloadCsv(`${label}_gtm.csv`, rowsToCsv(visibleRows))
            }
            disabled={visibleRows.length === 0}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>

        {epicsQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-20 text-slate-500">
            <Loader2 size={18} className="animate-spin" /> Loading {label}…
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{visibleRows.length}</span>{" "}
              of {rows.length} epics for{" "}
              <span className="font-mono text-slate-700">{label}</span>
            </p>
            <DashboardTable
              rows={visibleRows}
              onSave={handleSave}
              onSelect={(r) => setSelectedKey(r.key)}
            />
          </>
        )}
      </main>

      <EpicDetailDrawer
        row={selected}
        onClose={() => setSelectedKey(null)}
        onSave={handleSave}
      />
    </div>
  );
}
