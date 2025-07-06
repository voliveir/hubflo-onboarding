"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getAllClients } from "@/lib/database"
import type { Client } from "@/lib/types"
import { TrendingUp, Users, AlertCircle, Package } from "lucide-react"
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
    <div className="space-y-8">
      {/* Implementation Overview */}
      <div className="rounded-2xl border border-[#F2C94C] bg-white/10 backdrop-blur-md shadow-inner-glass p-6">
        <div className="flex flex-wrap gap-4 justify-between mb-6">
          {[
            { label: 'Active', value: activeClients.length, icon: <Users className="h-4 w-4 mr-1 text-[#F2C94C]" /> },
            { label: 'Need Attention', value: urgentClients.length, icon: <AlertCircle className="h-4 w-4 mr-1 text-[#F2C94C]" /> },
            { label: 'Near Completion', value: completedClients.length, icon: <TrendingUp className="h-4 w-4 mr-1 text-[#F2C94C]" /> },
            { label: 'Avg Progress', value: `${Math.round((activeClients.reduce((sum, c) => sum + c.project_completion_percentage, 0) / activeClients.length) || 0)}%`, icon: <Package className="h-4 w-4 mr-1 text-[#F2C94C]" /> },
          ].map((stat, i) => (
            <div key={i} className="flex items-center px-5 py-2 rounded-full font-bold shadow-gold-glow text-sm bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124]">
              {stat.icon}{stat.value} <span className="ml-2 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <h4 className="font-medium text-white">Recent Activity</h4>
          {activeClients.slice(0, 5).map((client) => (
            <div key={client.id} className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-[#F2C94C] shadow-inner-glass">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="font-medium text-white">{client.name}</div>
                  <div className="flex items-center space-x-2 text-sm text-[#F2C94C]">
                    <Badge className={getPackageBadgeColor(client.success_package)}>{client.success_package}</Badge>
                    <span>•</span>
                    <span>{client.number_of_users} users</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium text-[#F2C94C] drop-shadow-glow">{client.project_completion_percentage}%</div>
                  <div className="w-24 h-3 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#F2C94C] to-[#F2994A]" style={{ width: `${client.project_completion_percentage}%` }} />
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="border-2 border-[#F2C94C] text-[#F2C94C] rounded-full px-4 font-bold hover:bg-[#F2C94C]/10">
                  <Link href={`/admin/clients/${client.id}/tracking`}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Track
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Clients Needing Attention */}
      {urgentClients.length > 0 && (
        <div className="rounded-2xl border border-[#F2C94C] bg-white/10 backdrop-blur-md shadow-inner-glass p-6">
          <h4 className="font-bold text-[#F87171] mb-4">Clients Needing Attention</h4>
          <div className="space-y-3">
            {urgentClients.map((client, idx) => (
              <div
                key={client.id}
                className={`flex items-center justify-between p-3 rounded-xl border-l-4 border-[#F2C94C] shadow-inner-glass ${idx % 2 === 0 ? 'bg-[#1c1e39]/[0.85]' : 'bg-white/10'} mb-2`}
                style={{ marginBottom: '8px' }}
              >
                <div>
                  <div className="font-medium text-white">{client.name}</div>
                  <div className="text-sm text-[#F2C94C]">
                    Progress: {client.project_completion_percentage}% • Calls: {client.calls_completed}/{client.calls_scheduled}
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="border-2 border-[#F2C94C] text-[#F2C94C] rounded-full px-4 font-bold hover:bg-[#F2C94C]/10">
                  <Link href={`/admin/clients/${client.id}/tracking`}>Review</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
