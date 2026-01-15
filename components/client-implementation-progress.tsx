"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, FileText, BookOpen, Zap, Database, MessageSquare } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"
import { cn } from "@/lib/utils"
import type { Client } from "@/lib/types"

interface ClientImplementationProgressProps {
  client: Client
}

export function ClientImplementationProgress({ client }: ClientImplementationProgressProps) {
  const { ref, isVisible } = useReveal()
  const [progress, setProgress] = useState({
    overall: 0,
    calls: 0,
    forms: 0,
    smartdocs: 0,
    integrations: 0,
  })
  const [showDates, setShowDates] = useState(false);

  useEffect(() => {
    calculateProgress()
  }, [client])

  const calculateProgress = () => {
    // Define package limits
    const limits = {
      light: { calls: 1, forms: 0, smartdocs: 0, integrations: 0, migration: false, slack: false },
      premium: { calls: 2, forms: 2, smartdocs: 2, integrations: 1, migration: false, slack: false },
      gold: { calls: 3, forms: 4, smartdocs: 4, integrations: 2, migration: false, slack: false },
      elite: { calls: 999, forms: 999, smartdocs: 999, integrations: 999, migration: true, slack: true },
      starter: { calls: 1, forms: 1, smartdocs: 1, integrations: 0, migration: false, slack: false },
      professional: { calls: 3, forms: 5, smartdocs: 5, integrations: 3, migration: false, slack: true },
      enterprise: { calls: 999, forms: 999, smartdocs: 999, integrations: 999, migration: true, slack: true },
      no_success: { calls: 0, forms: 0, smartdocs: 0, integrations: 0, migration: false, slack: false },
    }

    const packageLimits = limits[client.success_package] || limits.premium

    // Calculate individual progress percentages
    const callsProgress =
      packageLimits.calls === 999
        ? client.calls_scheduled > 0
          ? Math.round((client.calls_completed / client.calls_scheduled) * 100)
          : 0
        : Math.round((client.calls_completed / packageLimits.calls) * 100)

    const formsProgress =
      packageLimits.forms === 0
        ? 100
        : packageLimits.forms === 999
          ? client.forms_setup > 0
            ? 100
            : 0
          : Math.round((client.forms_setup / packageLimits.forms) * 100)

    const smartdocsProgress =
      packageLimits.smartdocs === 0
        ? 100
        : packageLimits.smartdocs === 999
          ? client.smartdocs_setup > 0
            ? 100
            : 0
          : Math.round((client.smartdocs_setup / packageLimits.smartdocs) * 100)

    const integrationsProgress =
      packageLimits.integrations === 0
        ? 100
        : packageLimits.integrations === 999
          ? client.zapier_integrations_setup > 0
            ? 100
            : 0
          : Math.round((client.zapier_integrations_setup / packageLimits.integrations) * 100)

    // Calculate overall progress
    let totalTasks = 0
    let completedTasks = 0

    // Count calls
    if (packageLimits.calls > 0) {
      // Only count calls as completed if their date is today or in the past
      const callDates = [
        client.light_onboarding_call_date,
        client.premium_first_call_date,
        client.premium_second_call_date,
        client.gold_first_call_date,
        client.gold_second_call_date,
        client.gold_third_call_date,
        ...(Array.isArray(client.extra_call_dates) ? client.extra_call_dates : [])
      ].filter((d): d is string => !!d).map(date => new Date(date))
      const now = new Date()
      const completedCalls = callDates.filter(date => date <= now).length
      totalTasks += packageLimits.calls === 999 ? Math.max(client.calls_scheduled, 1) : packageLimits.calls
      completedTasks += Math.min(
        completedCalls,
        packageLimits.calls === 999 ? Math.max(client.calls_scheduled, 1) : packageLimits.calls,
      )
    }

    // Count forms
    if (packageLimits.forms > 0) {
      totalTasks += packageLimits.forms === 999 ? Math.max(client.forms_setup, 1) : packageLimits.forms
      completedTasks += Math.min(
        client.forms_setup,
        packageLimits.forms === 999 ? Math.max(client.forms_setup, 1) : packageLimits.forms,
      )
    }

    // Count smartdocs
    if (packageLimits.smartdocs > 0) {
      totalTasks += packageLimits.smartdocs === 999 ? Math.max(client.smartdocs_setup, 1) : packageLimits.smartdocs
      completedTasks += Math.min(
        client.smartdocs_setup,
        packageLimits.smartdocs === 999 ? Math.max(client.smartdocs_setup, 1) : packageLimits.smartdocs,
      )
    }

    // Count integrations
    if (packageLimits.integrations > 0) {
      totalTasks +=
        packageLimits.integrations === 999 ? Math.max(client.zapier_integrations_setup, 1) : packageLimits.integrations
      completedTasks += Math.min(
        client.zapier_integrations_setup,
        packageLimits.integrations === 999 ? Math.max(client.zapier_integrations_setup, 1) : packageLimits.integrations,
      )
    }

    // Count elite features
    if (packageLimits.migration) {
      totalTasks += 1
      if (client.migration_completed) completedTasks += 1
    }

    if (packageLimits.slack) {
      totalTasks += 1
      if (client.slack_access_granted) completedTasks += 1
    }

    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    setProgress({
      overall: overallProgress,
      calls: Math.min(callsProgress, 100),
      forms: Math.min(formsProgress, 100),
      smartdocs: Math.min(smartdocsProgress, 100),
      integrations: Math.min(integrationsProgress, 100),
    })
  }

  const getPackageLimits = () => {
    const limits = {
      light: { calls: 1, forms: 0, smartdocs: 0, integrations: 0, migration: false, slack: false },
      premium: { calls: 2, forms: 2, smartdocs: 2, integrations: 1, migration: false, slack: false },
      gold: { calls: 3, forms: 4, smartdocs: 4, integrations: 2, migration: false, slack: false },
      elite: { calls: 999, forms: 999, smartdocs: 999, integrations: 999, migration: true, slack: true },
      starter: { calls: 1, forms: 1, smartdocs: 1, integrations: 0, migration: false, slack: false },
      professional: { calls: 3, forms: 5, smartdocs: 5, integrations: 3, migration: false, slack: true },
      enterprise: { calls: 999, forms: 999, smartdocs: 999, integrations: 999, migration: true, slack: true },
      no_success: { calls: 0, forms: 0, smartdocs: 0, integrations: 0, migration: false, slack: false },
    }

    return limits[client.success_package] || limits.premium
  }

  const packageLimits = getPackageLimits()
  const isUnlimited = (value: number) => value === 999

  const getServiceStatus = (completed: number, total: number, isEliteFeature = false) => {
    if (isEliteFeature) {
      return completed ? { text: "Completed", color: "text-brand-gold" } : { text: "Pending", color: "text-white/60" }
    }

    if (total === 0) {
      return { text: "Not Included", color: "text-white/40" }
    }

    if (completed >= total) {
      return { text: "Completed", color: "text-brand-gold" }
    }

    if (completed > 0) {
      return { text: "In Progress", color: "text-white" }
    }

    return { text: "Pending", color: "text-white/60" }
  }

  // Calculate completed calls for display (only those with date <= today)
  const callDates = [
    client.light_onboarding_call_date,
    client.premium_first_call_date,
    client.premium_second_call_date,
    client.gold_first_call_date,
    client.gold_second_call_date,
    client.gold_third_call_date,
    ...(Array.isArray(client.extra_call_dates) ? client.extra_call_dates : [])
  ].filter((d): d is string => !!d).map(date => new Date(date));
  const now = new Date();
  const completedCallDates: Date[] = callDates.filter(date => date <= now).sort((a, b) => a.getTime() - b.getTime());
  const scheduledCallDates: Date[] = callDates.filter(date => date > now).sort((a, b) => a.getTime() - b.getTime());
  const completedCallsForDisplay = completedCallDates.length;
  const callsStatus = getServiceStatus(
    // Only count calls as completed if their date is today or in the past
    completedCallsForDisplay,
    isUnlimited(packageLimits.calls) ? client.calls_scheduled : packageLimits.calls,
  )
  const formsStatus = getServiceStatus(client.forms_setup, packageLimits.forms)
  const smartdocsStatus = getServiceStatus(client.smartdocs_setup, packageLimits.smartdocs)
  const integrationsStatus = getServiceStatus(client.zapier_integrations_setup, packageLimits.integrations)

  return (
    <div ref={ref} className={cn("space-y-6", isVisible && "animate-fade-in-up")}>
      {/* Overall Progress */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
            <CheckCircle className="h-6 w-6 text-brand-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#060520' }}>Overall Implementation Progress</h2>
            <p className="leading-relaxed" style={{ color: '#64748b' }}>Your complete onboarding progress across all services</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: '#64748b' }}>Completion Status</span>
            <span className="text-3xl font-bold" style={{ color: '#060520' }}>{progress.overall}% Complete</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-brand-gold rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.overall}%` }}
            />
          </div>
          <div className="flex items-center space-x-2 text-sm" style={{ color: '#64748b' }}>
            <span>🚀</span>
            <span>
              {progress.overall === 100
                ? "Congratulations! Your implementation is complete."
                : "Let's get started with your Hubflo onboarding journey."}
            </span>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Onboarding Calls */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                <Users className="h-5 w-5 text-brand-gold" />
              </div>
              <Badge variant="outline" className={`${callsStatus.color} border-gray-200`} style={{ color: '#64748b' }}>
                {callsStatus.text}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#060520' }}>Onboarding Calls</h3>
            <div className="text-2xl font-bold mb-2" style={{ color: '#060520' }}>
              {completedCallsForDisplay}/
              {isUnlimited(packageLimits.calls) ||
              client.success_package === "elite" ||
              client.success_package === "enterprise"
                ? "∞"
                : packageLimits.calls}
            </div>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: '#64748b' }}>
              {isUnlimited(packageLimits.calls) ||
              client.success_package === "elite" ||
              client.success_package === "enterprise"
                ? `${completedCallsForDisplay} calls completed`
                : `${completedCallsForDisplay}/${packageLimits.calls} calls completed`}
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="h-full bg-brand-gold rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${
                    (completedCallsForDisplay /
                      (isUnlimited(packageLimits.calls) ? (client.calls_scheduled || 1) : packageLimits.calls)) * 100
                  }%`
                }}
              />
            </div>
          </div>
          {/* Expandable Dates Section */}
          <div className="mt-2">
            <button
              className="text-brand-gold text-xs underline hover:text-brand-gold/80 focus:outline-none focus:ring-2 focus:ring-brand-gold rounded transition-all"
              aria-expanded={showDates}
              aria-controls="onboarding-call-dates-section"
              onClick={() => setShowDates(v => !v)}
              type="button"
            >
              {showDates ? "Hide Dates" : "Show Dates"}
            </button>
            <div
              id="onboarding-call-dates-section"
              className={`transition-all duration-300 overflow-hidden ${showDates ? 'max-h-40 mt-2' : 'max-h-0'}`}
              aria-hidden={!showDates}
            >
              {(scheduledCallDates.length > 0 || completedCallDates.length > 0) ? (
                <div className="space-y-2">
                  {scheduledCallDates.length > 0 && (
                    <div>
                      <div className="text-xs mb-1" style={{ color: '#64748b' }}>Scheduled Call Dates:</div>
                      <ul className="text-xs space-y-1" style={{ color: '#060520' }}>
                        {scheduledCallDates.map((date: Date, idx: number) => (
                          <li key={"scheduled-" + idx}>• {date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {completedCallDates.length > 0 && (
                    <div>
                      <div className="text-xs mb-1" style={{ color: '#64748b' }}>Completed Call Dates:</div>
                      <ul className="text-xs space-y-1" style={{ color: '#060520' }}>
                        {completedCallDates.map((date: Date, idx: number) => (
                          <li key={"completed-" + idx}>• {date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs mt-2" style={{ color: '#64748b' }}>No calls scheduled yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Forms Setup */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
              <FileText className="h-5 w-5 text-brand-gold" />
            </div>
            <Badge variant="outline" className={`${formsStatus.color} border-gray-200`} style={{ color: '#64748b' }}>
              {formsStatus.text}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2" style={{ color: '#060520' }}>Forms Setup</h3>
          <div className="text-2xl font-bold mb-2" style={{ color: '#060520' }}>
            {client.forms_setup}/{isUnlimited(packageLimits.forms) ? "∞" : packageLimits.forms}
          </div>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: '#64748b' }}>
            {packageLimits.forms === 0
              ? "Not included in your package"
              : isUnlimited(packageLimits.forms)
                ? `${client.forms_setup} forms configured`
                : `${client.forms_setup}/${packageLimits.forms} forms configured`}
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${packageLimits.forms === 0 ? 'bg-gray-300' : 'bg-brand-gold'}`}
              style={{ width: `${progress.forms}%` }}
            />
          </div>
        </div>

        {/* SmartDocs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
              <BookOpen className="h-5 w-5 text-brand-gold" />
            </div>
            <Badge variant="outline" className={`${smartdocsStatus.color} border-gray-200`} style={{ color: '#64748b' }}>
              {smartdocsStatus.text}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2" style={{ color: '#060520' }}>SmartDocs</h3>
          <div className="text-2xl font-bold mb-2" style={{ color: '#060520' }}>
            {client.smartdocs_setup}/{isUnlimited(packageLimits.smartdocs) ? "∞" : packageLimits.smartdocs}
          </div>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: '#64748b' }}>
            {packageLimits.smartdocs === 0
              ? "Not included in your package"
              : isUnlimited(packageLimits.smartdocs)
                ? `${client.smartdocs_setup} SmartDocs configured`
                : `${client.smartdocs_setup}/${packageLimits.smartdocs} SmartDocs configured`}
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${packageLimits.smartdocs === 0 ? 'bg-gray-300' : 'bg-brand-gold'}`}
              style={{ width: `${progress.smartdocs}%` }}
            />
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
              <Zap className="h-5 w-5 text-brand-gold" />
            </div>
            <Badge variant="outline" className={`${integrationsStatus.color} border-gray-200`} style={{ color: '#64748b' }}>
              {integrationsStatus.text}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2" style={{ color: '#060520' }}>Integrations</h3>
          <div className="text-2xl font-bold mb-2" style={{ color: '#060520' }}>
            {client.zapier_integrations_setup}/
            {isUnlimited(packageLimits.integrations) ? "∞" : packageLimits.integrations}
          </div>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: '#64748b' }}>
            {packageLimits.integrations === 0
              ? "Not included in your package"
              : isUnlimited(packageLimits.integrations)
                ? `${client.zapier_integrations_setup} integrations active`
                : `${client.zapier_integrations_setup}/${packageLimits.integrations} integrations active`}
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${packageLimits.integrations === 0 ? 'bg-gray-300' : 'bg-brand-gold'}`}
              style={{ width: `${progress.integrations}%` }}
            />
          </div>
        </div>
      </div>

      {/* Elite Features */}
      {(packageLimits.migration || packageLimits.slack) && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                <Database className="h-6 w-6 text-brand-gold" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#060520' }}>Elite Features</h2>
                <p className="leading-relaxed" style={{ color: '#64748b' }}>Premium services included in your package</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-brand-gold text-brand-DEFAULT">
              {client.success_package.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packageLimits.migration && (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                    <Database className="h-4 w-4 text-brand-gold" />
                  </div>
                  <span className="font-medium" style={{ color: '#060520' }}>Migration Completed</span>
                </div>
                <Badge
                  variant={client.migration_completed ? "default" : "secondary"}
                  className={client.migration_completed ? "bg-brand-gold text-brand-DEFAULT" : "bg-gray-100 border-gray-200"}
                  style={{ color: client.migration_completed ? undefined : '#64748b' }}
                >
                  {client.migration_completed ? "Completed" : "Pending"}
                </Badge>
              </div>
            )}

            {packageLimits.slack && (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                    <MessageSquare className="h-4 w-4 text-brand-gold" />
                  </div>
                  <span className="font-medium" style={{ color: '#060520' }}>Slack Access Granted</span>
                </div>
                <Badge
                  variant={client.slack_access_granted ? "default" : "secondary"}
                  className={client.slack_access_granted ? "bg-brand-gold text-brand-DEFAULT" : "bg-gray-100 border-gray-200"}
                  style={{ color: client.slack_access_granted ? undefined : '#64748b' }}
                >
                  {client.slack_access_granted ? "Completed" : "Pending"}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
