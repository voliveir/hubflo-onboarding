"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Users, FileText, BookOpen, Zap, Database, MessageSquare } from "lucide-react"
import type { Client } from "@/lib/types"

interface ClientImplementationProgressProps {
  client: Client
}

export function ClientImplementationProgress({ client }: ClientImplementationProgressProps) {
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
      return completed ? { text: "Completed", color: "text-[#ECB22D]" } : { text: "Pending", color: "text-gray-500" }
    }

    if (total === 0) {
      return { text: "Not Included", color: "text-gray-400" }
    }

    if (completed >= total) {
      return { text: "Completed", color: "text-[#ECB22D]" }
    }

    if (completed > 0) {
      return { text: "In Progress", color: "text-[#010124]" }
    }

    return { text: "Pending", color: "text-gray-500" }
  }

  const callsStatus = getServiceStatus(
    client.calls_completed,
    isUnlimited(packageLimits.calls) ? client.calls_scheduled : packageLimits.calls,
  )
  const formsStatus = getServiceStatus(client.forms_setup, packageLimits.forms)
  const smartdocsStatus = getServiceStatus(client.smartdocs_setup, packageLimits.smartdocs)
  const integrationsStatus = getServiceStatus(client.zapier_integrations_setup, packageLimits.integrations)

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="border-[#ECB22D] border-2">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-[#ECB22D]" />
            <div>
              <CardTitle className="text-[#010124]">Overall Implementation Progress</CardTitle>
              <CardDescription>Your complete onboarding progress across all services</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#010124]">Completion Status</span>
              <span className="text-2xl font-bold text-[#010124]">{progress.overall}% Complete</span>
            </div>
            <Progress value={progress.overall} className="h-3 bg-gray-200">
              <div
                className="h-full bg-[#ECB22D] rounded-full transition-all duration-300"
                style={{ width: `${progress.overall}%` }}
              />
            </Progress>
            <div className="flex items-center space-x-2 text-sm text-[#010124]">
              <span>🚀</span>
              <span>
                {progress.overall === 100
                  ? "Congratulations! Your implementation is complete."
                  : "Let's get started with your Hubflo onboarding journey."}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Onboarding Calls */}
        <Card className="border-[#ECB22D] border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-[#010124]" />
              <Badge variant="outline" className={`${callsStatus.color} border-[#ECB22D]`}>
                {callsStatus.text}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-[#010124]">Onboarding Calls</h3>
            <div className="text-2xl font-bold mb-2 text-[#010124]">
              {client.calls_completed}/
              {isUnlimited(packageLimits.calls) ||
              client.success_package === "elite" ||
              client.success_package === "enterprise"
                ? "∞"
                : packageLimits.calls}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {isUnlimited(packageLimits.calls) ||
              client.success_package === "elite" ||
              client.success_package === "enterprise"
                ? `${client.calls_completed} calls completed`
                : `${client.calls_completed}/${packageLimits.calls} calls completed`}
            </p>
            <Progress value={progress.calls} className="h-2 bg-gray-200">
              <div
                className="h-full bg-[#ECB22D] rounded-full transition-all duration-300"
                style={{ width: `${progress.calls}%` }}
              />
            </Progress>
          </CardContent>
        </Card>

        {/* Forms Setup */}
        <Card className="border-[#ECB22D] border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-[#010124]" />
              <Badge variant="outline" className={`${formsStatus.color} border-[#ECB22D]`}>
                {formsStatus.text}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-[#010124]">Forms Setup</h3>
            <div className="text-2xl font-bold mb-2 text-[#010124]">
              {client.forms_setup}/{isUnlimited(packageLimits.forms) ? "∞" : packageLimits.forms}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {packageLimits.forms === 0
                ? "Not included in your package"
                : isUnlimited(packageLimits.forms)
                  ? `${client.forms_setup} forms configured`
                  : `${client.forms_setup}/${packageLimits.forms} forms configured`}
            </p>
            <Progress value={progress.forms} className="h-2 bg-gray-200">
              <div
                className="h-full bg-[#ECB22D] rounded-full transition-all duration-300"
                style={{ width: `${progress.forms}%` }}
              />
            </Progress>
          </CardContent>
        </Card>

        {/* SmartDocs */}
        <Card className="border-[#ECB22D] border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-[#010124]" />
              <Badge variant="outline" className={`${smartdocsStatus.color} border-[#ECB22D]`}>
                {smartdocsStatus.text}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-[#010124]">SmartDocs</h3>
            <div className="text-2xl font-bold mb-2 text-[#010124]">
              {client.smartdocs_setup}/{isUnlimited(packageLimits.smartdocs) ? "∞" : packageLimits.smartdocs}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {packageLimits.smartdocs === 0
                ? "Not included in your package"
                : isUnlimited(packageLimits.smartdocs)
                  ? `${client.smartdocs_setup} SmartDocs configured`
                  : `${client.smartdocs_setup}/${packageLimits.smartdocs} SmartDocs configured`}
            </p>
            <Progress value={progress.smartdocs} className="h-2 bg-gray-200">
              <div
                className="h-full bg-[#ECB22D] rounded-full transition-all duration-300"
                style={{ width: `${progress.smartdocs}%` }}
              />
            </Progress>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="border-[#ECB22D] border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="h-8 w-8 text-[#010124]" />
              <Badge variant="outline" className={`${integrationsStatus.color} border-[#ECB22D]`}>
                {integrationsStatus.text}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-[#010124]">Integrations</h3>
            <div className="text-2xl font-bold mb-2 text-[#010124]">
              {client.zapier_integrations_setup}/
              {isUnlimited(packageLimits.integrations) ? "∞" : packageLimits.integrations}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {packageLimits.integrations === 0
                ? "Not included in your package"
                : isUnlimited(packageLimits.integrations)
                  ? `${client.zapier_integrations_setup} integrations active`
                  : `${client.zapier_integrations_setup}/${packageLimits.integrations} integrations active`}
            </p>
            <Progress value={progress.integrations} className="h-2 bg-gray-200">
              <div
                className="h-full bg-[#ECB22D] rounded-full transition-all duration-300"
                style={{ width: `${progress.integrations}%` }}
              />
            </Progress>
          </CardContent>
        </Card>
      </div>

      {/* Elite Features */}
      {(packageLimits.migration || packageLimits.slack) && (
        <Card className="border-[#ECB22D] border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-[#010124]" />
                <div>
                  <CardTitle className="text-[#010124]">Elite Features</CardTitle>
                  <CardDescription>Premium services included in your package</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-[#ECB22D] text-[#010124]">
                {client.success_package.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packageLimits.migration && (
                <div className="flex items-center justify-between p-4 border border-[#ECB22D] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-[#010124]" />
                    <span className="font-medium text-[#010124]">Migration Completed</span>
                  </div>
                  <Badge
                    variant={client.migration_completed ? "default" : "secondary"}
                    className={client.migration_completed ? "bg-[#ECB22D] text-[#010124]" : ""}
                  >
                    {client.migration_completed ? "Completed" : "Pending"}
                  </Badge>
                </div>
              )}

              {packageLimits.slack && (
                <div className="flex items-center justify-between p-4 border border-[#ECB22D] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-[#010124]" />
                    <span className="font-medium text-[#010124]">Slack Access Granted</span>
                  </div>
                  <Badge
                    variant={client.slack_access_granted ? "default" : "secondary"}
                    className={client.slack_access_granted ? "bg-[#ECB22D] text-[#010124]" : ""}
                  >
                    {client.slack_access_granted ? "Completed" : "Pending"}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
