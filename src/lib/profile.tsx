import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth";
import { supabase } from "./supabase";

export type UnitSystem = "metric" | "imperial";

export interface Profile {
  name: string;
  avatarUrl: string;
  tagline: string;
  memberSince: string; // ISO date
  unitSystem: UnitSystem;
  weightKg: number | null;
  heightCm: number | null;
  weeklyGoal: number;
  restTimerSec: number;
  accent: string;
}

export const ACCENTS = ["#c8a96e", "#5b8c5a", "#4a72b5", "#b5544a", "#8a6bb0"];

export const DEFAULT_AVATAR_URL =
  "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=200&h=200&fit=crop&auto=format";

export const DEFAULT_PROFILE: Profile = {
  name: "Athlete",
  avatarUrl: DEFAULT_AVATAR_URL,
  tagline: "Getting stronger every week",
  memberSince: new Date().toISOString().slice(0, 10),
  unitSystem: "metric",
  weightKg: null,
  heightCm: null,
  weeklyGoal: 4,
  restTimerSec: 60,
  accent: ACCENTS[0],
};

// ---- row <-> Profile mapping ------------------------------------------

interface ProfileRow {
  id: string;
  name: string;
  avatar_url: string;
  tagline: string;
  member_since: string;
  unit_system: string;
  weight_kg: number | null;
  height_cm: number | null;
  weekly_goal: number;
  rest_timer_sec: number;
  accent: string;
}

function fromRow(r: ProfileRow): Profile {
  return {
    name: r.name,
    avatarUrl: r.avatar_url,
    tagline: r.tagline,
    memberSince: r.member_since,
    unitSystem: r.unit_system === "imperial" ? "imperial" : "metric",
    weightKg: r.weight_kg,
    heightCm: r.height_cm,
    weeklyGoal: r.weekly_goal,
    restTimerSec: r.rest_timer_sec,
    accent: r.accent,
  };
}

function toRow(p: Partial<Profile>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.avatarUrl !== undefined) row.avatar_url = p.avatarUrl;
  if (p.tagline !== undefined) row.tagline = p.tagline;
  if (p.unitSystem !== undefined) row.unit_system = p.unitSystem;
  if (p.weightKg !== undefined) row.weight_kg = p.weightKg;
  if (p.heightCm !== undefined) row.height_cm = p.heightCm;
  if (p.weeklyGoal !== undefined) row.weekly_goal = p.weeklyGoal;
  if (p.restTimerSec !== undefined) row.rest_timer_sec = p.restTimerSec;
  if (p.accent !== undefined) row.accent = p.accent;
  return row;
}

// ---- context ---------------------------------------------------------

interface ProfileContextValue {
  profile: Profile;
  ready: boolean;
  update: (patch: Partial<Profile>) => void;
  reset: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  // Coalesce rapid edits (stepper taps) into one write.
  const pending = useRef<Partial<Profile>>({});
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    setReady(false);
    (async () => {
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      if (error) console.log("profile load:", error);
      if (!data) {
        // Trigger normally creates the row; self-heal if it's missing.
        const created = await supabase
          .from("profiles")
          .insert({ id: userId })
          .select("*")
          .maybeSingle();
        data = created.data;
        if (created.error) console.log("profile create:", created.error);
      }
      if (active && data) setProfile(fromRow(data as ProfileRow));
      if (active) setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const flush = useCallback(() => {
    if (!userId) return;
    const patch = pending.current;
    pending.current = {};
    if (Object.keys(patch).length === 0) return;
    supabase
      .from("profiles")
      .update({ ...toRow(patch), updated_at: new Date().toISOString() })
      .eq("id", userId)
      .then(({ error }) => error && console.log("profile save:", error));
  }, [userId]);

  const update = useCallback(
    (patch: Partial<Profile>) => {
      setProfile((prev) => ({ ...prev, ...patch }));
      pending.current = { ...pending.current, ...patch };
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flush, 500);
    },
    [flush]
  );

  const reset = useCallback(() => {
    const next: Profile = { ...DEFAULT_PROFILE, memberSince: profile.memberSince };
    setProfile(next);
    pending.current = {};
    if (flushTimer.current) clearTimeout(flushTimer.current);
    if (userId) {
      supabase
        .from("profiles")
        .update({ ...toRow(next), updated_at: new Date().toISOString() })
        .eq("id", userId)
        .then(({ error }) => error && console.log("profile reset:", error));
    }
  }, [profile.memberSince, userId]);

  // Write out any buffered edit when the provider unmounts (e.g. sign-out).
  useEffect(() => flush, [flush]);

  const value = useMemo(() => ({ profile, ready, update, reset }), [profile, ready, update, reset]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a <ProfileProvider>");
  return ctx;
}

// ---- unit helpers ---------------------------------------------------------

export function displayWeight(kg: number | null, system: UnitSystem): string {
  if (kg == null) return "—";
  return system === "metric" ? `${Math.round(kg)} kg` : `${Math.round(kg * 2.20462)} lb`;
}

export function displayHeight(cm: number | null, system: UnitSystem): string {
  if (cm == null) return "—";
  if (system === "metric") return `${Math.round(cm)} cm`;
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inch = Math.round(totalInches % 12);
  return `${ft}'${inch}"`;
}

export function weightToKg(input: number, system: UnitSystem): number {
  return system === "metric" ? input : input / 2.20462;
}

export function heightToCm(input: number, system: UnitSystem): number {
  return system === "metric" ? input : input * 2.54;
}

export function weightInputValue(kg: number | null, system: UnitSystem): string {
  if (kg == null) return "";
  return String(system === "metric" ? Math.round(kg) : Math.round(kg * 2.20462));
}

export function heightInputValue(cm: number | null, system: UnitSystem): string {
  if (cm == null) return "";
  return String(system === "metric" ? Math.round(cm) : Math.round(cm / 2.54));
}
