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
import { Phone, FileText, BookOpen, Zap, Loader2, Plus, GraduationCap } from "lucide-react"
import type { Client } from "@/lib/types"

interface ClientQuickAddPopoverProps {
  client: Client
  onUpdate?: (updated: Client) => void
  /** Compact trigger for table cells */
  compact?: boolean
}

export function ClientQuickAddPopover({ client, onUpdate, compact = true }: ClientQuickAddPopoverProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [callDate, setCallDate] = useState("")
  const [graduationDate, setGraduationDate] = useState("")

  useEffect(() => {
    if (open) {
      const now = new Date()
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      setCallDate(today)
      setGraduationDate(client.graduation_date?.split("T")[0] || today)
    }
  }, [open, client.graduation_date])

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
        setOpen(false)
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

  const handleSetGraduationDate = async () => {
    setLoading("graduation")
    try {
      const res = await fetch(`/api/clients/${client.id}/graduation-date`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graduation_date: graduationDate || null }),
      })
      const data = await res.json()
      if (res.ok && data.client) {
        onUpdate?.(data.client)
        router.refresh()
        setOpen(false)
      }
    } catch {
      // ignore
    } finally {
      setLoading(null)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={compact ? "h-7 w-7 p-0 hover:bg-gray-100" : "h-8 px-2"}
          title="Quick add"
        >
          <Plus className="h-3.5 w-3.5 text-green-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2" align="end">
        <div className="space-y-1">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Quick add
          </div>
          {/* Call - with date */}
          <div className="space-y-1.5 rounded-md bg-gray-50 p-2">
            <div className="flex items-center gap-2">
              {loading === "call" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Phone className="h-3.5 w-3.5" />
              )}
              <span className="text-xs font-medium">Call</span>
            </div>
            <div className="flex items-center gap-1">
              <Input
                type="date"
                value={callDate}
                onChange={(e) => setCallDate(e.target.value)}
                className="h-7 text-xs flex-1"
              />
              <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleAddCall}
                disabled={!!loading || !callDate}
              >
                Add
              </Button>
            </div>
          </div>
          {/* Form, SmartDoc, Integration - one-click */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start gap-2 text-xs font-normal"
            onClick={() => handleIncrement("form")}
            disabled={!!loading}
          >
            {loading === "form" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            +1 Form
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start gap-2 text-xs font-normal"
            onClick={() => handleIncrement("smartdoc")}
            disabled={!!loading}
          >
            {loading === "smartdoc" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookOpen className="h-3.5 w-3.5" />}
            +1 SmartDoc
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start gap-2 text-xs font-normal"
            onClick={() => handleIncrement("automation_integration")}
            disabled={!!loading}
          >
            {loading === "automation_integration" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            +1 Integration
          </Button>
          {/* Graduation date */}
          <div className="space-y-1.5 rounded-md bg-gray-50 p-2 border-t border-gray-100 mt-1 pt-2">
            <div className="flex items-center gap-2">
              {loading === "graduation" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <GraduationCap className="h-3.5 w-3.5" />
              )}
              <span className="text-xs font-medium">Graduation Date</span>
            </div>
            <div className="flex items-center gap-1">
              <Input
                type="date"
                value={graduationDate}
                onChange={(e) => setGraduationDate(e.target.value)}
                className="h-7 text-xs flex-1"
              />
              <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleSetGraduationDate}
                disabled={!!loading || !graduationDate}
              >
                Set
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
