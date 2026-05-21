"use client";

import Link from "next/link";
import { ArrowRight, Baby, CheckCircle2, Moon, RotateCcw, ShoppingBasket } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useDadMode } from "@/lib/store";
import { caregiverName, getNextItems, getTodayLogs, relativeDue } from "@/lib/utils";

export default function LandingPage() {
  const state = useDadMode();
  const next = getNextItems(state)[0];
  const todayCount = getTodayLogs(state.careLogs).length;
  const onDuty = state.turns[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
      <section className="py-3 md:py-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-rose-500 shadow-sm dark:border-rose-900/50 dark:bg-stone-900 dark:text-rose-200">
          <Moon size={14} />
          Built for low sleep days
        </div>
        <h1 className="max-w-3xl text-5xl font-black leading-[0.96] text-stone-950 dark:text-stone-50 sm:text-6xl md:text-7xl">
          DadMode
        </h1>
        <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-stone-600 dark:text-stone-300">
          A family command center for tired parents: care logs, shared tasks, supplies, and whose turn is handled in one calm place.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/dashboard" className="flex items-center gap-2">
              Open command center <ArrowRight size={19} />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <Link href="/tracker">Log baby care</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-[2rem] border border-white/70 bg-white/78 p-3 shadow-soft backdrop-blur dark:border-stone-800 dark:bg-stone-950/74">
          <div className="rounded-[1.55rem] bg-[#2e2a27] p-4 text-white shadow-lift dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <p className="font-black">Today</p>
              <span className="rounded-full bg-[#86d3be] px-3 py-1 text-xs font-black text-stone-950">{todayCount} logs</span>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-sm font-bold text-white/70">Next up</p>
                <p className="mt-1 text-2xl font-black">{next?.label ?? "All clear"}</p>
                <p className="text-sm font-bold text-[#ffd47d]">{next ? relativeDue(next.at) : "No open items"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Feed", icon: Baby },
                  { label: "Tasks", icon: CheckCircle2 },
                  { label: "Turns", icon: RotateCcw },
                  { label: "Supplies", icon: ShoppingBasket }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="grid min-h-24 place-items-center rounded-3xl bg-white/10 text-center">
                      <Icon size={24} />
                      <span className="text-sm font-black">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <Card className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">On duty</p>
            <p className="mt-1 text-xl font-black text-stone-950 dark:text-stone-50">
              {onDuty ? caregiverName(state, onDuty.currentCaregiverId) : "Balanced"}
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">Low supply</p>
            <p className="mt-1 text-xl font-black text-stone-950 dark:text-stone-50">
              {state.supplies.filter((item) => item.quantity <= item.threshold).length} items
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
