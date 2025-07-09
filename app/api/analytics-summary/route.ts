import { NextResponse } from 'next/server';
import { getAnalyticsOverview, getAllClients } from '@/lib/database';

function daysBetween(start: string | undefined, end: string | undefined): number | null {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function parseDate(date: string | null | undefined): Date | null {
  if (!date) return null;
  return new Date(date);
}

export async function GET(req: Request) {
  try {
    // Parse filters from query params
    const url = new URL(req.url);
    const planType = url.searchParams.get('plan_type');
    const successPackage = url.searchParams.get('success_package');
    const implementationManager = url.searchParams.get('implementation_manager');
    const status = url.searchParams.get('status');

    let clients = await getAllClients();
    // Apply filters
    if (planType) clients = clients.filter(c => c.plan_type === planType);
    if (successPackage) clients = clients.filter(c => c.success_package === successPackage);
    if (implementationManager) clients = clients.filter(c => c.implementation_manager === implementationManager);
    if (status) clients = clients.filter(c => c.status === status);

    // Revenue breakdowns
    const revenueByPlan: Record<string, number> = {};
    const revenueByBilling: Record<string, number> = {};
    const revenueByPackage: Record<string, number> = {};
    let totalRevenue = 0;
    clients.forEach(c => {
      const rev = Number(c.revenue_amount) || 0;
      totalRevenue += rev;
      revenueByPlan[c.plan_type] = (revenueByPlan[c.plan_type] || 0) + rev;
      revenueByBilling[c.billing_type] = (revenueByBilling[c.billing_type] || 0) + rev;
      revenueByPackage[c.success_package] = (revenueByPackage[c.success_package] || 0) + rev;
    });
    // Top revenue plan/package
    const topRevenuePlan = Object.entries(revenueByPlan).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const topRevenuePackage = Object.entries(revenueByPackage).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const percentAnnualRevenue = totalRevenue > 0 ? Math.round(100 * (revenueByBilling['annually'] || 0) / totalRevenue) : 0;

    // Engagement score (normalize and average)
    function engagementScore(client: any): number {
      // Normalize each metric to 0-1, then average
      const calls = client.calls_scheduled > 0 ? client.calls_completed / client.calls_scheduled : 0;
      const forms = Math.min(1, (client.forms_setup || 0) / 5); // assume 5 is "good"
      const zaps = Math.min(1, (client.zapier_integrations_setup || 0) / 3); // assume 3 is "good"
      const progress = Math.min(1, (client.project_completion_percentage || 0) / 100);
      return Math.round(((calls + forms + zaps + progress) / 4) * 100);
    }
    const engagementScores = clients.map(c => ({ id: c.id, name: c.name, score: engagementScore(c), implementation_manager: c.implementation_manager }));
    const avgEngagementScore = engagementScores.length ? Math.round(engagementScores.reduce((a, b) => a + b.score, 0) / engagementScores.length) : 0;
    const lowEngagementClients = engagementScores.filter(c => c.score < 40);

    // Engagement distribution (buckets)
    const engagementBuckets = [0, 20, 40, 60, 80, 100];
    const engagementDistribution = engagementBuckets.map((min, i) => {
      const max = engagementBuckets[i + 1] || 100;
      return {
        range: `${min}-${max}`,
        count: engagementScores.filter(c => c.score >= min && c.score < max).length,
      };
    });

    // Contract renewal pipeline (annual contracts)
    const now = new Date();
    const expiring30: any[] = [], expiring60: any[] = [], expiring90: any[] = [];
    let revenueAtRisk = 0;
    clients.forEach(c => {
      if ((c.billing_type as string) === 'annually' || (c.billing_type as string) === 'yearly') {
        const start = parseDate((c as any).contract_start_date) || parseDate(c.created_at);
        const end = parseDate((c as any).contract_end_date) || (start ? new Date(start.getFullYear() + 1, start.getMonth(), start.getDate()) : null);
        if (!end) return;
        const daysToEnd = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysToEnd <= 30 && daysToEnd >= 0) expiring30.push(c);
        if (daysToEnd <= 60 && daysToEnd > 30) expiring60.push(c);
        if (daysToEnd <= 90 && daysToEnd > 60) expiring90.push(c);
        if (daysToEnd <= 90 && daysToEnd >= 0) revenueAtRisk += Number(c.revenue_amount) || 0;
      }
    });

    // Implementation Health Metrics (reuse previous logic)
    let timeToFirstValueSum = 0, timeToFirstValueCount = 0;
    let onboardingDurationSum = 0, onboardingDurationCount = 0;
    let activeImplementations = 0;
    let atRiskClients = 0;
    clients.forEach(client => {
      let firstCall: string | undefined = undefined;
      if (client.success_package === 'light') firstCall = client.light_onboarding_call_date ?? undefined;
      else if (client.success_package === 'premium') firstCall = client.premium_first_call_date ?? undefined;
      else if (client.success_package === 'gold') firstCall = client.gold_first_call_date ?? undefined;
      const completedDate = client.graduation_date ?? undefined;
      const ttfv = daysBetween(client.created_at, firstCall);
      if (ttfv !== null && ttfv >= 0) {
        timeToFirstValueSum += ttfv;
        timeToFirstValueCount++;
      }
      if (completedDate) {
        const dur = daysBetween(client.created_at, completedDate);
        if (dur !== null && dur >= 0) {
          onboardingDurationSum += dur;
          onboardingDurationCount++;
        }
      }
      if (!completedDate) activeImplementations++;
      const created = new Date(client.created_at);
      const firstCallDate = firstCall ? new Date(firstCall) : null;
      const daysSinceCreated = Math.round((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      const noCallWithin10 = !firstCallDate || (firstCallDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) > 10;
      const notCompleted45 = !completedDate && daysSinceCreated > 45;
      if (noCallWithin10 || notCompleted45) atRiskClients++;
    });
    const timeToFirstValue = timeToFirstValueCount ? (timeToFirstValueSum / timeToFirstValueCount) : null;
    const avgOnboardingDuration = onboardingDurationCount ? (onboardingDurationSum / onboardingDurationCount) : null;

    // ARR and MRR logic
    const arr = totalRevenue;
    const mrr = arr / 12;

    // Analytics overview (existing)
    const analytics = await getAnalyticsOverview();

    // Churned clients metric
    const churnedClients = clients.filter(c => c.churned === true).length;

    return NextResponse.json({
      ...analytics,
      arr,
      mrr,
      churnedClients,
      filters: { planType, successPackage, implementationManager, status },
      revenue: {
        total: totalRevenue,
        byPlan: revenueByPlan,
        byBilling: revenueByBilling,
        byPackage: revenueByPackage,
        topRevenuePlan,
        topRevenuePackage,
        percentAnnualRevenue,
      },
      engagement: {
        avgScore: avgEngagementScore,
        lowEngagementClients,
        distribution: engagementDistribution,
        scores: engagementScores,
      },
      contractRenewal: {
        expiring30: expiring30.map(c => ({ id: c.id, name: c.name, end: (c as any).contract_end_date || c.created_at, revenue: c.revenue_amount })),
        expiring60: expiring60.map(c => ({ id: c.id, name: c.name, end: (c as any).contract_end_date || c.created_at, revenue: c.revenue_amount })),
        expiring90: expiring90.map(c => ({ id: c.id, name: c.name, end: (c as any).contract_end_date || c.created_at, revenue: c.revenue_amount })),
        revenueAtRisk,
      },
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