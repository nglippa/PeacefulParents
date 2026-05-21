"use client";

import { FormEvent, useState } from "react";
import { CloudRain, Coffee, Edit3, Music2, Plus, RefreshCw, Save, Trash2, UserRoundPlus, Volume2, Waves } from "lucide-react";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { usePeacefulParents } from "@/lib/store";
import type { AmbientSoundKey, CaregiverProfile, ChildProfile } from "@/lib/types";

const soundOptions: Array<{ key: AmbientSoundKey; label: string; icon: typeof CloudRain }> = [
  { key: "rain", label: "Soft rain", icon: CloudRain },
  { key: "cafe", label: "Quiet cafe", icon: Coffee },
  { key: "white-noise", label: "White noise", icon: Waves },
  { key: "lofi", label: "Lo-fi beats", icon: Music2 }
];

export default function SettingsPage() {
  const state = usePeacefulParents();
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
          <p className="text-sm font-black uppercase tracking-[0.14em] pp-accent">Settings</p>
          <h1 className="mt-1 text-3xl font-black pp-ink">Tune the calm.</h1>
          <p className="mt-2 text-sm font-semibold leading-6 pp-muted">Quiet defaults for a house that is doing its best.</p>
        </div>

        <Card>
          <h2 className="mb-3 text-lg font-black pp-ink">Children</h2>
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
              <div key={child.id} className="flex items-center justify-between gap-3 rounded-2xl pp-soft-surface p-3">
                <div>
                  <p className="font-black pp-ink">{child.name}</p>
                  <p className="text-sm font-bold pp-muted">Born {child.birthDate}</p>
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
          <h2 className="mb-3 text-lg font-black pp-ink">Caregivers</h2>
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
              <div key={caregiver.id} className="flex items-center justify-between gap-3 rounded-2xl pp-soft-surface p-3">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full" style={{ background: caregiver.color }} />
                  <p className="font-black pp-ink">{caregiver.name}</p>
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
          <h2 className="mb-3 text-lg font-black pp-ink">Routine defaults</h2>
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
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#e2ece4] p-3 text-sm font-bold text-[#566d5d] dark:bg-[#2f4136] dark:text-[#c8ddcf]">
            <Save size={18} />
            Saved automatically on this device.
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-black pp-ink">Ambient sound placeholders</h2>
          <p className="mb-4 text-sm font-semibold leading-6 pp-muted">
            Audio is not implemented yet. These settings prepare PeacefulParents for future rain, cafe, white noise, or lo-fi ambience.
          </p>
          <div className="grid gap-3">
            <button
              onClick={() => state.updateAmbientSound({ ...state.ambientSound, enabled: !state.ambientSound.enabled })}
              className="pp-soft-surface flex min-h-14 items-center justify-between rounded-2xl px-4 text-left font-black transition hover:opacity-90"
            >
              <span className="flex items-center gap-2">
                <Volume2 size={18} /> Ambient layer
              </span>
              <span className="rounded-full bg-[var(--pp-navy)] px-3 py-1 text-xs text-[#fff7e8]">
                {state.ambientSound.enabled ? "Prepared" : "Off"}
              </span>
            </button>
            <Field label="Preferred sound">
              <Select
                value={state.ambientSound.selected}
                onChange={(event) => state.updateAmbientSound({ ...state.ambientSound, selected: event.target.value as AmbientSoundKey })}
              >
                {soundOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={`Future volume: ${state.ambientSound.volume}%`}>
              <Input
                type="range"
                min={0}
                max={100}
                value={state.ambientSound.volume}
                onChange={(event) => state.updateAmbientSound({ ...state.ambientSound, volume: Number(event.target.value) })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              {soundOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.key} className="pp-soft-surface flex items-center gap-2 rounded-2xl p-3 text-sm font-black pp-muted">
                    <Icon size={17} /> {option.label}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-black pp-ink">Local-first data</h2>
          <p className="text-sm font-semibold leading-6 pp-muted">
            PeacefulParents stores the MVP in localStorage. There is no account, backend, payment, or external API.
          </p>
          <Button className="mt-4 w-full" variant="secondary" onClick={() => state.resetDemoData()}>
            <RefreshCw size={18} /> Reset demo data
          </Button>
        </Card>
      </section>
    </div>
  );
}
