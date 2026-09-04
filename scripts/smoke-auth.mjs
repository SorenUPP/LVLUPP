// node scripts/smoke-auth.mjs  — exercise sign-up, profile trigger, RLS scoping.
import { createClient } from "@supabase/supabase-js";
import { env, withClient } from "./lib/db.mjs";

const e = env();
const anon = createClient(e.EXPO_PUBLIC_SUPABASE_URL, e.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const email = `lvlupp.smoke.${Date.now()}@gmail.com`;
const password = "smoke-test-123";

const { data: signUp, error: signUpErr } = await anon.auth.signUp({ email, password });
console.log(
  "signUp:",
  signUpErr?.message ?? "ok",
  "session?",
  !!signUp.session,
  "user?",
  signUp.user?.id
);

let session = signUp.session;
if (!session) {
  // Email confirmation is on — confirm directly in the DB so the smoke test can continue.
  await withClient((c) =>
    c.query(`update auth.users set email_confirmed_at = now() where email = $1`, [email])
  );
  const { data: signIn, error: signInErr } = await anon.auth.signInWithPassword({
    email,
    password,
  });
  console.log("signIn after confirm:", signInErr?.message ?? "ok", "session?", !!signIn.session);
  session = signIn.session;
}

const uid = session.user.id;
const authed = createClient(e.EXPO_PUBLIC_SUPABASE_URL, e.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${session.access_token}` } },
});

const { data: prof } = await authed.from("profiles").select("*").eq("id", uid).maybeSingle();
console.log(
  "profile row from trigger:",
  prof ? `${prof.name} / goal ${prof.weekly_goal}` : "MISSING"
);

const { error: logErr } = await authed.from("workout_logs").insert({
  user_id: uid,
  workout_name: "Smoke Test",
  duration: "10 min",
  calories: 50,
});
console.log("insert own log:", logErr?.message ?? "ok");

const { error: badLogErr } = await authed.from("workout_logs").insert({
  user_id: "00000000-0000-0000-0000-000000000000",
  workout_name: "Should Fail",
  duration: "1 min",
  calories: 1,
});
console.log("insert log as other user (want RLS error):", badLogErr?.message ?? "!! ALLOWED !!");

const { data: myLogs } = await authed.from("workout_logs").select("workout_name");
console.log(
  "my logs visible:",
  myLogs?.map((l) => l.workout_name)
);

const { data: sess, error: sessErr } = await authed
  .from("workout_sessions")
  .insert({ user_id: uid, workout_name: "Smoke", duration: "5 min", calories: 20 })
  .select()
  .single();
console.log("insert session:", sessErr?.message ?? `ok #${sess?.id}`);
const { error: setErr } = await authed.from("workout_session_sets").insert({
  session_id: sess.id,
  exercise_name: "Test",
  exercise_index: 0,
  set_number: 1,
  target_reps: "8",
  weight: "60 kg",
  completed: true,
});
console.log("insert session set:", setErr?.message ?? "ok");

const fresh = createClient(e.EXPO_PUBLIC_SUPABASE_URL, e.EXPO_PUBLIC_SUPABASE_ANON_KEY);
const { data: anonWorkouts } = await fresh.from("workouts").select("id").limit(1);
console.log("fresh anon can read workouts:", (anonWorkouts?.length ?? 0) > 0);
const { data: anonProfiles } = await fresh.from("profiles").select("*");
console.log("fresh anon profiles rows (want 0):", anonProfiles?.length ?? 0);
const { data: anonLogs } = await fresh.from("workout_logs").select("*");
console.log("fresh anon logs rows (want 0):", anonLogs?.length ?? 0);

await withClient((c) => c.query(`delete from auth.users where email = $1`, [email]));
console.log("cleaned up test user");
