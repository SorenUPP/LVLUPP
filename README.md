# LVLUPP

A mobile strength-training companion built with Expo and React Native. Users
create an account, build a weekly training plan from a shared workout
catalogue (or from custom days they assemble exercise by exercise), and run a
guided, set-by-set session for whatever the plan calls for that day. Progress,
personal bests, and history are derived from the sessions they actually
complete.

The app targets iOS and Android from a single codebase and also runs on the
web through React Native Web.

---

## Features

- **Accounts** – email and password authentication via Supabase Auth, with
  sign-up confirmation by a six-digit code entered in the app (no email links).
- **Profile** – name, avatar (photo library or camera), unit system
  (metric/imperial), weekly goal, default rest timer, and accent colour, all
  stored per user and synced across devices.
- **Workout catalogue** – a shared library of workouts, each with an exercise
  breakdown (sets, reps, target weight, rest, muscle group).
- **Custom training days** – assemble a day from individual exercises pulled
  from anywhere in the catalogue, tune sets/reps/weight per exercise, reorder
  them, and save it. Each custom day is given a randomly chosen cover photo.
- **Weekly routine** – assign one workout (catalogue or custom) or a rest day
  to each weekday. The dashboard surfaces the current day's entry.
- **Session tracker** – start the day's workout, complete it set by set with an
  automatic rest timer, adjust reps and weights mid-session, and add or remove
  sets. Completing a session writes a workout log.
- **Progress** – day streak, total time, total calories, an eight-week activity
  chart, personal bests (derived from the heaviest completed set per exercise),
  and full session history.

---

## Tech stack

| Area                    | Choice                                                                   |
| ----------------------- | ------------------------------------------------------------------------ |
| Framework               | Expo SDK 57, React Native 0.86, React 19.2                               |
| Navigation              | `expo-router` (the app itself is a single screen with an in-app tab bar) |
| Language                | TypeScript (strict)                                                      |
| Styling                 | NativeWind 4 (Tailwind-style `className`)                                |
| Backend                 | Supabase (Postgres, Auth, Row Level Security)                            |
| Data access             | `@supabase/supabase-js`                                                  |
| Local storage           | `@react-native-async-storage/async-storage` (auth session persistence)   |
| Icons                   | `lucide-react-native`                                                    |
| Fonts                   | Roboto and Roboto Mono via `@expo-google-fonts`                          |
| Migrations / DB tooling | Node scripts using `pg` against the Supabase connection pooler           |

---

## Project structure

```
app/                     expo-router entry
  _layout.tsx            loads fonts, registers NativeWind, renders a Stack
  index.tsx              re-exports src/App.tsx

src/
  App.tsx                AuthProvider -> Gate -> (AuthScreen | ProfileProvider + Shell)
                         Shell holds the in-app tab state and floating nav bar

  components/
    auth/                AuthScreen (sign in / create account / code entry)
    dashboard/           DashboardView + hooks and sub-components
                         (useWorkoutSession, useRestTimer, useDashboardData,
                          ActiveSessionCard, SessionEditor, WeeklyRoutineCard,
                          RoutinePickerSheet, ...)
    workouts/            WorkoutsView, WorkoutCard, WorkoutDetailSheet,
                         CustomWorkoutBuilder, CategoryChips
    progress/            ProgressView + ActivityChart, HistoryList, StatTile, ...
    profile/             ProfileView + EditProfileSheet, PreferencesCard, ...
    ui/                  Text and Input wrappers that apply the Roboto faces

  lib/
    supabase.ts          Supabase client (AsyncStorage-backed session)
    auth.tsx             AuthProvider / useAuth / useUserId
    profile.tsx          ProfileProvider / useProfile (backed by the profiles table)
    queries.ts           row types + cached data hooks (useWorkouts,
                         useWorkoutLogs, usePersonalBests)
    customWorkouts.ts    custom-day types, hooks, and the Workout adapter
    routine.ts           weekly routine types, hooks, and day resolution
    date.ts / stats.ts   shared formatting and streak helpers
    theme.ts             shared style fragments
    pickImage.ts         avatar capture/crop
    nativewind.ts        registers BlurView / LinearGradient with NativeWind

  data/nav.ts            bottom-nav item definitions

scripts/
  migrate.mjs            applies pending SQL migrations, tracked in public._migrations
  migrations/*.sql       schema history (001..006)
  introspect.mjs         dumps the current schema, RLS, and row counts
  seed-workouts.mjs      inserts rows into the workouts table
  smoke-*.mjs            verify RLS and data flows by impersonating auth roles
  lib/db.mjs             shared Postgres connection for the scripts
```

### Application flow

`app/index.tsx` re-exports `src/App.tsx`, so all application UI lives under
`src/`. `App.tsx` wraps everything in `AuthProvider`. While the session is
loading it shows a spinner; with no session it renders `AuthScreen`; once
authenticated it mounts `ProfileProvider` and `Shell`. `Shell` keeps the active
tab in state and renders one of the four views plus a floating bottom
navigation bar. It does not use `expo-router` screens for the tabs.

---

## Data model (Supabase)

All tables live in the `public` schema. Row Level Security is enabled on every
table the app touches.

| Table                      | Purpose                                                                                           | Access                          |
| -------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------- |
| `workouts`                 | shared workout catalogue (`sets` is a JSONB array of exercises)                                   | public read only                |
| `profiles`                 | one row per auth user, created by a trigger on sign-up                                            | owner only                      |
| `workout_sessions`         | an in-progress or completed training session                                                      | owner only                      |
| `workout_session_sets`     | per-set state within a session                                                                    | owner only (via parent session) |
| `workout_logs`             | a completed workout, powering streaks and history                                                 | owner only                      |
| `custom_workouts`          | a user-built training day (name, cover image)                                                     | owner only                      |
| `custom_workout_exercises` | ordered exercises within a custom day                                                             | owner only (via parent)         |
| `routine_days`             | one row per `(user, weekday)`; points at a catalogue workout, a custom day, or neither (rest day) | owner only                      |
| `_migrations`              | applied-migration bookkeeping for `scripts/migrate.mjs`                                           | —                               |

Personal bests are not stored; they are computed in the client from the
heaviest completed set per exercise.

---

## Prerequisites

- Node.js 22.13 or newer
- A Supabase project
- For running on device/simulator: Xcode (iOS), Android Studio (Android), or
  the Expo Go app

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` in the project root and fill in the values:

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon public key>

# Used only by the scripts in scripts/ (migrations, introspection, smoke tests).
# Supabase dashboard -> Project Settings -> Database -> Connection string ->
# "Session pooler" (port 5432).
DIRECT_URL=postgresql://postgres.<ref>:<password>@<host>.pooler.supabase.com:5432/postgres

# Optional: only needed if you seed the workouts table with scripts/seed-workouts.mjs
# after RLS is enabled. Supabase dashboard -> Project Settings -> API -> service_role.
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

The `EXPO_PUBLIC_` values are read by the app. `DIRECT_URL` and
`SUPABASE_SERVICE_ROLE_KEY` are read only by the Node scripts and are never
bundled into the app.

### 3. Apply the database schema

```bash
node scripts/migrate.mjs            # apply all pending migrations
node scripts/migrate.mjs --status   # list applied vs pending
```

This creates the `profiles`, `custom_workouts`, `custom_workout_exercises`, and
`routine_days` tables, adds the user-scoping columns, installs the sign-up
trigger, enables Row Level Security with per-user policies, and adds the
per-email sign-up rate limiting used by the signup Edge Function.

### 4. Seed the workout catalogue

The `workouts` table is the shared catalogue. Add rows either from the Supabase
SQL editor or with:

```bash
node scripts/seed-workouts.mjs          # insert the rows defined in the script
node scripts/seed-workouts.mjs --list   # print what's already there
```

Because RLS makes `workouts` read-only for the anonymous key, this script needs
`SUPABASE_SERVICE_ROLE_KEY` in `.env` to insert.

### 5. Configure Supabase Auth

In the Supabase dashboard:

- **Authentication -> Providers -> Email**: keep "Confirm email" enabled.
- **Authentication -> Emails -> Templates -> Confirm signup**: the app expects a
  six-digit code, so the template body must include `{{ .Token }}` rather than
  the `{{ .ConfirmationURL }}` link.
- **Authentication -> Emails**: the built-in SMTP is rate limited to a couple of
  messages per hour. For anything beyond first-run testing, configure custom
  SMTP and raise the email rate limit under **Authentication -> Rate Limits**.

### 6. Deploy the signup gateway

Signups use the Edge Function in `supabase/functions/signup`, which applies a
per-email limit before asking Supabase Auth to send a confirmation message. Run
these commands with the Supabase CLI after linking the project:

```bash
node scripts/migrate.mjs
supabase functions deploy signup --no-verify-jwt
npx supabase secrets set SERVICE_ROLE_KEY=<service role key>
```

The `--no-verify-jwt` setting is required because signup is an unauthenticated
request and the function handles the browser CORS preflight itself. It is also
stored in `supabase/config.toml` for future deployments.

Supabase provides `SUPABASE_URL` and `SUPABASE_ANON_KEY` automatically to Edge
Functions. The service-role key must only be configured as the
`SERVICE_ROLE_KEY` Edge Function secret. Do not put it in `.env` under an
`EXPO_PUBLIC_` name. Configure custom SMTP before
testing addresses outside the Supabase organization team; the default SMTP
service still has a shared project limit.

### 7. Run the app

```bash
npm start          # Expo dev server, then choose a target
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # browser
```

---

## npm scripts

| Command                           | Description                         |
| --------------------------------- | ----------------------------------- |
| `npm start`                       | Start the Expo development server   |
| `npm run ios` / `android` / `web` | Start and open on a specific target |
| `npm run lint`                    | Run `expo lint`                     |
| `npm run format`                  | Format the codebase with Prettier   |
