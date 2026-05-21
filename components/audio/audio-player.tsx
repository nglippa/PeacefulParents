"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { Button, Pill } from "@/components/ui";
import { audioTracks, sleepTimerOptions, type AudioTrack, type SleepTimerMinutes } from "@/lib/audio/tracks";
import { cn } from "@/lib/utils";

type PlayerStatus = "idle" | "playing" | "paused";
type TimerNotice = {
  id: number;
  message: string;
};

export function AudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(audioTracks[0]);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [volume, setVolume] = useState(45);
  const [timerMinutes, setTimerMinutes] = useState<SleepTimerMinutes>(0);
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(null);
  const [notice, setNotice] = useState<TimerNotice | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const fallbackRef = useRef<FallbackSound | null>(null);
  const wantsPlaybackRef = useRef(false);

  const timeLeft = useTimerCountdown(timerEndsAt);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
    fallbackRef.current?.setVolume(volume / 100);
  }, [volume]);

  useEffect(() => {
    if (status !== "playing") return;
    setTimer(timerMinutes);
    return () => clearTimer();
  }, [timerMinutes, status]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopFallback(fallbackRef);
    };
  }, []);

  async function play(track = currentTrack) {
    setCurrentTrack(track);
    setUsingFallback(false);
    stopFallback(fallbackRef);

    const audio = audioRef.current;
    if (!audio) return;
    wantsPlaybackRef.current = true;
    audio.loop = true;
    audio.volume = volume / 100;
    audio.src = track.src;
    setStatus("playing");

    try {
      await audio.play();
      setTimer(timerMinutes);
    } catch {
      startFallback(track);
    }
  }

  function pause() {
    wantsPlaybackRef.current = false;
    audioRef.current?.pause();
    fallbackRef.current?.pause();
    clearTimer();
    setStatus("paused");
  }

  function stop(showNotice = false) {
    wantsPlaybackRef.current = false;
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    stopFallback(fallbackRef);
    clearTimer();
    setStatus("idle");
    setTimerEndsAt(null);
    if (showNotice) {
      setNotice({ id: Date.now(), message: "Sound session ended gently." });
      window.setTimeout(() => setNotice(null), 4600);
    }
  }

  function switchTrack(track: AudioTrack) {
    if (currentTrack.id === track.id && status === "playing") return;
    setCurrentTrack(track);
    if (status === "playing") void play(track);
  }

  function setTimer(minutes: SleepTimerMinutes) {
    clearTimer();
    if (!minutes) {
      setTimerEndsAt(null);
      return;
    }
    const endsAt = Date.now() + minutes * 60 * 1000;
    setTimerEndsAt(endsAt);
    timerRef.current = window.setTimeout(() => stop(true), minutes * 60 * 1000);
  }

  function clearTimer() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  function startFallback(track: AudioTrack) {
    stopFallback(fallbackRef);
    wantsPlaybackRef.current = true;
    fallbackRef.current = createFallbackSound(track, volume / 100);
    fallbackRef.current.play();
    setUsingFallback(true);
    setStatus("playing");
    setTimer(timerMinutes);
  }

  return (
    <div className="grid gap-5">
      <audio ref={audioRef} preload="none" loop onError={() => wantsPlaybackRef.current && startFallback(currentTrack)} />

      <section className="relative overflow-hidden rounded-[2rem] border border-[rgba(255,247,232,0.12)] bg-[linear-gradient(145deg,#33495a_0%,#263947_48%,#202d36_100%)] p-5 text-[#fff7e8] shadow-soft backdrop-blur-2xl dark:border-[rgba(255,247,232,0.1)] dark:bg-[linear-gradient(145deg,#2d4352_0%,#23333e_52%,#1b252d_100%)]">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl" style={{ background: `${currentTrack.accent}38` }} />
        <div className="absolute -bottom-24 left-8 h-56 w-56 rounded-full bg-[#d0a36c]/14 blur-3xl" />
        <div className="relative">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f2dfbb]/80">Currently playing</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">{currentTrack.title}</h2>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/68">{currentTrack.description}</p>
            </div>
            <Pill className="border-white/10 bg-white/10 text-[#f2dfbb]">{status === "playing" ? "Looping" : status === "paused" ? "Paused" : "Ready"}</Pill>
          </div>

          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex gap-2">
              {status === "playing" ? (
                <Button variant="secondary" size="lg" onClick={pause} className="bg-white/12 text-[#fff7e8] hover:bg-white/18">
                  <Pause size={20} /> Pause
                </Button>
              ) : (
                <Button size="lg" onClick={() => play()} className="bg-[#f2dfbb] text-[#2f4151] hover:bg-[#f6e8ca]">
                  <Play size={20} /> Play
                </Button>
              )}
              <Button variant="ghost" size="lg" onClick={() => stop()} className="bg-white/10 text-[#fff7e8] hover:bg-white/16">
                <Square size={18} /> Stop
              </Button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-black text-white/75">
                <span className="flex items-center gap-2">
                  <Volume2 size={16} /> Volume
                </span>
                <span>{volume}%</span>
              </div>
              <input
                aria-label="Volume"
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="w-full accent-[#f2dfbb]"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <label className="grid gap-1.5 text-sm font-black text-white/72">
              Sleep timer
              <select
                value={timerMinutes}
                onChange={(event) => setTimerMinutes(Number(event.target.value) as SleepTimerMinutes)}
                className="min-h-12 rounded-2xl border border-white/10 bg-white/10 px-4 font-black text-[#fff7e8] outline-none"
              >
                {sleepTimerOptions.map((option) => (
                  <option key={option.minutes} value={option.minutes} className="bg-[#273946]">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white/78">
              {timerMinutes && timerEndsAt ? `Gently stops in ${timeLeft}` : "Continuous until you stop it"}
            </div>
          </div>

          <p className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-semibold leading-6 text-white/72">
            Audio will play through your current device output, including connected Bluetooth speakers.
          </p>

          {usingFallback ? <p className="mt-3 text-xs font-bold text-[#f2dfbb]/78">Generated local sound</p> : null}
        </div>
      </section>

      <TrackLibrary currentTrack={currentTrack} onSelect={switchTrack} />

      <AnimatePresence>
        {notice ? (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md rounded-3xl border border-[var(--pp-line)] bg-[rgba(255,250,240,0.88)] p-4 text-center font-black text-[var(--pp-ink)] shadow-soft backdrop-blur-xl dark:bg-[rgba(32,38,42,0.9)]"
          >
            {notice.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TrackLibrary({ currentTrack, onSelect }: { currentTrack: AudioTrack; onSelect: (track: AudioTrack) => void }) {
  const grouped = useMemo(() => audioTracks, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {grouped.map((track) => (
        <button
          key={track.id}
          onClick={() => onSelect(track)}
          className={cn(
            "pp-card min-h-32 rounded-[1.55rem] p-4 text-left transition duration-300 hover:-translate-y-0.5",
            currentTrack.id === track.id && "ring-2 ring-[var(--pp-accent)]"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] pp-accent">{track.category}</p>
              <h3 className="mt-2 text-xl font-black pp-ink">{track.title}</h3>
            </div>
            <span className="h-4 w-4 rounded-full" style={{ background: track.accent }} />
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 pp-muted">{track.description}</p>
        </button>
      ))}
    </div>
  );
}

function useTimerCountdown(endsAt: number | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!endsAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [endsAt]);

  if (!endsAt) return "";
  const seconds = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

type FallbackSound = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
};

function createFallbackSound(track: AudioTrack, volume: number): FallbackSound {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return {
      play: () => undefined,
      pause: () => undefined,
      stop: () => undefined,
      setVolume: () => undefined
    };
  }
  const context = new AudioContextClass();
  const gain = context.createGain();
  const softener = context.createBiquadFilter();
  softener.type = "lowpass";
  softener.frequency.value = track.tone === "music" ? 1450 : track.id === "white" ? 2600 : 1800;
  gain.gain.value = 0;
  gain.connect(softener);
  softener.connect(context.destination);
  gain.gain.setTargetAtTime(getTrackVolume(track, volume), context.currentTime, 0.35);

  const nodes: AudioNode[] = [];
  const cleanups: Array<() => void> = [];
  const timers: number[] = [];

  if (track.tone === "music") {
    createMusicLoop(context, gain, track.id, nodes, cleanups, timers);
  } else {
    createAmbientTexture(context, gain, track, nodes, cleanups);
  }

  let stopped = false;

  return {
    play: () => void context.resume(),
    pause: () => void context.suspend(),
    stop: () => {
      if (stopped) return;
      stopped = true;
      timers.forEach((timer) => window.clearInterval(timer));
      gain.gain.setTargetAtTime(0.0001, context.currentTime, 0.08);
      cleanups.forEach((cleanup) => cleanup());
      nodes.forEach((node) => node.disconnect());
      void context.close();
    },
    setVolume: (nextVolume) => {
      gain.gain.setTargetAtTime(getTrackVolume(track, nextVolume), context.currentTime, 0.12);
    }
  };
}

function stopFallback(ref: MutableRefObject<FallbackSound | null>) {
  ref.current?.stop();
  ref.current = null;
}

function getFallbackFrequencies(track: AudioTrack) {
  if (track.id === "womb") return [92, 138];
  if (track.id === "fan") return [118, 236];
  if (track.id === "lofi") return [196, 246.94, 329.63];
  if (track.id === "piano") return [261.63, 329.63, 392];
  if (track.id === "night") return [174, 220];
  return [110];
}

function getTrackVolume(track: AudioTrack, volume: number) {
  if (track.tone === "music") return volume * 0.23;
  if (track.id === "white") return volume * 0.2;
  if (track.id === "brown" || track.id === "pink") return volume * 0.3;
  return volume * 0.28;
}

function createAmbientTexture(
  context: AudioContext,
  destination: AudioNode,
  track: AudioTrack,
  nodes: AudioNode[],
  cleanups: Array<() => void>
) {
  if (track.tone === "noise" || track.tone === "water" || track.tone === "room") {
    const noise = createNoiseNode(context, track.id);
    const filter = context.createBiquadFilter();
    filter.type = track.id === "rain" ? "bandpass" : "lowpass";
    filter.frequency.value = getNoiseFrequency(track);
    filter.Q.value = track.id === "rain" ? 0.45 : 0.15;
    const textureGain = context.createGain();
    textureGain.gain.value = 0.92;

    if (track.id === "ocean" || track.id === "night") {
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.type = "sine";
      lfo.frequency.value = track.id === "ocean" ? 0.09 : 0.035;
      lfoGain.gain.value = track.id === "ocean" ? 0.34 : 0.16;
      textureGain.gain.value = track.id === "ocean" ? 0.64 : 0.5;
      lfo.connect(lfoGain);
      lfoGain.connect(textureGain.gain);
      lfo.start();
      nodes.push(lfo, lfoGain);
      cleanups.push(() => lfo.stop());
    }

    noise.connect(filter);
    filter.connect(textureGain);
    textureGain.connect(destination);
    nodes.push(noise, filter, textureGain);
    cleanups.push(() => noise.stop());
  }

  getFallbackFrequencies(track).forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const localGain = context.createGain();
    oscillator.type = track.id === "womb" ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    localGain.gain.value = track.tone === "hum" ? 0.06 / (index + 1) : 0.018 / (index + 1);
    oscillator.connect(localGain);
    localGain.connect(destination);
    oscillator.start();
    nodes.push(oscillator, localGain);
    cleanups.push(() => oscillator.stop());
  });
}

function createMusicLoop(
  context: AudioContext,
  destination: AudioNode,
  trackId: AudioTrack["id"],
  nodes: AudioNode[],
  cleanups: Array<() => void>,
  timers: number[]
) {
  const chords =
    trackId === "piano"
      ? [
          [261.63, 329.63, 392],
          [220, 277.18, 329.63],
          [246.94, 293.66, 369.99],
          [196, 246.94, 329.63]
        ]
      : [
          [196, 246.94, 329.63],
          [174.61, 220, 293.66],
          [146.83, 196, 246.94],
          [164.81, 207.65, 261.63]
        ];

  const chordGain = context.createGain();
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = trackId === "piano" ? 1150 : 780;
  chordGain.gain.value = 0.001;
  chordGain.connect(filter);
  filter.connect(destination);
  nodes.push(chordGain, filter);

  let chordIndex = 0;
  let activeOscillators: OscillatorNode[] = [];

  const playChord = () => {
    const now = context.currentTime;
    activeOscillators.forEach((oscillator) => {
      try {
        oscillator.stop(now + 0.35);
      } catch {
        // The oscillator may already be stopped during rapid track changes.
      }
    });

    chordGain.gain.cancelScheduledValues(now);
    chordGain.gain.setTargetAtTime(0.001, now, 0.3);
    chordGain.gain.setTargetAtTime(trackId === "piano" ? 0.24 : 0.32, now + 0.45, 1.1);

    activeOscillators = chords[chordIndex].map((frequency, index) => {
      const oscillator = context.createOscillator();
      const voiceGain = context.createGain();
      oscillator.type = trackId === "piano" ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index === 1 ? 3 : index === 2 ? -4 : 0;
      voiceGain.gain.value = trackId === "piano" ? 0.17 / (index + 1) : 0.12 / (index + 1);
      oscillator.connect(voiceGain);
      voiceGain.connect(chordGain);
      oscillator.start(now);
      nodes.push(oscillator, voiceGain);
      return oscillator;
    });

    chordIndex = (chordIndex + 1) % chords.length;
  };

  playChord();
  timers.push(window.setInterval(playChord, trackId === "piano" ? 5200 : 6400));
  cleanups.push(() => activeOscillators.forEach((oscillator) => oscillator.stop()));
}

function getNoiseFrequency(track: AudioTrack) {
  if (track.id === "brown") return 420;
  if (track.id === "pink") return 920;
  if (track.id === "rain") return 2400;
  if (track.id === "ocean") return 1050;
  if (track.id === "night") return 720;
  return 2200;
}

function createNoiseNode(context: AudioContext, trackId: AudioTrack["id"]) {
  const bufferSize = context.sampleRate * 2;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let i = 0; i < bufferSize; i += 1) {
    const white = Math.random() * 2 - 1;
    if (trackId === "brown") {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else if (trackId === "pink") {
      last = 0.92 * last + 0.08 * white;
      data[i] = last;
    } else {
      data[i] = white * 0.72;
    }
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.start();
  return source;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
