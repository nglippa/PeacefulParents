"use client";

import Link from "next/link";
import { Baby, Bed, ClipboardCheck, Milk, Pill, Plus, RotateCcw, ShieldCheck } from "lucide-react";
import { Button, Card, Pill as StatusPill, SectionTitle } from "@/components/ui";
import { usePeacefulParents } from "@/lib/store";
import { caregiverName, careLabel, childName, formatTime, getNextItems, getTodayLogs, isOverdue, relativeDue } from "@/lib/utils";
import type { CareType } from "@/lib/types";

const quickActions: Array<{ label: string; type: CareType; detail: string; icon: typeof Milk }> = [
  { label: "Feed", type: "feeding", detail: "Quick bottle", icon: Milk },
  { label: "Diaper", type: "diaper", detail: "Wet", icon: Baby },
  { label: "Nap", type: "sleep", detail: "Nap started", icon: Bed },
  { label: "Medicine", type: "medicine", detail: "Dose given", icon: Pill }
];

const calmNotes = [
  "You're doing great.",
  "One bottle at a time.",
  "Tiny humans. Big effort.",
  "Tonight's mission: survive gracefully."
];

export default function DashboardPage() {
  const state = usePeacefulParents();
  const todayLogs = getTodayLogs(state.careLogs);
  const nextItems = getNextItems(state);
  const openTasks = state.tasks.filter((task) => !task.completed).sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));
  const onDuty = state.turns[0];
  const primaryChild = state.children[0];
  const calmNote = calmNotes[todayLogs.length % calmNotes.length];

  function quickLog(type: CareType, detail: string) {
    if (!primaryChild) return;
    state.addCareLog({
      childId: primaryChild.id,
      type,
      occurredAt: new Date().toISOString(),
      detail,
      notes: "Logged from dashboard."
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="grid gap-5">
        <Card className="overflow-hidden p-0 text-[#fff7e8]">
          <div className="relative overflow-hidden rounded-[1.55rem] bg-[linear-gradient(145deg,#405666,#273946)] p-5 dark:bg-[linear-gradient(145deg,#2b3942,#202a31)]">
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#d0a36c]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-6 h-52 w-52 rounded-full bg-[#9ab7aa]/16 blur-3xl" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white/65">Family command center</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight">A calmer night, one step at a time.</h1>
                <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-white/68">{calmNote}</p>
              </div>
              <StatusPill className="bg-[#f2dfbb]/90 text-[#35434a]">{todayLogs.length} logs</StatusPill>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => quickLog(action.type, action.detail)}
                    className="grid min-h-24 place-items-center rounded-3xl bg-white/10 p-3 text-center font-black transition duration-300 hover:bg-white/15 active:scale-[0.99]"
                  >
                    <Icon size={25} />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Rhythm" title="Today" action={<Link className="text-sm font-black pp-accent" href="/tasks">See tasks</Link>} />
          <div className="grid gap-3">
            {nextItems.slice(0, 5).map((item) => (
              <div key={`${item.label}-${item.at}`} className="pp-soft-surface flex items-center justify-between gap-3 rounded-2xl p-3">
                <div>
                  <p className="font-black pp-ink">{item.label}</p>
                  <p className="text-sm font-semibold pp-muted">{item.detail}</p>
                </div>
                <div className="text-right">
                  <p className="font-black">{formatTime(item.at)}</p>
                  <p className="text-xs font-black pp-accent">{relativeDue(item.at)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Soft record" title="Latest care" action={<Link className="text-sm font-black pp-accent" href="/tracker">Edit logs</Link>} />
          <div className="grid gap-3">
            {todayLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-2xl border border-[var(--pp-line)] p-3">
                <div>
                  <p className="font-black pp-ink">{careLabel(log.type)}: {log.detail}</p>
                  <p className="text-sm font-semibold pp-muted">{childName(state, log.childId)}</p>
                </div>
                <p className="text-sm font-black pp-muted">{formatTime(log.occurredAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 content-start">
        <Card>
          <SectionTitle eyebrow="Next gentle nudge" title={nextItems[0]?.label ?? "No alarms"} />
          <div className="rounded-3xl bg-[#f2ead7]/75 p-4 dark:bg-[#443b2c]/45">
            <p className="text-4xl font-black pp-ink">{nextItems[0] ? relativeDue(nextItems[0].at) : "clear"}</p>
            <p className="mt-1 text-sm font-bold pp-muted">{nextItems[0]?.detail ?? "Everyone gets one tiny exhale."}</p>
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="On duty" title={onDuty ? caregiverName(state, onDuty.currentCaregiverId) : "Shared"} />
          <div className="pp-soft-surface flex items-center gap-3 rounded-3xl p-4">
            <ShieldCheck className="text-[var(--pp-accent-2)]" size={30} />
            <div>
              <p className="font-black pp-ink">{onDuty?.title ?? "Everything"}</p>
              <p className="text-sm font-semibold pp-muted">Rotate responsibilities from the Turns page.</p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Open tasks" title={`${openTasks.length} waiting`} />
          <div className="grid gap-2">
            {openTasks.slice(0, 4).map((task) => (
              <button
                key={task.id}
                onClick={() => state.toggleTask(task.id)}
                className="pp-soft-surface flex min-h-14 items-center justify-between gap-3 rounded-2xl px-3 text-left transition duration-300 hover:opacity-90"
              >
                <span className="font-black">{task.title}</span>
                <span className={isOverdue(task) ? "text-xs font-black text-[#9d7b5b] dark:text-[#d0a36c]" : "text-xs font-black pp-muted"}>
                  {isOverdue(task) ? `${task.title} is still waiting` : relativeDue(task.dueAt)}
                </span>
              </button>
            ))}
            <Button variant="secondary" className="mt-2" asChild>
              <Link href="/tasks" className="flex items-center gap-2">
                <Plus size={18} /> Manage tasks
              </Link>
            </Button>
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Supplies" title="A few things to replenish" />
          <div className="grid gap-2">
            {state.supplies.filter((item) => item.quantity <= item.threshold).slice(0, 4).map((item) => (
              <Link key={item.id} href="/supplies" className="flex min-h-12 items-center justify-between rounded-2xl bg-[#f0e5d7]/75 px-3 font-bold text-[#765f4c] dark:bg-[#4c3b32]/55 dark:text-[#ead7c2]">
                <span>{item.name}</span>
                <span>{item.quantity} left</span>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
