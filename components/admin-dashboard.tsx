"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatabaseStatusCheck } from "@/components/database-status-check"
import { ImplementationManagerDashboard } from "@/components/implementation-manager-dashboard"
import { getAllClients } from "@/lib/database"
import { Users, Package, TrendingUp, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"

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

  useEffect(() => {
    fetchDashboardData()
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
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold">{stats.activeClients}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold">{stats.averageProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Premium+</p>
                <p className="text-2xl font-bold">
                  {stats.packageBreakdown.premium + stats.packageBreakdown.gold + stats.packageBreakdown.elite}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Package Distribution</CardTitle>
          <CardDescription>Breakdown of clients by success package</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.packageBreakdown.light}</div>
              <Badge className="bg-green-100 text-green-800">Light</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.packageBreakdown.premium}</div>
              <Badge className="bg-blue-100 text-blue-800">Premium</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.packageBreakdown.gold}</div>
              <Badge className="bg-yellow-100 text-yellow-800">Gold</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.packageBreakdown.elite}</div>
              <Badge className="bg-purple-100 text-purple-800">Elite</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
            >
              <Link href="/admin/clients/new">
                <Plus className="h-6 w-6" />
                <span>Add New Client</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
            >
              <Link href="/admin/integrations">
                <Package className="h-6 w-6" />
                <span>Manage Integrations</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
            >
              <Link href="/admin/setup">
                <AlertCircle className="h-6 w-6" />
                <span>Database Setup</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Status */}
      <DatabaseStatusCheck />

      {/* Implementation Manager Dashboard */}
      {stats.totalClients > 0 && <ImplementationManagerDashboard />}
    </div>
  )
}
