export interface JiraEpic {
  key: string;
  url: string;
  summary: string;
  epicName?: string;
  status: string;
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

export type TshirtSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "";

export type Domain = "Payments" | "Contingent" | "EOR" | "Payroll" | "Other";

export interface EpicOverlay {
  epicKey: string;
  domain?: Domain | "";
  tshirtSize?: TshirtSize;
  productOpsOwner?: string;
  gtmOwner?: string;
  productOpsDone?: boolean;
  gtmDone?: boolean;
  notRelevantForRollout?: boolean;
  gtmLabels?: string[];
  aeAmNotes?: string;
  gtmVisible?: boolean;
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface EpicsResponse {
  label: string;
  quarter: number;
  year: number;
  epics: JiraEpic[];
  overlays: Record<string, EpicOverlay>;
}

export interface AppConfig {
  labelPrefix: string;
  epicsOnly: boolean;
  currentQuarter: number;
  currentYear: number;
  exampleLabel: string;
}

/** An epic joined with its GTM/ProductOps overlay — the row model the UI works with. */
export interface EpicRow extends JiraEpic {
  overlay: EpicOverlay;
}
