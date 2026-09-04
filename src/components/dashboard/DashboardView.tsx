import { useState } from "react";
import { Pressable, View } from "react-native";
import type { NavId } from "../../data/nav";
import { useProfile } from "../../lib/profile";
import { todayWeekday } from "../../lib/routine";
import { glass } from "../../lib/theme";
import type { SessionSet, Workout } from "../../lib/queries";
import { Text } from "../ui/Text";
import { ActiveSessionCard } from "./ActiveSessionCard";
import { DashboardHeader } from "./DashboardHeader";
import { PersonalBests } from "./PersonalBests";
import { RoutinePickerSheet } from "./RoutinePickerSheet";
import { SessionEditor } from "./SessionEditor";
import { TodaysWorkoutCard } from "./TodaysWorkout";
import { useDashboardData } from "./useDashboardData";
import { useRestTimer } from "./useRestTimer";
import { useWorkoutSession } from "./useWorkoutSession";
import { WeeklyRoutineCard } from "./WeeklyRoutineCard";
import { WeeklySummary } from "./WeeklySummary";

export function DashboardView({
  workouts,
  setActiveNav,
}: {
  workouts: Workout[];
  setActiveNav: (nav: NavId) => void;
}) {
  const { profile } = useProfile();
  const {
    todaysWorkout,
    todayState,
    byWeekday,
    setDay,
    customWorkouts,
    personalBests,
    refetchLogs,
    streak,
    totalWorkouts,
    totalCalories,
    week,
  } = useDashboardData(workouts);

  const rest = useRestTimer(profile.restTimerSec);
  const session = useWorkoutSession(todaysWorkout, refetchLogs);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pickDay, setPickDay] = useState<number | null>(null);

  const toggleSet = async (set: SessionSet) => {
    const completed = await session.toggleSet(set);
    if (completed === undefined) return;
    if (completed) rest.start();
    else rest.skip();
  };

  const complete = async () => {
    await session.complete();
    rest.skip();
  };

  const handlePick = async (
    weekday: number,
    target: { workoutId?: number | null; customWorkoutId?: number | null }
  ) => {
    await setDay(weekday, target);
    setPickDay(null);
  };

  return (
    <View>
      <DashboardHeader name={profile.name} avatarUrl={profile.avatarUrl} />

      <View className="gap-4 px-5 py-5">
        <WeeklySummary
          streak={streak}
          totalWorkouts={totalWorkouts}
          totalCalories={totalCalories}
          week={week}
          onTrain={() => setActiveNav("workouts")}
          onProgress={() => setActiveNav("progress")}
        />

        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold uppercase">Today's Workout</Text>
            {session.session || todayState === "workout" ? (
              <Text className="font-mono text-[10px] text-[#9c8468]">
                {todaysWorkout?.duration}
              </Text>
            ) : null}
          </View>

          {session.session ? (
            editorOpen ? (
              <SessionEditor
                session={session}
                rest={rest}
                onToggleSet={toggleSet}
                onComplete={complete}
                onClose={() => setEditorOpen(false)}
              />
            ) : (
              <ActiveSessionCard
                session={session}
                rest={rest}
                onToggleSet={toggleSet}
                onComplete={complete}
                onOpenEditor={() => setEditorOpen(true)}
              />
            )
          ) : todayState === "workout" ? (
            <TodaysWorkoutCard
              workout={todaysWorkout}
              starting={session.starting}
              onStart={session.start}
            />
          ) : (
            <Pressable
              onPress={() => setPickDay(todayWeekday())}
              className={`${glass} mb-3 items-center justify-center rounded-xl p-6`}
            >
              <Text className="text-sm font-bold uppercase text-[#1a1410]">
                {todayState === "rest" ? "Rest day" : "No workout planned"}
              </Text>
              <Text className="mt-1 text-center text-xs text-[#9c8468]">
                {todayState === "rest"
                  ? "Recover today — tap to change your plan."
                  : "Tap to pick today's training."}
              </Text>
            </Pressable>
          )}
        </View>

        <WeeklyRoutineCard
          byWeekday={byWeekday}
          workouts={workouts}
          customWorkouts={customWorkouts}
          onPickDay={setPickDay}
        />

        <PersonalBests items={personalBests} />
      </View>

      <RoutinePickerSheet
        weekday={pickDay}
        current={pickDay !== null ? byWeekday.get(pickDay) : undefined}
        workouts={workouts}
        customWorkouts={customWorkouts}
        onClose={() => setPickDay(null)}
        onPick={handlePick}
      />
    </View>
  );
}
