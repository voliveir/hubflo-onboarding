"use client"
import OnboardingProgress from '@/components/OnboardingProgress'

export default function OnboardingProgressClient({ clientId }: { clientId: string }) {
  if (!clientId) return null;
  return <OnboardingProgress clientId={clientId} />;
} 