/** Shape of an epic after we normalize it from the raw Jira payload. */
export interface JiraEpic {
  key: string;
  url: string;
  summary: string;
  epicName?: string;
  status: string;
  /** "To Do" | "In Progress" | "Done" — universal across workflows, good for coloring. */
  statusCategory: "To Do" | "In Progress" | "Done";
  epicStatus?: string;
  executiveStatus?: string;
  project: string;
  projectKey: string;
  assignee?: string;
  productManager?: string;
  pmOwner?: string;
  storyPoints?: number;
  targetQuarter?: string;
  fixVersions: string[];
  labels: string[];
  priority?: string;
  dueDate?: string;
  targetStart?: string;
  targetEnd?: string;
  updated: string;
}

/** App-side overlay — the GTM / Product Ops data Jira does not hold. */
export interface EpicOverlay {
  epicKey: string;
  /** Product domain: Payments | Contingent | EOR | Payroll | Other. Empty = auto-guess from Jira. */
  domain?: string;
  tshirtSize?: "XS" | "S" | "M" | "L" | "XL" | "XXL" | "";
  productOpsOwner?: string;
  gtmOwner?: string;
  /** Rollout sign-off from each side. Both true = fully rolled out. */
  productOpsDone?: boolean;
  gtmDone?: boolean;
  /** Excluded from rollout tracking; hidden from the active list. */
  notRelevantForRollout?: boolean;
  gtmLabels?: string[];
  /** Notes surfaced for AE / AM visibility. */
  aeAmNotes?: string;
  /** Whether this epic should be surfaced to AE / AM. */
  gtmVisible?: boolean;
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type OverlayStore = Record<string, EpicOverlay>;
