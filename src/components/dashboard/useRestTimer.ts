import { useEffect, useRef, useState } from "react";

/**
 * Countdown rest timer. Self-correcting: one timeout per tick keyed on the
 * remaining seconds, so it always stops cleanly at zero (no runaway interval).
 *
 * `profileDefault` seeds the length and keeps updating it until the user
 * nudges the stepper mid-workout.
 */
export function useRestTimer(profileDefault: number) {
  const [duration, setDuration] = useState(profileDefault);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current) setDuration(profileDefault);
  }, [profileDefault]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      setSecondsLeft(null);
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const nudge = (delta: number) => {
    touched.current = true;
    setDuration((d) => Math.min(240, Math.max(15, d + delta)));
  };

  return {
    duration,
    secondsLeft,
    resting: secondsLeft !== null,
    start: () => setSecondsLeft(duration),
    skip: () => setSecondsLeft(null),
    nudge,
  };
}
