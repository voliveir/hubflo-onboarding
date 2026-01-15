"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pin, Calendar, Plus, X, Save, Clock, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Client } from "@/lib/types"

interface PinnedNoteEditorProps {
  client: Client
  onSave?: () => void
}

export function PinnedNoteEditor({ client, onSave }: PinnedNoteEditorProps) {
  const [initialScope, setInitialScope] = useState("")
  const [scopeChanges, setScopeChanges] = useState<Array<{ description: string; extra_time?: string; added_at: string }>>([])
  const [goLiveDate, setGoLiveDate] = useState("")
  const [newEstimatedGoLiveDate, setNewEstimatedGoLiveDate] = useState("")
  const [newScopeChange, setNewScopeChange] = useState({ description: "", extra_time: "" })
  const [saving, setSaving] = useState(false)
  const [showAddChange, setShowAddChange] = useState(false)

  useEffect(() => {
    if (client.pinned_note) {
      setInitialScope(client.pinned_note.initial_scope || "")
      setScopeChanges(client.pinned_note.scope_changes || [])
      // Extract just the date part (YYYY-MM-DD) from the date string, handling both date-only and ISO datetime formats
      if (client.pinned_note.go_live_date) {
        const dateStr = client.pinned_note.go_live_date.split("T")[0]
        setGoLiveDate(dateStr)
      } else {
        setGoLiveDate("")
      }
      if (client.pinned_note.new_estimated_go_live_date) {
        const dateStr = client.pinned_note.new_estimated_go_live_date.split("T")[0]
        setNewEstimatedGoLiveDate(dateStr)
      } else {
        setNewEstimatedGoLiveDate("")
      }
    }
  }, [client.pinned_note])

  const handleAddScopeChange = () => {
    if (!newScopeChange.description.trim()) return

    setScopeChanges([
      ...scopeChanges,
      {
        description: newScopeChange.description,
        extra_time: newScopeChange.extra_time || undefined,
        added_at: new Date().toISOString(),
      },
    ])
    setNewScopeChange({ description: "", extra_time: "" })
    setShowAddChange(false)
  }

  const handleRemoveScopeChange = (index: number) => {
    setScopeChanges(scopeChanges.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const pinnedNote = {
        initial_scope: initialScope,
        scope_changes: scopeChanges,
        go_live_date: goLiveDate || null,
        new_estimated_go_live_date: newEstimatedGoLiveDate || null,
        updated_at: new Date().toISOString(),
      }

      const response = await fetch("/api/update-client-full", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          updates: { pinned_note: pinnedNote },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save pinned note")
      }

      if (onSave) {
        onSave()
      } else {
        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (error: any) {
      console.error("Error saving pinned note:", error)
      alert(error.message || "Failed to save pinned note. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold pl-3 border-l-4 border-brand-gold flex items-center gap-2" style={{color: '#060520'}}>
          <Pin className="h-5 w-5 text-brand-gold" />
          Pinned Note for Client Portal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Initial Scope */}
        <div>
          <Label htmlFor="initial-scope" className="mb-2 block" style={{color: '#060520'}}>
            Initial Scope of Project
          </Label>
          <Textarea
            id="initial-scope"
            value={initialScope}
            onChange={(e) => setInitialScope(e.target.value)}
            placeholder="Enter the initial scope of the project as agreed during the kickoff call..."
            rows={4}
            className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Scope Changes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label style={{color: '#060520'}}>Scope Changes & Additions</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddChange(!showAddChange)}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Change
            </Button>
          </div>

          {showAddChange && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
              <div>
                <Label className="text-sm" style={{color: '#060520'}}>Description of Change</Label>
                <Textarea
                  value={newScopeChange.description}
                  onChange={(e) => setNewScopeChange({ ...newScopeChange, description: e.target.value })}
                  placeholder="Describe the scope change or addition..."
                  rows={2}
                  className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 mt-1"
                />
              </div>
              <div>
                <Label className="text-sm" style={{color: '#060520'}}>Extra Time Required (optional)</Label>
                <Input
                  value={newScopeChange.extra_time}
                  onChange={(e) => setNewScopeChange({ ...newScopeChange, extra_time: e.target.value })}
                  placeholder="e.g., 2 hours, 1 day, 3 weeks"
                  className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddScopeChange}
                  className="bg-brand-gold text-[#010124] hover:bg-[#F2994A]"
                >
                  Add
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddChange(false)
                    setNewScopeChange({ description: "", extra_time: "" })
                  }}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {scopeChanges.length > 0 && (
            <div className="space-y-3">
              {scopeChanges.map((change, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <p className="text-sm mb-1" style={{color: '#060520'}}>{change.description}</p>
                    {change.extra_time && (
                      <div className="flex items-center gap-1 text-brand-gold text-xs mt-1">
                        <Clock className="h-3 w-3" />
                        <span>Extra time: {change.extra_time}</span>
                      </div>
                    )}
                    <p className="text-gray-600 text-xs mt-2">
                      Added: {new Date(change.added_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveScopeChange(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Go-Live Date */}
        <div>
          <Label htmlFor="go-live-date" className="mb-2 block flex items-center gap-2" style={{color: '#060520'}}>
            <Calendar className="h-4 w-4 text-brand-gold" />
            First Go-Live Date
          </Label>
          <Input
            id="go-live-date"
            type="date"
            value={goLiveDate}
            onChange={(e) => setGoLiveDate(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 max-w-xs"
          />
          <p className="text-gray-600 text-xs mt-1">
            The go-live date agreed upon during the kickoff call
          </p>
        </div>

        {/* Estimated Go-Live Date (shown when there are scope changes) */}
        {scopeChanges.length > 0 && (
          <div>
            <Label htmlFor="new-estimated-go-live-date" className="mb-2 block flex items-center gap-2" style={{color: '#060520'}}>
              <Calendar className="h-4 w-4 text-brand-gold" />
              Estimated Go-Live Date
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex items-center justify-center">
                      <Info className="h-4 w-4 text-brand-gold hover:text-[#F2994A] transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    className="bg-white border border-gray-200 text-gray-900 max-w-xs p-3 shadow-lg"
                    side="right"
                  >
                    <p className="text-sm leading-relaxed">
                      This date accounts for any additional scope added during kickoff or after kickoff is completed.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="new-estimated-go-live-date"
              type="date"
              value={newEstimatedGoLiveDate}
              onChange={(e) => setNewEstimatedGoLiveDate(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 max-w-xs"
            />
            <p className="text-gray-600 text-xs mt-1">
              Updated go-live date accounting for scope changes and additional time required
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-semibold hover:brightness-110 border border-brand-gold/70"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Pinned Note"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
