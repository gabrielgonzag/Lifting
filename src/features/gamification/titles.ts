export type LegacyTitleRequirementType = "level" | "prs" | "streak" | "volume" | "workouts";

export type LegacyTitleRarity = "common" | "epic" | "legendary" | "mythic" | "rare";

export type LegacyTitle = {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  description: string;
  unlockRequirement: {
    type: LegacyTitleRequirementType;
    value: number;
  };
  rarity: LegacyTitleRarity;
};

export type LegacyTitleProgress = {
  current: LegacyTitle;
  next?: LegacyTitle;
  progress: number;
  unlocked: LegacyTitle[];
};

export type LegacyTitleStats = {
  level: number;
  prs: number;
  streak: number;
  volume: number;
  workouts: number;
};

export const legacyTitles: LegacyTitle[] = [
  {
    description: "Os primeiros passos no ferro. A base comeca aqui.",
    id: "iniciante",
    name: "Iniciante",
    rarity: "common",
    tier: 1,
    unlockRequirement: { type: "level", value: 1 },
  },
  {
    description: "A rotina aparece. A disciplina deixa de ser promessa.",
    id: "consistente",
    name: "Consistente",
    rarity: "common",
    tier: 1,
    unlockRequirement: { type: "workouts", value: 3 },
  },
  {
    description: "Forjado pela repeticao. O treino virou compromisso.",
    id: "disciplinado",
    name: "Disciplinado",
    rarity: "common",
    tier: 1,
    unlockRequirement: { type: "streak", value: 3 },
  },
  {
    description: "Novato no ferro, mas ja com mentalidade de construcao.",
    id: "iron-rookie",
    name: "Iron Rookie",
    rarity: "rare",
    tier: 1,
    unlockRequirement: { type: "level", value: 4 },
  },
  {
    description: "A fundacao fisica foi aberta. Agora ela precisa crescer.",
    id: "foundation",
    name: "Foundation",
    rarity: "rare",
    tier: 1,
    unlockRequirement: { type: "workouts", value: 10 },
  },
  {
    description: "A intensidade subiu. O corpo ja sabe o caminho.",
    id: "implacavel",
    name: "Implacavel",
    rarity: "rare",
    tier: 2,
    unlockRequirement: { type: "level", value: 8 },
  },
  {
    description: "Evolucao visivel, treino apos treino.",
    id: "evoluido",
    name: "Evoluido",
    rarity: "rare",
    tier: 2,
    unlockRequirement: { type: "prs", value: 8 },
  },
  {
    description: "Carga, volume e execucao comecam a pesar no historico.",
    id: "brutal",
    name: "Brutal",
    rarity: "epic",
    tier: 2,
    unlockRequirement: { type: "volume", value: 25_000 },
  },
  {
    description: "Mente de ferro. A consistencia virou identidade.",
    id: "iron-mind",
    name: "Iron Mind",
    rarity: "epic",
    tier: 2,
    unlockRequirement: { type: "streak", value: 10 },
  },
  {
    description: "Sem recuo. A progressao agora tem assinatura.",
    id: "relentless",
    name: "Relentless",
    rarity: "epic",
    tier: 2,
    unlockRequirement: { type: "workouts", value: 30 },
  },
  {
    description: "Performance alta e presenca atletica.",
    id: "elite",
    name: "Elite",
    rarity: "epic",
    tier: 3,
    unlockRequirement: { type: "level", value: 18 },
  },
  {
    description: "Forca densa. Volume pesado. Nome marcado.",
    id: "tita",
    name: "Tita",
    rarity: "epic",
    tier: 3,
    unlockRequirement: { type: "volume", value: 75_000 },
  },
  {
    description: "Um fisico que ja nao passa despercebido.",
    id: "monstro",
    name: "Monstro",
    rarity: "legendary",
    tier: 3,
    unlockRequirement: { type: "prs", value: 30 },
  },
  {
    description: "Ponto alto da performance. O topo comeca a aparecer.",
    id: "apex",
    name: "Apex",
    rarity: "legendary",
    tier: 3,
    unlockRequirement: { type: "streak", value: 30 },
  },
  {
    description: "A melhor versao ate agora. Dominio fisico real.",
    id: "prime",
    name: "Prime",
    rarity: "legendary",
    tier: 3,
    unlockRequirement: { type: "workouts", value: 100 },
  },
  {
    description: "A disciplina cria lendas. Voce chegou ao territorio raro.",
    id: "lenda",
    name: "Lenda",
    rarity: "legendary",
    tier: 4,
    unlockRequirement: { type: "level", value: 40 },
  },
  {
    description: "Construido no ferro, repetido ate virar legado.",
    id: "hammer",
    name: "Hammer",
    rarity: "legendary",
    tier: 4,
    unlockRequirement: { type: "volume", value: 250_000 },
  },
  {
    description: "Presenca massiva. Historia acumulada em cada sessao.",
    id: "colosso",
    name: "Colosso",
    rarity: "legendary",
    tier: 4,
    unlockRequirement: { type: "prs", value: 75 },
  },
  {
    description: "Bodybuilding old school. Prestigio construido com anos de ferro.",
    id: "golden-era",
    name: "Golden Era",
    rarity: "legendary",
    tier: 4,
    unlockRequirement: { type: "streak", value: 90 },
  },
  {
    description: "Seu nome comeca a ficar marcado. Status conquistado.",
    id: "iron-legacy",
    name: "Iron Legacy",
    rarity: "legendary",
    tier: 4,
    unlockRequirement: { type: "workouts", value: 250 },
  },
  {
    description: "Poucos chegam ate aqui. A conquista maxima. Seu legado agora e eterno.",
    id: "mr-olympia",
    name: "MR. OLYMPIA",
    rarity: "mythic",
    tier: 5,
    unlockRequirement: { type: "volume", value: 1_000_000 },
  },
];

const requirementValue = (stats: LegacyTitleStats, type: LegacyTitleRequirementType) => stats[type];

export const isLegacyTitleUnlocked = (title: LegacyTitle, stats: LegacyTitleStats) =>
  requirementValue(stats, title.unlockRequirement.type) >= title.unlockRequirement.value;

export const requirementLabel = (title: LegacyTitle) => {
  const { type, value } = title.unlockRequirement;
  if (type === "level") return `LVL ${value}`;
  if (type === "workouts") return `${value} treinos`;
  if (type === "prs") return `${value} PRs`;
  if (type === "streak") return `${value} dias seguidos`;
  return `${Math.round(value / 1000)}k kg de volume`;
};

export const legacyTierLabel = (tier: LegacyTitle["tier"]) => {
  if (tier === 1) return "Construcao";
  if (tier === 2) return "Evolucao";
  if (tier === 3) return "Dominio";
  if (tier === 4) return "Legado";
  return "Absoluto";
};

export const getLegacyTitleProgress = (stats: LegacyTitleStats): LegacyTitleProgress => {
  const unlocked = legacyTitles.filter((title) => isLegacyTitleUnlocked(title, stats));
  const current = unlocked.at(-1) ?? legacyTitles[0];
  const next = legacyTitles.find((title) => !isLegacyTitleUnlocked(title, stats));
  const progress = next
    ? Math.min(
        100,
        Math.round((requirementValue(stats, next.unlockRequirement.type) / next.unlockRequirement.value) * 100),
      )
    : 100;

  return { current, next, progress, unlocked };
};
