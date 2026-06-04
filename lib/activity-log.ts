import { ActivityEntry } from "@/types/activity";

let activityLog: ActivityEntry[] = [];
let listeners: (() => void)[] = [];

export function addActivityEntry(entry: Omit<ActivityEntry, "id">) {
  const newEntry: ActivityEntry = {
    ...entry,
    id: crypto.randomUUID(),
  };
  activityLog = [newEntry, ...activityLog].slice(0, 500);
  listeners.forEach((fn) => fn());
}

export function getActivityLog(): ActivityEntry[] {
  return activityLog;
}

export function clearActivityLog() {
  activityLog = [];
  listeners.forEach((fn) => fn());
}

export function subscribeToActivityLog(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
