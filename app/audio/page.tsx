"use client";

import { Headphones, Moon, Waves } from "lucide-react";
import { AudioPlayer } from "@/components/audio/audio-player";
import { Card, CalmPageTitle, Pill } from "@/components/ui";
import { audioCategories } from "@/lib/audio/tracks";

export default function AudioPage() {
  return (
    <div className="grid gap-5">
      <CalmPageTitle
        eyebrow="Audio"
        title="A quiet room in your pocket."
        body="White noise, soft loops, and lowfi ambience for babies, parents, and the strange hours in between."
      />

      <Card className="overflow-hidden">
        <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
          <div className="grid h-16 w-16 place-items-center rounded-[1.35rem] bg-[linear-gradient(145deg,#405666,#273946)] text-[#fff7e8] shadow-soft">
            <Headphones size={28} />
          </div>
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Pill className="border-[var(--pp-line)] bg-[rgba(255,250,240,0.42)] text-[var(--pp-muted)] dark:bg-[rgba(255,244,224,0.06)]">
                <Moon size={13} className="mr-1" /> Dim nursery mode
              </Pill>
              <Pill className="border-[var(--pp-line)] bg-[rgba(255,250,240,0.42)] text-[var(--pp-muted)] dark:bg-[rgba(255,244,224,0.06)]">
                <Waves size={13} className="mr-1" /> Seamless loops
              </Pill>
            </div>
            <p className="text-sm font-semibold leading-6 pp-muted">
              No Bluetooth pairing lives here. PeacefulParents uses normal device audio output, so already-connected speakers, headphones, car audio, or nursery speakers work naturally.
            </p>
          </div>
        </div>
      </Card>

      <AudioPlayer />

      <Card>
        <h2 className="text-lg font-black pp-ink">Sound categories</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {audioCategories.map((category) => (
            <Pill key={category} className="border-[var(--pp-line)] bg-[rgba(255,250,240,0.5)] text-[var(--pp-muted)] dark:bg-[rgba(255,244,224,0.07)]">
              {category}
            </Pill>
          ))}
        </div>
      </Card>
    </div>
  );
}
