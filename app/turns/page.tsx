"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Edit3, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, Pill, Select } from "@/components/ui";
import { usePeacefulParents } from "@/lib/store";
import type { TurnInput, TurnItem } from "@/lib/types";
import { caregiverName, formatShortDate, formatTime } from "@/lib/utils";

export default function TurnsPage() {
  const state = usePeacefulParents();
  const [editing, setEditing] = useState<TurnItem | null>(null);
  const [form, setForm] = useState<TurnInput>({
    title: "",
    currentCaregiverId: state.caregivers[0]?.id ?? ""
  });

  function reset() {
    setEditing(null);
    setForm({ title: "", currentCaregiverId: state.caregivers[0]?.id ?? "" });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (editing) {
      state.updateTurn(editing.id, form);
    } else {
      state.addTurn(form);
    }
    reset();
  }

  function edit(turn: TurnItem) {
    setEditing(turn);
    setForm({ title: turn.title, currentCaregiverId: turn.currentCaregiverId });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
      <section className="grid gap-5 content-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] pp-accent">Whose turn</p>
          <h1 className="mt-1 text-3xl font-black pp-ink">Fair without math.</h1>
        </div>

        <Card>
          <form className="grid gap-4" onSubmit={submit}>
            <Field label="Responsibility">
              <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Night wake-up" required />
            </Field>
            <Field label="Current owner">
              <Select value={form.currentCaregiverId} onChange={(event) => setForm({ ...form, currentCaregiverId: event.target.value })}>
                {state.caregivers.map((caregiver) => (
                  <option key={caregiver.id} value={caregiver.id}>
                    {caregiver.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Button type="submit" size="lg">
                <Plus size={19} /> {editing ? "Save turn" : "Add turn"}
              </Button>
              {editing ? (
                <Button type="button" variant="secondary" size="lg" onClick={reset}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      </section>

      <section className="grid gap-3 content-start">
        {state.turns.map((turn) => (
          <Card key={turn.id}>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black pp-ink">{turn.title}</h2>
                  <Pill className="bg-[#fff1de] text-amber-800 dark:bg-amber-950/50 dark:text-amber-100">{turn.completedCount} done</Pill>
                </div>
                <p className="mt-1 text-sm font-bold pp-muted">
                  Up now: <span className="text-stone-900 dark:text-stone-100">{caregiverName(state, turn.currentCaregiverId)}</span>
                  {turn.lastCompletedAt ? ` - last completed ${formatShortDate(turn.lastCompletedAt)} at ${formatTime(turn.lastCompletedAt)}` : ""}
                </p>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 sm:min-w-72">
                <Button variant="primary" onClick={() => state.completeTurn(turn.id)}>
                  <CheckCircle2 size={18} /> Done
                </Button>
                <Button variant="secondary" onClick={() => edit(turn)} aria-label={`Edit ${turn.title}`}>
                  <Edit3 size={17} />
                </Button>
                <Button variant="danger" onClick={() => state.deleteTurn(turn.id)} aria-label={`Delete ${turn.title}`}>
                  <Trash2 size={17} />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <Card className="bg-[#86d3be]/18 dark:bg-emerald-950/20">
          <div className="flex gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#dfe9df] text-[#526f62] dark:bg-[#2e4038] dark:text-[#c3d6c8]">
              <RotateCcw size={22} />
            </div>
            <div>
              <h2 className="font-black pp-ink">How rotation works</h2>
              <p className="mt-1 text-sm font-semibold pp-muted">
                Tap Done after a responsibility is handled. PeacefulParents moves it to the next caregiver automatically and keeps the count.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
