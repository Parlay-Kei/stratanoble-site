// Next.js API route for onboarding status
// Delegates to modular onboarding status handler

import { createGetStatusHandler } from '@modules/onboarding/api/status';
import { OnboardingDomainService } from '@modules/onboarding/domain/onboarding-service';

// Instantiate dependencies
const onboardingDomainService = new OnboardingDomainService();

// Create handler with injected dependencies
export const GET = createGetStatusHandler({
  onboardingDomainService,
  logger: console
});
