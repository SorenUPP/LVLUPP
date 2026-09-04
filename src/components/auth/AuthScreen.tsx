import { LinearGradient } from "expo-linear-gradient";
import {
  Dumbbell as DumbbellIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  View,
} from "react-native";
import { isUnconfirmedError, useAuth } from "../../lib/auth";
import { Input } from "../ui/Input";
import { Text } from "../ui/Text";

type Mode = "signin" | "signup";

const inputClass =
  "rounded-xl border border-[#e5d9c8] bg-white px-4 py-3.5 text-base text-[#1a1410]";

export function AuthScreen() {
  const { signIn, signUp, verifyCode, resendCode } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | "code" | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const swap = (next: Mode) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const backToForm = () => {
    setPendingEmail(null);
    setCode("");
    setError(null);
    setNotice(null);
  };

  const submit = async () => {
    if (busy) return;
    setError(null);
    setNotice(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    const res = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);

    if (!res.ok) {
      if (mode === "signin" && isUnconfirmedError(res.error)) {
        setPendingEmail(email.trim());
        setNotice("This email isn't confirmed yet. Enter the code we emailed you.");
        return;
      }
      if (mode === "signup" && /confirmation email|500/i.test(res.error ?? "")) {
        setError(
          "Confirmation email could not be sent. Check your Supabase email settings or try again later."
        );
        return;
      }
      setError(res.error ?? "Something went wrong.");
      return;
    }
    if (res.needsConfirmation) {
      setPendingEmail(email.trim());
      setNotice("We emailed you a 6-digit code. Enter it below to finish.");
    }
    // On success with a session, the auth listener swaps this screen out.
  };

  const verify = async () => {
    if (busy || !pendingEmail) return;
    if (code.trim().length < 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await verifyCode(pendingEmail, code);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "That code didn't work.");
      return;
    }
  };

  const resend = async () => {
    if (busy || !pendingEmail) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const res = await resendCode(pendingEmail);
    setBusy(false);
    if (res.ok) setNotice("New code sent.");
    else setError(res.error ?? "Could not resend the code.");
  };

  const verifying = pendingEmail !== null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#fdf8f0]"
    >
      <LinearGradient
        colors={["#fdf8f0", "#f4eadb", "#e9dcc9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
      >
        <View className="mx-auto w-full max-w-md flex-1 justify-center px-5">
          <View className="mb-5 flex-row items-center justify-between px-1">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#1a1410] shadow-md">
                <DumbbellIcon size={22} color="#c8a96e" />
              </View>
              <View>
                <Text className="text-2xl font-extrabold uppercase tracking-tight text-[#1a1410]">
                  LVLUPP
                </Text>
                <Text className="font-mono text-[9px] uppercase tracking-widest text-[#9c8468]">
                  Train with intent
                </Text>
              </View>
            </View>
            <View className="rounded-full border border-white/70 bg-white/30 px-2.5 py-1">
              <Text className="font-mono text-[9px] uppercase text-[#6b5a42]">01 / 01</Text>
            </View>
          </View>

          <View className="rounded-3xl border border-white/80 bg-white/55 p-5 shadow-lg">
            <View className="mb-5">
              <Text className="font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
                {verifying ? "Email checkpoint" : "Member access"}
              </Text>
              <Text className="mt-1 text-2xl font-bold uppercase text-[#1a1410]">
                {verifying
                  ? "Confirm your email"
                  : mode === "signin"
                    ? "Welcome back"
                    : "Start your climb"}
              </Text>
            </View>

            {verifying ? (
              <View className="gap-3">
                <Text className="text-center text-xs text-[#6b5d4d]">{pendingEmail}</Text>
                <Input
                  value={code}
                  onChangeText={(v) => setCode(v.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="6-digit code"
                  placeholderTextColor="#c4b49a"
                  keyboardType="number-pad"
                  maxLength={6}
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                  onFocus={() => setFocusedField("code")}
                  onBlur={() => setFocusedField(null)}
                  className={`${inputClass} text-center tracking-[8px] ${focusedField === "code" ? "border-[#c8a96e]" : ""}`}
                  onSubmitEditing={verify}
                />

                {error && <Text className="text-center text-xs text-[#b5544a]">{error}</Text>}
                {notice && <Text className="text-center text-xs text-[#5b8c5a]">{notice}</Text>}

                <Pressable
                  onPress={verify}
                  disabled={busy}
                  className="mt-2 items-center rounded-full bg-[#1a1410] py-4"
                  style={{ opacity: busy ? 0.6 : 1 }}
                >
                  {busy ? (
                    <ActivityIndicator color="#c8a96e" />
                  ) : (
                    <Text className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                      Confirm
                    </Text>
                  )}
                </Pressable>

                <View className="mt-2 flex-row items-center justify-between">
                  <Pressable onPress={backToForm} hitSlop={8}>
                    <Text className="font-mono text-[10px] uppercase tracking-wide text-[#9c8468]">
                      ← Back
                    </Text>
                  </Pressable>
                  <Pressable onPress={resend} hitSlop={8} disabled={busy}>
                    <Text className="font-mono text-[10px] uppercase tracking-wide text-[#c8a96e]">
                      Resend code
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View className="mb-5 flex-row overflow-hidden rounded-full border border-white/80 bg-white/35 p-1">
                  {(["signin", "signup"] as Mode[]).map((m) => {
                    const active = m === mode;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => swap(m)}
                        className={`flex-1 items-center rounded-full py-2.5 ${active ? "bg-[#1a1410] shadow-sm" : ""}`}
                      >
                        <Text
                          className={`font-mono text-[11px] font-bold uppercase tracking-wide ${
                            active ? "text-white" : "text-[#9c8468]"
                          }`}
                        >
                          {m === "signin" ? "Sign in" : "Create account"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View className="gap-3">
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="#c4b49a"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className={`${inputClass} ${focusedField === "email" ? "border-[#c8a96e]" : ""}`}
                  />
                  <View className="relative justify-center">
                    <Input
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      placeholderTextColor="#c4b49a"
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={!passwordVisible}
                      textContentType={mode === "signin" ? "password" : "newPassword"}
                      className={`${inputClass} pr-12 ${focusedField === "password" ? "border-[#c8a96e]" : ""}`}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={submit}
                    />
                    <Pressable
                      onPress={() => setPasswordVisible((value) => !value)}
                      className="absolute right-3 p-2"
                      hitSlop={6}
                      accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                    >
                      {passwordVisible ? (
                        <EyeOffIcon size={18} color="#9c8468" />
                      ) : (
                        <EyeIcon size={18} color="#9c8468" />
                      )}
                    </Pressable>
                  </View>
                </View>

                {error && <Text className="mt-3 text-center text-xs text-[#b5544a]">{error}</Text>}
                {notice && (
                  <Text className="mt-3 text-center text-xs text-[#5b8c5a]">{notice}</Text>
                )}

                <Pressable
                  onPress={submit}
                  disabled={busy}
                  className="mt-6 items-center rounded-full bg-[#1a1410] py-4"
                  style={{ opacity: busy ? 0.6 : 1 }}
                >
                  {busy ? (
                    <ActivityIndicator color="#c8a96e" />
                  ) : (
                    <Text className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                      {mode === "signin" ? "Sign in" : "Create account"}
                    </Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
