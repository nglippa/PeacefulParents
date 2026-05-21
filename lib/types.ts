export type CareType = "feeding" | "diaper" | "sleep" | "medicine" | "note";
export type ParentId = string;

export type ChildProfile = {
  id: string;
  name: string;
  birthDate: string;
};

export type CaregiverProfile = {
  id: ParentId;
  name: string;
  color: string;
};

export type RoutineSettings = {
  feedingEveryHours: number;
  napWindowHours: number;
  medicineWindowHours: number;
  bedtime: string;
};

export type CareLog = {
  id: string;
  childId: string;
  type: CareType;
  occurredAt: string;
  detail: string;
  notes?: string;
};

export type Task = {
  id: string;
  title: string;
  assignedTo: ParentId;
  dueAt: string;
  recurring: "none" | "daily" | "weekly";
  category: "baby" | "home" | "admin";
  completed: boolean;
  completedAt?: string;
};

export type TurnItem = {
  id: string;
  title: string;
  currentCaregiverId: ParentId;
  completedCount: number;
  lastCompletedAt?: string;
};

export type SupplyCategory = "diapers" | "wipes" | "formula" | "food" | "household";

export type SupplyItem = {
  id: string;
  name: string;
  category: SupplyCategory;
  quantity: number;
  threshold: number;
  checked: boolean;
};

export type DadModeState = {
  children: ChildProfile[];
  caregivers: CaregiverProfile[];
  routines: RoutineSettings;
  careLogs: CareLog[];
  tasks: Task[];
  turns: TurnItem[];
  supplies: SupplyItem[];
  darkMode: boolean;
};

export type CareLogInput = Omit<CareLog, "id">;
export type TaskInput = Omit<Task, "id" | "completed" | "completedAt">;
export type TurnInput = Omit<TurnItem, "id" | "completedCount" | "lastCompletedAt">;
export type SupplyInput = Omit<SupplyItem, "id" | "checked">;
