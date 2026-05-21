import type { AudioTrackKind } from "@/lib/types";

export type SleepTimerMinutes = 15 | 30 | 45 | 60 | 120 | 0;

export type AudioTrack = {
  id: AudioTrackKind;
  title: string;
  category: string;
  description: string;
  src: string;
  tone: "noise" | "water" | "hum" | "music" | "room";
  accent: string;
};

export const sleepTimerOptions: Array<{ label: string; minutes: SleepTimerMinutes }> = [
  { label: "15 minutes", minutes: 15 },
  { label: "30 minutes", minutes: 30 },
  { label: "45 minutes", minutes: 45 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "Continuous", minutes: 0 }
];

export const audioTracks: AudioTrack[] = [
  {
    id: "white",
    title: "White Noise",
    category: "White Noise",
    description: "A steady blanket for busy little brains.",
    src: "/audio/white-noise.mp3",
    tone: "noise",
    accent: "#d7dfdf"
  },
  {
    id: "brown",
    title: "Brown Noise",
    category: "Brown Noise",
    description: "Lower, warmer noise for late-night settling.",
    src: "/audio/brown-noise.mp3",
    tone: "noise",
    accent: "#c1aa8f"
  },
  {
    id: "pink",
    title: "Pink Noise",
    category: "Pink Noise",
    description: "Soft balanced texture with gentle edges.",
    src: "/audio/pink-noise.mp3",
    tone: "noise",
    accent: "#d9b7bd"
  },
  {
    id: "rain",
    title: "Rain Loop",
    category: "Rain",
    description: "Windowpane rain for a dim cozy room.",
    src: "/audio/rain-loop.mp3",
    tone: "water",
    accent: "#8aa6bc"
  },
  {
    id: "ocean",
    title: "Ocean Loop",
    category: "Ocean",
    description: "Slow waves in, slow waves out.",
    src: "/audio/ocean-loop.mp3",
    tone: "water",
    accent: "#7fa4a9"
  },
  {
    id: "fan",
    title: "Fan Loop",
    category: "Fan",
    description: "Nursery fan hum without the draft.",
    src: "/audio/fan-loop.mp3",
    tone: "hum",
    accent: "#a8b3aa"
  },
  {
    id: "womb",
    title: "Womb-like Hum",
    category: "Womb-like hum",
    description: "Low rounded hum for tiny sleepers.",
    src: "/audio/womb-hum.mp3",
    tone: "hum",
    accent: "#b8957a"
  },
  {
    id: "lofi",
    title: "Soft Lofi",
    category: "Soft lowfi",
    description: "Slow room-tone pulse for parent reset moments.",
    src: "/audio/soft-lofi.mp3",
    tone: "music",
    accent: "#d0a36c"
  },
  {
    id: "piano",
    title: "Calm Piano",
    category: "Calm piano",
    description: "Sparse moonlit notes, no urgency.",
    src: "/audio/calm-piano.mp3",
    tone: "music",
    accent: "#b8bdd0"
  },
  {
    id: "night",
    title: "Night Ambience",
    category: "Night ambience",
    description: "A quiet room after everyone finally settles.",
    src: "/audio/night-ambience.mp3",
    tone: "room",
    accent: "#788b9b"
  }
];

export const audioCategories = Array.from(new Set(audioTracks.map((track) => track.category)));
