"use client"

import { OnboardingAccessGuide } from "./onboarding-access-guide"

interface OnboardingAccessGuideWrapperProps {
  clientName: string
}

export function OnboardingAccessGuideWrapper({ clientName }: OnboardingAccessGuideWrapperProps) {
  return <OnboardingAccessGuide clientName={clientName} />
} 