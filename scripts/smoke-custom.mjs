/**
 * Exercise the custom-workout tables + RLS by impersonating `authenticated`.
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
      [rows[0].u, ZERO, `cw-${Date.now()}-${Math.random()}@gmail.com`]
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
    const w = await c.query(
      `insert into public.custom_workouts (user_id, name) values ($1,'Push Day') returning id`,
      [alice]
    );
    const cwId = w.rows[0].id;
    await c.query(
      `insert into public.custom_workout_exercises
         (custom_workout_id, position, name, muscle, sets, reps, weight, rest, source_workout_id)
       values ($1,0,'Bench Press','Chest',4,'8','80 kg','90s',$2),
              ($1,1,'Overhead Press','Shoulders',3,'10','40 kg','60s',$2)`,
      [cwId, workoutId]
    );
    const read = await c.query(
      `select w.name, json_agg(e.name order by e.position) exercises
       from public.custom_workouts w
       join public.custom_workout_exercises e on e.custom_workout_id = w.id
       group by w.id, w.name`
    );
    console.log("alice reads back:", read.rows[0]);

    await c.query(`delete from public.custom_workouts where id = $1`, [cwId]);
    const left = await c.query(
      `select count(*)::int n from public.custom_workout_exercises where custom_workout_id = $1`,
      [cwId]
    );
    console.log("exercises after parent delete (want 0):", left.rows[0].n);
  });

  // Created outside asUser() so it commits, letting bob's session test RLS isolation.
  const cwId = (
    await c.query(
      `insert into public.custom_workouts (user_id, name) values ($1,'Secret') returning id`,
      [alice]
    )
  ).rows[0].id;
  await asUser(bob, async () => {
    const seen = await c.query("select count(*)::int n from public.custom_workouts");
    console.log("bob sees alice's custom workouts (want 0):", seen.rows[0].n);
    try {
      await c.query(
        `insert into public.custom_workout_exercises (custom_workout_id, name) values ($1,'inject')`,
        [cwId]
      );
      console.log("!! bob wrote into alice's custom workout — RLS HOLE");
    } catch (e) {
      console.log("bob blocked from writing into alice's workout:", e.message.split("\n")[0]);
    }
  });
  await c.query("delete from public.custom_workouts where id = $1", [cwId]);

  await c.query("delete from auth.users where id = any($1)", [[alice, bob]]);
  console.log("cleaned up");
});
