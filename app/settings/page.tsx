"use client";

import { FormEvent, useState } from "react";
import { Edit3, Plus, RefreshCw, Save, Trash2, UserRoundPlus } from "lucide-react";
import { Button, Card, Field, Input } from "@/components/ui";
import { useDadMode } from "@/lib/store";
import type { CaregiverProfile, ChildProfile } from "@/lib/types";

export default function SettingsPage() {
  const state = useDadMode();
  const [childEditing, setChildEditing] = useState<ChildProfile | null>(null);
  const [caregiverEditing, setCaregiverEditing] = useState<CaregiverProfile | null>(null);
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [caregiverName, setCaregiverName] = useState("");

  function submitChild(event: FormEvent) {
    event.preventDefault();
    if (childEditing) {
      state.updateChild(childEditing.id, { name: childName, birthDate });
    } else {
      state.addChild(childName, birthDate);
    }
    setChildEditing(null);
    setChildName("");
    setBirthDate("");
  }

  function editChild(child: ChildProfile) {
    setChildEditing(child);
    setChildName(child.name);
    setBirthDate(child.birthDate);
  }

  function submitCaregiver(event: FormEvent) {
    event.preventDefault();
    if (caregiverEditing) {
      state.updateCaregiver(caregiverEditing.id, { name: caregiverName, color: caregiverEditing.color });
    } else {
      state.addCaregiver(caregiverName);
    }
    setCaregiverEditing(null);
    setCaregiverName("");
  }

  function editCaregiver(caregiver: CaregiverProfile) {
    setCaregiverEditing(caregiver);
    setCaregiverName(caregiver.name);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="grid gap-5 content-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#f9735b]">Settings</p>
          <h1 className="mt-1 text-3xl font-black text-stone-950 dark:text-stone-50">Tune the household.</h1>
        </div>

        <Card>
          <h2 className="mb-3 text-lg font-black text-stone-950 dark:text-stone-50">Children</h2>
          <form className="grid gap-3" onSubmit={submitChild}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <Input value={childName} onChange={(event) => setChildName(event.target.value)} placeholder="Riley" required />
              </Field>
              <Field label="Birth date">
                <Input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required />
              </Field>
            </div>
            <Button type="submit">
              <UserRoundPlus size={18} /> {childEditing ? "Save child" : "Add child"}
            </Button>
          </form>
          <div className="mt-4 grid gap-2">
            {state.children.map((child) => (
              <div key={child.id} className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 p-3 dark:bg-stone-900">
                <div>
                  <p className="font-black text-stone-950 dark:text-stone-50">{child.name}</p>
                  <p className="text-sm font-bold text-stone-500 dark:text-stone-400">Born {child.birthDate}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => editChild(child)} aria-label={`Edit ${child.name}`}>
                    <Edit3 size={17} />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => state.deleteChild(child.id)} aria-label={`Delete ${child.name}`} disabled={state.children.length <= 1}>
                    <Trash2 size={17} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-black text-stone-950 dark:text-stone-50">Caregivers</h2>
          <form className="grid gap-3" onSubmit={submitCaregiver}>
            <Field label="Name">
              <Input value={caregiverName} onChange={(event) => setCaregiverName(event.target.value)} placeholder="Parent A" required />
            </Field>
            <Button type="submit">
              <Plus size={18} /> {caregiverEditing ? "Save caregiver" : "Add caregiver"}
            </Button>
          </form>
          <div className="mt-4 grid gap-2">
            {state.caregivers.map((caregiver) => (
              <div key={caregiver.id} className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 p-3 dark:bg-stone-900">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full" style={{ background: caregiver.color }} />
                  <p className="font-black text-stone-950 dark:text-stone-50">{caregiver.name}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => editCaregiver(caregiver)} aria-label={`Edit ${caregiver.name}`}>
                    <Edit3 size={17} />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => state.deleteCaregiver(caregiver.id)} aria-label={`Delete ${caregiver.name}`} disabled={state.caregivers.length <= 2}>
                    <Trash2 size={17} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 content-start">
        <Card>
          <h2 className="mb-3 text-lg font-black text-stone-950 dark:text-stone-50">Routine defaults</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Feeding every hours">
              <Input
                type="number"
                min={1}
                value={state.routines.feedingEveryHours}
                onChange={(event) => state.updateRoutines({ ...state.routines, feedingEveryHours: Number(event.target.value) })}
              />
            </Field>
            <Field label="Nap check hours">
              <Input
                type="number"
                min={1}
                value={state.routines.napWindowHours}
                onChange={(event) => state.updateRoutines({ ...state.routines, napWindowHours: Number(event.target.value) })}
              />
            </Field>
            <Field label="Medicine window hours">
              <Input
                type="number"
                min={1}
                value={state.routines.medicineWindowHours}
                onChange={(event) => state.updateRoutines({ ...state.routines, medicineWindowHours: Number(event.target.value) })}
              />
            </Field>
            <Field label="Bedtime">
              <Input
                type="time"
                value={state.routines.bedtime}
                onChange={(event) => state.updateRoutines({ ...state.routines, bedtime: event.target.value })}
              />
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
            <Save size={18} />
            Saved automatically on this device.
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-black text-stone-950 dark:text-stone-50">Local-first data</h2>
          <p className="text-sm font-semibold leading-6 text-stone-600 dark:text-stone-300">
            DadMode stores the MVP in localStorage. There is no account, backend, payment, or external API.
          </p>
          <Button className="mt-4 w-full" variant="secondary" onClick={() => state.resetDemoData()}>
            <RefreshCw size={18} /> Reset demo data
          </Button>
        </Card>
      </section>
    </div>
  );
}
