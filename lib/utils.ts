import { clsx, type ClassValue } from "clsx";
import type { CareLog, CareType, DadModeState, Task } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function toDatetimeLocal(date: string | Date) {
  const value = typeof date === "string" ? new Date(date) : date;
  const offset = value.getTimezoneOffset();
  const local = new Date(value.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function fromDatetimeLocal(value: string) {
  return new Date(value).toISOString();
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function minutesUntil(value: string) {
  return Math.round((new Date(value).getTime() - Date.now()) / 60000);
}

export function relativeDue(value: string) {
  const minutes = minutesUntil(value);
  const abs = Math.abs(minutes);
  const amount = abs < 60 ? `${abs}m` : `${Math.round(abs / 60)}h`;
  if (minutes < -1) return `${amount} overdue`;
  if (minutes <= 1) return "now";
  return `in ${amount}`;
}

export function careLabel(type: CareType) {
  const labels: Record<CareType, string> = {
    feeding: "Feeding",
    diaper: "Diaper",
    sleep: "Sleep",
    medicine: "Medicine",
    note: "Note"
  };
  return labels[type];
}

export function careAccent(type: CareType) {
  const accents: Record<CareType, string> = {
    feeding: "bg-rose-50 text-rose-700",
    diaper: "bg-sky-50 text-sky-700",
    sleep: "bg-violet-50 text-violet-700",
    medicine: "bg-emerald-50 text-emerald-700",
    note: "bg-amber-50 text-amber-700"
  };
  return accents[type];
}

export function isOverdue(task: Task) {
  return !task.completed && new Date(task.dueAt).getTime() < Date.now();
}

export function getTodayLogs(logs: CareLog[]) {
  return logs
    .filter((log) => isToday(log.occurredAt))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export function getNextItems(state: DadModeState) {
  const openTasks = state.tasks.filter((task) => !task.completed).sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));
  const latestFeed = state.careLogs
    .filter((log) => log.type === "feeding")
    .sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt))[0];
  const latestSleep = state.careLogs
    .filter((log) => log.type === "sleep")
    .sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt))[0];
  const latestMedicine = state.careLogs
    .filter((log) => log.type === "medicine")
    .sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt))[0];

  const predicted = [
    latestFeed && {
      label: "Next feeding",
      at: new Date(new Date(latestFeed.occurredAt).getTime() + state.routines.feedingEveryHours * 3600000).toISOString(),
      detail: "Based on last feeding"
    },
    latestSleep && {
      label: "Nap check",
      at: new Date(new Date(latestSleep.occurredAt).getTime() + state.routines.napWindowHours * 3600000).toISOString(),
      detail: "Based on last sleep log"
    },
    latestMedicine && {
      label: "Medicine window",
      at: new Date(new Date(latestMedicine.occurredAt).getTime() + state.routines.medicineWindowHours * 3600000).toISOString(),
      detail: "Based on last medicine"
    },
    ...openTasks.slice(0, 3).map((task) => ({ label: task.title, at: task.dueAt, detail: "Open task" }))
  ].filter(Boolean) as Array<{ label: string; at: string; detail: string }>;

  return predicted.sort((a, b) => +new Date(a.at) - +new Date(b.at));
}

export function childName(state: DadModeState, childId: string) {
  return state.children.find((child) => child.id === childId)?.name ?? "Child";
}

export function caregiverName(state: Pick<DadModeState, "caregivers">, caregiverId: string) {
  return state.caregivers.find((caregiver) => caregiver.id === caregiverId)?.name ?? "Someone";
}
