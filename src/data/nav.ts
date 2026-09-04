import {
  BarChart2 as ChartIcon,
  Dumbbell as DumbbellIcon,
  LayoutGrid as GridIcon,
  User as UserIcon,
} from "lucide-react-native";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Home", icon: GridIcon },
  { id: "workouts", label: "Train", icon: DumbbellIcon },
  { id: "progress", label: "Progress", icon: ChartIcon },
  { id: "profile", label: "Profile", icon: UserIcon },
] as const;

export type NavId = (typeof NAV_ITEMS)[number]["id"];
