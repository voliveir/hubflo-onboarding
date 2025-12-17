"use client"

import React from "react"
import { Pin, Calendar, Clock, FileText, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Client } from "@/lib/types"

interface PinnedNoteDisplayProps {
  client: Client
}

export function PinnedNoteDisplay({ client }: PinnedNoteDisplayProps) {
  const pinnedNote = client.pinned_note

  if (!pinnedNote || (!pinnedNote.initial_scope && (!pinnedNote.scope_changes || pinnedNote.scope_changes.length === 0) && !pinnedNote.go_live_date && !pinnedNote.new_estimated_go_live_date)) {
    return null
  }

  return (
    <div className="flex flex-col h-full min-h-[400px] text-center bg-[#10122b]/90 text-white rounded-3xl p-8 border border-brand-gold/30 transition-all duration-500 hover:border-brand-gold/60 hover:shadow-lg">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-14 h-14 bg-brand-gold/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-gold/20">
          <Pin className="h-6 w-6 text-brand-gold" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Project Scope & Timeline</h2>
        <p className="text-white/80 text-sm">
          Your project requirements and agreed-upon go-live date
        </p>
      </div>

      {/* Content */}
      <div className="text-left space-y-6 flex-grow">
        {/* Initial Scope */}
        {pinnedNote.initial_scope && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-brand-gold" />
              <h3 className="text-white font-semibold">Initial Project Scope</h3>
            </div>
            <div className="bg-[#181a2f]/50 rounded-xl p-4 border border-white/10">
              <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                {pinnedNote.initial_scope}
              </p>
            </div>
          </div>
        )}

        {/* Scope Changes */}
        {pinnedNote.scope_changes && pinnedNote.scope_changes.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3">Scope Changes & Additions</h3>
            <div className="space-y-3">
              {pinnedNote.scope_changes.map((change, index) => (
                <div
                  key={index}
                  className="bg-[#181a2f]/50 rounded-xl p-4 border border-white/10"
                >
                  <p className="text-white/90 mb-2">{change.description}</p>
                  {change.extra_time && (
                    <div className="flex items-center gap-2 text-brand-gold text-sm mt-2">
                      <Clock className="h-3 w-3" />
                      <span>Additional time required: {change.extra_time}</span>
                    </div>
                  )}
                  <p className="text-white/60 text-xs mt-2">
                    Added on {new Date(change.added_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Go-Live Date */}
        {(pinnedNote.go_live_date || pinnedNote.new_estimated_go_live_date) && (
          <div className="bg-brand-gold/10 rounded-xl p-4 border border-brand-gold/30">
            {pinnedNote.go_live_date && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-brand-gold" />
                  <h3 className="text-white font-semibold">Target Go-Live Date - MVP (Minimal Viable Portal)</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex items-center justify-center">
                          <Info className="h-4 w-4 text-brand-gold hover:text-brand-gold/80 transition-colors" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent 
                        className="bg-[#181a2f] border border-brand-gold/30 text-white max-w-xs p-3"
                        side="right"
                      >
                        <p className="text-sm leading-relaxed">
                          <strong className="text-brand-gold">MVP Definition:</strong> The Minimal Viable Portal means all settings have been updated (logos, branding, etc.) and the workspace template(s) have been created so you can invite your first beta clients for testing.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-brand-gold text-xl font-bold">
                  {(() => {
                    // Parse date string as local date to avoid timezone issues
                    const dateStr = pinnedNote.go_live_date
                    if (!dateStr) return ""
                    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
                    const date = new Date(year, month - 1, day)
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  })()}
                </p>
                <p className="text-white/80 text-sm mt-2">
                  This is the date we agreed upon during the kickoff call
                </p>
              </>
            )}
            
            {/* Estimated Go-Live Date (shown when there are scope changes and a new date is set) */}
            {pinnedNote.new_estimated_go_live_date && (
              <div className={pinnedNote.go_live_date ? "mt-4 pt-4 border-t border-brand-gold/20" : ""}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`${pinnedNote.go_live_date ? "h-4 w-4" : "h-5 w-5"} text-brand-gold`} />
                  <h4 className={`text-white font-semibold ${pinnedNote.go_live_date ? "text-sm" : ""}`}>
                    Estimated Go-Live Date
                  </h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex items-center justify-center">
                          <Info className={`${pinnedNote.go_live_date ? "h-3 w-3" : "h-4 w-4"} text-brand-gold hover:text-brand-gold/80 transition-colors`} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent 
                        className="bg-[#181a2f] border border-brand-gold/30 text-white max-w-xs p-3"
                        side="right"
                      >
                        <p className="text-sm leading-relaxed">
                          This date accounts for any additional scope added during kickoff or after kickoff is completed.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className={`text-brand-gold ${pinnedNote.go_live_date ? "text-lg" : "text-xl"} font-bold`}>
                  {(() => {
                    // Parse date string as local date to avoid timezone issues
                    const dateStr = pinnedNote.new_estimated_go_live_date
                    if (!dateStr) return ""
                    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
                    const date = new Date(year, month - 1, day)
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  })()}
                </p>
                <p className="text-white/80 text-xs mt-2">
                  Updated date accounting for scope changes and additional time required
                </p>
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        {pinnedNote.updated_at && (
          <p className="text-white/60 text-xs text-right mt-4">
            Last updated: {new Date(pinnedNote.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  )
}
