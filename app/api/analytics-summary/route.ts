import { NextResponse } from 'next/server';
import { getAnalyticsOverview, getAllClients } from '@/lib/database';

function daysBetween(start: string | undefined, end: string | undefined): number | null {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET() {
  try {
    const analytics = await getAnalyticsOverview();
    const clients = await getAllClients();

    // Implementation Health Metrics
    let timeToFirstValueSum = 0, timeToFirstValueCount = 0;
    let onboardingDurationSum = 0, onboardingDurationCount = 0;
    let activeImplementations = 0;
    let atRiskClients = 0;
    const now = new Date();

    clients.forEach(client => {
      // Find first onboarding call date (package-specific)
      let firstCall: string | undefined = undefined;
      if (client.success_package === 'light') firstCall = client.light_onboarding_call_date ?? undefined;
      else if (client.success_package === 'premium') firstCall = client.premium_first_call_date ?? undefined;
      else if (client.success_package === 'gold') firstCall = client.gold_first_call_date ?? undefined;
      // Use graduation_date as completed_date
      const completedDate = client.graduation_date ?? undefined;
      // Time to First Value
      const ttfv = daysBetween(client.created_at, firstCall);
      if (ttfv !== null && ttfv >= 0) {
        timeToFirstValueSum += ttfv;
        timeToFirstValueCount++;
      }
      // Avg. Onboarding Duration
      if (completedDate) {
        const dur = daysBetween(client.created_at, completedDate);
        if (dur !== null && dur >= 0) {
          onboardingDurationSum += dur;
          onboardingDurationCount++;
        }
      }
      // Active Implementations
      if (!completedDate) activeImplementations++;
      // At-Risk: no onboarding call within 10 days, or not completed after 45 days
      const created = new Date(client.created_at);
      const firstCallDate = firstCall ? new Date(firstCall) : null;
      const daysSinceCreated = Math.round((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      const noCallWithin10 = !firstCallDate || (firstCallDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) > 10;
      const notCompleted45 = !completedDate && daysSinceCreated > 45;
      if (noCallWithin10 || notCompleted45) atRiskClients++;
    });

    const timeToFirstValue = timeToFirstValueCount ? (timeToFirstValueSum / timeToFirstValueCount) : null;
    const avgOnboardingDuration = onboardingDurationCount ? (onboardingDurationSum / onboardingDurationCount) : null;

    return NextResponse.json({
      ...analytics,
      implementationHealth: {
        timeToFirstValue: timeToFirstValue !== null ? Number(timeToFirstValue.toFixed(1)) : null,
        avgOnboardingDuration: avgOnboardingDuration !== null ? Number(avgOnboardingDuration.toFixed(1)) : null,
        activeImplementations,
        atRiskClients,
      },
      clients,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics summary.' }, { status: 500 });
  }
} 