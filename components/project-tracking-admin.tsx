"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Save,
  Phone,
  FileText,
  Zap,
  Users,
  Slack,
  CheckCircle,
  BarChart3,
} from "lucide-react"
import {
  updateProjectTracking,
  calculateProjectCompletion,
  countCompletedCalls,
  getScheduledCallsForPackage,
} from "@/lib/database"
import type { Client } from "@/lib/types"

interface ProjectTrackingAdminProps {
  client: Client
}

export function ProjectTrackingAdmin({ client }: ProjectTrackingAdminProps) {
  const [loading, setLoading] = useState(false)
  
  // Calculate completed calls based on call dates
  const calculatedCompletedCalls = countCompletedCalls(client)
  
  // Calculate scheduled calls based on package type (pass client for dynamic calculation of elite/enterprise)
  const calculatedScheduledCalls = getScheduledCallsForPackage(client.success_package, client)
  
  const [tracking, setTracking] = useState({
    calls_scheduled: calculatedScheduledCalls, // Use calculated value
    calls_completed: calculatedCompletedCalls, // Use calculated value
    forms_setup: client.forms_setup || 0,
    smartdocs_setup: client.smartdocs_setup || 0,
    zapier_integrations_setup: client.zapier_integrations_setup || 0,
    migration_completed: client.migration_completed || false,
    slack_access_granted: client.slack_access_granted || false,
  })

  // Create updated client object for progress component
  const [updatedClient, setUpdatedClient] = useState<Client>({
    ...client,
    ...tracking,
  })

  // Update the client object whenever tracking changes
  useEffect(() => {
    setUpdatedClient({
      ...client,
      ...tracking,
    })
  }, [client, tracking])

  // Update tracking when client data changes (e.g., call dates are updated)
  useEffect(() => {
    const newCompletedCalls = countCompletedCalls(client)
    const newScheduledCalls = getScheduledCallsForPackage(client.success_package, client)
    setTracking(prev => ({
      ...prev,
      calls_completed: newCompletedCalls,
      calls_scheduled: newScheduledCalls,
    }))
  }, [client])

  const handleSaveTracking = async () => {
    if (!client?.id) return

    setLoading(true)
    try {
      await updateProjectTracking(client.id, tracking)
      toast.success("Progress saved successfully")
    } catch (error) {
      console.error("Error saving tracking:", error)
      toast.error("Failed to save progress")
    } finally {
      setLoading(false)
    }
  }

  const getProgressStatus = (completed: number, total: number) => {
    if (total === 0) return { status: "Not Included", color: "text-slate-400", bgColor: "bg-slate-400/20" }
    if (completed >= total) return { status: "Completed", color: "text-emerald-400", bgColor: "bg-emerald-400/20" }
    if (completed > 0) return { status: "In Progress", color: "text-[#F2C94C]", bgColor: "bg-[#F2C94C]/20" }
    return { status: "Not Started", color: "text-red-400", bgColor: "bg-red-400/20" }
  }

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.min((completed / total) * 100, 100)
  }

  // Calculate overall progress manually since calculateProjectCompletion is async
  const calculateOverallProgress = (client: Client) => {
    const packageLimits = {
      light: { calls: 1, forms: 0, smartdocs: 0, integrations: 0, migration: false, slack: false },
      premium: { calls: 2, forms: 2, smartdocs: 2, integrations: 1, migration: false, slack: false },
      gold: { calls: 3, forms: 4, smartdocs: 4, integrations: 2, migration: false, slack: false },
      elite: { calls: 999, forms: 999, smartdocs: 999, integrations: 999, migration: true, slack: true },
      starter: { calls: 1, forms: 1, smartdocs: 1, integrations: 0, migration: false, slack: false },
      professional: { calls: 3, forms: 5, smartdocs: 5, integrations: 3, migration: false, slack: true },
      enterprise: { calls: 999, forms: 999, smartdocs: 999, integrations: 999, migration: true, slack: true },
    }

    const limits = packageLimits[client.success_package] || packageLimits.premium
    let totalTasks = 0
    let completedTasks = 0

    // Count calls
    if (limits.calls > 0) {
      totalTasks += limits.calls === 999 ? Math.max(client.calls_scheduled, 1) : limits.calls
      completedTasks += Math.min(
        client.calls_completed,
        limits.calls === 999 ? Math.max(client.calls_scheduled, 1) : limits.calls,
      )
    }

    // Count forms
    if (limits.forms > 0) {
      totalTasks += limits.forms === 999 ? Math.max(client.forms_setup, 1) : limits.forms
      completedTasks += Math.min(client.forms_setup, limits.forms === 999 ? Math.max(client.forms_setup, 1) : limits.forms)
    }

    // Count smartdocs
    if (limits.smartdocs > 0) {
      totalTasks += limits.smartdocs === 999 ? Math.max(client.smartdocs_setup, 1) : limits.smartdocs
      completedTasks += Math.min(client.smartdocs_setup, limits.smartdocs === 999 ? Math.max(client.smartdocs_setup, 1) : limits.smartdocs)
    }

    // Count integrations
    if (limits.integrations > 0) {
      totalTasks += limits.integrations === 999 ? Math.max(client.zapier_integrations_setup, 1) : limits.integrations
      completedTasks += Math.min(client.zapier_integrations_setup, limits.integrations === 999 ? Math.max(client.zapier_integrations_setup, 1) : limits.integrations)
    }

    // Count elite features
    if (limits.migration) {
      totalTasks += 1
      if (client.migration_completed) completedTasks += 1
    }

    if (limits.slack) {
      totalTasks += 1
      if (client.slack_access_granted) completedTasks += 1
    }

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60">No client data available</p>
      </div>
    )
  }

  // Calculate progress for mini cards
  const callsProgress = getProgressStatus(tracking.calls_completed, Math.max(tracking.calls_scheduled, 1))
  const formsProgress = getProgressStatus(tracking.forms_setup, 4) // Assuming 4 is a good target
  const smartdocsProgress = getProgressStatus(tracking.smartdocs_setup, 4) // Assuming 4 is a good target
  const integrationsProgress = getProgressStatus(tracking.zapier_integrations_setup, 2) // Assuming 2 is a good target

  const overallProgress = calculateOverallProgress(updatedClient)

  return (
    <div className="space-y-6">
      {/* Overall Implementation Progress - Compact version */}
      <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6 shadow-[#F2C94C]/5">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F2C94C]/10 rounded-2xl flex items-center justify-center border border-[#F2C94C]/20">
                <CheckCircle className="h-6 w-6 text-[#F2C94C]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Overall Implementation Progress</h2>
                <p className="text-white/80 text-sm">Complete onboarding progress across all services</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#F2C94C]">
                {overallProgress}%
              </div>
              <div className="text-sm text-white/60">Complete</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress 
              value={overallProgress} 
              className="h-3 bg-slate-700"
              style={{
                '--progress-background': '#F2C94C',
                '--progress-foreground': '#F2C94C',
              } as React.CSSProperties}
            />
          </div>
        </CardContent>
      </Card>

      {/* 4 Mini Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calls Card */}
        <Card className="bg-[#10122b]/90 rounded-xl border border-[#F2C94C]/20 p-4 shadow-[#F2C94C]/5">
          <CardContent className="p-0 text-center">
            <div className={`text-3xl font-bold ${callsProgress.color}`}>
              {tracking.calls_completed}/{Math.max(tracking.calls_scheduled, 1)}
            </div>
            <div className="text-sm text-white/60 mb-3">Calls</div>
            <Progress 
              value={getProgressPercentage(tracking.calls_completed, Math.max(tracking.calls_scheduled, 1))} 
              className="h-1 bg-slate-700"
              style={{
                '--progress-background': '#F2C94C',
                '--progress-foreground': '#F2C94C',
              } as React.CSSProperties}
            />
            <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${callsProgress.bgColor} ${callsProgress.color}`}>
              {callsProgress.status}
            </div>
          </CardContent>
        </Card>

        {/* Forms Card */}
        <Card className="bg-[#10122b]/90 rounded-xl border border-[#F2C94C]/20 p-4 shadow-[#F2C94C]/5">
          <CardContent className="p-0 text-center">
            <div className={`text-3xl font-bold ${formsProgress.color}`}>
              {tracking.forms_setup}/4
            </div>
            <div className="text-sm text-white/60 mb-3">Forms</div>
            <Progress 
              value={getProgressPercentage(tracking.forms_setup, 4)} 
              className="h-1 bg-slate-700"
              style={{
                '--progress-background': '#F2C94C',
                '--progress-foreground': '#F2C94C',
              } as React.CSSProperties}
            />
            <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${formsProgress.bgColor} ${formsProgress.color}`}>
              {formsProgress.status}
            </div>
          </CardContent>
        </Card>

        {/* SmartDocs Card */}
        <Card className="bg-[#10122b]/90 rounded-xl border border-[#F2C94C]/20 p-4 shadow-[#F2C94C]/5">
          <CardContent className="p-0 text-center">
            <div className={`text-3xl font-bold ${smartdocsProgress.color}`}>
              {tracking.smartdocs_setup}/4
            </div>
            <div className="text-sm text-white/60 mb-3">SmartDocs</div>
            <Progress 
              value={getProgressPercentage(tracking.smartdocs_setup, 4)} 
              className="h-1 bg-slate-700"
              style={{
                '--progress-background': '#F2C94C',
                '--progress-foreground': '#F2C94C',
              } as React.CSSProperties}
            />
            <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${smartdocsProgress.bgColor} ${smartdocsProgress.color}`}>
              {smartdocsProgress.status}
            </div>
          </CardContent>
        </Card>

        {/* Integrations Card */}
        <Card className="bg-[#10122b]/90 rounded-xl border border-[#F2C94C]/20 p-4 shadow-[#F2C94C]/5">
          <CardContent className="p-0 text-center">
            <div className={`text-3xl font-bold ${integrationsProgress.color}`}>
              {tracking.zapier_integrations_setup}/2
            </div>
            <div className="text-sm text-white/60 mb-3">Integrations</div>
            <Progress 
              value={getProgressPercentage(tracking.zapier_integrations_setup, 2)} 
              className="h-1 bg-slate-700"
              style={{
                '--progress-background': '#F2C94C',
                '--progress-foreground': '#F2C94C',
              } as React.CSSProperties}
            />
            <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${integrationsProgress.bgColor} ${integrationsProgress.color}`}>
              {integrationsProgress.status}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Tracking Form */}
      <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6 shadow-[#F2C94C]/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white pl-3 border-l-4 border-[#F2C94C] flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#F2C94C]" />
            Implementation Tracking
          </CardTitle>
          <CardDescription className="text-white/80">Update progress for {client.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zoom Calls */}
            <div className="rounded-lg border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-[#F2C94C]" />
                <h4 className="font-semibold text-white">Zoom Calls</h4>
              </div>
              <p className="text-xs text-slate-400 mb-4">Scheduled calls are auto-set based on package type. Completed calls are calculated from call dates in the client edit form</p>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-y-2">
                  <Label htmlFor="calls_scheduled" className="col-span-4 text-right text-slate-400">Scheduled</Label>
                  <div className="col-span-8">
                    <Input
                      id="calls_scheduled"
                      type="number"
                      min="0"
                      value={tracking.calls_scheduled}
                      disabled
                      className="bg-[#181a2f] border border-slate-600 text-white rounded-lg opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-1">Auto-set based on package type</p>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-y-2">
                  <Label htmlFor="calls_completed" className="col-span-4 text-right text-slate-400">Completed</Label>
                  <div className="col-span-8">
                    <Input
                      id="calls_completed"
                      type="number"
                      min="0"
                      max={tracking.calls_scheduled}
                      value={tracking.calls_completed}
                      disabled
                      className="bg-[#181a2f] border border-slate-600 text-white rounded-lg opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-1">Auto-calculated from call dates</p>
                  </div>
                </div>
                <Progress
                  value={
                    tracking.calls_scheduled > 0 ? (tracking.calls_completed / tracking.calls_scheduled) * 100 : 0
                  }
                  className="h-2 bg-slate-700"
                  style={{
                    '--progress-background': '#F2C94C',
                    '--progress-foreground': '#F2C94C',
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Forms & SmartDocs */}
            <div className="rounded-lg border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-[#F2C94C]" />
                <h4 className="font-semibold text-white">Forms & SmartDocs</h4>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-y-2">
                  <Label htmlFor="forms_setup" className="col-span-4 text-right text-slate-400">Forms Setup</Label>
                  <div className="col-span-8">
                    <Input
                      id="forms_setup"
                      type="number"
                      min="0"
                      value={tracking.forms_setup}
                      onChange={(e) =>
                        setTracking({ ...tracking, forms_setup: Number.parseInt(e.target.value) || 0 })
                      }
                      className="bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-y-2">
                  <Label htmlFor="smartdocs_setup" className="col-span-4 text-right text-slate-400">SmartDocs Setup</Label>
                  <div className="col-span-8">
                    <Input
                      id="smartdocs_setup"
                      type="number"
                      min="0"
                      value={tracking.smartdocs_setup}
                      onChange={(e) =>
                        setTracking({ ...tracking, smartdocs_setup: Number.parseInt(e.target.value) || 0 })
                      }
                      className="bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
                    />
                  </div>
                </div>
                <Progress 
                  value={((tracking.forms_setup + tracking.smartdocs_setup) / 8) * 100} 
                  className="h-2 bg-slate-700"
                  style={{
                    '--progress-background': '#F2C94C',
                    '--progress-foreground': '#F2C94C',
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Elite Features */}
            <div className="rounded-lg border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-[#F2C94C]" />
                <h4 className="font-semibold text-white">Elite Features</h4>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-y-2">
                  <Label htmlFor="zapier_integrations_setup" className="col-span-4 text-right text-slate-400">Zapier Integrations</Label>
                  <div className="col-span-8">
                    <Input
                      id="zapier_integrations_setup"
                      type="number"
                      min="0"
                      value={tracking.zapier_integrations_setup}
                      onChange={(e) =>
                        setTracking({ ...tracking, zapier_integrations_setup: Number.parseInt(e.target.value) || 0 })
                      }
                      className="bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-y-2">
                  <Label htmlFor="migration_completed" className="col-span-4 text-right text-slate-400">Migration</Label>
                  <div className="col-span-8 flex justify-end">
                    <Switch
                      id="migration_completed"
                      checked={tracking.migration_completed}
                      onCheckedChange={(checked) => setTracking({ ...tracking, migration_completed: checked })}
                      className="data-[state=checked]:bg-[#F2C94C] data-[state=checked]:border-[#F2C94C]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-y-2">
                  <Label htmlFor="slack_access_granted" className="col-span-4 text-right text-slate-400 flex items-center gap-2">
                    <Slack className="h-4 w-4" />
                    <span>Slack Access</span>
                  </Label>
                  <div className="col-span-8 flex justify-end">
                    <Switch
                      id="slack_access_granted"
                      checked={tracking.slack_access_granted}
                      onCheckedChange={(checked) => setTracking({ ...tracking, slack_access_granted: checked })}
                      className="data-[state=checked]:bg-[#F2C94C] data-[state=checked]:border-[#F2C94C]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button 
              onClick={handleSaveTracking} 
              disabled={loading} 
              className="w-full h-12 bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2994A] text-white font-semibold rounded-xl hover:brightness-110 border border-[#F2C94C]/70"
            >
              {loading ? <Save className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Save Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
