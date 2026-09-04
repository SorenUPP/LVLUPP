// node scripts/introspect.mjs  — dump public schema, RLS, row counts, triggers
import { withClient } from "./lib/db.mjs";

await withClient(async (c) => {
  const cols = await c.query(`
    select table_name, column_name, data_type, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'public'
    order by table_name, ordinal_position`);
  let cur = null;
  for (const r of cols.rows) {
    if (r.table_name !== cur) {
      cur = r.table_name;
      console.log("\n== " + cur);
    }
    const nn = r.is_nullable === "NO" ? " NOT NULL" : "";
    const def = r.column_default ? " default " + r.column_default : "";
    console.log(`  ${r.column_name} :: ${r.data_type}${nn}${def}`);
  }

  const rls = await c.query(
    `select tablename, policyname, cmd, roles, qual, with_check
     from pg_policies where schemaname = 'public' order by tablename, cmd`
  );
  console.log("\n== RLS policies");
  for (const r of rls.rows)
    console.log(
      `  ${r.tablename}: ${r.policyname} [${r.cmd}] roles=${r.roles} using=${r.qual} check=${r.with_check}`
    );

  const rlsEnabled = await c.query(
    `select relname, relrowsecurity from pg_class
     where relnamespace = 'public'::regnamespace and relkind = 'r' order by relname`
  );
  console.log("\n== RLS enabled?");
  for (const r of rlsEnabled.rows) console.log(`  ${r.relname}: ${r.relrowsecurity}`);

  const trig = await c.query(
    `select event_object_table, trigger_name, action_timing, event_manipulation
     from information_schema.triggers where trigger_schema = 'public'`
  );
  console.log("\n== triggers", trig.rows);

  const tbls = [
    "workouts",
    "personal_bests",
    "workout_logs",
    "workout_sessions",
    "workout_session_sets",
    "classes",
    "profiles",
  ];
  const counts = {};
  for (const t of tbls) {
    try {
      const x = await c.query(`select count(*)::int n from public.${t}`);
      counts[t] = x.rows[0].n;
    } catch (e) {
      counts[t] = "ERR " + e.message;
    }
  }
  console.log("\n== row counts", counts);

  const users = await c.query(`select count(*)::int n from auth.users`);
  console.log("== auth.users", users.rows[0].n);
});
