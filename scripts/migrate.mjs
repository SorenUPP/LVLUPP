/**
 * Apply pending SQL migrations from scripts/migrations/ against the Supabase
 * database (DIRECT_URL in .env). Tracks applied files in public._migrations.
 *
 *   node scripts/migrate.mjs                 # apply all pending
 *   node scripts/migrate.mjs 002_foo.sql     # apply just this one (if pending)
 *   node scripts/migrate.mjs --status        # list applied / pending
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { withClient } from "./lib/db.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "migrations");
const arg = process.argv[2];

await withClient(async (c) => {
  await c.query(`
    create table if not exists public._migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )`);

  const applied = new Set(
    (await c.query(`select name from public._migrations`)).rows.map((r) => r.name)
  );
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (arg === "--status") {
    for (const f of files) console.log(`${applied.has(f) ? "✓ applied" : "· pending"}  ${f}`);
    return;
  }

  let ran = 0;
  for (const f of files) {
    if (arg && f !== arg) continue;
    if (applied.has(f)) {
      console.log("skip (applied):", f);
      continue;
    }
    console.log("applying:", f);
    await c.query(readFileSync(join(dir, f), "utf8"));
    await c.query(`insert into public._migrations (name) values ($1)`, [f]);
    console.log("  ok");
    ran++;
  }
  console.log(ran === 0 ? "nothing to do" : `${ran} migration(s) applied`);
});
