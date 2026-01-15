"use client"

import { useEffect, useState } from "react"
import { getUpcomingClientFollowUps, completeClientFollowUp } from "@/lib/database"
import type { ClientFollowUp } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, parseISO, isBefore, differenceInCalendarDays } from "date-fns"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"
import { AlertCircle } from "lucide-react"

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
      <div className="mb-12">
        <div className="inline-block mb-4">
          <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wide">{title}</span>
        </div>
        <div className="space-y-4">
          {items.map((fu) => {
            const isOverdue = isBefore(parseISO(fu.due_date), now)
            return (
              <div
                key={fu.id}
                className={`rounded-xl p-6 lg:p-5 space-y-1 border-2 ${isOverdue ? 'border-[#ff4d4f]' : 'border-[#F2C94C]'} bg-white/5 shadow-sm shadow-black/30 flex flex-col md:flex-row md:items-center md:justify-between`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isOverdue && <AlertCircle className="h-4 w-4 text-[#ff4d4f]" />}
                    <span className="text-lg font-semibold text-white truncate">{fu.client_name || "Unknown Client"}</span>
                    {fu.client_package && (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ml-2 ${fu.client_package === 'Light' ? 'bg-green-500/20 text-green-300' : fu.client_package === 'Premium' ? 'bg-blue-500/20 text-blue-300' : fu.client_package === 'Gold' ? 'bg-yellow-400/20 text-yellow-300' : fu.client_package === 'Elite' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-300'}`}>{fu.client_package}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300 mb-1">{fu.client_email}</div>
                  <div className="text-sm text-gray-200 font-medium">{fu.title}</div>
                </div>
                <div className="flex flex-col items-end mt-3 md:mt-0 md:ml-8 min-w-[180px]">
                  <div className="text-sm text-gray-400 italic">{fu.milestone ? `${fu.milestone}-day follow-up` : ''}</div>
                  <div className="text-sm text-gray-400">Due: {format(parseISO(fu.due_date), "MMM d, yyyy")}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border border-white text-white rounded-full bg-transparent hover:bg-white/10 px-5 py-1.5 font-semibold transition"
                    disabled={marking === fu.id}
                    onClick={() => handleMarkDone(fu.id)}
                  >
                    {marking === fu.id ? "Marking..." : "Mark Complete"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <span className="text-brand-gold font-medium text-sm">Follow-ups</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4" style={{color: '#060520'}}>
                Client Follow-ups
              </h1>
              <p className="text-xl max-w-4xl leading-relaxed mb-8" style={{color: '#64748b'}}>Follow-ups grouped by due date. Mark them complete as you go!</p>
            </div>
            {loading ? (
              <div className="text-gray-400">Loading follow-ups...</div>
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