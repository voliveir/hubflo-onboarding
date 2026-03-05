"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Phone, FileText, BookOpen, Zap, Loader2, Calendar } from "lucide-react"
import type { Client } from "@/lib/types"

interface ProjectTrackingQuickActionsProps {
  client: Client
  onUpdate?: (updated: Client) => void
}

export function ProjectTrackingQuickActions({ client, onUpdate }: ProjectTrackingQuickActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [callPopoverOpen, setCallPopoverOpen] = useState(false)
  const [callDate, setCallDate] = useState("")

  useEffect(() => {
    if (callPopoverOpen) {
      const now = new Date()
      setCallDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`)
    }
  }, [callPopoverOpen])

  const handleIncrement = async (category: string, opts?: { callDate?: string }) => {
    setLoading(category)
    try {
      const body: { category: string; count: number; callDate?: string } = { category, count: 1 }
      if (opts?.callDate) body.callDate = opts.callDate
      const res = await fetch(`/api/clients/${client.id}/increment-tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok && data.client) {
        onUpdate?.(data.client)
        router.refresh()
        setCallPopoverOpen(false)
      }
    } catch {
      // ignore
    } finally {
      setLoading(null)
    }
  }

  const handleAddCall = () => {
    handleIncrement("call", { callDate: callDate || undefined })
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-600 mr-2">Quick add:</span>
      <Popover open={callPopoverOpen} onOpenChange={setCallPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={!!loading}
            className="h-8 text-xs"
          >
            {loading === "call" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Phone className="h-3 w-3 mr-1" />}
            +1 Call
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2" style={{ color: "#060520" }}>
              <Calendar className="h-4 w-4" />
              Call date
            </label>
            <Input
              type="date"
              value={callDate}
              onChange={(e) => setCallDate(e.target.value)}
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={handleAddCall}
              disabled={!!loading || !callDate}
            >
              {loading === "call" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add call"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
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
