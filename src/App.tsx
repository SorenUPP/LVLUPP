import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { AuthScreen } from "./components/auth/AuthScreen";
import { DashboardView } from "./components/dashboard";
import { ProfileView } from "./components/profile";
import { ProgressView } from "./components/progress";
import { Text } from "./components/ui/Text";
import { WorkoutsView } from "./components/workouts";
import { NAV_ITEMS, type NavId } from "./data/nav";
import { AuthProvider, useAuth } from "./lib/auth";
import { ProfileProvider } from "./lib/profile";
import { useWorkouts } from "./lib/queries";

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#fdf8f0]">
        <ActivityIndicator color="#1a1410" />
      </View>
    );
  }
  if (!session) return <AuthScreen />;

  return (
    <ProfileProvider>
      <Shell />
    </ProfileProvider>
  );
}

function Shell() {
  const { workouts } = useWorkouts();
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");

  return (
    <View className="mx-auto w-full max-w-md flex-1 bg-[#fdf8f0]">
      <ScrollView className="mb-20 flex-1" showsVerticalScrollIndicator={false}>
        {activeNav === "dashboard" && (
          <DashboardView workouts={workouts} setActiveNav={setActiveNav} />
        )}
        {activeNav === "workouts" && <WorkoutsView workouts={workouts} />}
        {activeNav === "progress" && <ProgressView />}
        {activeNav === "profile" && <ProfileView />}
      </ScrollView>

      <View className="absolute bottom-6 left-0 right-0 z-50 items-center bg-transparent">
        {/*
          BlurView is only the frosted background layer — NativeWind doesn't map
          className -> style on it, so the flex-row layout lives on the plain View.
        */}
        <View className="w-4/5 max-w-xs flex-row items-center justify-around overflow-hidden rounded-full border border-white/40 bg-transparent px-1 py-1 shadow-lg">
          <BlurView
            intensity={70}
            tint="light"
            style={[StyleSheet.absoluteFill, { borderRadius: 9999 }]}
          />
          <LinearGradient
            colors={["rgba(255,255,255,0.62)", "rgba(255,255,255,0.28)", "rgba(200,169,110,0.2)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 9999 }]}
          />
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setActiveNav(id)}
                className={`flex-1 items-center rounded-full px-1 py-1.5 ${active ? "bg-[#1a1410]/90" : ""}`}
              >
                <Icon size={17} color={active ? "#c8a96e" : "#c4b49a"} />
                <Text
                  className={`mt-0.5 text-[8px] uppercase tracking-wide ${active ? "font-bold text-white" : "text-[#c4b49a]"}`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
