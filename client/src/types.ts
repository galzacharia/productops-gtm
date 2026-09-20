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

export type TshirtSize = "S" | "M" | "L" | "";

export type Domain = "Payments" | "Contingent" | "EOR" | "Payroll" | "Other";

export type ProductType =
  | "EOR"
  | "Payroll"
  | "WF General"
  | "Contingent"
  | "Contractors"
  | "Other";

export type Audience = "Internal" | "External" | "";

/** Per-task rollout state stored in the overlay, keyed by task id. */
export interface TaskState {
  done?: boolean;
  owner?: string;
}

export interface EpicOverlay {
  epicKey: string;
  domain?: Domain | "";
  productType?: ProductType | "";
  audience?: Audience;
  internalAudiences?: string[];
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
  tasks?: Record<string, TaskState>;
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
