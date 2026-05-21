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

export type AmbientSoundKey = "rain" | "cafe" | "white-noise" | "lofi";
export type AudioTrackKind =
  | "white"
  | "brown"
  | "pink"
  | "rain"
  | "ocean"
  | "fan"
  | "womb"
  | "lofi"
  | "piano"
  | "night";

export type AmbientSoundSettings = {
  enabled: boolean;
  selected: AmbientSoundKey;
  volume: number;
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

export type SupplyCategory =
  | "diapers"
  | "wipes"
  | "formula"
  | "baby-food"
  | "bottles"
  | "pacifiers"
  | "medicine"
  | "household"
  | "snacks";
export type SupplyStatus = "normal" | "running-low" | "out";
export type PreferredRetailer = "none" | "amazon" | "walmart" | "target";
export type PreferredReorderDay =
  | "any"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type SupplyItem = {
  id: string;
  name: string;
  category: SupplyCategory;
  quantity: number;
  threshold: number;
  status: SupplyStatus;
  preferredRetailer: PreferredRetailer;
  notes?: string;
  productLink?: string;
  restockFrequencyDays: number;
  preferredReorderDay: PreferredReorderDay;
  lastRestockedAt?: string;
  reminderEnabled: boolean;
  autoReorderEnabled: boolean;
  checked: boolean;
};

export type PeacefulParentsState = {
  children: ChildProfile[];
  caregivers: CaregiverProfile[];
  routines: RoutineSettings;
  careLogs: CareLog[];
  tasks: Task[];
  turns: TurnItem[];
  supplies: SupplyItem[];
  darkMode: boolean;
  ambientSound: AmbientSoundSettings;
};

export type CareLogInput = Omit<CareLog, "id">;
export type TaskInput = Omit<Task, "id" | "completed" | "completedAt">;
export type TurnInput = Omit<TurnItem, "id" | "completedCount" | "lastCompletedAt">;
export type SupplyInput = Omit<SupplyItem, "id" | "checked">;
