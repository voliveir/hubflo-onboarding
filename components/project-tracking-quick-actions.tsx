"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Phone, FileText, BookOpen, Zap, Loader2 } from "lucide-react"
import type { Client } from "@/lib/types"

interface ProjectTrackingQuickActionsProps {
  client: Client
  onUpdate?: (updated: Client) => void
}

export function ProjectTrackingQuickActions({ client, onUpdate }: ProjectTrackingQuickActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleIncrement = async (category: string) => {
    setLoading(category)
    try {
      const res = await fetch(`/api/clients/${client.id}/increment-tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, count: 1 }),
      })
      const data = await res.json()
      if (res.ok && data.client) {
        onUpdate?.(data.client)
        router.refresh()
      }
    } catch {
      // ignore
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-600 mr-2">Quick add:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleIncrement("call")}
        disabled={!!loading}
        className="h-8 text-xs"
      >
        {loading === "call" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Phone className="h-3 w-3 mr-1" />}
        +1 Call today
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleIncrement("form")}
        disabled={!!loading}
        className="h-8 text-xs"
      >
        {loading === "form" ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3 mr-1" />}
        +1 Form
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleIncrement("smartdoc")}
        disabled={!!loading}
        className="h-8 text-xs"
      >
        {loading === "smartdoc" ? <Loader2 className="h-3 w-3 animate-spin" /> : <BookOpen className="h-3 w-3 mr-1" />}
        +1 SmartDoc
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleIncrement("automation_integration")}
        disabled={!!loading}
        className="h-8 text-xs"
      >
        {loading === "automation_integration" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />}
        +1 Integration
      </Button>
    </div>
  )
}
