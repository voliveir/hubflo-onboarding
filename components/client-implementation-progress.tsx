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
      totalTasks += packageLimits.calls === 999 ? Math.max(client.calls_scheduled, 1) : packageLimits.calls
      completedTasks += Math.min(
        client.calls_completed,
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

  const callsStatus = getServiceStatus(
    client.calls_completed,
    isUnlimited(packageLimits.calls) ? client.calls_scheduled : packageLimits.calls,
  )
  const formsStatus = getServiceStatus(client.forms_setup, packageLimits.forms)
  const smartdocsStatus = getServiceStatus(client.smartdocs_setup, packageLimits.smartdocs)
  const integrationsStatus = getServiceStatus(client.zapier_integrations_setup, packageLimits.integrations)

  return (
    <div ref={ref} className={cn("space-y-6", isVisible && "animate-fade-in-up")}>
      {/* Overall Progress */}
      <div className="bg-[#10122b]/90 text-white rounded-3xl border border-brand-gold/30 p-8 transition-all duration-500 hover:border-brand-gold/60 hover:shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/20">
            <CheckCircle className="h-6 w-6 text-brand-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Overall Implementation Progress</h2>
            <p className="text-white/80">Your complete onboarding progress across all services</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/80">Completion Status</span>
            <span className="text-3xl font-bold text-white">{progress.overall}% Complete</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-brand-gold rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.overall}%` }}
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-white/80">
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
        <div className="bg-[#10122b]/90 text-white rounded-3xl border border-brand-gold/30 p-6 transition-all duration-300 hover:border-brand-gold/60 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center border border-brand-gold/20">
              <Users className="h-5 w-5 text-brand-gold" />
            </div>
            <Badge variant="outline" className={`${callsStatus.color} border-brand-gold/40 bg-white/10`}>
              {callsStatus.text}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-white">Onboarding Calls</h3>
          <div className="text-2xl font-bold mb-2 text-white">
            {client.calls_completed}/
            {isUnlimited(packageLimits.calls) ||
            client.success_package === "elite" ||
            client.success_package === "enterprise"
              ? "∞"
              : packageLimits.calls}
          </div>
          <p className="text-sm text-white/80 mb-4">
            {isUnlimited(packageLimits.calls) ||
            client.success_package === "elite" ||
            client.success_package === "enterprise"
              ? `${client.calls_completed} calls completed`
              : `${client.calls_completed}/${packageLimits.calls} calls completed`}
          </p>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-brand-gold rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.calls}%` }}
            />
          </div>
        </div>

        {/* Forms Setup */}
        <div className="bg-[#10122b]/90 text-white rounded-3xl border border-brand-gold/30 p-6 transition-all duration-300 hover:border-brand-gold/60 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center border border-brand-gold/20">
              <FileText className="h-5 w-5 text-brand-gold" />
            </div>
            <Badge variant="outline" className={`${formsStatus.color} border-brand-gold/40 bg-white/10`}>
              {formsStatus.text}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-white">Forms Setup</h3>
          <div className="text-2xl font-bold mb-2 text-white">
            {client.forms_setup}/{isUnlimited(packageLimits.forms) ? "∞" : packageLimits.forms}
          </div>
          <p className="text-sm text-white/80 mb-4">
            {packageLimits.forms === 0
              ? "Not included in your package"
              : isUnlimited(packageLimits.forms)
                ? `${client.forms_setup} forms configured`
                : `${client.forms_setup}/${packageLimits.forms} forms configured`}
          </p>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-brand-gold rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.forms}%` }}
            />
          </div>
        </div>

        {/* SmartDocs */}
        <div className="bg-[#10122b]/90 text-white rounded-3xl border border-brand-gold/30 p-6 transition-all duration-300 hover:border-brand-gold/60 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center border border-brand-gold/20">
              <BookOpen className="h-5 w-5 text-brand-gold" />
            </div>
            <Badge variant="outline" className={`${smartdocsStatus.color} border-brand-gold/40 bg-white/10`}>
              {smartdocsStatus.text}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-white">SmartDocs</h3>
          <div className="text-2xl font-bold mb-2 text-white">
            {client.smartdocs_setup}/{isUnlimited(packageLimits.smartdocs) ? "∞" : packageLimits.smartdocs}
          </div>
          <p className="text-sm text-white/80 mb-4">
            {packageLimits.smartdocs === 0
              ? "Not included in your package"
              : isUnlimited(packageLimits.smartdocs)
                ? `${client.smartdocs_setup} SmartDocs configured`
                : `${client.smartdocs_setup}/${packageLimits.smartdocs} SmartDocs configured`}
          </p>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-brand-gold rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.smartdocs}%` }}
            />
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-[#10122b]/90 text-white rounded-3xl border border-brand-gold/30 p-6 transition-all duration-300 hover:border-brand-gold/60 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center border border-brand-gold/20">
              <Zap className="h-5 w-5 text-brand-gold" />
            </div>
            <Badge variant="outline" className={`${integrationsStatus.color} border-brand-gold/40 bg-white/10`}>
              {integrationsStatus.text}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-white">Integrations</h3>
          <div className="text-2xl font-bold mb-2 text-white">
            {client.zapier_integrations_setup}/
            {isUnlimited(packageLimits.integrations) ? "∞" : packageLimits.integrations}
          </div>
          <p className="text-sm text-white/80 mb-4">
            {packageLimits.integrations === 0
              ? "Not included in your package"
              : isUnlimited(packageLimits.integrations)
                ? `${client.zapier_integrations_setup} integrations active`
                : `${client.zapier_integrations_setup}/${packageLimits.integrations} integrations active`}
          </p>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-brand-gold rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.integrations}%` }}
            />
          </div>
        </div>
      </div>

      {/* Elite Features */}
      {(packageLimits.migration || packageLimits.slack) && (
        <div className="bg-[#10122b]/90 text-white rounded-3xl border border-brand-gold/30 p-8 transition-all duration-500 hover:border-brand-gold/60 hover:shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/20">
                <Database className="h-6 w-6 text-brand-gold" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Elite Features</h2>
                <p className="text-white/80">Premium services included in your package</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-brand-gold text-brand-DEFAULT">
              {client.success_package.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packageLimits.migration && (
              <div className="flex items-center justify-between p-4 border border-brand-gold/40 rounded-2xl bg-[#181a2f] text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-brand-gold/10 rounded-lg flex items-center justify-center border border-brand-gold/20">
                    <Database className="h-4 w-4 text-brand-gold" />
                  </div>
                  <span className="font-medium text-white">Migration Completed</span>
                </div>
                <Badge
                  variant={client.migration_completed ? "default" : "secondary"}
                  className={client.migration_completed ? "bg-brand-gold text-brand-DEFAULT" : "bg-white/10 text-white/80"}
                >
                  {client.migration_completed ? "Completed" : "Pending"}
                </Badge>
              </div>
            )}

            {packageLimits.slack && (
              <div className="flex items-center justify-between p-4 border border-brand-gold/40 rounded-2xl bg-[#181a2f] text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-brand-gold/10 rounded-lg flex items-center justify-center border border-brand-gold/20">
                    <MessageSquare className="h-4 w-4 text-brand-gold" />
                  </div>
                  <span className="font-medium text-white">Slack Access Granted</span>
                </div>
                <Badge
                  variant={client.slack_access_granted ? "default" : "secondary"}
                  className={client.slack_access_granted ? "bg-brand-gold text-brand-DEFAULT" : "bg-white/10 text-white/80"}
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
