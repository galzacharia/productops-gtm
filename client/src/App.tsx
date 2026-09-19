import { useMemo, useState } from "react";
import { AlertTriangle, Download, Loader2 } from "lucide-react";
import { Header } from "./components/Header";
import { StatCards, computeStats } from "./components/StatCards";
import { Filters } from "./components/Filters";
import { DomainTabs, type DomainTab } from "./components/DomainTabs";
import { ViewSwitch } from "./components/ViewSwitch";
import { DashboardTable } from "./components/DashboardTable";
import { EpicDetailDrawer } from "./components/EpicDetailDrawer";
import { useAppConfig, useEpics, useSaveOverlay, toRows } from "./hooks/useEpics";
import {
  baseRows,
  emptyFilters,
  inDomain,
  type ViewMode,
} from "./lib/filters";
import { signalMeta } from "./lib/onboarding";
import { domainOf } from "./lib/domain";
import { DOMAINS } from "./lib/options";
import { currentQuarter, quarterLabel } from "./lib/quarter";
import { downloadCsv, rowsToCsv } from "./lib/csv";
import type { EpicOverlay, EpicRow } from "./types";

export default function App() {
  const configQuery = useAppConfig();
  const now = currentQuarter();

  const [period, setPeriod] = useState({ quarter: now.quarter, year: now.year });
  const [filters, setFilters] = useState(emptyFilters);
  const [view, setView] = useState<ViewMode>("active");
  const [domain, setDomain] = useState<DomainTab>("All");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const epicsQuery = useEpics(period.quarter, period.year);
  const saveMutation = useSaveOverlay(period.quarter, period.year);

  const rows = useMemo(() => toRows(epicsQuery.data), [epicsQuery.data]);

  const base = useMemo(() => baseRows(rows, view, filters), [rows, view, filters]);

  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = { All: base.length };
    DOMAINS.forEach((d) => (counts[d] = 0));
    base.forEach((r) => {
      const d = domainOf(r);
      counts[d] = (counts[d] ?? 0) + 1;
    });
    return counts;
  }, [base]);

  const visibleRows = useMemo(() => {
    const filtered = base.filter((r) => inDomain(r, domain));
    return [...filtered].sort((a, b) => {
      const u = signalMeta(b).urgency - signalMeta(a).urgency;
      if (u !== 0) return u;
      return (b.updated ?? "").localeCompare(a.updated ?? "");
    });
  }, [base, domain]);

  const stats = useMemo(
    () => computeStats(rows.filter((r) => inDomain(r, domain))),
    [rows, domain],
  );

  const selected: EpicRow | null =
    rows.find((r) => r.key === selectedKey) ?? null;

  const labelPrefix = configQuery.data?.labelPrefix ?? "Product";
  const label = quarterLabel(labelPrefix, period.quarter, period.year);

  const handleSave = (epicKey: string, patch: Partial<EpicOverlay>) =>
    saveMutation.mutate({ epicKey, patch });

  const scopeLabel = domain === "All" ? "Epics in play" : `${domain} epics`;

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
              <p className="mt-0.5 text-red-700">{(epicsQuery.error as Error)?.message}</p>
              <p className="mt-1 text-red-600">
                Check that <code>.env</code> has valid <code>JIRA_BASE_URL</code>,{" "}
                <code>JIRA_EMAIL</code> and <code>JIRA_API_TOKEN</code>, then refresh.
              </p>
            </div>
          </div>
        )}

        <DomainTabs current={domain} counts={domainCounts} onChange={setDomain} />

        <StatCards stats={stats} scopeLabel={scopeLabel} />

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <ViewSwitch view={view} onChange={setView} />
          <div className="flex flex-wrap items-center gap-2">
            <Filters filters={filters} onChange={setFilters} />
            <button
              onClick={() => downloadCsv(`${label}_gtm.csv`, rowsToCsv(visibleRows))}
              disabled={visibleRows.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {epicsQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-20 text-slate-500">
            <Loader2 size={18} className="animate-spin" /> Loading {label}…
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{visibleRows.length}</span> epics
              {domain !== "All" && (
                <>
                  {" "}in <span className="font-medium text-slate-700">{domain}</span>
                </>
              )}{" "}
              · <span className="capitalize">{view === "notrelevant" ? "not relevant" : view}</span> view ·{" "}
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
