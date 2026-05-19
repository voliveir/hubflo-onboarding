"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Users,
  FileText,
  BookOpen,
  Zap,
  Database,
  MessageSquare,
  Clock,
  LayoutTemplate,
  type LucideIcon,
} from "lucide-react"
import { useReveal } from "@/hooks/useReveal"
import { cn } from "@/lib/utils"
import { countCompletedCalls } from "@/lib/database"
import type { Client } from "@/lib/types"
import {
  calculateImplementationProgress,
  getKickoffCallDate,
  getPackageLimits,
  getTemplatesCompleted,
  isUnlimited,
  normalizePackage,
} from "@/lib/success-packages"

interface ClientImplementationProgressProps {
  client: Client
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function completedCallDatesFromClient(client: Client): Date[] {
  const now = new Date()
  return [
    client.light_onboarding_call_date,
    client.premium_first_call_date,
    client.premium_second_call_date,
    client.gold_first_call_date,
    client.gold_second_call_date,
    client.gold_third_call_date,
    ...(Array.isArray(client.extra_call_dates) ? client.extra_call_dates : []),
  ]
    .filter((d): d is string => !!d)
    .map((date) => parseLocalDate(date))
    .filter((date) => date <= now)
}

export function ClientImplementationProgress({ client }: ClientImplementationProgressProps) {
  const { ref, isVisible } = useReveal()
  const packageId = normalizePackage(client.success_package)
  const limits = getPackageLimits(client.success_package)
  const [progress, setProgress] = useState({
    overall: 0,
    calls: 0,
    forms: 0,
    smartdocs: 0,
    integrations: 0,
    templates: 0,
  })
  const [showDates, setShowDates] = useState(false)
  const [timeSummary, setTimeSummary] = useState<{
    total_minutes: number
    total_hours: number
    meeting_minutes: number
    email_minutes: number
    implementation_minutes: number
  } | null>(null)

  const usesStructuredCallCount =
    packageId !== "light" && packageId !== "starter" && packageId !== "no_success"
  const completedCallsForDisplay = usesStructuredCallCount
    ? countCompletedCalls(client)
    : completedCallDatesFromClient(client).length

  useEffect(() => {
    const completed = usesStructuredCallCount
      ? countCompletedCalls(client)
      : completedCallDatesFromClient(client).length
    setProgress(calculateImplementationProgress(client, completed))
  }, [client, packageId])

  useEffect(() => {
    if (!client?.id) return
    fetch(`/api/time-entries/summary?client_id=${client.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.total_minutes === "number") {
          setTimeSummary({
            total_minutes: data.total_minutes ?? 0,
            total_hours: data.total_hours ?? data.total_minutes / 60,
            meeting_minutes: data.meeting_minutes ?? 0,
            email_minutes: data.email_minutes ?? 0,
            implementation_minutes: data.implementation_minutes ?? 0,
          })
        } else {
          setTimeSummary(null)
        }
      })
      .catch(() => setTimeSummary(null))
  }, [client?.id])

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes < 0) return "0m"
    const h = Math.floor(minutes / 60)
    const m = Math.round(minutes % 60)
    if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
    return `${m}m`
  }

  const getServiceStatus = (completed: number, total: number, isEliteFeature = false) => {
    if (isEliteFeature) {
      return completed ? { text: "Completed", color: "text-brand-gold" } : { text: "Pending", color: "text-white/60" }
    }
    if (total === 0) return { text: "Not Included", color: "text-white/40" }
    if (completed >= total) return { text: "Completed", color: "text-brand-gold" }
    if (completed > 0) return { text: "In Progress", color: "text-white" }
    return { text: "Pending", color: "text-white/60" }
  }

  const callDates = [
    client.light_onboarding_call_date,
    client.premium_first_call_date,
    client.premium_second_call_date,
    client.gold_first_call_date,
    client.gold_second_call_date,
    client.gold_third_call_date,
    ...(Array.isArray(client.extra_call_dates) ? client.extra_call_dates : []),
  ]
    .filter((d): d is string => !!d)
    .map((date) => parseLocalDate(date))

  const now = new Date()
  const completedCallDates = callDates.filter((date) => date <= now).sort((a, b) => a.getTime() - b.getTime())
  const scheduledCallDates = callDates.filter((date) => date > now).sort((a, b) => a.getTime() - b.getTime())

  const callsDenominator = isUnlimited(limits.countableCalls)
    ? Math.max(client.calls_scheduled || 1, 1)
    : limits.countableCalls

  const callsStatus = getServiceStatus(completedCallsForDisplay, callsDenominator)
  const templatesCompleted = getTemplatesCompleted(client)
  const templatesMax = limits.templatesCombined
  const templatesStatus = getServiceStatus(templatesCompleted, templatesMax ?? 0)
  const formsStatus = getServiceStatus(
    client.forms_setup,
    isUnlimited(limits.forms) ? Math.max(client.forms_setup, 1) : limits.forms,
  )
  const smartdocsStatus = getServiceStatus(
    client.smartdocs_setup,
    isUnlimited(limits.smartdocs) ? Math.max(client.smartdocs_setup, 1) : limits.smartdocs,
  )
  const integrationsStatus = getServiceStatus(
    client.zapier_integrations_setup,
    isUnlimited(limits.integrations) ? Math.max(client.zapier_integrations_setup, 1) : limits.integrations,
  )

  const kickoffDateStr = getKickoffCallDate(client)
  const kickoffCompleted = !!kickoffDateStr && parseLocalDate(kickoffDateStr) <= now

  const showCalls = limits.countableCalls > 0 || limits.totalCalls > 0
  const showTemplatesCombined = templatesMax != null && templatesMax > 0
  const showForms = !showTemplatesCombined && limits.forms > 0
  const showSmartdocs = !showTemplatesCombined && limits.smartdocs > 0
  const showIntegrations = limits.integrations > 0

  const serviceCardCount =
    [showCalls, showTemplatesCombined, showForms, showSmartdocs, showIntegrations].filter(Boolean).length
  const gridCols =
    serviceCardCount <= 1
      ? "grid-cols-1"
      : serviceCardCount === 2
        ? "md:grid-cols-2"
        : serviceCardCount === 3
          ? "md:grid-cols-2 lg:grid-cols-3"
          : "md:grid-cols-2 lg:grid-cols-4"

  return (
    <div ref={ref} className={cn("space-y-6", isVisible && "animate-fade-in-up")}>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
        <div className="flex items-center space-x-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: "rgba(236, 178, 45, 0.1)" }}
          >
            <CheckCircle className="h-6 w-6 text-brand-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#060520" }}>
              Overall Implementation Progress
            </h2>
            <p className="leading-relaxed" style={{ color: "#64748b" }}>
              Your complete onboarding progress across all services included in your package
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: "#64748b" }}>
              Completion Status
            </span>
            <span className="text-3xl font-bold" style={{ color: "#060520" }}>
              {progress.overall}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-brand-gold rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.overall}%` }}
            />
          </div>
          <div className="flex items-center space-x-2 text-sm" style={{ color: "#64748b" }}>
            <span>🚀</span>
            <span>
              {progress.overall === 100
                ? "Congratulations! Your implementation is complete."
                : "Implementation covers your first few weeks until you're fully set up."}
            </span>
          </div>

          {timeSummary && timeSummary.total_minutes > 0 && (
            <>
              <div className="my-6 border-t border-gray-200" />
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "rgba(236, 178, 45, 0.06)", border: "1px solid rgba(236, 178, 45, 0.15)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(236, 178, 45, 0.12)" }}
                  >
                    <Clock className="h-4 w-4 text-brand-gold" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#64748b" }}>
                    Time invested in your implementation
                  </span>
                </div>
                <p className="text-2xl font-bold mb-3" style={{ color: "#060520" }}>
                  {formatDuration(timeSummary.total_minutes)}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                  So far we&apos;ve spent{" "}
                  {timeSummary.total_hours >= 1
                    ? `${timeSummary.total_hours.toFixed(1)} hours`
                    : formatDuration(timeSummary.total_minutes)}{" "}
                  on your onboarding—including calls, email, and hands-on setup. This is separate from your progress
                  completion above.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {serviceCardCount > 0 && (
        <div className={cn("grid grid-cols-1 gap-6", gridCols)}>
          {showCalls && (
            <ServiceCard
              icon={Users}
              title="Onboarding Calls"
              status={callsStatus}
              value={
                isUnlimited(limits.countableCalls)
                  ? `${completedCallsForDisplay}/∞`
                  : `${completedCallsForDisplay}/${callsDenominator}`
              }
              description={
                isUnlimited(limits.countableCalls)
                  ? `${completedCallsForDisplay} calls completed`
                  : `${completedCallsForDisplay}/${callsDenominator} onboarding calls completed`
              }
              progressPercent={progress.calls}
              footer={
                <>
                  {kickoffCompleted && limits.excludeKickoffFromProgress && (
                    <p className="text-sm font-medium mt-2" style={{ color: "#64748b" }}>
                      Kick Off Completed 🎉!
                    </p>
                  )}
                  <CallDatesToggle
                    showDates={showDates}
                    setShowDates={setShowDates}
                    scheduledCallDates={scheduledCallDates}
                    completedCallDates={completedCallDates}
                  />
                </>
              }
            />
          )}

          {showTemplatesCombined && templatesMax != null && (
            <ServiceCard
              icon={LayoutTemplate}
              title="Forms & SmartDocs"
              status={templatesStatus}
              value={`${templatesCompleted}/${templatesMax}`}
              description={`${templatesCompleted}/${templatesMax} forms and SmartDocs configured`}
              progressPercent={progress.templates}
            />
          )}

          {showForms && (
            <ServiceCard
              icon={FileText}
              title="Forms Setup"
              status={formsStatus}
              value={`${client.forms_setup}/${isUnlimited(limits.forms) ? "∞" : limits.forms}`}
              description={
                isUnlimited(limits.forms)
                  ? `${client.forms_setup} forms configured`
                  : `${client.forms_setup}/${limits.forms} forms configured`
              }
              progressPercent={progress.forms}
            />
          )}

          {showSmartdocs && (
            <ServiceCard
              icon={BookOpen}
              title="SmartDocs"
              status={smartdocsStatus}
              value={`${client.smartdocs_setup}/${isUnlimited(limits.smartdocs) ? "∞" : limits.smartdocs}`}
              description={
                isUnlimited(limits.smartdocs)
                  ? `${client.smartdocs_setup} SmartDocs configured`
                  : `${client.smartdocs_setup}/${limits.smartdocs} SmartDocs configured`
              }
              progressPercent={progress.smartdocs}
            />
          )}

          {showIntegrations && (
            <ServiceCard
              icon={Zap}
              title="Workflows & Integrations"
              status={integrationsStatus}
              value={`${client.zapier_integrations_setup}/${isUnlimited(limits.integrations) ? "∞" : limits.integrations}`}
              description={
                isUnlimited(limits.integrations)
                  ? `${client.zapier_integrations_setup} workflows or integrations active`
                  : `${client.zapier_integrations_setup}/${limits.integrations} workflows or integrations active`
              }
              progressPercent={progress.integrations}
            />
          )}
        </div>
      )}

      {(limits.migration || limits.slack) && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                style={{ backgroundColor: "rgba(236, 178, 45, 0.1)" }}
              >
                <Database className="h-6 w-6 text-brand-gold" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#060520" }}>
                  Elite Features
                </h2>
                <p className="leading-relaxed" style={{ color: "#64748b" }}>
                  Premium services included in your Elite package
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-brand-gold text-brand-DEFAULT">
              {packageId.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {limits.migration && (
              <EliteFeatureRow icon={Database} label="Migration Completed" completed={!!client.migration_completed} />
            )}
            {limits.slack && (
              <EliteFeatureRow icon={MessageSquare} label="Slack Access Granted" completed={!!client.slack_access_granted} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ServiceCard({
  icon: Icon,
  title,
  status,
  value,
  description,
  progressPercent,
  footer,
}: {
  icon: LucideIcon
  title: string
  status: { text: string; color: string }
  value: string
  description: string
  progressPercent: number
  footer?: ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: "rgba(236, 178, 45, 0.1)" }}
          >
            <Icon className="h-5 w-5 text-brand-gold" />
          </div>
          <Badge variant="outline" className={`${status.color} border-gray-200`} style={{ color: "#64748b" }}>
            {status.text}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg mb-2" style={{ color: "#060520" }}>
          {title}
        </h3>
        <div className="text-2xl font-bold mb-2" style={{ color: "#060520" }}>
          {value}
        </div>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: "#64748b" }}>
          {description}
        </p>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
          <div
            className="h-full bg-brand-gold rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      {footer}
    </div>
  )
}

function CallDatesToggle({
  showDates,
  setShowDates,
  scheduledCallDates,
  completedCallDates,
}: {
  showDates: boolean
  setShowDates: (v: boolean | ((prev: boolean) => boolean)) => void
  scheduledCallDates: Date[]
  completedCallDates: Date[]
}) {
  return (
    <div className="mt-2">
      <button
        className="text-brand-gold text-xs underline hover:text-brand-gold/80 focus:outline-none focus:ring-2 focus:ring-brand-gold rounded transition-all"
        aria-expanded={showDates}
        aria-controls="onboarding-call-dates-section"
        onClick={() => setShowDates((v) => !v)}
        type="button"
      >
        {showDates ? "Hide Dates" : "Show Dates"}
      </button>
      <div
        id="onboarding-call-dates-section"
        className={`transition-all duration-300 overflow-hidden ${showDates ? "max-h-40 mt-2" : "max-h-0"}`}
        aria-hidden={!showDates}
      >
        {scheduledCallDates.length > 0 || completedCallDates.length > 0 ? (
          <div className="space-y-2">
            {scheduledCallDates.length > 0 && (
              <div>
                <div className="text-xs mb-1" style={{ color: "#64748b" }}>
                  Scheduled Call Dates:
                </div>
                <ul className="text-xs space-y-1" style={{ color: "#060520" }}>
                  {scheduledCallDates.map((date, idx) => (
                    <li key={`scheduled-${idx}`}>
                      • {date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {completedCallDates.length > 0 && (
              <div>
                <div className="text-xs mb-1" style={{ color: "#64748b" }}>
                  Completed Call Dates:
                </div>
                <ul className="text-xs space-y-1" style={{ color: "#060520" }}>
                  {completedCallDates.map((date, idx) => (
                    <li key={`completed-${idx}`}>
                      • {date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs mt-2" style={{ color: "#64748b" }}>
            No calls scheduled yet.
          </div>
        )}
      </div>
    </div>
  )
}

function EliteFeatureRow({
  icon: Icon,
  label,
  completed,
}: {
  icon: LucideIcon
  label: string
  completed: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-white">
      <div className="flex items-center space-x-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ backgroundColor: "rgba(236, 178, 45, 0.1)" }}
        >
          <Icon className="h-4 w-4 text-brand-gold" />
        </div>
        <span className="font-medium" style={{ color: "#060520" }}>
          {label}
        </span>
      </div>
      <Badge
        variant={completed ? "default" : "secondary"}
        className={completed ? "bg-brand-gold text-brand-DEFAULT" : "bg-gray-100 border-gray-200"}
        style={{ color: completed ? undefined : "#64748b" }}
      >
        {completed ? "Completed" : "Pending"}
      </Badge>
    </div>
  )
}
