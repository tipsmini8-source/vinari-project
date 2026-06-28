export type FeatureAccent = {
  bg: string;
  darkBg: string;
  darkIcon: string;
  icon: string;
};

const defaultAccent: FeatureAccent = {
  bg: '#F1F5F9',
  darkBg: '#1E293B',
  darkIcon: '#CBD5E1',
  icon: '#64748B'
};

export const featureAccents: Record<string, FeatureAccent> = {
  budgets: {
    bg: '#EEF2FF',
    darkBg: '#242B57',
    darkIcon: '#A5B4FC',
    icon: '#4F46E5'
  },
  debts: {
    bg: '#FFEDD5',
    darkBg: '#3B2412',
    darkIcon: '#FDBA74',
    icon: '#EA580C'
  },
  goals: {
    bg: '#DCFCE7',
    darkBg: '#12351F',
    darkIcon: '#86EFAC',
    icon: '#16A34A'
  },
  insights: {
    bg: '#DBEAFE',
    darkBg: '#172554',
    darkIcon: '#93C5FD',
    icon: '#2563EB'
  },
  menu: defaultAccent,
  premium: {
    bg: '#FEF3C7',
    darkBg: '#3A2A0A',
    darkIcon: '#FCD34D',
    icon: '#D97706'
  },
  recurring: {
    bg: '#F3E8FF',
    darkBg: '#2E174A',
    darkIcon: '#C084FC',
    icon: '#7C3AED'
  },
  simulator: {
    bg: '#F5F3FF',
    darkBg: '#251A4A',
    darkIcon: '#C4B5FD',
    icon: '#6D28D9'
  },
  subscriptions: {
    bg: '#FFE4E6',
    darkBg: '#3F1724',
    darkIcon: '#FDA4AF',
    icon: '#E11D48'
  },
  wallets: {
    bg: '#E0F2FE',
    darkBg: '#0B314A',
    darkIcon: '#7DD3FC',
    icon: '#0284C7'
  }
};

export function getFeatureAccent(key: string): FeatureAccent {
  return featureAccents[key] ?? defaultAccent;
}

export function getFeatureAccentKey(href: string): string {
  if (href.includes('/wallets')) {
    return 'wallets';
  }

  if (href.includes('/budgets')) {
    return 'budgets';
  }

  if (href.includes('/goals')) {
    return 'goals';
  }

  if (href.includes('/debts')) {
    return 'debts';
  }

  if (href.includes('/recurring')) {
    return 'recurring';
  }

  if (href.includes('/subscriptions')) {
    return 'subscriptions';
  }

  if (href.includes('/insights')) {
    return 'insights';
  }

  if (href.includes('/simulator')) {
    return 'simulator';
  }

  if (href.includes('/upgrade')) {
    return 'premium';
  }

  return 'menu';
}
