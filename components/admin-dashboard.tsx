"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatabaseStatusCheck } from "@/components/database-status-check"
import { ImplementationManagerDashboard } from "@/components/implementation-manager-dashboard"
import { getAllClients, getDueClientFollowUps, markClientFollowUpDone } from "@/lib/database"
import { Users, Package, TrendingUp, AlertCircle, Plus, CheckCircle } from "lucide-react"
import Link from "next/link"
import { format, parseISO, isBefore } from "date-fns"
import type { ClientFollowUp } from "@/lib/types"

interface DashboardStats {
  totalClients: number
  activeClients: number
  packageBreakdown: {
    light: number
    premium: number
    gold: number
    elite: number
  }
  averageProgress: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    packageBreakdown: { light: 0, premium: 0, gold: 0, elite: 0 },
    averageProgress: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [followUps, setFollowUps] = useState<ClientFollowUp[]>([])
  const [loadingFollowUps, setLoadingFollowUps] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
    fetchFollowUps()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const clients = await getAllClients()

      const totalClients = clients.length
      const activeClients = clients.filter((c) => c.status === "active").length

      const packageBreakdown = {
        light: clients.filter((c) => c.success_package === "light").length,
        premium: clients.filter((c) => c.success_package === "premium").length,
        gold: clients.filter((c) => c.success_package === "gold").length,
        elite: clients.filter((c) => c.success_package === "elite").length,
      }

      const totalProgress = clients.reduce((sum, client) => sum + (client.project_completion_percentage || 0), 0)
      const averageProgress = totalClients > 0 ? Math.round(totalProgress / totalClients) : 0

      setStats({
        totalClients,
        activeClients,
        packageBreakdown,
        averageProgress,
      })
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const fetchFollowUps = async () => {
    setLoadingFollowUps(true)
    try {
      const due = await getDueClientFollowUps({ daysAhead: 7 })
      setFollowUps(due)
    } catch (err) {
      setFollowUps([])
    } finally {
      setLoadingFollowUps(false)
    }
  }

  const handleMarkDone = async (id: string) => {
    setMarking(id)
    await markClientFollowUpDone(id)
    await fetchFollowUps()
    setMarking(null)
  }

  // Helper to group follow-ups by due date (YYYY-MM-DD)
  function groupByDueDate(followUps: ClientFollowUp[]): Record<string, ClientFollowUp[]> {
    return followUps.reduce((acc: Record<string, ClientFollowUp[]>, fu: ClientFollowUp) => {
      const date = fu.due_date.split('T')[0]
      if (!acc[date]) acc[date] = []
      acc[date].push(fu)
      return acc
    }, {})
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading dashboard: {error}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              This might be because the database tables haven't been set up yet.
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin/setup">Go to Database Setup</Link>
            </Button>
          </CardContent>
        </Card>
        <DatabaseStatusCheck />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {[
          {
            label: 'Total Clients',
            value: stats.totalClients,
            icon: <Users className="h-10 w-10 text-blue-400 drop-shadow-glow" />,
            labelColor: 'text-blue-400',
          },
          {
            label: 'Active Clients',
            value: stats.activeClients,
            icon: <Users className="h-10 w-10 text-green-400 drop-shadow-glow" />,
            labelColor: 'text-green-400',
          },
          {
            label: 'Avg Progress',
            value: `${stats.averageProgress}%`,
            icon: <TrendingUp className="h-10 w-10 text-yellow-400 drop-shadow-glow" />,
            labelColor: 'text-yellow-400',
          },
          {
            label: 'Premium+',
            value: stats.packageBreakdown.premium + stats.packageBreakdown.gold + stats.packageBreakdown.elite,
            icon: <Package className="h-10 w-10 text-purple-400 drop-shadow-glow" />,
            labelColor: 'text-purple-400',
          },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl bg-white/10 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center p-6 min-h-[140px] border border-white/10">
            <div className="mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-white drop-shadow-glow">{stat.value}</div>
            <div className={`text-sm mt-1 font-medium tracking-wide ${stat.labelColor}`}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Package Breakdown as mini cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Light', value: stats.packageBreakdown.light, color: 'bg-green-500', emoji: '🟢' },
          { label: 'Premium', value: stats.packageBreakdown.premium, color: 'bg-blue-500', emoji: '🔵' },
          { label: 'Gold', value: stats.packageBreakdown.gold, color: 'bg-yellow-400', emoji: '🟡' },
          { label: 'Elite', value: stats.packageBreakdown.elite, color: 'bg-purple-500', emoji: '🟣' },
        ].map((pkg, i) => (
          <div key={i} className={`rounded-2xl border border-[#F2C94C] bg-white/10 backdrop-blur-md shadow-inner-glass flex flex-col items-center justify-center p-4 min-h-[90px]`}>
            <span className="text-2xl mb-1">{pkg.emoji}</span>
            <div className={`text-2xl font-bold text-white drop-shadow-glow`}>{pkg.value}</div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full ${pkg.color} text-white font-semibold tracking-wide`}>{pkg.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-[#F2C94C] bg-white/10 backdrop-blur-md shadow-inner-glass p-6 flex flex-col items-center">
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          <Button asChild className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-xl shadow-gold-glow py-6 px-4 w-48 mx-auto hover:scale-105 transition-transform" size="lg">
            <Link href="/admin/clients/new">
              <Plus className="h-7 w-7 mb-1" />
              <span>Add New Client</span>
            </Link>
          </Button>
          <Button asChild className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-xl shadow-gold-glow py-6 px-4 w-48 mx-auto hover:scale-105 transition-transform" size="lg">
            <Link href="/admin/integrations">
              <Package className="h-7 w-7 mb-1" />
              <span>Manage Integrations</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Implementation Manager Dashboard */}
      {stats.totalClients > 0 && <ImplementationManagerDashboard />}

      {/* Follow-up Reminders: group by due date in accordion */}
      <div className="rounded-2xl border border-[#F2C94C] bg-white/10 backdrop-blur-md shadow-inner-glass p-6">
        <h2 className="text-xl font-bold text-white mb-4">Follow-up Reminders</h2>
        {loadingFollowUps ? (
          <div className="text-[#F2C94C]">Loading follow-ups...</div>
        ) : followUps.length === 0 ? (
          <div className="text-green-400">No follow-ups due this week!</div>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupByDueDate(followUps)).map(([date, items]) => {
              const reminders = items as ClientFollowUp[];
              return (
                <div key={date} className="mb-2">
                  <button type="button" className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-gradient-to-r from-[#010124]/60 to-[#1a1a40]/60 border border-[#F2C94C] text-[#F2C94C] font-semibold focus:outline-none">
                    <span>{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-xs text-[#F2C94C]">{reminders.length} reminder{reminders.length > 1 ? 's' : ''}</span>
                  </button>
                  <div className="mt-2 space-y-1">
                    {reminders.map((fu: ClientFollowUp & { client_name?: string }) => (
                      <div key={fu.id} className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/10 border border-white/10 shadow-inner-glass">
                        <div>
                          {fu.client_name && (
                            <div className="text-xs font-semibold text-[#F2C94C] mb-0.5">{fu.client_name}</div>
                          )}
                          <div className="font-medium text-white">{fu.title}</div>
                          <div className="text-xs text-[#F2C94C]">Due: {new Date(fu.due_date).toLocaleDateString()}</div>
                        </div>
                        <button
                          className="ml-4 p-2 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#F2994A] shadow-gold-glow hover:scale-110 transition-transform"
                          disabled={marking === fu.id}
                          onClick={() => handleMarkDone(fu.id)}
                          title="Mark as done"
                        >
                          <CheckCircle className="h-6 w-6 text-[#010124]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
