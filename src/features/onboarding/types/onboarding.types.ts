import type { onboardingSchema } from '@features/onboarding/schemas/onboarding.schemas';
import type { z } from 'zod';

export type UsageType = 'personal' | 'couple' | 'family';

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export type WorkspaceSummary = {
  id: string;
  name: string;
};
