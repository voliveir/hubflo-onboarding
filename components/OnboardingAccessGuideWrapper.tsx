"use client"

import { OnboardingAccessGuide } from "./onboarding-access-guide"

interface OnboardingAccessGuideWrapperProps {
  clientName: string
  calendarContactSuccess?: string
}

export function OnboardingAccessGuideWrapper({ clientName, calendarContactSuccess }: OnboardingAccessGuideWrapperProps) {
  return <OnboardingAccessGuide clientName={clientName} calendarContactSuccess={calendarContactSuccess} />
} 