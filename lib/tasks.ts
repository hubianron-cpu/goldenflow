export const TASK_STATUSES = ["פתוחה", "בתהליך", "הושלמה", "נדחתה"] as const;
export const TASK_PRIORITIES = ["נמוכה", "בינונית", "גבוהה", "דחוף"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export function normalizeTaskStatus(status?: string | null): TaskStatus {
  if (status === "open") {
    return "פתוחה";
  }

  if (status === "done") {
    return "הושלמה";
  }

  return TASK_STATUSES.includes(status as TaskStatus) ? (status as TaskStatus) : "פתוחה";
}

export function normalizeTaskPriority(priority?: string | null): TaskPriority {
  return TASK_PRIORITIES.includes(priority as TaskPriority) ? (priority as TaskPriority) : "בינונית";
}
