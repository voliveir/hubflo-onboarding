import { NextResponse } from 'next/server';
import { getAnalyticsOverview, getAllClients } from '@/lib/database';

/** Count calendar days between two dates (legacy, used for at-risk logic). */
function daysBetween(start: string | undefined, end: string | undefined): number | null {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

/** Count business days only (Mon–Fri) strictly between two dates. Excludes weekends and both boundary dates. */
function businessDaysBetween(start: string | undefined, end: string | undefined): number | null {
  if (!start || !end) return null;
  const startStr = start.split('T')[0] || start;
  const endStr = end.split('T')[0] || end;
  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);
  if (!sy || !sm || !sd || !ey || !em || !ed) return null;
  const s = new Date(sy, sm - 1, sd);
  const e = new Date(ey, em - 1, ed);
  if (e.getTime() <= s.getTime()) return null;
  // Count business days strictly between (exclude start and end dates)
  let count = 0;
  const cursor = new Date(s);
  cursor.setDate(cursor.getDate() + 1);
  while (cursor.getTime() < e.getTime()) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

function parseDate(date: string | null | undefined): Date | null {
  if (!date) return null;
  return new Date(date);
}

/** Compute median (no minimum, returns value for any length >= 1). */
function median(values: number[]): number | null {
  if (!values?.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianVal = sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
  return isNaN(medianVal) ? null : medianVal;
}

/** Compute median after removing the 3 smallest and 3 largest values (trimmed median). Falls back to regular median when insufficient data. */
function trimmedMedian(values: number[], trimCount = 3): number | null {
  if (!values?.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const trimmed = sorted.slice(trimCount, trimCount > 0 ? -trimCount : undefined);
  if (!trimmed.length) return median(values);
  const mid = Math.floor(trimmed.length / 2);
  const medianVal = trimmed.length % 2 ? trimmed[mid]! : (trimmed[mid - 1]! + trimmed[mid]!) / 2;
  return isNaN(medianVal) ? median(values) : medianVal;
}

export async function GET(req: Request) {
  try {
    // Parse filters from query params
    const url = new URL(req.url);
    const planType = url.searchParams.get('plan_type');
    const successPackage = url.searchParams.get('success_package');
    const implementationManager = url.searchParams.get('implementation_manager');
    const status = url.searchParams.get('status');
    const dateRange = url.searchParams.get('date_range'); // '30' | '60' | '90' | 'custom'
    const dateStart = url.searchParams.get('date_start'); // YYYY-MM-DD for custom
    const dateEnd = url.searchParams.get('date_end'); // YYYY-MM-DD for custom
    const debug = url.searchParams.get('debug') === '1';

    let clients = await getAllClients();
    // Exclude demo clients from analytics
    const allNonDemoClients = clients.filter(c => !c.is_demo);
    // Exclude churned clients for most metrics
    const activeAnalyticsClients = allNonDemoClients.filter(c => !c.churned);
    // Apply filters to activeAnalyticsClients
    let filteredClients = activeAnalyticsClients;
    if (planType) filteredClients = filteredClients.filter(c => c.plan_type === planType);
    if (successPackage) filteredClients = filteredClients.filter(c => c.success_package === successPackage);
    if (implementationManager) filteredClients = filteredClients.filter(c => c.implementation_manager === implementationManager);
    if (status) filteredClients = filteredClients.filter(c => c.status === status);
    // Use filteredClients for all metrics except churnedClients and churnRate

    const now = new Date();

    // Implementation date range filter (for Implementation Timelines section)
    let implementationFilteredClients = filteredClients;
    if (dateRange || dateStart || dateEnd) {
      let rangeStart: Date | null = null;
      let rangeEnd: Date | null = null;
      if (dateRange === '30') {
        rangeStart = new Date(now);
        rangeStart.setDate(rangeStart.getDate() - 30);
        rangeEnd = new Date(now);
      } else if (dateRange === '60') {
        rangeStart = new Date(now);
        rangeStart.setDate(rangeStart.getDate() - 60);
        rangeEnd = new Date(now);
      } else if (dateRange === '90') {
        rangeStart = new Date(now);
        rangeStart.setDate(rangeStart.getDate() - 90);
        rangeEnd = new Date(now);
      } else if (dateStart && dateEnd) {
        rangeStart = new Date(dateStart + 'T00:00:00');
        rangeEnd = new Date(dateEnd + 'T23:59:59');
      }
      if (rangeStart && rangeEnd) {
        implementationFilteredClients = filteredClients.filter(c => {
          const created = new Date(c.created_at);
          return created >= rangeStart! && created <= rangeEnd!;
        });
      }
    }

    // Revenue breakdowns
    const revenueByPlan: Record<string, number> = {};
    const revenueByBilling: Record<string, number> = {};
    const revenueByPackage: Record<string, number> = {};
    let totalRevenue = 0;
    filteredClients.forEach(c => {
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
    const engagementScores = filteredClients.map(c => ({ id: c.id, name: c.name, score: engagementScore(c), implementation_manager: c.implementation_manager }));
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
    const expiring30: any[] = [], expiring60: any[] = [], expiring90: any[] = [];
    let revenueAtRisk = 0;
    filteredClients.forEach(c => {
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

    // Helper: first onboarding call date by package (only packages that track first call)
    function getFirstCallDate(client: any): string | undefined {
      const pkg = (client.success_package || '').toLowerCase();
      if (pkg === 'light' || pkg === 'starter') return client.light_onboarding_call_date ?? undefined;
      if (pkg === 'premium' || pkg === 'professional') return client.premium_first_call_date ?? undefined;
      if (pkg === 'gold') return client.gold_first_call_date ?? undefined;
      if (pkg === 'elite' || pkg === 'enterprise') return client.elite_configurations_started_date ?? undefined;
      return undefined;
    }

    // Implementation Health Metrics (use implementationFilteredClients for date-range scoping)
    // Only count clients that have actual data for each metric
    let timeToFirstValueSum = 0, timeToFirstValueCount = 0;
    const timeToFirstValueClientList: { id: string; name: string; created_at: string; first_call_date: string; days: number }[] = [];
    const onboardingDurations: number[] = [];
    let activeImplementations = 0;
    let atRiskClients = 0;
    let graduationsInPeriod = 0;
    implementationFilteredClients.forEach(client => {
      const firstCall = getFirstCallDate(client);
      const completedDate = client.graduation_date ?? undefined;
      const ttfv = businessDaysBetween(client.created_at, firstCall);
      if (ttfv !== null && ttfv >= 0 && firstCall) {
        timeToFirstValueSum += ttfv;
        timeToFirstValueCount++;
        timeToFirstValueClientList.push({
          id: client.id,
          name: client.name,
          created_at: client.created_at || '',
          first_call_date: firstCall,
          days: ttfv,
        });
      }
      if (completedDate) {
        const dur = businessDaysBetween(client.created_at, completedDate);
        if (dur !== null && dur >= 0) {
          onboardingDurations.push(dur);
          graduationsInPeriod++;
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
    const ttfvDays = timeToFirstValueClientList?.length
      ? timeToFirstValueClientList.map((c) => c.days).filter((d) => typeof d === "number" && !isNaN(d))
      : [];
    const ttfvSorted = [...ttfvDays].sort((a, b) => a - b);
    const ttfvTrimmed = ttfvSorted.slice(3, ttfvSorted.length > 6 ? -3 : undefined);
    const medianTimeToFirstValue = trimmedMedian(ttfvDays);
    const avgOnboardingDuration = onboardingDurations.length ? (onboardingDurations.reduce((a, b) => a + b, 0) / onboardingDurations.length) : null;
    const obDurationSorted = [...onboardingDurations].sort((a, b) => a - b);
    const obDurationTrimmed = obDurationSorted.slice(3, obDurationSorted.length > 6 ? -3 : undefined);
    const medianOnboardingDuration = trimmedMedian(onboardingDurations);

    // Duration by package (for bar chart)
    const durationByPackage: Record<string, number[]> = {};
    implementationFilteredClients.forEach(client => {
      const completedDate = client.graduation_date ?? undefined;
      if (!completedDate) return;
      const dur = businessDaysBetween(client.created_at, completedDate);
      if (dur !== null && dur >= 0) {
        const pkg = client.success_package || 'other';
        if (!durationByPackage[pkg]) durationByPackage[pkg] = [];
        durationByPackage[pkg].push(dur);
      }
    });
    const avgDurationByPackage = Object.fromEntries(
      Object.entries(durationByPackage).map(([pkg, arr]) => [
        pkg,
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0,
      ])
    );

    // Duration distribution (histogram buckets: 0-14, 15-29, 30-44, 45-59, 60+)
    const durationBuckets = [
      { range: '0-14 days', min: 0, max: 14, count: 0 },
      { range: '15-29 days', min: 15, max: 29, count: 0 },
      { range: '30-44 days', min: 30, max: 44, count: 0 },
      { range: '45-59 days', min: 45, max: 59, count: 0 },
      { range: '60+ days', min: 60, max: 9999, count: 0 },
    ];
    onboardingDurations.forEach(d => {
      const bucket = durationBuckets.find(b => d >= b.min && d <= b.max);
      if (bucket) bucket.count++;
    });

    // Clients contributing to avg/median onboarding duration (for modal) - only clients with valid graduation data
    const avgOnboardingDurationClientList = implementationFilteredClients
      .filter(c => c.graduation_date && c.created_at)
      .map(c => {
        const dur = businessDaysBetween(c.created_at, c.graduation_date!);
        return {
          id: c.id,
          name: c.name,
          created_at: c.created_at,
          graduation_date: c.graduation_date,
          duration_days: dur !== null && dur >= 0 ? dur : null,
        };
      })
      .filter(c => c.duration_days != null);

    // Build lists for implementation modals (use implementationFilteredClients for date-range consistency)
    const activeImplementationClientList = implementationFilteredClients
      .filter(c => !(c.graduation_date ?? undefined))
      .map(c => ({ id: c.id, name: c.name, implementation_manager: c.implementation_manager, success_package: c.success_package, created_at: c.created_at }));
    const atRiskClientList = implementationFilteredClients
      .filter(c => {
        const created = new Date(c.created_at);
        const firstCall = c.success_package === 'light' ? c.light_onboarding_call_date : c.success_package === 'premium' ? c.premium_first_call_date : c.success_package === 'gold' ? c.gold_first_call_date : undefined;
        const firstCallDate = firstCall ? new Date(firstCall) : null;
        const daysSinceCreated = Math.round((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        const noCallWithin10 = !firstCallDate || (firstCallDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) > 10;
        const notCompleted45 = !(c.graduation_date ?? undefined) && daysSinceCreated > 45;
        return noCallWithin10 || notCompleted45;
      })
      .map(c => ({ id: c.id, name: c.name, implementation_manager: c.implementation_manager }));

    // ARR and MRR logic
    const arr = totalRevenue;
    const mrr = arr / 12;

    // Analytics overview (existing)
    const analytics = await getAnalyticsOverview();

    // Churned clients metric - apply filters to churned clients calculation
    let filteredChurnedClients = allNonDemoClients.filter(c => c.churned === true);
    if (planType) filteredChurnedClients = filteredChurnedClients.filter(c => c.plan_type === planType);
    if (successPackage) filteredChurnedClients = filteredChurnedClients.filter(c => c.success_package === successPackage);
    if (implementationManager) filteredChurnedClients = filteredChurnedClients.filter(c => c.implementation_manager === implementationManager);
    if (status) filteredChurnedClients = filteredChurnedClients.filter(c => c.status === status);
    
    const churnedClients = filteredChurnedClients.length;
    const churnedClientList = filteredChurnedClients.map(c => ({ id: c.id, name: c.name, implementation_manager: c.implementation_manager }));
    const churnRate = allNonDemoClients.length > 0 ? (churnedClients / allNonDemoClients.length) * 100 : 0;

    // Revenue lost to churned clients
    const revenueLostToChurnedClients = filteredChurnedClients.reduce((sum, c) => sum + (Number(c.revenue_amount) || 0), 0);

    // Churn risk clients metric
    const churnRiskClientsArr = filteredClients.filter(c => c.churn_risk === true);
    const churnRiskClients = churnRiskClientsArr.length;
    const churnRiskClientList = churnRiskClientsArr.map(c => ({ id: c.id, name: c.name, implementation_manager: c.implementation_manager }));

    // Average number of users per client
    const userCounts = filteredClients.map(c => Number(c.number_of_users)).filter(n => !isNaN(n) && n > 0);
    const avgUsersPerClient = userCounts.length ? (userCounts.reduce((a, b) => a + b, 0) / userCounts.length) : 0;

    // Revenue at Risk (Churn Risk)
    const revenueAtRiskChurn = filteredClients.filter(c => c.churn_risk === true).reduce((sum, c) => sum + (Number(c.revenue_amount) || 0), 0);

    // Calculate ARR by month for heatmap
    const arrByMonth: Record<string, Record<string, number>> = {};
    let minYear = new Date().getFullYear();
    let maxYear = new Date().getFullYear();
    
    filteredClients.forEach(client => {
      if (!client.created_at) return;
      const date = new Date(client.created_at);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-indexed
      const revenue = Number(client.revenue_amount) || 0;
      
      if (!arrByMonth[year]) arrByMonth[year] = {};
      arrByMonth[year][month] = (arrByMonth[year][month] || 0) + revenue;
      
      if (year < minYear) minYear = year;
      if (year > maxYear) maxYear = year;
    });

    return NextResponse.json({
      ...analytics,
      arr,
      mrr,
      avgUsersPerClient,
      churnedClients,
      churnedClientList,
      churnRate,
      churnRiskClients,
      churnRiskClientList,
      filters: { planType, successPackage, implementationManager, status, dateRange: dateRange || null, dateStart: dateStart || null, dateEnd: dateEnd || null },
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
        medianTimeToFirstValue: medianTimeToFirstValue !== null ? Number(medianTimeToFirstValue.toFixed(1)) : null,
        timeToFirstValueClientList,
        avgOnboardingDuration: avgOnboardingDuration !== null ? Number(avgOnboardingDuration.toFixed(1)) : null,
        avgOnboardingDurationClientList,
        medianOnboardingDuration: medianOnboardingDuration !== null ? Number(medianOnboardingDuration.toFixed(1)) : null,
        ...(debug && {
          medianDebug: {
            timeToFirstValue: { sorted: ttfvSorted, trimmed: ttfvTrimmed, median: medianTimeToFirstValue },
            onboardingDuration: { sorted: obDurationSorted, trimmed: obDurationTrimmed, median: medianOnboardingDuration },
          },
        }),
        graduationsInPeriod,
        activeImplementations,
        atRiskClients,
        activeImplementationClientList,
        atRiskClientList,
        avgDurationByPackage,
        durationDistribution: durationBuckets.map(b => ({ range: b.range, count: b.count })),
        dateRange: dateRange || (dateStart && dateEnd ? 'custom' : null),
        dateStart: dateStart || null,
        dateEnd: dateEnd || null,
      },
      clients,
      revenueLostToChurnedClients,
      revenueAtRiskChurn,
      arrByMonth,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics summary.' }, { status: 500 });
  }
} 