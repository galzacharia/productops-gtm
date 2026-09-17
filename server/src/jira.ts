import { config } from "./config.js";
import type { JiraEpic } from "./types.js";

/** Fields we ask Jira for. Keeps the payload small and predictable. */
function requestedFields(): string[] {
  const f = config.fields;
  return [
    "summary",
    "status",
    "issuetype",
    "project",
    "assignee",
    "priority",
    "labels",
    "duedate",
    "updated",
    "fixVersions",
    f.epicName,
    f.epicStatus,
    f.executiveStatus,
    f.productManager,
    f.pmOwner,
    f.storyPoints,
    f.targetQuarter,
    f.targetStart,
    f.targetEnd,
  ];
}

function authHeader(): string {
  const token = Buffer.from(
    `${config.jira.email}:${config.jira.apiToken}`,
  ).toString("base64");
  return `Basic ${token}`;
}

/** Jira custom fields come in many shapes; pull a human string out of any of them. */
function readString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value || undefined;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const parts = value.map(readString).filter(Boolean) as string[];
    return parts.length ? parts.join(", ") : undefined;
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    return (
      readString(o.displayName) ??
      readString(o.value) ??
      readString(o.name) ??
      undefined
    );
  }
  return undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !isNaN(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function normalizeStatusCategory(name?: string): JiraEpic["statusCategory"] {
  const n = (name ?? "").toLowerCase();
  if (n.includes("done") || n === "complete") return "Done";
  if (n.includes("progress") || n === "indeterminate") return "In Progress";
  return "To Do";
}

function mapIssue(issue: any): JiraEpic {
  const f = issue.fields ?? {};
  const cf = config.fields;
  return {
    key: issue.key,
    url: `${config.jira.baseUrl}/browse/${issue.key}`,
    summary: f.summary ?? "",
    epicName: readString(f[cf.epicName]),
    status: f.status?.name ?? "Unknown",
    statusCategory: normalizeStatusCategory(f.status?.statusCategory?.name),
    epicStatus: readString(f[cf.epicStatus]),
    executiveStatus: readString(f[cf.executiveStatus]),
    project: f.project?.name ?? "",
    projectKey: f.project?.key ?? "",
    assignee: readString(f.assignee),
    productManager: readString(f[cf.productManager]),
    pmOwner: readString(f[cf.pmOwner]),
    storyPoints: readNumber(f[cf.storyPoints]),
    targetQuarter: readString(f[cf.targetQuarter]),
    fixVersions: Array.isArray(f.fixVersions)
      ? f.fixVersions.map((v: any) => v?.name).filter(Boolean)
      : [],
    labels: Array.isArray(f.labels) ? f.labels : [],
    priority: readString(f.priority),
    dueDate: f.duedate ?? undefined,
    targetStart: readString(f[cf.targetStart]),
    targetEnd: readString(f[cf.targetEnd]),
    updated: f.updated ?? "",
  };
}

export interface FetchEpicsResult {
  label: string;
  epics: JiraEpic[];
}

/**
 * Fetch every issue carrying `label` using Jira's enhanced JQL search
 * (POST /rest/api/3/search/jql), paginating via nextPageToken.
 */
export async function fetchEpicsByLabel(label: string): Promise<JiraEpic[]> {
  const jqlParts = [`labels = "${label}"`];
  if (config.epicsOnly) jqlParts.push("issuetype = Epic");
  const jql = `${jqlParts.join(" AND ")} ORDER BY status ASC, updated DESC`;

  const url = `${config.jira.baseUrl}/rest/api/3/search/jql`;
  const fields = requestedFields();
  const epics: JiraEpic[] = [];
  let nextPageToken: string | undefined;

  do {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jql,
        fields,
        maxResults: 100,
        ...(nextPageToken ? { nextPageToken } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new JiraError(
        res.status,
        `Jira search failed (${res.status}): ${body.slice(0, 500)}`,
      );
    }

    const data = (await res.json()) as {
      issues?: any[];
      nextPageToken?: string;
    };
    for (const issue of data.issues ?? []) epics.push(mapIssue(issue));
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return epics;
}

export class JiraError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "JiraError";
    this.status = status;
  }
}
