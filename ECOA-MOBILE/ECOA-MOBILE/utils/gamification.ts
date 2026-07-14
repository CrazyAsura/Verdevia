export type RewardKind = 'title' | 'frame' | 'boost' | 'badge' | 'coins';

export type RewardTier = {
  label: string;
  kind: RewardKind;
  value: string;
};

export type RewardPassLevel = {
  level: number;
  xpRequired: number;
  free: RewardTier;
  premium: RewardTier;
};

export type Achievement = {
  id: string;
  label: string;
  description: string;
  icon: 'Zap' | 'Star' | 'ShieldCheck' | 'Award' | 'Crown' | 'Flame';
  current: number;
  target: number;
  unlocked: boolean;
  status: string;
  progress: number;
  reward: string;
};

export type CustomizationItem = {
  id: string;
  name: string;
  type: 'title' | 'frame';
  value: string;
};

export type GamificationSource = {
  xp?: number;
  level?: number;
  points?: number;
  streak?: number;
  complaintsCount?: number;
  coursesCompleted?: number;
  lessonsCompleted?: number;
  verifiedComplaints?: number;
  activeTitle?: string;
  avatarFrame?: string;
  unlockedItems?: CustomizationItem[];
};

const LEVEL_BASE_XP = 650;
const LEVEL_GROWTH_XP = 190;

export const REWARD_PASS: RewardPassLevel[] = [
  {
    level: 1,
    xpRequired: 0,
    free: { label: 'Titulo: Recruta Ambiental', kind: 'title', value: 'Recruta Ambiental' },
    premium: { label: 'Moldura: Broto Vivo', kind: 'frame', value: 'frame://sprout' },
  },
  {
    level: 2,
    xpRequired: 650,
    free: { label: 'Titulo: Guardiao Local', kind: 'title', value: 'Guardiao Local' },
    premium: { label: 'Impulso de XP: aulas +10%', kind: 'boost', value: 'course-xp-10' },
  },
  {
    level: 3,
    xpRequired: 1490,
    free: { label: 'Badge: Primeira Patrulha', kind: 'badge', value: 'first-patrol' },
    premium: { label: 'Moldura: Dossel Verde', kind: 'frame', value: 'frame://canopy' },
  },
  {
    level: 4,
    xpRequired: 2520,
    free: { label: 'Titulo: Fiscal da Natureza', kind: 'title', value: 'Fiscal da Natureza' },
    premium: { label: '200 Ecos', kind: 'coins', value: '200' },
  },
  {
    level: 5,
    xpRequired: 3740,
    free: { label: 'Moldura: Trilha ECOA', kind: 'frame', value: 'frame://trail' },
    premium: { label: 'Titulo: Sentinela Premium', kind: 'title', value: 'Sentinela Premium' },
  },
  {
    level: 6,
    xpRequired: 5150,
    free: { label: 'Badge: Voz da Comunidade', kind: 'badge', value: 'community-voice' },
    premium: { label: 'Impulso de XP: denuncias +15%', kind: 'boost', value: 'complaint-xp-15' },
  },
  {
    level: 7,
    xpRequired: 6750,
    free: { label: 'Titulo: Analista Verde', kind: 'title', value: 'Analista Verde' },
    premium: { label: 'Moldura: Ouro Solar', kind: 'frame', value: 'frame://solar-gold' },
  },
  {
    level: 8,
    xpRequired: 8540,
    free: { label: '300 Ecos', kind: 'coins', value: '300' },
    premium: { label: 'Titulo: Guardiao Elite', kind: 'title', value: 'Guardiao Elite' },
  },
  {
    level: 9,
    xpRequired: 10520,
    free: { label: 'Badge: Impacto Real', kind: 'badge', value: 'real-impact' },
    premium: { label: 'Moldura: Aurora ECOA', kind: 'frame', value: 'frame://aurora' },
  },
  {
    level: 10,
    xpRequired: 12690,
    free: { label: 'Titulo: Guardiao do Bioma', kind: 'title', value: 'Guardiao do Bioma' },
    premium: { label: 'Titulo: Lenda Regenerativa', kind: 'title', value: 'Lenda Regenerativa' },
  },
];

export function getXpForLevel(level: number) {
  if (level <= 1) return 0;

  let total = 0;
  for (let current = 1; current < level; current += 1) {
    total += LEVEL_BASE_XP + (current - 1) * LEVEL_GROWTH_XP;
  }
  return total;
}

export function getLevelFromXp(xp = 0) {
  let level = 1;
  while (level < 50 && xp >= getXpForLevel(level + 1)) {
    level += 1;
  }
  return level;
}

export function getLevelProgress(xp = 0) {
  const level = getLevelFromXp(xp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const earnedThisLevel = Math.max(0, xp - currentLevelXp);
  const neededThisLevel = nextLevelXp - currentLevelXp;
  const percent = Math.min(100, Math.round((earnedThisLevel / neededThisLevel) * 100));

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    earnedThisLevel,
    neededThisLevel,
    remainingXp: Math.max(0, nextLevelXp - xp),
    percent,
  };
}

export function getPassProgress(xp = 0) {
  const reached = REWARD_PASS.filter((reward) => xp >= reward.xpRequired);
  const current = reached[reached.length - 1] ?? REWARD_PASS[0];
  const next = REWARD_PASS.find((reward) => xp < reward.xpRequired) ?? null;
  const passPercent = Math.min(
    100,
    Math.round((xp / REWARD_PASS[REWARD_PASS.length - 1].xpRequired) * 100)
  );

  return {
    currentPassLevel: current.level,
    nextPassLevel: next?.level ?? null,
    nextReward: next ?? null,
    passPercent,
    claimedCount: reached.length,
    totalCount: REWARD_PASS.length,
  };
}

export function buildAchievements(source: GamificationSource): Achievement[] {
  const xp = source.xp ?? source.points ?? 0;
  const level = getLevelFromXp(xp);
  const complaints = source.complaintsCount ?? 0;
  const verified = source.verifiedComplaints ?? 0;
  const streak = source.streak ?? 0;
  const lessons = source.lessonsCompleted ?? source.coursesCompleted ?? 0;

  const make = (
    id: string,
    label: string,
    description: string,
    icon: Achievement['icon'],
    current: number,
    target: number,
    reward: string
  ): Achievement => {
    const unlocked = current >= target;
    return {
      id,
      label,
      description,
      icon,
      current,
      target,
      unlocked,
      status: unlocked ? 'Desbloqueado' : `${Math.min(current, target)}/${target}`,
      progress: Math.min(1, current / target),
      reward,
    };
  };

  return [
    make('first-report', 'Primeira Denuncia', 'Registre sua primeira ocorrencia ambiental.', 'ShieldCheck', complaints, 1, '+120 XP'),
    make('field-agent', 'Agente de Campo', 'Registre 5 denuncias ambientais.', 'Award', complaints, 5, 'Titulo: Fiscal da Natureza'),
    make('trusted-eye', 'Olhar Confiavel', 'Tenha 3 denuncias verificadas.', 'Star', verified, 3, 'Moldura: Trilha ECOA'),
    make('learning-path', 'Trilha de Aprendizado', 'Conclua 4 aulas ou desafios.', 'Zap', lessons, 4, '+250 XP bonus'),
    make('weekly-streak', 'Sequencia Verde', 'Volte por 7 dias de atividade.', 'Flame', streak, 7, 'Titulo: Guardiao Local'),
    make('level-five', 'Impacto Crescente', 'Alcance o nivel 5.', 'Crown', level, 5, 'Moldura: Dossel Verde'),
  ];
}

export function getUnlockedCustomizations(source: GamificationSource): CustomizationItem[] {
  const xp = source.xp ?? source.points ?? 0;
  const level = getLevelFromXp(xp);
  const achievements = buildAchievements(source);
  const unlockedFromPass = REWARD_PASS.flatMap((reward) => {
    if (xp < reward.xpRequired) return [];
    return [reward.free, reward.premium]
      .filter((tier) => tier.kind === 'title' || tier.kind === 'frame')
      .map((tier) => ({
        id: `pass-${reward.level}-${tier.kind}-${tier.value}`,
        name: tier.label,
        type: tier.kind as 'title' | 'frame',
        value: tier.value,
      }));
  });

  const unlockedFromAchievements = achievements
    .filter((achievement) => achievement.unlocked && achievement.reward.startsWith('Titulo: '))
    .map((achievement) => ({
      id: `achievement-${achievement.id}`,
      name: achievement.reward,
      type: 'title' as const,
      value: achievement.reward.replace('Titulo: ', ''),
    }));

  const milestoneTitles: CustomizationItem[] = [
    { id: 'base-title', name: 'Titulo inicial', type: 'title', value: 'Recruta Ambiental' },
    ...(level >= 3 ? [{ id: 'level-3-title', name: 'Nivel 3', type: 'title' as const, value: 'Guardiao Local' }] : []),
    ...(level >= 7 ? [{ id: 'level-7-title', name: 'Nivel 7', type: 'title' as const, value: 'Analista Verde' }] : []),
  ];

  const merged = [
    ...(source.unlockedItems ?? []),
    ...milestoneTitles,
    ...unlockedFromPass,
    ...unlockedFromAchievements,
  ];

  return Array.from(
    new Map(merged.map((item) => [`${item.type}-${item.value}`, item])).values()
  );
}

export function getDefaultTitle(source: GamificationSource) {
  const items = getUnlockedCustomizations(source).filter((item) => item.type === 'title');
  return source.activeTitle || items[items.length - 1]?.value || 'Recruta Ambiental';
}

export function getLessonXp(lessonType?: string, quizAnswered = false) {
  const base = lessonType === 'quiz' ? 100 : lessonType === 'video' ? 70 : 50;
  return base + (quizAnswered ? 50 : 0);
}
