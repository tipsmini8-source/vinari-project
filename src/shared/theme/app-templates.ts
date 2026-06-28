export type AppTemplateId = 'tech_premium' | 'fintech_fresh';

export type AppTemplateModeColors = {
  accentColor: string;
  cardAccent: string;
  centerButtonGradient: string;
  dangerColor: string;
  heroGradient: string;
  iconSoftBackground: string;
  navActiveColor: string;
  primaryColor: string;
  softBackground: string;
  successColor: string;
  warningColor: string;
};

export type AppTemplate = {
  id: AppTemplateId;
  name: string;
  description: string;
  colors: {
    light: AppTemplateModeColors;
    dark: AppTemplateModeColors;
  };
  accentColor: string;
  cardAccent: string;
  centerButtonGradient: string;
  dangerColor: string;
  heroGradient: string;
  iconSoftBackground: string;
  navActiveColor: string;
  primaryColor: string;
  softBackground: string;
  successColor: string;
  warningColor: string;
};

const techPremiumLight: AppTemplateModeColors = {
  accentColor: '#06B6D4',
  cardAccent: '#DBEAFE',
  centerButtonGradient: 'linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%)',
  dangerColor: '#EF4444',
  heroGradient: 'linear-gradient(135deg, #0F172A 0%, #1D4ED8 55%, #06B6D4 100%)',
  iconSoftBackground: '#DBEAFE',
  navActiveColor: '#1D4ED8',
  primaryColor: '#1D4ED8',
  softBackground: '#EFF6FF',
  successColor: '#16A34A',
  warningColor: '#F59E0B'
};

const techPremiumDark: AppTemplateModeColors = {
  accentColor: '#22D3EE',
  cardAccent: '#0F2A4A',
  centerButtonGradient: 'linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%)',
  dangerColor: '#F43F5E',
  heroGradient: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #0E7490 100%)',
  iconSoftBackground: '#0F2A4A',
  navActiveColor: '#38BDF8',
  primaryColor: '#38BDF8',
  softBackground: '#0B2038',
  successColor: '#22C55E',
  warningColor: '#FBBF24'
};

const fintechFreshLight: AppTemplateModeColors = {
  accentColor: '#0EA5E9',
  cardAccent: '#CCFBF1',
  centerButtonGradient: 'linear-gradient(135deg, #0EA5E9 0%, #4F46E5 100%)',
  dangerColor: '#EF4444',
  heroGradient: 'linear-gradient(135deg, #14B8A6 0%, #0EA5E9 55%, #4F46E5 100%)',
  iconSoftBackground: '#CCFBF1',
  navActiveColor: '#0EA5E9',
  primaryColor: '#0EA5E9',
  softBackground: '#ECFEFF',
  successColor: '#16A34A',
  warningColor: '#F59E0B'
};

const fintechFreshDark: AppTemplateModeColors = {
  accentColor: '#38BDF8',
  cardAccent: '#123B4B',
  centerButtonGradient: 'linear-gradient(135deg, #0284C7 0%, #4338CA 100%)',
  dangerColor: '#F43F5E',
  heroGradient: 'linear-gradient(135deg, #0F766E 0%, #0369A1 55%, #3730A3 100%)',
  iconSoftBackground: '#123B4B',
  navActiveColor: '#38BDF8',
  primaryColor: '#38BDF8',
  softBackground: '#0A2A32',
  successColor: '#22C55E',
  warningColor: '#FBBF24'
};

export const appTemplates: Record<AppTemplateId, AppTemplate> = {
  fintech_fresh: {
    id: 'fintech_fresh',
    name: 'Fintech Fresh',
    description: 'Tampilan segar, cerah, dan ramah digunakan.',
    colors: {
      light: fintechFreshLight,
      dark: fintechFreshDark
    },
    ...fintechFreshLight
  },
  tech_premium: {
    id: 'tech_premium',
    name: 'Tech Premium',
    description: 'Tampilan premium dengan nuansa teknologi modern.',
    colors: {
      light: techPremiumLight,
      dark: techPremiumDark
    },
    ...techPremiumLight
  }
};

export const defaultAppTemplate = appTemplates.tech_premium;

export function isAppTemplateId(value: unknown): value is AppTemplateId {
  return value === 'tech_premium' || value === 'fintech_fresh';
}

export function getAppTemplate(templateId: unknown): AppTemplate {
  return isAppTemplateId(templateId) ? appTemplates[templateId] : defaultAppTemplate;
}

export function getTemplateModeColors(template: AppTemplate, isDark: boolean): AppTemplateModeColors {
  return isDark ? template.colors.dark : template.colors.light;
}
