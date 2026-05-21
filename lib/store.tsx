"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  CareLog,
  CareLogInput,
  CaregiverProfile,
  ChildProfile,
  DadModeState,
  ParentId,
  RoutineSettings,
  SupplyInput,
  SupplyItem,
  Task,
  TaskInput,
  TurnInput,
  TurnItem
} from "@/lib/types";

const STORAGE_KEY = "dadmode-state-v1";

type DadModeActions = {
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
  setDarkMode: (darkMode: boolean) => void;
  resetDemoData: () => void;
};

type DadModeContextValue = DadModeState & DadModeActions;

const DadModeContext = createContext<DadModeContextValue | null>(null);

const parentColors = ["#f9735b", "#38bdf8", "#86d3be", "#f5b84b", "#a78bfa"];

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

export function createInitialState(): DadModeState {
  const caregivers: CaregiverProfile[] = [
    { id: "parent-a", name: "Maya", color: "#f9735b" },
    { id: "parent-b", name: "Jon", color: "#38bdf8" }
  ];
  const children: ChildProfile[] = [{ id: "child-1", name: "Riley", birthDate: "2025-11-18" }];

  return {
    children,
    caregivers,
    darkMode: false,
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
      { id: "supply-1", name: "Size 3 diapers", category: "diapers", quantity: 12, threshold: 20, checked: false },
      { id: "supply-2", name: "Sensitive wipes", category: "wipes", quantity: 2, threshold: 2, checked: false },
      { id: "supply-3", name: "Formula", category: "formula", quantity: 1, threshold: 2, checked: false },
      { id: "supply-4", name: "Bananas", category: "food", quantity: 5, threshold: 3, checked: false },
      { id: "supply-5", name: "Dish tabs", category: "household", quantity: 9, threshold: 8, checked: true }
    ]
  };
}

function getNextCaregiverId(caregivers: CaregiverProfile[], currentId: ParentId) {
  const index = caregivers.findIndex((caregiver) => caregiver.id === currentId);
  return caregivers[(index + 1 + caregivers.length) % caregivers.length]?.id ?? currentId;
}

export function DadModeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DadModeState>(() => createInitialState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved) as DadModeState);
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

  const actions = useMemo<DadModeActions>(
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
        setState((current) => ({ ...current, supplies: [{ ...input, id: id("supply"), checked: false }, ...current.supplies] })),
      updateSupply: (supplyId, input) =>
        setState((current) => ({
          ...current,
          supplies: current.supplies.map((supply) => (supply.id === supplyId ? { ...supply, ...input } : supply))
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
      setDarkMode: (darkMode) => setState((current) => ({ ...current, darkMode })),
      resetDemoData: () => setState(createInitialState())
    }),
    [ready]
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return <DadModeContext.Provider value={value}>{children}</DadModeContext.Provider>;
}

export function useDadMode() {
  const context = useContext(DadModeContext);
  if (!context) {
    throw new Error("useDadMode must be used inside DadModeProvider");
  }
  return context;
}

export function useCaregiverName(id: ParentId) {
  const { caregivers } = useDadMode();
  return useCallback(() => caregivers.find((caregiver) => caregiver.id === id)?.name ?? "Someone", [caregivers, id]);
}
