"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Bell,
  CalendarClock,
  Check,
  Edit3,
  ExternalLink,
  Info,
  PackageCheck,
  Plus,
  RefreshCw,
  ShoppingBasket,
  Sparkles,
  Trash2
} from "lucide-react";
import { Button, Card, EmptyState, Field, Input, Pill, Select, Textarea } from "@/components/ui";
import { usePeacefulParents } from "@/lib/store";
import type { PreferredReorderDay, PreferredRetailer, SupplyCategory, SupplyInput, SupplyItem, SupplyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type RetailerKey = Exclude<PreferredRetailer, "none">;

const categories: Array<{ id: SupplyCategory; label: string; query: string }> = [
  { id: "diapers", label: "Diapers", query: "diapers" },
  { id: "wipes", label: "Wipes", query: "wipes" },
  { id: "formula", label: "Formula", query: "formula" },
  { id: "baby-food", label: "Baby food", query: "baby food" },
  { id: "bottles", label: "Bottles", query: "baby bottles" },
  { id: "pacifiers", label: "Pacifiers", query: "pacifiers" },
  { id: "medicine", label: "Medicine", query: "baby medicine" },
  { id: "household", label: "Household", query: "household essentials" },
  { id: "snacks", label: "Snacks", query: "kid snacks" }
];

const retailerLinks: Array<{ id: RetailerKey; name: string; helper: string; url: string }> = [
  { id: "amazon", name: "Amazon", helper: "Fast bulk restocks", url: "https://www.amazon.com" },
  { id: "walmart", name: "Walmart", helper: "Everyday essentials", url: "https://www.walmart.com" },
  { id: "target", name: "Target", helper: "Diapers, wipes, nursery", url: "https://www.target.com" }
];

const reorderDays: Array<{ id: PreferredReorderDay; label: string }> = [
  { id: "any", label: "Any calm day" },
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" }
];

const defaultForm: SupplyInput = {
  name: "",
  category: "diapers",
  quantity: 1,
  threshold: 2,
  status: "normal",
  preferredRetailer: "none",
  notes: "",
  productLink: "",
  restockFrequencyDays: 14,
  preferredReorderDay: "any",
  lastRestockedAt: new Date().toISOString().slice(0, 10),
  reminderEnabled: true,
  autoReorderEnabled: false
};

export default function SuppliesPage() {
  const state = usePeacefulParents();
  const [editing, setEditing] = useState<SupplyItem | null>(null);
  const [form, setForm] = useState<SupplyInput>(defaultForm);

  const grouped = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        items: state.supplies.filter((item) => item.category === category.id)
      })),
    [state.supplies]
  );
  const lowItems = state.supplies.filter((item) => getVisualStatus(item) !== "normal");
  const outItems = state.supplies.filter((item) => getVisualStatus(item) === "out");
  const upcomingRestocks = useMemo(() => getUpcomingRestocks(state.supplies), [state.supplies]);
  const suggestions = useMemo(() => getSmartSuggestions(state.supplies), [state.supplies]);

  function reset() {
    setEditing(null);
    setForm(defaultForm);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const cleanForm: SupplyInput = {
      ...form,
      name: form.name.trim(),
      notes: form.notes?.trim(),
      productLink: form.productLink?.trim()
    };

    if (editing) {
      state.updateSupply(editing.id, cleanForm);
    } else {
      state.addSupply(cleanForm);
    }
    reset();
  }

  function edit(item: SupplyItem) {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      threshold: item.threshold,
      status: item.status,
      preferredRetailer: item.preferredRetailer,
      notes: item.notes ?? "",
      productLink: item.productLink ?? "",
      restockFrequencyDays: item.restockFrequencyDays,
      preferredReorderDay: item.preferredReorderDay,
      lastRestockedAt: toDateInputValue(item.lastRestockedAt),
      reminderEnabled: item.reminderEnabled,
      autoReorderEnabled: false
    });
  }

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.12em] pp-accent">Supplies</p>
        <h1 className="mt-1 text-3xl font-black pp-ink">Restock without the spiral.</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 pp-muted">
          Keep the little essentials visible, save trusted product links, and jump to clean shopping searches when the house starts running thin.
        </p>
      </div>

      <QuickRestockLinks />

      <RestockDashboard restocks={upcomingRestocks} suggestions={suggestions} />

      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="grid content-start gap-5">
          <Card>
            <form className="grid gap-4" onSubmit={submit}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black pp-ink">{editing ? "Edit supply item" : "Add supply item"}</h2>
                  <p className="mt-1 text-sm font-semibold pp-muted">Simple fields, easy to update during a half-awake pantry check.</p>
                </div>
                {editing ? <Pill className="bg-[#f1e3cf] text-[#87613b] dark:bg-[#4a392b] dark:text-[#efd5ae]">Editing</Pill> : null}
              </div>

              <Field label="Name">
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Size 4 overnight diapers" required />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Category">
                  <Select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as SupplyCategory })}>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as SupplyStatus })}>
                    <option value="normal">Normal</option>
                    <option value="running-low">Running low</option>
                    <option value="out">Out</option>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Quantity">
                  <Input type="number" min={0} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} />
                </Field>
                <Field label="Threshold trigger">
                  <Input type="number" min={0} value={form.threshold} onChange={(event) => setForm({ ...form, threshold: Number(event.target.value) })} />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Restock every">
                  <Input
                    type="number"
                    min={0}
                    value={form.restockFrequencyDays}
                    onChange={(event) => setForm({ ...form, restockFrequencyDays: Number(event.target.value) })}
                  />
                </Field>
                <Field label="Reorder day">
                  <Select
                    value={form.preferredReorderDay}
                    onChange={(event) => setForm({ ...form, preferredReorderDay: event.target.value as PreferredReorderDay })}
                  >
                    {reorderDays.map((day) => (
                      <option key={day.id} value={day.id}>
                        {day.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Last restocked">
                  <Input
                    type="date"
                    value={toDateInputValue(form.lastRestockedAt)}
                    onChange={(event) => setForm({ ...form, lastRestockedAt: event.target.value })}
                  />
                </Field>
              </div>
              <p className="-mt-2 text-xs font-bold pp-muted">Use 0 days for “restock when low.”</p>

              <Field label="Preferred retailer">
                <Select
                  value={form.preferredRetailer}
                  onChange={(event) => setForm({ ...form, preferredRetailer: event.target.value as PreferredRetailer })}
                >
                  <option value="none">No preference</option>
                  <option value="amazon">Amazon</option>
                  <option value="walmart">Walmart</option>
                  <option value="target">Target</option>
                </Select>
              </Field>

              <Field label="Product link">
                <Input
                  type="url"
                  value={form.productLink ?? ""}
                  onChange={(event) => setForm({ ...form, productLink: event.target.value })}
                  placeholder="https://..."
                />
              </Field>

              <Field label="Notes">
                <Textarea
                  value={form.notes ?? ""}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  placeholder="Brand, size, where it lives, or anything Future You will thank you for."
                />
              </Field>

              <div className="grid gap-3 rounded-2xl pp-soft-surface p-3">
                <label className="flex items-center justify-between gap-3 text-sm font-black pp-ink">
                  <span className="flex items-center gap-2">
                    <Bell size={17} className="pp-accent" />
                    Local restock reminders
                  </span>
                  <input
                    type="checkbox"
                    checked={form.reminderEnabled}
                    onChange={(event) => setForm({ ...form, reminderEnabled: event.target.checked })}
                    className="h-5 w-5 accent-[#7fa79a]"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm font-black text-[var(--pp-muted)]">
                  <span className="flex items-center gap-2">
                    <RefreshCw size={17} />
                    Automatic reorder coming later
                  </span>
                  <input type="checkbox" checked={false} disabled className="h-5 w-5" />
                </label>
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

          <SupplyInfoCards lowCount={lowItems.length} outCount={outItems.length} />
        </section>

        <section className="grid content-start gap-4">
          {state.supplies.length === 0 ? (
            <EmptyState title="No supplies yet" body="Add diapers, wipes, formula, baby food, or household staples." />
          ) : null}

          {grouped.map((group) => (
            <CategorySection
              key={group.id}
              category={group}
              onEdit={edit}
              onDelete={state.deleteSupply}
              onToggle={state.toggleSupply}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

function QuickRestockLinks() {
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="text-lg font-black pp-ink">Quick restock links</h2>
        <p className="mt-1 text-sm font-semibold pp-muted">General retailer shortcuts, no affiliate tracking.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {retailerLinks.map((retailer) => (
          <a
            key={retailer.id}
            href={retailer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pp-card group rounded-[1.45rem] p-4 transition duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] pp-accent">Restock</p>
                <h3 className="mt-2 text-xl font-black pp-ink">{retailer.name}</h3>
                <p className="mt-1 text-sm font-semibold pp-muted">{retailer.helper}</p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[rgba(255,250,240,0.58)] text-[var(--pp-accent)] transition group-hover:bg-[var(--pp-navy)] group-hover:text-[#fff7e8] dark:bg-[rgba(255,244,224,0.08)]">
                <ExternalLink size={17} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

type RestockItem = {
  item: SupplyItem;
  state: "good" | "watch-soon" | "reorder-suggested" | "critical-low";
  label: string;
  daysRemaining: number | null;
  reminder: string;
};

function RestockDashboard({ restocks, suggestions }: { restocks: RestockItem[]; suggestions: string[] }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] pp-accent">Smart restock</p>
            <h2 className="mt-1 text-xl font-black pp-ink">Upcoming Restocks</h2>
            <p className="mt-1 text-sm font-semibold pp-muted">Quiet reminders based on rhythm, thresholds, and current status.</p>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[rgba(255,250,240,0.62)] pp-accent shadow-sm dark:bg-[rgba(255,244,224,0.08)]">
            <CalendarClock size={21} />
          </div>
        </div>

        {restocks.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {restocks.slice(0, 6).map((restock) => {
              const buyAgainUrl = getBuyAgainUrl(restock.item);
              return (
                <div key={restock.item.id} className="rounded-2xl pp-soft-surface p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black pp-ink">{restock.item.name}</h3>
                      <p className="mt-1 text-sm font-bold pp-muted">{restock.label}</p>
                    </div>
                    <RestockStatePill state={restock.state} />
                  </div>
                  <div className="mt-3 grid gap-1 text-sm font-semibold pp-muted">
                    <p>Retailer: {retailerLabel(restock.item.preferredRetailer)}</p>
                    <p>{restock.reminder}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {buyAgainUrl ? (
                      <a
                        href={buyAgainUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[var(--pp-navy)] px-3 text-sm font-black text-[#fff7e8] shadow-sm transition hover:opacity-95"
                      >
                        Buy Again
                        <ExternalLink size={15} />
                      </a>
                    ) : null}
                    <Pill className="bg-[rgba(255,250,240,0.58)] text-[var(--pp-muted)] dark:bg-[rgba(255,244,224,0.08)]">
                      {restock.item.reminderEnabled ? "Reminder on" : "Reminder off"}
                    </Pill>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--pp-line)] p-4 text-sm font-semibold pp-muted">
            Add a restock frequency to a supply item and PeacefulParents will start watching the rhythm.
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[rgba(127,167,154,0.16)] text-[#58766b] dark:bg-[rgba(127,167,154,0.18)] dark:text-[#b9d4c7]">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="font-black pp-ink">Gentle suggestions</h2>
            <p className="text-sm font-semibold pp-muted">Helpful nudges, never pressure.</p>
          </div>
        </div>
        <div className="grid gap-2">
          {suggestions.map((suggestion) => (
            <div key={suggestion} className="rounded-2xl bg-[rgba(255,250,240,0.48)] p-3 text-sm font-bold leading-6 pp-muted dark:bg-[rgba(255,244,224,0.06)]">
              {suggestion}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function SupplyInfoCards({ lowCount, outCount }: { lowCount: number; outCount: number }) {
  const cards = [
    {
      title: "Low supply soon",
      body: lowCount ? `${lowCount} item${lowCount === 1 ? "" : "s"} could use a calm restock plan.` : "Everything looks steady right now.",
      icon: ShoppingBasket
    },
    {
      title: "Restock rhythm",
      body: "A weekly diapers and wipes check keeps the last-minute scramble softer.",
      icon: PackageCheck
    },
    {
      title: "Bulk buy tip",
      body: "Diapers, wipes, formula, and household basics are often easier to restock in bulk.",
      icon: Sparkles
    },
    {
      title: "Nightstand essentials",
      body: "Wipes, pacifiers, burp cloth, water bottle, and phone charger.",
      icon: Info
    }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className={card.title === "Low supply soon" && outCount ? "bg-[#eee0d1]/70 dark:bg-[#4a3a31]/45" : undefined}>
            <div className="flex gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[rgba(255,250,240,0.62)] pp-accent shadow-sm dark:bg-[rgba(255,244,224,0.08)]">
                <Icon size={20} />
              </div>
              <div>
                <h2 className="font-black pp-ink">{card.title}</h2>
                <p className="mt-1 text-sm font-semibold leading-6 pp-muted">{card.body}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function CategorySection({
  category,
  onEdit,
  onDelete,
  onToggle
}: {
  category: { id: SupplyCategory; label: string; query: string; items: SupplyItem[] };
  onEdit: (item: SupplyItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <Card>
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black pp-ink">{category.label}</h2>
            <Pill className="bg-[rgba(255,250,240,0.6)] text-[var(--pp-muted)] dark:bg-[rgba(255,244,224,0.08)]">
              {category.items.length} {category.items.length === 1 ? "item" : "items"}
            </Pill>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {retailerLinks.map((retailer) => (
              <a
                key={retailer.id}
                href={getSearchUrl(retailer.id, category.query)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-2xl border border-[var(--pp-line)] bg-[rgba(255,250,240,0.48)] px-3 text-xs font-black text-[var(--pp-muted)] transition hover:bg-[rgba(255,250,240,0.78)] dark:bg-[rgba(255,244,224,0.06)]"
              >
                {retailer.name}
                <ExternalLink size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {category.items.length ? (
        <div className="grid gap-3">
          {category.items.map((item) => (
            <SupplyRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--pp-line)] p-4 text-sm font-semibold pp-muted">
          No saved {category.label.toLowerCase()} yet. The search links are ready when you need them.
        </div>
      )}
    </Card>
  );
}

function SupplyRow({
  item,
  onEdit,
  onDelete,
  onToggle
}: {
  item: SupplyItem;
  onEdit: (item: SupplyItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const status = getVisualStatus(item);
  const buyAgainUrl = getBuyAgainUrl(item);
  const restock = getRestockItem(item);

  return (
    <div className="grid gap-3 rounded-2xl pp-soft-surface p-3 sm:grid-cols-[auto_1fr_auto] sm:items-start">
      <button
        onClick={() => onToggle(item.id)}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-2xl border-2 transition",
          item.checked
            ? "border-[#7fa79a] bg-[#7fa79a] text-[#fff7e8]"
            : "border-[var(--pp-line)] bg-[rgba(255,250,240,0.54)] text-[var(--pp-muted)] dark:bg-[rgba(255,244,224,0.06)]"
        )}
        aria-label={item.checked ? "Uncheck item" : "Check item"}
      >
        <Check size={18} />
      </button>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("font-black pp-ink", item.checked && "line-through")}>{item.name}</p>
          <StatusPill status={status} />
          {item.preferredRetailer !== "none" ? (
            <Pill className="bg-[rgba(127,167,154,0.16)] text-[#58766b] dark:bg-[rgba(127,167,154,0.18)] dark:text-[#b9d4c7]">
              {retailerLabel(item.preferredRetailer)}
            </Pill>
          ) : null}
        </div>
        <p className="mt-1 text-sm font-bold pp-muted">
          {item.quantity} left - low at {item.threshold}
        </p>
        <p className="mt-1 text-sm font-bold pp-muted">
          {item.restockFrequencyDays > 0 ? `Restock every ${item.restockFrequencyDays} days` : "Restock when low"}
          {item.preferredReorderDay !== "any" ? ` - ${capitalize(item.preferredReorderDay)} reorder day` : ""}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <RestockStatePill state={restock.state} />
          {item.reminderEnabled ? (
            <Pill className="bg-[rgba(138,166,188,0.16)] text-[#5d7384] dark:bg-[rgba(138,166,188,0.16)] dark:text-[#bed4e3]">
              Reminder on
            </Pill>
          ) : null}
        </div>
        {item.notes ? <p className="mt-2 text-sm font-semibold leading-6 pp-muted">{item.notes}</p> : null}
        {buyAgainUrl ? (
          <a
            href={buyAgainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[var(--pp-navy)] px-3 text-sm font-black text-[#fff7e8] shadow-sm transition hover:opacity-95"
          >
            Buy Again
            <ExternalLink size={15} />
          </a>
        ) : null}
      </div>

      <div className="flex gap-1 sm:justify-end">
        <Button variant="ghost" size="sm" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}>
          <Edit3 size={17} />
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`}>
          <Trash2 size={17} />
        </Button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: SupplyStatus }) {
  if (status === "out") {
    return <Pill className="bg-[#eadbd2] text-[#76584b] dark:bg-[#4b3732] dark:text-[#e8c8bc]">Out</Pill>;
  }
  if (status === "running-low") {
    return <Pill className="bg-[#efe4d2] text-[#7a6245] dark:bg-[#4a3b2c] dark:text-[#edd4aa]">Running low</Pill>;
  }
  return <Pill className="bg-[#dfe9df] text-[#526f62] dark:bg-[#2e4038] dark:text-[#c3d6c8]">Normal</Pill>;
}

function RestockStatePill({ state }: { state: RestockItem["state"] }) {
  if (state === "critical-low") {
    return <Pill className="bg-[#eadbd2] text-[#76584b] dark:bg-[#4b3732] dark:text-[#e8c8bc]">Critical low</Pill>;
  }
  if (state === "reorder-suggested") {
    return <Pill className="bg-[#efe4d2] text-[#7a6245] dark:bg-[#4a3b2c] dark:text-[#edd4aa]">Reorder suggested</Pill>;
  }
  if (state === "watch-soon") {
    return <Pill className="bg-[#e7eadc] text-[#68704f] dark:bg-[#3d422d] dark:text-[#dce2be]">Watch soon</Pill>;
  }
  return <Pill className="bg-[#dfe9df] text-[#526f62] dark:bg-[#2e4038] dark:text-[#c3d6c8]">Good</Pill>;
}

function getVisualStatus(item: SupplyItem): SupplyStatus {
  if (item.status === "out" || item.quantity <= 0) return "out";
  if (item.status === "running-low" || item.quantity <= item.threshold) return "running-low";
  return "normal";
}

function getUpcomingRestocks(items: SupplyItem[]) {
  return items
    .map(getRestockItem)
    .filter((restock) => restock.item.reminderEnabled || restock.state !== "good")
    .sort((a, b) => {
      const weight = { "critical-low": 0, "reorder-suggested": 1, "watch-soon": 2, good: 3 };
      if (weight[a.state] !== weight[b.state]) return weight[a.state] - weight[b.state];
      return (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999);
    });
}

function getRestockItem(item: SupplyItem): RestockItem {
  const status = getVisualStatus(item);
  const daysRemaining = getDaysRemaining(item);
  const isDue = daysRemaining !== null && daysRemaining <= 0;
  const watchSoon = daysRemaining !== null && daysRemaining <= 3;
  const state: RestockItem["state"] =
    status === "out" ? "critical-low" : status === "running-low" || isDue ? "reorder-suggested" : watchSoon ? "watch-soon" : "good";

  return {
    item,
    state,
    daysRemaining,
    label: getRestockLabel(item, daysRemaining),
    reminder: getReminderCopy(item, state)
  };
}

function getDaysRemaining(item: SupplyItem) {
  if (!item.restockFrequencyDays) return null;
  const lastRestocked = item.lastRestockedAt ? new Date(item.lastRestockedAt) : new Date();
  if (Number.isNaN(lastRestocked.getTime())) return null;
  const nextRestock = lastRestocked.getTime() + item.restockFrequencyDays * 24 * 60 * 60 * 1000;
  return Math.ceil((nextRestock - Date.now()) / (24 * 60 * 60 * 1000));
}

function getRestockLabel(item: SupplyItem, daysRemaining: number | null) {
  if (!item.restockFrequencyDays) return "Restock when the supply feels low.";
  if (daysRemaining === null) return `Every ${item.restockFrequencyDays} days.`;
  if (daysRemaining < 0) return `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} past the usual rhythm.`;
  if (daysRemaining === 0) return "Today is a gentle reorder day.";
  return `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining.`;
}

function getReminderCopy(item: SupplyItem, state: RestockItem["state"]) {
  if (!item.reminderEnabled) return "Local reminders are off for this item.";
  if (state === "critical-low") return "Low supply reminder is active.";
  if (state === "reorder-suggested") return "Suggested reorder reminder is active.";
  if (state === "watch-soon") return "Upcoming restock reminder is active.";
  return item.preferredReorderDay === "any"
    ? "PeacefulParents will keep this rhythm nearby."
    : `PeacefulParents will nudge you around ${capitalize(item.preferredReorderDay)}.`;
}

function getSmartSuggestions(items: SupplyItem[]) {
  const restocks = getUpcomingRestocks(items);
  const suggestions = restocks
    .filter((restock) => restock.state !== "good")
    .slice(0, 4)
    .map((restock) => {
      if (restock.state === "critical-low") return `${restock.item.name} is very low. A small reorder soon could make tonight easier.`;
      if (restock.state === "reorder-suggested") return `${restock.item.name} may need restocking soon.`;
      return `${restock.item.name} is in the watch-soon window.`;
    });

  const wipes = items.find((item) => item.category === "wipes" && item.restockFrequencyDays > 0);
  if (wipes) suggestions.push(`You often reorder wipes around every ${Math.max(8, wipes.restockFrequencyDays - 2)}-${wipes.restockFrequencyDays + 2} days.`);

  if (!suggestions.length) {
    suggestions.push("Supplies look steady. Nothing needs a loud alarm today.");
    suggestions.push("Diapers, wipes, formula, and coffee are good candidates for a simple recurring check.");
  }

  return Array.from(new Set(suggestions)).slice(0, 5);
}

function getBuyAgainUrl(item: SupplyItem) {
  if (item.productLink) return item.productLink;
  if (item.preferredRetailer === "none") return "";
  return getSearchUrl(item.preferredRetailer, item.name);
}

function toDateInputValue(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
}

function getSearchUrl(retailer: RetailerKey, query: string) {
  const encoded = encodeURIComponent(query);
  if (retailer === "amazon") return `https://www.amazon.com/s?k=${encoded}`;
  if (retailer === "walmart") return `https://www.walmart.com/search?q=${encoded}`;
  return `https://www.target.com/s?searchTerm=${encoded}`;
}

function retailerLabel(retailer: PreferredRetailer) {
  if (retailer === "amazon") return "Amazon";
  if (retailer === "walmart") return "Walmart";
  if (retailer === "target") return "Target";
  return "No preference";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
