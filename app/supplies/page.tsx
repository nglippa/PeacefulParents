"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, Edit3, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Field, Input, Pill, Select } from "@/components/ui";
import { usePeacefulParents } from "@/lib/store";
import type { SupplyCategory, SupplyInput, SupplyItem } from "@/lib/types";

const categories: SupplyCategory[] = ["diapers", "wipes", "formula", "food", "household"];

export default function SuppliesPage() {
  const state = usePeacefulParents();
  const [editing, setEditing] = useState<SupplyItem | null>(null);
  const [form, setForm] = useState<SupplyInput>({
    name: "",
    category: "diapers",
    quantity: 1,
    threshold: 2
  });

  const grouped = useMemo(
    () =>
      categories.map((category) => ({
        category,
        items: state.supplies.filter((item) => item.category === category)
      })),
    [state.supplies]
  );
  const lowCount = state.supplies.filter((item) => item.quantity <= item.threshold).length;

  function reset() {
    setEditing(null);
    setForm({ name: "", category: "diapers", quantity: 1, threshold: 2 });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (editing) {
      state.updateSupply(editing.id, form);
    } else {
      state.addSupply(form);
    }
    reset();
  }

  function edit(item: SupplyItem) {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      threshold: item.threshold
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
      <section className="grid gap-5 content-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] pp-accent">Supplies</p>
          <h1 className="mt-1 text-3xl font-black pp-ink">Know before empty.</h1>
        </div>

        <Card>
          <form className="grid gap-4" onSubmit={submit}>
            <Field label="Item">
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Size 3 diapers" required />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Category">
                <Select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as SupplyCategory })}>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Quantity">
                <Input type="number" min={0} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} />
              </Field>
              <Field label="Low at">
                <Input type="number" min={0} value={form.threshold} onChange={(event) => setForm({ ...form, threshold: Number(event.target.value) })} />
              </Field>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Button type="submit" size="lg">
                <Plus size={19} /> {editing ? "Save item" : "Add item"}
              </Button>
              {editing ? (
                <Button type="button" variant="secondary" size="lg" onClick={reset}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card className={lowCount ? "bg-[#f0e5d7]/70 dark:bg-[#4c3b32]/45" : "bg-[#e2ece4]/70 dark:bg-[#2f4136]/45"}>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(255,250,240,0.62)] pp-accent shadow-sm dark:bg-[rgba(255,244,224,0.08)]">
              <ShoppingBasket size={23} />
            </div>
            <div>
              <p className="text-2xl font-black pp-ink">{lowCount} low-supply reminders</p>
              <p className="text-sm font-semibold pp-muted">Quantities are local and stay after refresh.</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 content-start">
        {state.supplies.length === 0 ? <EmptyState title="No supplies yet" body="Add diapers, wipes, formula, food, or household staples." /> : null}
        {grouped.map(({ category, items }) =>
          items.length ? (
            <Card key={category}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-black capitalize pp-ink">{category}</h2>
                <Pill className="bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-200">{items.length} items</Pill>
              </div>
              <div className="grid gap-2">
                {items.map((item) => {
                  const low = item.quantity <= item.threshold;
                  return (
                    <div key={item.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl pp-soft-surface p-3">
                      <button
                        onClick={() => state.toggleSupply(item.id)}
                        className={`grid h-10 w-10 place-items-center rounded-2xl border-2 ${
                          item.checked
                            ? "border-[#7fa79a] bg-[#7fa79a] text-[#fff7e8]"
                            : "border-[var(--pp-line)] bg-[rgba(255,250,240,0.54)] text-[var(--pp-muted)] dark:bg-[rgba(255,244,224,0.06)]"
                        }`}
                        aria-label={item.checked ? "Uncheck item" : "Check item"}
                      >
                        <Check size={18} />
                      </button>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`font-black pp-ink ${item.checked ? "line-through" : ""}`}>{item.name}</p>
                          {low ? <Pill className="bg-[#f0e5d7] text-[#765f4c] dark:bg-[#4c3b32] dark:text-[#ead7c2]">Replenish soon</Pill> : null}
                        </div>
                        <p className="text-sm font-bold pp-muted">{item.quantity} left - remind at {item.threshold}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => edit(item)} aria-label={`Edit ${item.name}`}>
                          <Edit3 size={17} />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => state.deleteSupply(item.id)} aria-label={`Delete ${item.name}`}>
                          <Trash2 size={17} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null
        )}
      </section>
    </div>
  );
}
