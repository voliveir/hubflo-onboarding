"use client"
import OnboardingProgress from '@/components/OnboardingProgress'

export default function OnboardingProgressClient({ clientId, projectsEnabled }: { clientId: string, projectsEnabled: boolean }) {
  if (!clientId) return null;
  return <OnboardingProgress clientId={clientId} projectsEnabled={projectsEnabled} />;
} 