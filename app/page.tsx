"use client";

import Link from "next/link";
import { ArrowRight, Baby, CheckCircle2, Moon, RotateCcw, ShoppingBasket } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { usePeacefulParents } from "@/lib/store";
import { caregiverName, getNextItems, getTodayLogs, relativeDue } from "@/lib/utils";

export default function LandingPage() {
  const state = usePeacefulParents();
  const next = getNextItems(state)[0];
  const todayCount = getTodayLogs(state.careLogs).length;
  const onDuty = state.turns[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
      <section className="py-3 md:py-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--pp-line)] bg-[rgba(255,250,240,0.66)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] pp-accent shadow-sm dark:bg-[rgba(255,244,224,0.07)]">
          <Moon size={14} />
          Late-night calm for low sleep days
        </div>
        <h1 className="max-w-3xl text-5xl font-black leading-[0.96] tracking-tight pp-ink sm:text-6xl md:text-7xl">
          PeacefulParents
        </h1>
        <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 pp-muted">
          A calm co-pilot for overwhelmed parents: care logs, shared tasks, supplies, and whose turn is handled with soft edges and breathing room.
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
        <div className="pp-card rounded-[2rem] p-3">
          <div className="rounded-[1.55rem] bg-[linear-gradient(145deg,#405666,#273946)] p-4 text-[#fff7e8] shadow-soft dark:bg-[linear-gradient(145deg,#2b3942,#202a31)]">
            <div className="flex items-center justify-between">
              <p className="font-black">Today</p>
              <span className="rounded-full bg-[#f2dfbb]/90 px-3 py-1 text-xs font-black text-[#35434a]">{todayCount} logs</span>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-sm font-bold text-white/70">Next gentle nudge</p>
                <p className="mt-1 text-2xl font-black">{next?.label ?? "All clear"}</p>
                <p className="text-sm font-bold text-[#f2dfbb]">{next ? relativeDue(next.at) : "No open items"}</p>
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
            <p className="text-xs font-black uppercase tracking-[0.14em] pp-muted">On duty</p>
            <p className="mt-1 text-xl font-black pp-ink">
              {onDuty ? caregiverName(state, onDuty.currentCaregiverId) : "Balanced"}
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] pp-muted">Gentle supply notes</p>
            <p className="mt-1 text-xl font-black pp-ink">
              {state.supplies.filter((item) => item.quantity <= item.threshold).length} items
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
