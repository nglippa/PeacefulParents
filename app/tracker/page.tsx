"use client";

import { FormEvent, useMemo, useState } from "react";
import { Baby, Bed, Edit3, Milk, NotebookPen, Pill, Plus, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Field, Input, Select, Textarea } from "@/components/ui";
import { usePeacefulParents } from "@/lib/store";
import type { CareLog, CareLogInput, CareType } from "@/lib/types";
import { careLabel, childName, formatTime, fromDatetimeLocal, getTodayLogs, toDatetimeLocal } from "@/lib/utils";

const careTypes: Array<{ type: CareType; icon: typeof Milk; hint: string }> = [
  { type: "feeding", icon: Milk, hint: "Bottle, nursing, solids" },
  { type: "diaper", icon: Baby, hint: "Wet, dirty, cream" },
  { type: "sleep", icon: Bed, hint: "Nap start, wake up" },
  { type: "medicine", icon: Pill, hint: "Dose and time" },
  { type: "note", icon: NotebookPen, hint: "Anything odd or sweet" }
];

const defaults: Record<CareType, string> = {
  feeding: "Bottle, 4 oz",
  diaper: "Wet",
  sleep: "Nap started",
  medicine: "Dose given",
  note: "Quick note"
};

export default function TrackerPage() {
  const state = usePeacefulParents();
  const firstChild = state.children[0]?.id ?? "";
  const [editing, setEditing] = useState<CareLog | null>(null);
  const [form, setForm] = useState<CareLogInput>({
    childId: firstChild,
    type: "feeding",
    occurredAt: new Date().toISOString(),
    detail: defaults.feeding,
    notes: ""
  });

  const todayLogs = useMemo(() => getTodayLogs(state.careLogs), [state.careLogs]);

  function setType(type: CareType) {
    setForm((current) => ({ ...current, type, detail: defaults[type] }));
  }

  function reset() {
    setEditing(null);
    setForm({
      childId: state.children[0]?.id ?? "",
      type: "feeding",
      occurredAt: new Date().toISOString(),
      detail: defaults.feeding,
      notes: ""
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { ...form, childId: form.childId || firstChild };
    if (!payload.childId) return;
    if (editing) {
      state.updateCareLog(editing.id, payload);
    } else {
      state.addCareLog(payload);
    }
    reset();
  }

  function edit(log: CareLog) {
    setEditing(log);
    setForm({
      childId: log.childId,
      type: log.type,
      occurredAt: log.occurredAt,
      detail: log.detail,
      notes: log.notes ?? ""
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="grid gap-5 content-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] pp-accent">Baby tracker</p>
          <h1 className="mt-1 text-3xl font-black pp-ink">Log care in seconds.</h1>
        </div>

        <Card>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid grid-cols-5 gap-2">
              {careTypes.map((item) => {
                const Icon = item.icon;
                const active = form.type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setType(item.type)}
                    className={`grid min-h-20 place-items-center rounded-2xl border text-center text-xs font-black transition ${
                      active
                        ? "border-[var(--pp-accent)] bg-[var(--pp-navy)] text-[#fff7e8] shadow-soft"
                        : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100  dark:bg-stone-900 dark:text-stone-300"
                    }`}
                  >
                    <Icon size={22} />
                    <span>{careLabel(item.type)}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Child">
                <Select value={form.childId} onChange={(event) => setForm({ ...form, childId: event.target.value })}>
                  {state.children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="When">
                <Input
                  type="datetime-local"
                  value={toDatetimeLocal(form.occurredAt)}
                  onChange={(event) => setForm({ ...form, occurredAt: fromDatetimeLocal(event.target.value) })}
                />
              </Field>
            </div>

            <Field label="Detail">
              <Input value={form.detail} onChange={(event) => setForm({ ...form, detail: event.target.value })} placeholder="Bottle, 4 oz" required />
            </Field>

            <Field label="Notes">
              <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Optional context" />
            </Field>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Button type="submit" size="lg">
                <Plus size={19} /> {editing ? "Save log" : "Add log"}
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

      <section className="grid gap-4 content-start">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] pp-accent">Timeline</p>
              <h2 className="text-xl font-black pp-ink">Today</h2>
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600 dark:bg-stone-800 dark:text-stone-200">{todayLogs.length} events</span>
          </div>

          <div className="grid gap-3">
            {todayLogs.length === 0 ? <EmptyState title="No logs today" body="Quick actions will appear here as soon as care is logged." /> : null}
            {todayLogs.map((log) => (
              <article key={log.id} className="rounded-3xl border border-[var(--pp-line)] bg-stone-50 p-4  dark:bg-stone-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.12em] pp-muted">{formatTime(log.occurredAt)} - {childName(state, log.childId)}</p>
                    <h3 className="mt-1 text-lg font-black pp-ink">{careLabel(log.type)}: {log.detail}</h3>
                    {log.notes ? <p className="mt-1 text-sm font-semibold pp-muted">{log.notes}</p> : null}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => edit(log)} aria-label={`Edit ${log.detail}`}>
                      <Edit3 size={17} />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => state.deleteCareLog(log.id)} aria-label={`Delete ${log.detail}`}>
                      <Trash2 size={17} />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
