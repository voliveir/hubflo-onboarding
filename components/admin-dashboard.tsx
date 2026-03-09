"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatabaseStatusCheck } from "@/components/database-status-check"
import { ImplementationManagerDashboard } from "@/components/implementation-manager-dashboard"
import { getAllClients, getWebhookData, getClientActivityLog } from "@/lib/database"
import { Users, Package, TrendingUp, AlertCircle, Plus, CheckCircle, Clock, User, Activity } from "lucide-react"
import Link from "next/link"
import { format, parseISO, isBefore, formatDistanceToNow } from "date-fns"
import type { TaskCompletion } from "@/lib/types"

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

interface ActivityItem {
  id: string
  type: 'task_completed' | 'client_added' | 'integration_enabled' | 'feedback_submitted'
  title: string
  description: string
  clientName: string
  clientId: string
  timestamp: string
  icon: React.ReactNode
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
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loadingActivity, setLoadingActivity] = useState(true)
  useEffect(() => {
    fetchDashboardData()
    fetchRecentActivity()
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

  const fetchRecentActivity = async () => {
    setLoadingActivity(true)
    try {
      // Get recent task completions
      const taskCompletions = await getWebhookData()
      
      // Get recent client activity logs
      const allClients = await getAllClients()
      const activityPromises = allClients.slice(0, 5).map(client => getClientActivityLog(client.id))
      const activityLogs = await Promise.all(activityPromises)
      
      const activities: ActivityItem[] = []
      
      // Process task completions
      taskCompletions.slice(0, 10).forEach((completion: TaskCompletion) => {
        if (completion.completed_at) {
          activities.push({
            id: completion.id,
            type: 'task_completed',
            title: `Task Completed: ${completion.task_title}`,
            description: `${completion.client_name} completed a task in their onboarding`,
            clientName: completion.client_name,
            clientId: completion.client_id,
            timestamp: completion.completed_at,
            icon: <CheckCircle className="h-4 w-4 text-green-400" />
          })
        }
      })
      
      // Process activity logs
      activityLogs.flat().slice(0, 10).forEach((log: any) => {
        if (log.event_type === 'tag_added' || log.event_type === 'contact_added' || log.event_type === 'note_updated') {
          activities.push({
            id: log.id,
            type: 'client_added',
            title: `Client Activity: ${log.event_type.replace('_', ' ')}`,
            description: `Activity logged for client`,
            clientName: allClients.find(c => c.id === log.client_id)?.name || 'Unknown Client',
            clientId: log.client_id,
            timestamp: log.created_at,
            icon: <Activity className="h-4 w-4 text-blue-400" />
          })
        }
      })
      
      // Sort by timestamp (most recent first) and take top 15
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 15))
    } catch (err) {
      console.error("Error fetching recent activity:", err)
      setRecentActivity([])
    } finally {
      setLoadingActivity(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 min-h-[140px]">
              <div className="animate-pulse space-y-3">
                <div className="h-10 w-10 bg-gray-200 rounded mx-auto"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl bg-white border border-red-200 shadow-sm p-8">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            <span className="font-semibold">Error loading dashboard: {error}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            This might be because the database tables haven't been set up yet.
          </p>
          <Button asChild className="bg-gradient-to-br from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold hover:shadow-lg">
            <Link href="/admin/setup">Go to Database Setup</Link>
          </Button>
        </div>
        <DatabaseStatusCheck />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Clients',
            value: stats.totalClients,
            icon: <Users className="h-10 w-10 text-blue-500" />,
            labelColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
          },
          {
            label: 'Active Clients',
            value: stats.activeClients,
            icon: <Users className="h-10 w-10 text-green-500" />,
            labelColor: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
          },
          {
            label: 'Avg Progress',
            value: `${stats.averageProgress}%`,
            icon: <TrendingUp className="h-10 w-10 text-yellow-500" />,
            labelColor: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
          },
          {
            label: 'Premium+',
            value: stats.packageBreakdown.premium + stats.packageBreakdown.gold + stats.packageBreakdown.elite,
            icon: <Package className="h-10 w-10 text-purple-500" />,
            labelColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
          },
        ].map((stat, i) => (
          <div key={i} className={`rounded-2xl ${stat.bgColor} border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center p-6 min-h-[140px]`}>
            <div className="mb-3">{stat.icon}</div>
            <div className="text-4xl font-bold" style={{color: '#060520'}}>{stat.value}</div>
            <div className={`text-sm mt-2 font-semibold tracking-wide ${stat.labelColor}`}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Package Breakdown as mini cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Light', value: stats.packageBreakdown.light, color: 'bg-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700' },
          { label: 'Premium', value: stats.packageBreakdown.premium, color: 'bg-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
          { label: 'Gold', value: stats.packageBreakdown.gold, color: 'bg-yellow-400', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-700' },
          { label: 'Elite', value: stats.packageBreakdown.elite, color: 'bg-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-700' },
        ].map((pkg, i) => (
          <div key={i} className={`rounded-2xl ${pkg.bgColor} border ${pkg.borderColor} shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center p-4 min-h-[100px]`}>
            <div className={`text-3xl font-bold mb-2`} style={{color: '#060520'}}>{pkg.value}</div>
            <div className={`text-sm mt-1 px-3 py-1 rounded-full ${pkg.color} text-white font-semibold tracking-wide`}>{pkg.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-8">
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          <Button asChild className="flex items-center justify-center gap-3 bg-gradient-to-br from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-xl shadow-md hover:shadow-lg py-6 px-8 w-full sm:w-auto hover:scale-105 transition-transform" size="lg">
            <Link href="/admin/clients/new">
              <Plus className="h-6 w-6" />
              <span>Add New Client</span>
            </Link>
          </Button>
          <Button asChild className="flex items-center justify-center gap-3 bg-gradient-to-br from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-xl shadow-md hover:shadow-lg py-6 px-8 w-full sm:w-auto hover:scale-105 transition-transform" size="lg">
            <Link href="/admin/integrations">
              <Package className="h-6 w-6" />
              <span>Manage Integrations</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3" style={{color: '#060520'}}>
            <Activity className="h-6 w-6 text-[#F2C94C]" />
            Recent Activity
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchRecentActivity}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Clock className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        
        {loadingActivity ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">Activity will appear here as clients complete tasks</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold truncate" style={{color: '#060520'}}>
                      {activity.title}
                    </p>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-[#F2C94C] mr-1" />
                    <span className="text-sm text-gray-700 font-medium">
                      {activity.clientName}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild 
                      className="ml-3 h-7 px-3 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                    >
                      <Link href={`/admin/clients/${activity.clientId}`}>
                        View Client
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
