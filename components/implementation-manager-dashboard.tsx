"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getAllClients } from "@/lib/database"
import type { Client } from "@/lib/supabase"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

export function ImplementationManagerDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const clientsData = await getAllClients()
      setClients(clientsData)
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getPackageBadgeColor = (pkg: string) => {
    switch (pkg) {
      case "light":
        return "bg-green-100 text-green-800"
      case "premium":
        return "bg-blue-100 text-blue-800"
      case "gold":
        return "bg-yellow-100 text-yellow-800"
      case "elite":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeClients = clients.filter((c) => c.status === "active")
  const urgentClients = activeClients.filter((c) => c.project_completion_percentage < 30)
  const completedClients = activeClients.filter((c) => c.project_completion_percentage >= 90)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Implementation Overview</CardTitle>
          <CardDescription>Track client implementation progress and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeClients.length}</div>
              <div className="text-sm text-gray-600">Active Implementations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{urgentClients.length}</div>
              <div className="text-sm text-gray-600">Need Attention</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedClients.length}</div>
              <div className="text-sm text-gray-600">Near Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  activeClients.reduce((sum, c) => sum + c.project_completion_percentage, 0) / activeClients.length ||
                    0,
                )}
                %
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Recent Activity</h4>
            {activeClients.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Badge className={getPackageBadgeColor(client.success_package)}>{client.success_package}</Badge>
                      <span>•</span>
                      <span>{client.number_of_users} users</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`font-medium ${getProgressColor(client.project_completion_percentage)}`}>
                      {client.project_completion_percentage}%
                    </div>
                    <Progress value={client.project_completion_percentage} className="w-24" />
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/clients/${client.id}/tracking`}>
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Track
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {urgentClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Clients Needing Attention</CardTitle>
            <CardDescription>Implementations with low progress that may need intervention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50"
                >
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-600">
                      Progress: {client.project_completion_percentage}% • Calls: {client.calls_completed}/
                      {client.calls_scheduled}
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/clients/${client.id}/tracking`}>Review</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
