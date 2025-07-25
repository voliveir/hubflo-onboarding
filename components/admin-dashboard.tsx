"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatabaseStatusCheck } from "@/components/database-status-check"
import { ImplementationManagerDashboard } from "@/components/implementation-manager-dashboard"
import { getAllClients, getDueClientFollowUps, markClientFollowUpDone, getWebhookData, getClientActivityLog, getScheduledCallsForPackage, countCompletedCalls, markFollowUpEmailSent, getClientFollowUpEmails, createClientFollowUpEmail, markClientFollowUpEmailSent } from "@/lib/database"
import { Users, Package, TrendingUp, AlertCircle, Plus, CheckCircle, Clock, User, Activity, Phone, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import { format, parseISO, isBefore, formatDistanceToNow } from "date-fns"
import type { ClientFollowUp, TaskCompletion, ClientFollowUpEmail } from "@/lib/types"

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

interface TaskItem {
  id: string
  type: 'missing_first_call' | 'no_recent_call' | 'follow_up_email' | 'overdue_call'
  title: string
  description: string
  clientName: string
  clientId: string
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  daysOverdue?: number
  icon: React.ReactNode
  reminderNumber?: number // Added for follow-up email reminders
}

const TASK_FILTERS = [
  { label: "All", value: "all" },
  { label: "Missing First Onboarding Call", value: "missing_first_call" },
  { label: "No Recent Calls", value: "no_recent_call" },
  { label: "Overdue Scheduled Call", value: "overdue_call" },
  { label: "Follow-up Email Needed", value: "follow_up_email" },
]

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
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [taskFilter, setTaskFilter] = useState<string>("all")

  useEffect(() => {
    fetchDashboardData()
    fetchRecentActivity()
    fetchTasksAndReminders()
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

  const fetchTasksAndReminders = async () => {
    setLoadingTasks(true)
    try {
      const allClients = (await getAllClients()).filter((client) => !client.is_demo)
      const now = new Date()
      const tasks: TaskItem[] = []

      // For each client, generate and fetch follow-up email reminders
      for (const client of allClients) {
        if (client.status !== 'active') continue

        // Get all call dates for this client
        const callDates = [
          client.light_onboarding_call_date,
          client.premium_first_call_date,
          client.premium_second_call_date,
          client.gold_first_call_date,
          client.gold_second_call_date,
          client.gold_third_call_date,
          ...(Array.isArray(client.extra_call_dates) ? client.extra_call_dates : [])
        ].filter((d): d is string => !!d).map(date => new Date(date))

        const firstCallDate = callDates.length > 0 ? new Date(Math.min(...callDates.map(d => d.getTime()))) : null

        // Only proceed if the first call date is today or in the past
        if (firstCallDate && firstCallDate <= now) {
          // Generate follow-up email reminders for week 1, 3, 5, 7, 9, 11, 13
          const intervals = [7, 21, 35, 49, 63, 77, 91] // days after first call
          for (let i = 0; i < intervals.length; i++) {
            const reminder_number = i + 1
            const reminder_date = new Date(firstCallDate.getTime() + intervals[i] * 24 * 60 * 60 * 1000)
            // Only create reminders up to today + 7 days (show upcoming)
            if (reminder_date <= now) {
              await createClientFollowUpEmail(client.id, reminder_number, reminder_date.toISOString().slice(0, 10))
            }
          }
          // Fetch all reminders for this client
          const followUpEmails: ClientFollowUpEmail[] = await getClientFollowUpEmails(client.id)
          for (const reminder of followUpEmails) {
            if (!reminder.sent && new Date(reminder.reminder_date) <= now) {
              tasks.push({
                id: `follow_up_email_${client.id}_${reminder.reminder_number}`,
                type: 'follow_up_email',
                title: `Follow-up Email Needed (Week ${reminder.reminder_number === 1 ? 1 : 1 + (reminder.reminder_number - 1) * 2})`,
                description: `${client.name} follow-up for week ${reminder.reminder_number === 1 ? 1 : 1 + (reminder.reminder_number - 1) * 2} (${reminder.reminder_date})`,
                clientName: client.name,
                clientId: client.id,
                priority: reminder.reminder_number === 1 ? 'high' : 'medium',
                dueDate: reminder.reminder_date,
                icon: <Mail className="h-4 w-4 text-blue-400" />,
                reminderNumber: reminder.reminder_number,
              })
            }
          }
        }

        // Check for missing first onboarding call
        let missingFirstCall = false
        if (client.success_package === 'light' && !client.light_onboarding_call_date) missingFirstCall = true
        if (client.success_package === 'premium' && !client.premium_first_call_date) missingFirstCall = true
        if (client.success_package === 'gold' && !client.gold_first_call_date) missingFirstCall = true
        if (client.success_package === 'elite' && !client.elite_configurations_started_date) missingFirstCall = true

        if (missingFirstCall) {
          const daysSinceCreated = Math.round((now.getTime() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24))
          tasks.push({
            id: `missing_call_${client.id}`,
            type: 'missing_first_call',
            title: 'Missing First Onboarding Call',
            description: `${client.name} hasn't had their first onboarding call yet`,
            clientName: client.name,
            clientId: client.id,
            priority: daysSinceCreated > 14 ? 'high' : daysSinceCreated > 7 ? 'medium' : 'low',
            daysOverdue: daysSinceCreated,
            icon: <Phone className="h-4 w-4 text-red-400" />
          })
        }

        // Check for no recent calls (more than 2 weeks)
        if (!missingFirstCall && firstCallDate) {
          const daysSinceLastCall = Math.round((now.getTime() - firstCallDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysSinceLastCall > 14) {
            tasks.push({
              id: `no_recent_call_${client.id}`,
              type: 'no_recent_call',
              title: 'No Recent Calls',
              description: `${client.name} hasn't had a call in ${daysSinceLastCall} days`,
              clientName: client.name,
              clientId: client.id,
              priority: daysSinceLastCall > 30 ? 'high' : daysSinceLastCall > 21 ? 'medium' : 'low',
              daysOverdue: daysSinceLastCall,
              icon: <Phone className="h-4 w-4 text-orange-400" />
            })
          }
        }

        // Check for overdue scheduled calls based on package
        const scheduledCalls = getScheduledCallsForPackage(client.success_package)
        const completedCalls = countCompletedCalls(client)
        if (completedCalls < scheduledCalls) {
          const daysSinceCreated = Math.round((now.getTime() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24))
          if (daysSinceCreated > 21) {
            tasks.push({
              id: `overdue_call_${client.id}`,
              type: 'overdue_call',
              title: 'Overdue Scheduled Call',
              description: `${client.name} has ${completedCalls}/${scheduledCalls} calls completed`,
              clientName: client.name,
              clientId: client.id,
              priority: daysSinceCreated > 30 ? 'high' : 'medium',
              daysOverdue: daysSinceCreated,
              icon: <Calendar className="h-4 w-4 text-yellow-400" />
            })
          }
        }
      }

      // Sort by priority and days overdue
      tasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return (b.daysOverdue || 0) - (a.daysOverdue || 0)
      })

      setTasks(tasks) // Show all matching tasks
    } catch (err) {
      console.error("Error fetching tasks and reminders:", err)
      setTasks([])
    } finally {
      setLoadingTasks(false)
    }
  }

  // Filtered tasks based on selected filter
  const filteredTasks = taskFilter === "all"
    ? tasks
    : tasks.filter((task) => task.type === taskFilter)

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

      {/* Tasks & Reminders */}
      <div className="rounded-2xl border border-[#F2C94C] bg-white/10 backdrop-blur-md shadow-inner-glass p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[#F2C94C]" />
            Tasks & Reminders
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchTasksAndReminders}
            className="text-[#F2C94C] hover:text-white"
          >
            <Clock className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TASK_FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border border-[#F2C94C]/40 backdrop-blur-md
                ${taskFilter === filter.value
                  ? "bg-gradient-to-br from-[#F2C94C] to-[#F2994A] text-[#010124] shadow-gold-glow"
                  : "bg-white/10 text-[#F2C94C] hover:bg-[#F2C94C]/10"}
              `}
              onClick={() => setTaskFilter(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        {loadingTasks ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-400 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-400 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-green-400">All caught up!</p>
            <p className="text-sm text-gray-500 mt-1">No urgent tasks or reminders</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {task.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {task.priority}
                      </span>
                      {task.daysOverdue && (
                        <span className="text-xs text-gray-400">
                          {task.daysOverdue}d ago
                        </span>
                      )}
                      {/* Follow-up Email Sent Checkmark */}
                      {task.type === 'follow_up_email' && typeof task.reminderNumber === 'number' && (
                        <button
                          className="ml-2 rounded-full bg-gradient-to-br from-green-400 to-green-600 p-1 text-white hover:scale-110 transition-transform"
                          title="Mark follow-up as sent"
                          onClick={async () => {
                            if (typeof task.reminderNumber === 'number') {
                              await markClientFollowUpEmailSent(task.clientId, task.reminderNumber)
                              fetchTasksAndReminders()
                            }
                          }}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    {task.description}
                  </p>
                  <div className="flex items-center mt-2">
                    <User className="h-3 w-3 text-[#F2C94C] mr-1" />
                    <span className="text-xs text-[#F2C94C] font-medium">
                      {task.clientName}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild 
                      className="ml-2 h-6 px-2 text-xs text-gray-400 hover:text-white"
                    >
                      <Link href={`/admin/clients/${task.clientId}`}>
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

      {/* Recent Activity Feed */}
      <div className="rounded-2xl border border-[#F2C94C] bg-white/10 backdrop-blur-md shadow-inner-glass p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#F2C94C]" />
            Recent Activity
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchRecentActivity}
            className="text-[#F2C94C] hover:text-white"
          >
            <Clock className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        
        {loadingActivity ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-400 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-400 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">Activity will appear here as clients complete tasks</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white truncate">
                      {activity.title}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-2">
                    <User className="h-3 w-3 text-[#F2C94C] mr-1" />
                    <span className="text-xs text-[#F2C94C] font-medium">
                      {activity.clientName}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild 
                      className="ml-2 h-6 px-2 text-xs text-gray-400 hover:text-white"
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
