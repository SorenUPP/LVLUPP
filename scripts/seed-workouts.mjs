/**
 * Add workouts to the Supabase `workouts` table.
 *
 *   node scripts/seed-workouts.mjs           # insert the rows in NEW_WORKOUTS below
 *   node scripts/seed-workouts.mjs --list    # just print what's already in the table
 *
 * Edit the NEW_WORKOUTS array, then run it. Safe to run repeatedly — it skips any
 * workout whose `name` already exists.
 *
 * Auth: uses SUPABASE_SERVICE_ROLE_KEY from .env if present (bypasses RLS, best for
 * seeding). Otherwise falls back to the public anon key, which only works if the
 * `workouts` table has an INSERT policy for anon. If you get a "row-level security"
 * error, add the service role key to .env (Supabase dashboard → Project Settings →
 * API → service_role) or insert via the SQL editor instead.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const env = Object.fromEntries(
  readFileSync(join(root, ".env"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or a key in .env");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

// ---------------------------------------------------------------------------
// Column reference for `workouts`:
//   name        text   – "UPPER BODY STRENGTH"
//   duration    text   – "52 min"
//   exercises   int    – number of exercises (usually sets.length)
//   calories    int    – 420
//   category    text   – "Strength" | "Cardio" | "HIIT" | "Mobility" | ...
//                        (this is what the Train tab's filter chips are built from)
//   tag         text   – "TODAY" (dashboard picks this as the featured workout),
//                        "POPULAR", "NEW", or null
//   image       text   – image URL (Unsplash etc.)
//   difficulty  text   – "Beginner" | "Intermediate" | "Advanced"
//   equipment   text   – "Barbell · Dumbbells · Cable"
//   description text
//   sets        jsonb  – array of { name, sets:int, reps:string, weight:string,
//                        rest:string, muscle:string }
// `id` is auto-generated — do not set it.
// ---------------------------------------------------------------------------

const NEW_WORKOUTS = [
  {
    name: "LOWER BODY POWER",
    duration: "48 min",
    calories: 460,
    category: "Strength",
    tag: null,
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&auto=format",
    difficulty: "Intermediate",
    equipment: "Barbell · Dumbbells",
    description:
      "Heavy compound leg work focused on the squat and hinge patterns for maximal strength and glute development.",
    sets: [
      { name: "Back Squat", sets: 5, reps: "5", weight: "100 kg", rest: "120s", muscle: "Quads" },
      {
        name: "Romanian Deadlift",
        sets: 4,
        reps: "8",
        weight: "90 kg",
        rest: "90s",
        muscle: "Hamstrings",
      },
      {
        name: "Walking Lunges",
        sets: 3,
        reps: "12",
        weight: "20 kg",
        rest: "75s",
        muscle: "Glutes",
      },
      { name: "Leg Press", sets: 3, reps: "12", weight: "160 kg", rest: "75s", muscle: "Quads" },
      {
        name: "Standing Calf Raise",
        sets: 4,
        reps: "15",
        weight: "40 kg",
        rest: "45s",
        muscle: "Calves",
      },
    ],
  },
  {
    name: "FULL BODY HYPERTROPHY",
    duration: "58 min",
    calories: 500,
    category: "Strength",
    tag: null,
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&auto=format",
    difficulty: "Advanced",
    equipment: "Barbell · Dumbbells · Machines",
    description:
      "A high-volume full-body session hitting every major muscle group for balanced muscle growth.",
    sets: [
      { name: "Deadlift", sets: 4, reps: "6", weight: "120 kg", rest: "120s", muscle: "Back" },
      {
        name: "Incline Bench Press",
        sets: 4,
        reps: "8",
        weight: "70 kg",
        rest: "90s",
        muscle: "Chest",
      },
      { name: "Pull-Ups", sets: 3, reps: "10", weight: "BW", rest: "90s", muscle: "Back" },
      {
        name: "Dumbbell Shoulder Press",
        sets: 3,
        reps: "10",
        weight: "24 kg",
        rest: "75s",
        muscle: "Shoulders",
      },
      {
        name: "Bulgarian Split Squat",
        sets: 3,
        reps: "10",
        weight: "20 kg",
        rest: "75s",
        muscle: "Legs",
      },
      { name: "Barbell Curl", sets: 3, reps: "12", weight: "30 kg", rest: "60s", muscle: "Biceps" },
    ],
  },
  {
    name: "20-MINUTE HIIT SHRED",
    duration: "20 min",
    calories: 280,
    category: "HIIT",
    tag: "NEW",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&auto=format",
    difficulty: "Intermediate",
    equipment: "Bodyweight",
    description:
      "Fast, equipment-free intervals designed to raise your heart rate and torch calories in minimal time.",
    sets: [
      {
        name: "Jumping Jacks",
        sets: 4,
        reps: "40s",
        weight: "BW",
        rest: "20s",
        muscle: "Full Body",
      },
      { name: "High Knees", sets: 4, reps: "40s", weight: "BW", rest: "20s", muscle: "Cardio" },
      { name: "Squat Jumps", sets: 4, reps: "30s", weight: "BW", rest: "30s", muscle: "Legs" },
      {
        name: "Plank Shoulder Taps",
        sets: 4,
        reps: "30s",
        weight: "BW",
        rest: "30s",
        muscle: "Core",
      },
    ],
  },
  {
    name: "ENDURANCE ROW INTERVALS",
    duration: "35 min",
    calories: 400,
    category: "Cardio",
    tag: null,
    image:
      "https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=800&h=600&fit=crop&auto=format",
    difficulty: "Intermediate",
    equipment: "Rowing Machine",
    description:
      "Structured rowing intervals to build aerobic capacity and muscular endurance across the whole body.",
    sets: [
      {
        name: "Warm-up Row",
        sets: 1,
        reps: "5 min",
        weight: "Easy",
        rest: "60s",
        muscle: "Cardio",
      },
      {
        name: "500m Intervals",
        sets: 6,
        reps: "500m",
        weight: "Hard",
        rest: "90s",
        muscle: "Full Body",
      },
      {
        name: "Steady Row",
        sets: 1,
        reps: "8 min",
        weight: "Moderate",
        rest: "0s",
        muscle: "Cardio",
      },
      {
        name: "Cooldown Row",
        sets: 1,
        reps: "3 min",
        weight: "Easy",
        rest: "0s",
        muscle: "Cardio",
      },
    ],
  },
  {
    name: "CORE & STABILITY",
    duration: "25 min",
    calories: 180,
    category: "Core",
    tag: null,
    image:
      "https://images.unsplash.com/photo-1544216717-3bbf52512659?w=800&h=600&fit=crop&auto=format",
    difficulty: "Beginner",
    equipment: "Mat · Ab Wheel",
    description:
      "A focused midsection circuit building anti-rotation strength, bracing, and a resilient lower back.",
    sets: [
      { name: "Dead Bug", sets: 3, reps: "12/side", weight: "BW", rest: "45s", muscle: "Core" },
      { name: "Ab Wheel Rollout", sets: 3, reps: "10", weight: "BW", rest: "60s", muscle: "Abs" },
      {
        name: "Pallof Press",
        sets: 3,
        reps: "12/side",
        weight: "15 kg",
        rest: "45s",
        muscle: "Obliques",
      },
      { name: "Hanging Knee Raise", sets: 3, reps: "12", weight: "BW", rest: "60s", muscle: "Abs" },
      {
        name: "Side Plank",
        sets: 3,
        reps: "40s/side",
        weight: "BW",
        rest: "30s",
        muscle: "Obliques",
      },
    ],
  },
  {
    name: "MOBILITY & RECOVERY FLOW",
    duration: "22 min",
    calories: 90,
    category: "Mobility",
    tag: null,
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&auto=format",
    difficulty: "Beginner",
    equipment: "Mat · Foam Roller",
    description:
      "A gentle full-body session to improve range of motion and speed up recovery between hard training days.",
    sets: [
      { name: "Foam Roll Quads", sets: 1, reps: "60s", weight: "BW", rest: "15s", muscle: "Quads" },
      {
        name: "World's Greatest Stretch",
        sets: 2,
        reps: "8/side",
        weight: "BW",
        rest: "20s",
        muscle: "Hips",
      },
      { name: "Cat-Cow", sets: 2, reps: "10", weight: "BW", rest: "15s", muscle: "Spine" },
      { name: "90/90 Hip Switch", sets: 2, reps: "10", weight: "BW", rest: "20s", muscle: "Hips" },
      {
        name: "Thoracic Rotation",
        sets: 2,
        reps: "8/side",
        weight: "BW",
        rest: "15s",
        muscle: "T-Spine",
      },
    ],
  },
];

async function list() {
  const { data, error } = await sb
    .from("workouts")
    .select("id,name,category,tag,difficulty,exercises")
    .order("id");
  if (error) throw error;
  console.table(data);
}

async function seed() {
  const { data: existing, error: readErr } = await sb.from("workouts").select("name");
  if (readErr) throw readErr;
  const have = new Set((existing ?? []).map((r) => r.name.toLowerCase()));

  const rows = NEW_WORKOUTS.filter((w) => !have.has(w.name.toLowerCase())).map((w) => ({
    ...w,
    exercises: w.exercises ?? w.sets.length,
  }));

  if (rows.length === 0) {
    console.log("Nothing to insert — every workout in NEW_WORKOUTS already exists.");
    return;
  }

  const { data, error } = await sb.from("workouts").insert(rows).select("id,name,category");
  if (error) {
    console.error("Insert failed:", error.message);
    if (/row-level security/i.test(error.message)) {
      console.error(
        "\n→ The anon key can't insert. Add SUPABASE_SERVICE_ROLE_KEY to .env, or insert via the Supabase SQL editor."
      );
    }
    process.exit(1);
  }
  console.log(`Inserted ${data.length} workout(s):`);
  console.table(data);
}

const mode = process.argv.includes("--list") ? list : seed;
mode().catch((e) => {
  console.error(e);
  process.exit(1);
});
