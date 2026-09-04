/**
 * Shared Postgres connection for the migration/introspection scripts.
 * Uses DIRECT_URL from .env (session-mode pooler on :5432 — supports DDL).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function env() {
  return Object.fromEntries(
    readFileSync(join(root, ".env"), "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [
          l.slice(0, i).trim(),
          l
            .slice(i + 1)
            .trim()
            .replace(/^["']|["']$/g, ""),
        ];
      })
  );
}

export async function withClient(fn) {
  const url = env().DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL missing from .env");
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: true } });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}
