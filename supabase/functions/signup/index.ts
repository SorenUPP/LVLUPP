import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function hashEmail(email: string): Promise<string> {
  const bytes = new TextEncoder().encode(email);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email || !password) return json({ error: "Email and password are required." }, 400);
  if (password.length < 6) return json({ error: "Password must be at least 6 characters." }, 400);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceRoleKey)
    return json({ error: "Signup service is not configured." }, 500);

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { data: limit, error: limitError } = await admin
    .rpc("consume_signup_attempt", { p_email_hash: await hashEmail(email) })
    .single();
  if (limitError) return json({ error: "Signup service is unavailable." }, 503);
  if (!limit.allowed) {
    return json(
      {
        error: "This email has reached its signup limit. Try again later.",
        retryAfterSeconds: limit.retry_after_seconds,
      },
      429
    );
  }

  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) return json({ error: error.message }, error.status ?? 400);
  if (data.user?.identities?.length === 0) {
    return json({ error: "That email is already registered. Sign in instead." }, 409);
  }

  return json({ ok: true, needsConfirmation: !data.session });
});
