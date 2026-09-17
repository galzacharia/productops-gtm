import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getConfig, getEpics, saveOverlay } from "../api";
import type { EpicOverlay, EpicRow, EpicsResponse } from "../types";

export function useAppConfig() {
  return useQuery({ queryKey: ["config"], queryFn: getConfig, staleTime: Infinity });
}

export function useEpics(quarter: number, year: number) {
  return useQuery({
    queryKey: ["epics", quarter, year],
    queryFn: () => getEpics(quarter, year),
    enabled: Number.isInteger(quarter) && Number.isInteger(year),
  });
}

/** Join epics with their overlays into the row model the UI renders. */
export function toRows(data?: EpicsResponse): EpicRow[] {
  if (!data) return [];
  return data.epics.map((epic) => ({
    ...epic,
    overlay: data.overlays[epic.key] ?? { epicKey: epic.key },
  }));
}

/**
 * Save an overlay patch with optimistic update against the active epics query,
 * so inline edits feel instant.
 */
export function useSaveOverlay(quarter: number, year: number) {
  const qc = useQueryClient();
  const key = ["epics", quarter, year];

  return useMutation({
    mutationFn: ({
      epicKey,
      patch,
    }: {
      epicKey: string;
      patch: Partial<EpicOverlay>;
    }) => saveOverlay(epicKey, patch),

    onMutate: async ({ epicKey, patch }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<EpicsResponse>(key);
      if (previous) {
        const overlays = { ...previous.overlays };
        overlays[epicKey] = { ...(overlays[epicKey] ?? { epicKey }), ...patch };
        qc.setQueryData<EpicsResponse>(key, { ...previous, overlays });
      }
      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },

    onSuccess: (saved) => {
      const current = qc.getQueryData<EpicsResponse>(key);
      if (current) {
        qc.setQueryData<EpicsResponse>(key, {
          ...current,
          overlays: { ...current.overlays, [saved.epicKey]: saved },
        });
      }
    },
  });
}
