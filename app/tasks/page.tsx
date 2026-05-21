"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, Edit3, Plus, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Field, Input, Pill, Select } from "@/components/ui";
import { usePeacefulParents } from "@/lib/store";
import type { Task, TaskInput } from "@/lib/types";
import { caregiverName, formatTime, fromDatetimeLocal, isOverdue, relativeDue, toDatetimeLocal } from "@/lib/utils";

export default function TasksPage() {
  const state = usePeacefulParents();
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskInput>({
    title: "",
    assignedTo: state.caregivers[0]?.id ?? "",
    dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    recurring: "none",
    category: "baby"
  });

  const tasks = useMemo(() => [...state.tasks].sort((a, b) => Number(a.completed) - Number(b.completed) || +new Date(a.dueAt) - +new Date(b.dueAt)), [state.tasks]);

  function reset() {
    setEditing(null);
    setForm({
      title: "",
      assignedTo: state.caregivers[0]?.id ?? "",
      dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      recurring: "none",
      category: "baby"
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (editing) {
      state.updateTask(editing.id, form);
    } else {
      state.addTask(form);
    }
    reset();
  }

  function edit(task: Task) {
    setEditing(task);
    setForm({
      title: task.title,
      assignedTo: task.assignedTo,
      dueAt: task.dueAt,
      recurring: task.recurring,
      category: task.category
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="grid gap-5 content-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] pp-accent">Shared board</p>
          <h1 className="mt-1 text-3xl font-black pp-ink">Tiny tasks, clear owners.</h1>
        </div>

        <Card>
          <form className="grid gap-4" onSubmit={submit}>
            <Field label="Task">
              <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Wash bottles" required />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Assigned to">
                <Select value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}>
                  {state.caregivers.map((caregiver) => (
                    <option key={caregiver.id} value={caregiver.id}>
                      {caregiver.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Due">
                <Input type="datetime-local" value={toDatetimeLocal(form.dueAt)} onChange={(event) => setForm({ ...form, dueAt: fromDatetimeLocal(event.target.value) })} />
              </Field>
              <Field label="Category">
                <Select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as TaskInput["category"] })}>
                  <option value="baby">Baby</option>
                  <option value="home">Home</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>
              <Field label="Repeats">
                <Select value={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.value as TaskInput["recurring"] })}>
                  <option value="none">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Button type="submit" size="lg">
                <Plus size={19} /> {editing ? "Save task" : "Add task"}
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
        {tasks.length === 0 ? <EmptyState title="No tasks yet" body="Add one recurring chore or quick responsibility to start the board." /> : null}
        {tasks.map((task) => (
          <Card key={task.id} className={task.completed ? "opacity-70" : ""}>
            <div className="flex items-start gap-3">
              <button
                onClick={() => state.toggleTask(task.id)}
                className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 transition ${
                  task.completed
                    ? "border-[#7fa79a] bg-[#7fa79a] text-[#fff7e8]"
                    : "border-[var(--pp-line)] bg-[rgba(255,250,240,0.54)] text-[var(--pp-muted)] dark:bg-[rgba(255,244,224,0.06)]"
                }`}
                aria-label={task.completed ? "Mark task incomplete" : "Complete task"}
              >
                <Check size={20} />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`text-lg font-black pp-ink ${task.completed ? "line-through" : ""}`}>{task.title}</h2>
                  {isOverdue(task) ? <Pill className="bg-[#f0e5d7] text-[#765f4c] dark:bg-[#4c3b32] dark:text-[#ead7c2]">Still waiting</Pill> : null}
                  {task.recurring !== "none" ? <Pill className="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-100">{task.recurring}</Pill> : null}
                </div>
                <p className="mt-1 text-sm font-bold pp-muted">
                  {caregiverName(state, task.assignedTo)} - {formatTime(task.dueAt)} - {relativeDue(task.dueAt)}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => edit(task)} aria-label={`Edit ${task.title}`}>
                  <Edit3 size={17} />
                </Button>
                <Button variant="danger" size="sm" onClick={() => state.deleteTask(task.id)} aria-label={`Delete ${task.title}`}>
                  <Trash2 size={17} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
