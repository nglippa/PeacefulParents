"use client";

import Link from "next/link";
import { Baby, Bed, ClipboardCheck, Milk, Pill, Plus, RotateCcw, ShieldCheck } from "lucide-react";
import { Button, Card, Pill as StatusPill, SectionTitle } from "@/components/ui";
import { useDadMode } from "@/lib/store";
import { caregiverName, careLabel, childName, formatTime, getNextItems, getTodayLogs, isOverdue, relativeDue } from "@/lib/utils";
import type { CareType } from "@/lib/types";

const quickActions: Array<{ label: string; type: CareType; detail: string; icon: typeof Milk }> = [
  { label: "Feed", type: "feeding", detail: "Quick bottle", icon: Milk },
  { label: "Diaper", type: "diaper", detail: "Wet", icon: Baby },
  { label: "Nap", type: "sleep", detail: "Nap started", icon: Bed },
  { label: "Medicine", type: "medicine", detail: "Dose given", icon: Pill }
];

export default function DashboardPage() {
  const state = useDadMode();
  const todayLogs = getTodayLogs(state.careLogs);
  const nextItems = getNextItems(state);
  const openTasks = state.tasks.filter((task) => !task.completed).sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));
  const onDuty = state.turns[0];
  const primaryChild = state.children[0];

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
        <Card className="overflow-hidden bg-[#2e2a27] p-0 text-white dark:bg-stone-900">
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white/65">Family command center</p>
                <h1 className="mt-1 text-3xl font-black">Today is under control.</h1>
              </div>
              <StatusPill className="bg-[#86d3be] text-stone-950">{todayLogs.length} logs</StatusPill>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => quickLog(action.type, action.detail)}
                    className="grid min-h-24 place-items-center rounded-3xl bg-white/10 p-3 text-center font-black transition hover:bg-white/15 active:scale-[0.98]"
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
          <SectionTitle eyebrow="Schedule" title="Today" action={<Link className="text-sm font-black text-[#f9735b]" href="/tasks">See tasks</Link>} />
          <div className="grid gap-3">
            {nextItems.slice(0, 5).map((item) => (
              <div key={`${item.label}-${item.at}`} className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 p-3 dark:bg-stone-900">
                <div>
                  <p className="font-black text-stone-950 dark:text-stone-50">{item.label}</p>
                  <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{item.detail}</p>
                </div>
                <div className="text-right">
                  <p className="font-black">{formatTime(item.at)}</p>
                  <p className="text-xs font-black text-[#f9735b]">{relativeDue(item.at)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Timeline" title="Latest care" action={<Link className="text-sm font-black text-[#f9735b]" href="/tracker">Edit logs</Link>} />
          <div className="grid gap-3">
            {todayLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-2xl border border-stone-100 p-3 dark:border-stone-800">
                <div>
                  <p className="font-black text-stone-950 dark:text-stone-50">{careLabel(log.type)}: {log.detail}</p>
                  <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{childName(state, log.childId)}</p>
                </div>
                <p className="text-sm font-black text-stone-500 dark:text-stone-300">{formatTime(log.occurredAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 content-start">
        <Card>
          <SectionTitle eyebrow="Next" title={nextItems[0]?.label ?? "No alarms"} />
          <div className="rounded-3xl bg-[#fff1de] p-4 dark:bg-amber-950/30">
            <p className="text-4xl font-black text-stone-950 dark:text-stone-50">{nextItems[0] ? relativeDue(nextItems[0].at) : "clear"}</p>
            <p className="mt-1 text-sm font-bold text-stone-600 dark:text-stone-300">{nextItems[0]?.detail ?? "Everyone gets one tiny exhale."}</p>
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="On duty" title={onDuty ? caregiverName(state, onDuty.currentCaregiverId) : "Shared"} />
          <div className="flex items-center gap-3 rounded-3xl bg-stone-50 p-4 dark:bg-stone-900">
            <ShieldCheck className="text-[#86d3be]" size={30} />
            <div>
              <p className="font-black text-stone-950 dark:text-stone-50">{onDuty?.title ?? "Everything"}</p>
              <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">Rotate responsibilities from the Turns page.</p>
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
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-stone-50 px-3 text-left transition hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800"
              >
                <span className="font-black">{task.title}</span>
                <span className={isOverdue(task) ? "text-xs font-black text-rose-500" : "text-xs font-black text-stone-500"}>{relativeDue(task.dueAt)}</span>
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
          <SectionTitle eyebrow="Supplies" title="Low stock" />
          <div className="grid gap-2">
            {state.supplies.filter((item) => item.quantity <= item.threshold).slice(0, 4).map((item) => (
              <Link key={item.id} href="/supplies" className="flex min-h-12 items-center justify-between rounded-2xl bg-rose-50 px-3 font-bold text-rose-800 dark:bg-rose-950/40 dark:text-rose-100">
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
