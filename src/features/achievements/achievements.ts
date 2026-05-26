import type { IconName } from "../../components/ui/Icon";

export type AchievementRarity = "common" | "epic" | "legendary" | "rare";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  xpReward: number;
  rarity: AchievementRarity;
};

export const achievements: Achievement[] = [
  {
    id: "first-workout",
    title: "Primeiro Ritual",
    description: "Finalize seu primeiro treino no LIFTING.",
    icon: "flame",
    rarity: "common",
    xpReward: 100,
  },
  {
    id: "seven-day-streak",
    title: "Sete Dias de Guerra",
    description: "Mantenha 7 dias seguidos de treino.",
    icon: "calendar",
    rarity: "rare",
    xpReward: 300,
  },
  {
    id: "thirty-day-streak",
    title: "Mes Imparavel",
    description: "Mantenha 30 dias seguidos de treino.",
    icon: "calendar",
    rarity: "legendary",
    xpReward: 1000,
  },
  {
    id: "ten-prs",
    title: "Cacador de PR",
    description: "Registre 10 recordes pessoais.",
    icon: "trophy",
    rarity: "rare",
    xpReward: 250,
  },
  {
    id: "fifty-prs",
    title: "Forja de Recordes",
    description: "Registre 50 recordes pessoais.",
    icon: "trophy",
    rarity: "epic",
    xpReward: 600,
  },
  {
    id: "hundred-sets",
    title: "Cem Series",
    description: "Conclua 100 series.",
    icon: "check",
    rarity: "epic",
    xpReward: 500,
  },
  {
    id: "bench-40",
    title: "Supino Acordou",
    description: "Registre 40kg no supino.",
    icon: "dumbbell",
    rarity: "common",
    xpReward: 120,
  },
  {
    id: "bench-100",
    title: "Monstro do Supino",
    description: "Registre 100kg no supino.",
    icon: "dumbbell",
    rarity: "legendary",
    xpReward: 500,
  },
  {
    id: "leg-300",
    title: "Leg Press Brutal",
    description: "Registre 300kg no leg press.",
    icon: "dumbbell",
    rarity: "legendary",
    xpReward: 500,
  },
  {
    id: "squat-40",
    title: "Base Solida",
    description: "Registre 40kg no agachamento.",
    icon: "dumbbell",
    rarity: "common",
    xpReward: 120,
  },
];

export const achievementById = new Map(achievements.map((achievement) => [achievement.id, achievement]));
