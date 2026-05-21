"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  CareLog,
  CareLogInput,
  CaregiverProfile,
  ChildProfile,
  PeacefulParentsState,
  AmbientSoundSettings,
  ParentId,
  PreferredReorderDay,
  PreferredRetailer,
  RoutineSettings,
  SupplyInput,
  SupplyItem,
  SupplyStatus,
  Task,
  TaskInput,
  TurnInput,
  TurnItem
} from "@/lib/types";

const STORAGE_KEY = "peacefulparents-state-v1";

type PeacefulParentsActions = {
  ready: boolean;
  addCareLog: (input: CareLogInput) => void;
  updateCareLog: (id: string, input: CareLogInput) => void;
  deleteCareLog: (id: string) => void;
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addTurn: (input: TurnInput) => void;
  updateTurn: (id: string, input: TurnInput) => void;
  deleteTurn: (id: string) => void;
  completeTurn: (id: string) => void;
  addSupply: (input: SupplyInput) => void;
  updateSupply: (id: string, input: SupplyInput) => void;
  deleteSupply: (id: string) => void;
  toggleSupply: (id: string) => void;
  addChild: (name: string, birthDate: string) => void;
  updateChild: (id: string, child: Omit<ChildProfile, "id">) => void;
  deleteChild: (id: string) => void;
  addCaregiver: (name: string) => void;
  updateCaregiver: (id: string, caregiver: Omit<CaregiverProfile, "id">) => void;
  deleteCaregiver: (id: string) => void;
  updateRoutines: (routines: RoutineSettings) => void;
  updateAmbientSound: (settings: AmbientSoundSettings) => void;
  setDarkMode: (darkMode: boolean) => void;
  resetDemoData: () => void;
};

type PeacefulParentsContextValue = PeacefulParentsState & PeacefulParentsActions;

const PeacefulParentsContext = createContext<PeacefulParentsContextValue | null>(null);

const parentColors = ["#7fa79a", "#8aa6bc", "#d0a36c", "#a99b87", "#9b8fa8"];

function id(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

function todayAt(hour: number, minute = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function createInitialState(): PeacefulParentsState {
  const caregivers: CaregiverProfile[] = [
    { id: "parent-a", name: "Maya", color: "#7fa79a" },
    { id: "parent-b", name: "Jon", color: "#8aa6bc" }
  ];
  const children: ChildProfile[] = [{ id: "child-1", name: "Riley", birthDate: "2025-11-18" }];

  return {
    children,
    caregivers,
    darkMode: false,
    ambientSound: {
      enabled: false,
      selected: "rain",
      volume: 30
    },
    routines: {
      feedingEveryHours: 3,
      napWindowHours: 2,
      medicineWindowHours: 8,
      bedtime: "19:30"
    },
    careLogs: [
      {
        id: "log-feed-1",
        childId: "child-1",
        type: "feeding",
        occurredAt: hoursAgo(2.25),
        detail: "Bottle, 4 oz",
        notes: "Finished most of it."
      },
      {
        id: "log-diaper-1",
        childId: "child-1",
        type: "diaper",
        occurredAt: hoursAgo(1.4),
        detail: "Wet",
        notes: ""
      },
      {
        id: "log-sleep-1",
        childId: "child-1",
        type: "sleep",
        occurredAt: hoursAgo(0.6),
        detail: "Nap started",
        notes: "White noise on."
      }
    ],
    tasks: [
      {
        id: "task-1",
        title: "Wash bottles",
        assignedTo: "parent-a",
        dueAt: hoursFromNow(1),
        recurring: "daily",
        category: "baby",
        completed: false
      },
      {
        id: "task-2",
        title: "Move laundry",
        assignedTo: "parent-b",
        dueAt: hoursAgo(0.5),
        recurring: "none",
        category: "home",
        completed: false
      },
      {
        id: "task-3",
        title: "Book pediatrician follow-up",
        assignedTo: "parent-a",
        dueAt: todayAt(17),
        recurring: "none",
        category: "admin",
        completed: false
      }
    ],
    turns: [
      { id: "turn-1", title: "Night wake-up", currentCaregiverId: "parent-b", completedCount: 6 },
      { id: "turn-2", title: "Dishes", currentCaregiverId: "parent-a", completedCount: 12 },
      { id: "turn-3", title: "Bath", currentCaregiverId: "parent-b", completedCount: 4 },
      { id: "turn-4", title: "Bedtime", currentCaregiverId: "parent-a", completedCount: 8 }
    ],
    supplies: [
      {
        id: "supply-1",
        name: "Size 3 diapers",
        category: "diapers",
        quantity: 12,
        threshold: 20,
        status: "running-low",
        preferredRetailer: "target",
        notes: "Overnight box is in the closet.",
        productLink: "",
        restockFrequencyDays: 14,
        preferredReorderDay: "sunday",
        lastRestockedAt: daysAgo(10),
        reminderEnabled: true,
        autoReorderEnabled: false,
        checked: false
      },
      {
        id: "supply-2",
        name: "Sensitive wipes",
        category: "wipes",
        quantity: 2,
        threshold: 2,
        status: "running-low",
        preferredRetailer: "amazon",
        notes: "Fragrance-free only.",
        productLink: "",
        restockFrequencyDays: 12,
        preferredReorderDay: "wednesday",
        lastRestockedAt: daysAgo(9),
        reminderEnabled: true,
        autoReorderEnabled: false,
        checked: false
      },
      {
        id: "supply-3",
        name: "Formula",
        category: "formula",
        quantity: 1,
        threshold: 2,
        status: "running-low",
        preferredRetailer: "walmart",
        notes: "Keep one unopened backup can.",
        productLink: "",
        restockFrequencyDays: 7,
        preferredReorderDay: "monday",
        lastRestockedAt: daysAgo(6),
        reminderEnabled: true,
        autoReorderEnabled: false,
        checked: false
      },
      {
        id: "supply-4",
        name: "Banana pouches",
        category: "baby-food",
        quantity: 5,
        threshold: 3,
        status: "normal",
        preferredRetailer: "target",
        notes: "",
        productLink: "",
        restockFrequencyDays: 10,
        preferredReorderDay: "friday",
        lastRestockedAt: daysAgo(3),
        reminderEnabled: true,
        autoReorderEnabled: false,
        checked: false
      },
      {
        id: "supply-5",
        name: "Dish tabs",
        category: "household",
        quantity: 9,
        threshold: 8,
        status: "normal",
        preferredRetailer: "none",
        notes: "",
        productLink: "",
        restockFrequencyDays: 30,
        preferredReorderDay: "any",
        lastRestockedAt: daysAgo(11),
        reminderEnabled: false,
        autoReorderEnabled: false,
        checked: true
      }
    ]
  };
}

function getNextCaregiverId(caregivers: CaregiverProfile[], currentId: ParentId) {
  const index = caregivers.findIndex((caregiver) => caregiver.id === currentId);
  return caregivers[(index + 1 + caregivers.length) % caregivers.length]?.id ?? currentId;
}

function hydrateState(saved: PeacefulParentsState): PeacefulParentsState {
  const defaults = createInitialState();
  return {
    ...defaults,
    ...saved,
    routines: { ...defaults.routines, ...saved.routines },
    ambientSound: { ...defaults.ambientSound, ...saved.ambientSound },
    supplies: (saved.supplies ?? defaults.supplies).map(normalizeSupply)
  };
}

function normalizeSupply(supply: Partial<SupplyItem> & Pick<SupplyItem, "id" | "name">): SupplyItem {
  const quantity = Number(supply.quantity ?? 0);
  const threshold = Number(supply.threshold ?? 1);
  const savedCategory = supply.category as unknown;
  const category = savedCategory === "food" ? "baby-food" : savedCategory;
  const status = supply.status ?? getSupplyStatus(quantity, threshold);
  const preferredRetailer = supply.preferredRetailer ?? "none";
  const preferredReorderDay = supply.preferredReorderDay ?? "any";

  return {
    id: supply.id,
    name: supply.name,
    category: isSupplyCategory(category) ? category : "household",
    quantity,
    threshold,
    status: isSupplyStatus(status) ? status : getSupplyStatus(quantity, threshold),
    preferredRetailer: isPreferredRetailer(preferredRetailer) ? preferredRetailer : "none",
    notes: supply.notes ?? "",
    productLink: supply.productLink ?? "",
    restockFrequencyDays: Math.max(0, Number(supply.restockFrequencyDays ?? getDefaultRestockFrequency(category))),
    preferredReorderDay: isPreferredReorderDay(preferredReorderDay) ? preferredReorderDay : "any",
    lastRestockedAt: supply.lastRestockedAt ?? new Date().toISOString(),
    reminderEnabled: supply.reminderEnabled ?? true,
    autoReorderEnabled: false,
    checked: Boolean(supply.checked)
  };
}

function getDefaultRestockFrequency(category: unknown) {
  if (category === "formula") return 7;
  if (category === "diapers") return 14;
  if (category === "wipes") return 12;
  if (category === "household") return 30;
  return 10;
}

function getSupplyStatus(quantity: number, threshold: number): SupplyStatus {
  if (quantity <= 0) return "out";
  if (quantity <= threshold) return "running-low";
  return "normal";
}

function isSupplyCategory(category: unknown): category is SupplyItem["category"] {
  return (
    category === "diapers" ||
    category === "wipes" ||
    category === "formula" ||
    category === "baby-food" ||
    category === "bottles" ||
    category === "pacifiers" ||
    category === "medicine" ||
    category === "household" ||
    category === "snacks"
  );
}

function isSupplyStatus(status: unknown): status is SupplyStatus {
  return status === "normal" || status === "running-low" || status === "out";
}

function isPreferredRetailer(retailer: unknown): retailer is PreferredRetailer {
  return retailer === "none" || retailer === "amazon" || retailer === "walmart" || retailer === "target";
}

function isPreferredReorderDay(day: unknown): day is PreferredReorderDay {
  return (
    day === "any" ||
    day === "monday" ||
    day === "tuesday" ||
    day === "wednesday" ||
    day === "thursday" ||
    day === "friday" ||
    day === "saturday" ||
    day === "sunday"
  );
}

export function PeacefulParentsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PeacefulParentsState>(() => createInitialState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(hydrateState(JSON.parse(saved) as PeacefulParentsState));
      } catch {
        setState(createInitialState());
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.classList.toggle("dark", state.darkMode);
  }, [ready, state]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.darkMode);
  }, [state.darkMode]);

  const actions = useMemo<PeacefulParentsActions>(
    () => ({
      ready,
      addCareLog: (input) => setState((current) => ({ ...current, careLogs: [{ ...input, id: id("log") }, ...current.careLogs] })),
      updateCareLog: (logId, input) =>
        setState((current) => ({
          ...current,
          careLogs: current.careLogs.map((log) => (log.id === logId ? { ...input, id: logId } : log))
        })),
      deleteCareLog: (logId) =>
        setState((current) => ({ ...current, careLogs: current.careLogs.filter((log) => log.id !== logId) })),
      addTask: (input) =>
        setState((current) => ({ ...current, tasks: [{ ...input, id: id("task"), completed: false }, ...current.tasks] })),
      updateTask: (taskId, input) =>
        setState((current) => ({
          ...current,
          tasks: current.tasks.map((task) =>
            task.id === taskId ? { ...task, ...input, completedAt: task.completed ? task.completedAt : undefined } : task
          )
        })),
      deleteTask: (taskId) =>
        setState((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== taskId) })),
      toggleTask: (taskId) =>
        setState((current) => ({
          ...current,
          tasks: current.tasks.map((task) =>
            task.id === taskId
              ? { ...task, completed: !task.completed, completedAt: task.completed ? undefined : new Date().toISOString() }
              : task
          )
        })),
      addTurn: (input) =>
        setState((current) => ({ ...current, turns: [{ ...input, id: id("turn"), completedCount: 0 }, ...current.turns] })),
      updateTurn: (turnId, input) =>
        setState((current) => ({
          ...current,
          turns: current.turns.map((turn) => (turn.id === turnId ? { ...turn, ...input } : turn))
        })),
      deleteTurn: (turnId) =>
        setState((current) => ({ ...current, turns: current.turns.filter((turn) => turn.id !== turnId) })),
      completeTurn: (turnId) =>
        setState((current) => ({
          ...current,
          turns: current.turns.map((turn) =>
            turn.id === turnId
              ? {
                  ...turn,
                  currentCaregiverId: getNextCaregiverId(current.caregivers, turn.currentCaregiverId),
                  completedCount: turn.completedCount + 1,
                  lastCompletedAt: new Date().toISOString()
                }
              : turn
          )
        })),
      addSupply: (input) =>
        setState((current) => ({
          ...current,
          supplies: [normalizeSupply({ ...input, id: id("supply"), checked: false }), ...current.supplies]
        })),
      updateSupply: (supplyId, input) =>
        setState((current) => ({
          ...current,
          supplies: current.supplies.map((supply) => (supply.id === supplyId ? normalizeSupply({ ...supply, ...input }) : supply))
        })),
      deleteSupply: (supplyId) =>
        setState((current) => ({ ...current, supplies: current.supplies.filter((supply) => supply.id !== supplyId) })),
      toggleSupply: (supplyId) =>
        setState((current) => ({
          ...current,
          supplies: current.supplies.map((supply) => (supply.id === supplyId ? { ...supply, checked: !supply.checked } : supply))
        })),
      addChild: (name, birthDate) =>
        setState((current) => ({ ...current, children: [...current.children, { id: id("child"), name, birthDate }] })),
      updateChild: (childId, child) =>
        setState((current) => ({
          ...current,
          children: current.children.map((item) => (item.id === childId ? { ...child, id: childId } : item))
        })),
      deleteChild: (childId) =>
        setState((current) => ({
          ...current,
          children: current.children.length <= 1 ? current.children : current.children.filter((child) => child.id !== childId),
          careLogs: current.careLogs.filter((log) => log.childId !== childId)
        })),
      addCaregiver: (name) =>
        setState((current) => ({
          ...current,
          caregivers: [
            ...current.caregivers,
            { id: id("caregiver"), name, color: parentColors[current.caregivers.length % parentColors.length] }
          ]
        })),
      updateCaregiver: (caregiverId, caregiver) =>
        setState((current) => ({
          ...current,
          caregivers: current.caregivers.map((item) => (item.id === caregiverId ? { ...caregiver, id: caregiverId } : item))
        })),
      deleteCaregiver: (caregiverId) =>
        setState((current) => {
          if (current.caregivers.length <= 2) return current;
          const fallback = current.caregivers.find((caregiver) => caregiver.id !== caregiverId)?.id ?? caregiverId;
          return {
            ...current,
            caregivers: current.caregivers.filter((caregiver) => caregiver.id !== caregiverId),
            tasks: current.tasks.map((task) => (task.assignedTo === caregiverId ? { ...task, assignedTo: fallback } : task)),
            turns: current.turns.map((turn) =>
              turn.currentCaregiverId === caregiverId ? { ...turn, currentCaregiverId: fallback } : turn
            )
          };
        }),
      updateRoutines: (routines) => setState((current) => ({ ...current, routines })),
      updateAmbientSound: (ambientSound) => setState((current) => ({ ...current, ambientSound })),
      setDarkMode: (darkMode) => setState((current) => ({ ...current, darkMode })),
      resetDemoData: () => setState(createInitialState())
    }),
    [ready]
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return <PeacefulParentsContext.Provider value={value}>{children}</PeacefulParentsContext.Provider>;
}

export function usePeacefulParents() {
  const context = useContext(PeacefulParentsContext);
  if (!context) {
    throw new Error("usePeacefulParents must be used inside PeacefulParentsProvider");
  }
  return context;
}

export function useCaregiverName(id: ParentId) {
  const { caregivers } = usePeacefulParents();
  return useCallback(() => caregivers.find((caregiver) => caregiver.id === id)?.name ?? "Someone", [caregivers, id]);
}
