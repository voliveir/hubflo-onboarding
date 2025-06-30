"use client"

import { useEffect, useState } from "react"
import { getUpcomingClientFollowUps, completeClientFollowUp } from "@/lib/database"
import type { ClientFollowUp } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, parseISO, isBefore, differenceInCalendarDays } from "date-fns"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"

export default function ClientFollowUpsPage() {
  const [followUps, setFollowUps] = useState<(ClientFollowUp & { client_name?: string, client_email?: string, client_package?: string, milestone?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)

  useEffect(() => {
    fetchFollowUps()
  }, [])

  const fetchFollowUps = async () => {
    setLoading(true)
    try {
      const due = await getUpcomingClientFollowUps({ daysAhead: 120 })
      setFollowUps(due)
    } catch (err) {
      setFollowUps([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkDone = async (id: string) => {
    setMarking(id)
    await completeClientFollowUp(id)
    await fetchFollowUps()
    setMarking(null)
  }

  const now = new Date()
  const overdue = followUps.filter(fu => isBefore(parseISO(fu.due_date), now))
  const next7 = followUps.filter(fu => differenceInCalendarDays(parseISO(fu.due_date), now) >= 0 && differenceInCalendarDays(parseISO(fu.due_date), now) < 7)
  const next30 = followUps.filter(fu => differenceInCalendarDays(parseISO(fu.due_date), now) >= 7 && differenceInCalendarDays(parseISO(fu.due_date), now) < 30)
  const next60 = followUps.filter(fu => differenceInCalendarDays(parseISO(fu.due_date), now) >= 30 && differenceInCalendarDays(parseISO(fu.due_date), now) < 60)
  const next90 = followUps.filter(fu => differenceInCalendarDays(parseISO(fu.due_date), now) >= 60 && differenceInCalendarDays(parseISO(fu.due_date), now) < 90)
  const beyond90 = followUps.filter(fu => differenceInCalendarDays(parseISO(fu.due_date), now) >= 90)

  function renderSection(title: string, items: typeof followUps) {
    if (!items.length) return null
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3">{title}</h2>
        <div className="space-y-4">
          {items.map((fu) => (
            <Card key={fu.id} className="border-2 border-[#ECB22D] shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-[#010124]">{fu.client_name || "Unknown Client"}</CardTitle>
                    <div className="text-sm text-gray-600">{fu.client_email}</div>
                    {fu.client_package && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                        {fu.client_package}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">{fu.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Due: {format(parseISO(fu.due_date), "MMM d, yyyy")} {isBefore(parseISO(fu.due_date), now) ? <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">Overdue</span> : null}
                    </div>
                    {fu.milestone && (
                      <div className="text-xs text-yellow-700 mt-1">{fu.milestone}-day follow-up</div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  {fu.notes && <div className="text-sm text-gray-700 mb-2 max-w-md">{fu.notes}</div>}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={marking === fu.id}
                  onClick={() => handleMarkDone(fu.id)}
                >
                  {marking === fu.id ? "Marking..." : "Mark Complete"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Client Follow-ups</h1>
            <p className="mb-8 text-gray-600">Follow-ups grouped by due date. Mark them complete as you go!</p>
            {loading ? (
              <div className="text-gray-500">Loading follow-ups...</div>
            ) : (
              <>
                {renderSection("Overdue", overdue)}
                {renderSection("Next 7 Days", next7)}
                {renderSection("Next 30 Days", next30)}
                {renderSection("Next 60 Days", next60)}
                {renderSection("Next 90 Days", next90)}
                {renderSection("90+ Days", beyond90)}
              </>
            )}
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
} 