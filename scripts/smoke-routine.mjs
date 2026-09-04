/**
 * Exercise routine_days + custom-day sessions by impersonating `authenticated`.
 * Throwaway users, everything rolled back.
 */
import { withClient } from "./lib/db.mjs";

const ZERO = "00000000-0000-0000-0000-000000000000";

await withClient(async (c) => {
  const mkUser = async () => {
    const { rows } = await c.query("select gen_random_uuid() u");
    await c.query(
      `insert into auth.users
         (id, instance_id, aud, role, email, encrypted_password,
          email_confirmed_at, created_at, updated_at)
       values ($1,$2,'authenticated','authenticated',$3,'x',now(),now(),now())`,
      [rows[0].u, ZERO, `rt-${Date.now()}-${Math.random()}@gmail.com`]
    );
    return rows[0].u;
  };
  const asUser = async (uid, fn) => {
    await c.query("begin");
    await c.query("set local role authenticated");
    await c.query("select set_config('request.jwt.claims',$1,true)", [
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
  const workoutId = (await c.query("select id from public.workouts limit 1")).rows[0].id;

  await asUser(alice, async () => {
    const cw = await c.query(
      `insert into public.custom_workouts (user_id, name) values ($1,'Leg Day') returning id`,
      [alice]
    );
    const cwId = cw.rows[0].id;

    // assign Monday = template, Wednesday = custom, then re-assign Monday (upsert)
    await c.query(
      `insert into public.routine_days (user_id, weekday, workout_id) values ($1,1,$2)`,
      [alice, workoutId]
    );
    await c.query(
      `insert into public.routine_days (user_id, weekday, custom_workout_id) values ($1,3,$2)`,
      [alice, cwId]
    );
    await c.query(
      `insert into public.routine_days (user_id, weekday, custom_workout_id)
       values ($1,1,$2)
       on conflict (user_id, weekday) do update
         set workout_id = excluded.workout_id,
             custom_workout_id = excluded.custom_workout_id`,
      [alice, cwId]
    );
    const plan = await c.query(
      `select weekday, workout_id, custom_workout_id from public.routine_days
       where user_id = $1 order by weekday`,
      [alice]
    );
    console.log("alice plan:", plan.rows);

    await c.query("savepoint sp");
    try {
      await c.query(
        `insert into public.routine_days (user_id, weekday, workout_id, custom_workout_id)
         values ($1,5,$2,$3)`,
        [alice, workoutId, cwId]
      );
      console.log("!! check constraint let both targets through");
    } catch (e) {
      console.log("both-targets blocked:", e.message.split("\n")[0]);
      await c.query("rollback to savepoint sp");
    }

    const s = await c.query(
      `insert into public.workout_sessions (user_id, custom_workout_id, workout_name, duration, calories)
       values ($1,$2,'Leg Day','~30 min',180) returning id, workout_id, custom_workout_id`,
      [alice, cwId]
    );
    console.log("custom-day session:", s.rows[0]);
  });

  const cwId = (
    await c.query(
      `insert into public.custom_workouts (user_id, name) values ($1,'x') returning id`,
      [alice]
    )
  ).rows[0].id;
  await c.query(
    `insert into public.routine_days (user_id, weekday, custom_workout_id) values ($1,2,$2)`,
    [alice, cwId]
  );
  await asUser(bob, async () => {
    const seen = await c.query("select count(*)::int n from public.routine_days");
    console.log("bob sees alice's routine rows (want 0):", seen.rows[0].n);
  });
  await c.query("delete from public.custom_workouts where id = $1", [cwId]);

  await c.query("delete from auth.users where id = any($1)", [[alice, bob]]);
  console.log("cleaned up");
});
