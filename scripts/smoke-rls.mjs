/**
 * Verify the RLS policies by impersonating the `authenticated` role with a
 * JWT-claims GUC, exactly how Supabase evaluates them. Creates throwaway
 * auth.users directly (no GoTrue email limits). All work is rolled back.
 */
import { withClient } from "./lib/db.mjs";

const ZERO = "00000000-0000-0000-0000-000000000000";

await withClient(async (c) => {
  const mkUser = async () => {
    const { rows } = await c.query("select gen_random_uuid() u");
    const id = rows[0].u;
    await c.query(
      `insert into auth.users
         (id, instance_id, aud, role, email, encrypted_password,
          email_confirmed_at, created_at, updated_at)
       values ($1, $2, 'authenticated', 'authenticated', $3, 'x', now(), now(), now())`,
      [id, ZERO, `rls-${Date.now()}-${Math.random()}@gmail.com`]
    );
    return id;
  };

  const asUser = async (uid, fn) => {
    await c.query("begin");
    await c.query("set local role authenticated");
    await c.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify({ sub: uid, role: "authenticated" }),
    ]);
    try {
      return await fn();
    } finally {
      await c.query("rollback");
    }
  };

  const alice = await mkUser();
  const bob = await mkUser();

  const prof = await c.query("select name, weekly_goal from public.profiles where id = $1", [
    alice,
  ]);
  console.log("trigger created profile:", prof.rows[0] ?? "MISSING");

  await asUser(alice, async () => {
    const s = await c.query(
      `insert into public.workout_sessions (user_id, workout_name, duration, calories)
       values ($1, 'Smoke', '5 min', 20) returning id`,
      [alice]
    );
    await c.query(
      `insert into public.workout_session_sets
         (session_id, exercise_name, exercise_index, set_number, target_reps, weight, completed)
       values ($1, 'Test', 0, 1, '8', '60 kg', true)`,
      [s.rows[0].id]
    );
    const n = await c.query("select count(*)::int n from public.workout_session_sets");
    console.log("alice: inserted session + set, sees", n.rows[0].n, "set(s)");
  });

  await asUser(bob, async () => {
    const sets = await c.query("select count(*)::int n from public.workout_session_sets");
    const sess = await c.query("select count(*)::int n from public.workout_sessions");
    const profs = await c.query("select count(*)::int n from public.profiles");
    console.log(
      `bob sees: ${sets.rows[0].n} sets, ${sess.rows[0].n} sessions, ${profs.rows[0].n} profiles (want 0/0/1 — his own profile)`
    );
    try {
      await c.query(
        `insert into public.workout_logs (user_id, workout_name, duration, calories)
         values ($1, 'hack', '1', 1)`,
        [alice]
      );
      console.log("!! bob inserted a log for alice — RLS HOLE");
    } catch (err) {
      console.log("bob blocked from writing as alice:", err.message.split("\n")[0]);
    }
  });

  await c.query("delete from auth.users where id = any($1)", [[alice, bob]]);
  console.log("cleaned up");
});
