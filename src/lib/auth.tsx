import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearQueryCache } from "./queries";
import { supabase } from "./supabase";

interface AuthResult {
  ok: boolean;
  /** Set when sign-up succeeded but the account still needs email confirmation. */
  needsConfirmation?: boolean;
  error?: string;
}

interface AuthContextValue {
  session: Session | null;
  userId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  /** Confirm a new account with the 6-digit code from the sign-up email. */
  verifyCode: (email: string, token: string) => Promise<AuthResult>;
  /** Re-send the sign-up confirmation code. */
  resendCode: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

/** signInWithPassword error shown when the address was never confirmed. */
export function isUnconfirmedError(message?: string): boolean {
  return !!message && /not confirmed/i.test(message);
}

const AuthContext = createContext<AuthContextValue | null>(null);
const signupGatewayUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/signup`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authEventVersion = 0;
    supabase.auth.getSession().then(({ data }) => {
      // Do not let a slower initial read overwrite a newer sign-out event.
      if (authEventVersion === 0) setSession(data.session);
      setLoading(false);
    });
    let prevUser: string | null = null;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      authEventVersion += 1;
      const nextUser = next?.user.id ?? null;
      if (nextUser !== prevUser) clearQueryCache();
      prevUser = nextUser;
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(signupGatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        needsConfirmation?: boolean;
      };
      if (!response.ok) {
        return { ok: false, error: body.error ?? "Could not create account." };
      }
      if (response.ok) return { ok: true, needsConfirmation: body.needsConfirmation ?? true };
    } catch {
      return { ok: false, error: "Sign-up is temporarily unavailable. Please try again later." };
    }
    return { ok: false, error: "Could not create account." };
  }, []);

  const verifyCode = useCallback(async (email: string, token: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: "signup",
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const resendCode = useCallback(async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) console.log("sign-out:", error);
    } finally {
      // Always leave the protected tree, even if the remote logout response fails.
      setSession(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      userId: session?.user.id ?? null,
      loading,
      signIn,
      signUp,
      verifyCode,
      resendCode,
      signOut,
    }),
    [session, loading, signIn, signUp, verifyCode, resendCode, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
}

/** For hooks that need the id but shouldn't crash outside the provider. */
export function useUserId(): string {
  const { userId } = useAuth();
  if (!userId) throw new Error("No authenticated user");
  return userId;
}
