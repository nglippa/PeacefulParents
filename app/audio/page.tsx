"use client";

import { useState } from "react";
import { Bluetooth, Headphones, Moon, Waves } from "lucide-react";
import { AudioPlayer } from "@/components/audio/audio-player";
import { Button, Card, CalmPageTitle, Pill } from "@/components/ui";
import { audioCategories } from "@/lib/audio/tracks";

type BluetoothNavigator = Navigator & {
  bluetooth?: {
    requestDevice: (options: { acceptAllDevices: boolean }) => Promise<{ name?: string | null }>;
  };
};

export default function AudioPage() {
  const [bluetoothMessage, setBluetoothMessage] = useState(
    "Pair a Bluetooth device here when supported, or use your device settings. Audio will play through your current output."
  );
  const [isPairing, setIsPairing] = useState(false);

  async function pairBluetoothDevice() {
    const bluetooth = (navigator as BluetoothNavigator).bluetooth;
    if (!bluetooth?.requestDevice) {
      setBluetoothMessage("Bluetooth pairing is not available in this browser. Connect your speaker in device settings, then return here.");
      return;
    }

    setIsPairing(true);
    try {
      const device = await bluetooth.requestDevice({ acceptAllDevices: true });
      setBluetoothMessage(
        device.name
          ? `${device.name} is ready when selected as your device output.`
          : "Bluetooth device selected. Use your device output settings if audio does not switch automatically."
      );
    } catch {
      setBluetoothMessage("No Bluetooth device was selected. You can try again here, or connect your speaker in device settings.");
    } finally {
      setIsPairing(false);
    }
  }

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
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Pill className="border-[var(--pp-line)] bg-[rgba(255,250,240,0.42)] text-[var(--pp-muted)] dark:bg-[rgba(255,244,224,0.06)]">
                  <Moon size={13} className="mr-1" /> Dim nursery mode
                </Pill>
                <Pill className="border-[var(--pp-line)] bg-[rgba(255,250,240,0.42)] text-[var(--pp-muted)] dark:bg-[rgba(255,244,224,0.06)]">
                  <Waves size={13} className="mr-1" /> Seamless loops
                </Pill>
              </div>
              <p className="text-sm font-semibold leading-6 pp-muted">{bluetoothMessage}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={pairBluetoothDevice}
              disabled={isPairing}
              className="w-full md:w-auto"
            >
              <Bluetooth size={18} />
              {isPairing ? "Pairing..." : "Bluetooth"}
            </Button>
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
