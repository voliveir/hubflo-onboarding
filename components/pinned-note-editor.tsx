"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pin, Calendar, Plus, X, Save, Clock, Info, CheckCircle2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import type { Client } from "@/lib/types"

interface PinnedNoteEditorProps {
  client: Client
  onSave?: () => void
}

export function PinnedNoteEditor({ client, onSave }: PinnedNoteEditorProps) {
  const [initialScope, setInitialScope] = useState("")
  const [initialScopeCompleted, setInitialScopeCompleted] = useState(false)
  const [initialScopeStartedAt, setInitialScopeStartedAt] = useState<string | undefined>(undefined)
  const [initialScopeCompletedAt, setInitialScopeCompletedAt] = useState<string | undefined>(undefined)
  const [scopeChanges, setScopeChanges] = useState<Array<{ description: string; extra_time?: string; added_at: string; completed?: boolean; started_at?: string; completed_at?: string }>>([])
  const [goLiveDate, setGoLiveDate] = useState("")
  const [newEstimatedGoLiveDate, setNewEstimatedGoLiveDate] = useState("")
  const [newScopeChange, setNewScopeChange] = useState({ description: "", extra_time: "" })
  const [saving, setSaving] = useState(false)
  const [showAddChange, setShowAddChange] = useState(false)

  useEffect(() => {
    if (client.pinned_note) {
      setInitialScope(client.pinned_note.initial_scope || "")
      setInitialScopeCompleted(client.pinned_note.initial_scope_completed || false)
      setInitialScopeStartedAt(client.pinned_note.initial_scope_started_at)
      setInitialScopeCompletedAt(client.pinned_note.initial_scope_completed_at)
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

  const handleToggleInitialScopeComplete = (checked: boolean) => {
    setInitialScopeCompleted(checked)
    if (checked) {
      // Mark as complete
      if (!initialScopeStartedAt) {
        // If not started yet, set started_at to now
        setInitialScopeStartedAt(new Date().toISOString())
      }
      setInitialScopeCompletedAt(new Date().toISOString())
    } else {
      // Unmark as complete
      setInitialScopeCompletedAt(undefined)
    }
  }

  const handleToggleScopeChangeComplete = (index: number, checked: boolean) => {
    const updated = [...scopeChanges]
    updated[index] = {
      ...updated[index],
      completed: checked,
      started_at: checked && !updated[index].started_at ? new Date().toISOString() : updated[index].started_at,
      completed_at: checked ? new Date().toISOString() : undefined,
    }
    setScopeChanges(updated)
  }

  const calculateDuration = (startedAt?: string, completedAt?: string): string | null => {
    if (!startedAt || !completedAt) return null
    const start = new Date(startedAt)
    const end = new Date(completedAt)
    const diffMs = end.getTime() - start.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}${diffHours > 0 ? `, ${diffHours} hour${diffHours !== 1 ? 's' : ''}` : ''}`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}${diffMinutes > 0 ? `, ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}` : ''}`
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`
    } else {
      return 'Less than a minute'
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const pinnedNote = {
        initial_scope: initialScope,
        initial_scope_completed: initialScopeCompleted,
        initial_scope_started_at: initialScopeStartedAt || undefined,
        initial_scope_completed_at: initialScopeCompletedAt || undefined,
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
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="initial-scope" className="block" style={{color: '#060520'}}>
              Initial Scope of Project
            </Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="initial-scope-complete"
                checked={initialScopeCompleted}
                onCheckedChange={handleToggleInitialScopeComplete}
                className="border-gray-300 data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
              />
              <Label htmlFor="initial-scope-complete" className="text-sm cursor-pointer" style={{color: '#060520'}}>
                Mark as Complete
              </Label>
            </div>
          </div>
          <Textarea
            id="initial-scope"
            value={initialScope}
            onChange={(e) => setInitialScope(e.target.value)}
            placeholder="Enter the initial scope of the project as agreed during the kickoff call..."
            rows={4}
            className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500"
          />
          {initialScopeCompleted && initialScopeCompletedAt && (
            <div className="mt-2 text-sm text-gray-600">
              <p>Completed on: {new Date(initialScopeCompletedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
              {initialScopeStartedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Duration: {calculateDuration(initialScopeStartedAt, initialScopeCompletedAt) || 'N/A'}
                </p>
              )}
            </div>
          )}
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
                  className={`bg-gray-50 border rounded-lg p-4 flex items-start justify-between gap-4 ${
                    change.completed ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <Checkbox
                        checked={change.completed || false}
                        onCheckedChange={(checked) => handleToggleScopeChangeComplete(index, !!checked)}
                        className="mt-0.5 border-gray-300 data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
                      />
                      <p className={`text-sm flex-1 ${change.completed ? 'line-through text-gray-500' : ''}`} style={{color: change.completed ? '#9ca3af' : '#060520'}}>
                        {change.description}
                      </p>
                    </div>
                    {change.extra_time && (
                      <div className="flex items-center gap-1 text-brand-gold text-xs mt-1 ml-6">
                        <Clock className="h-3 w-3" />
                        <span>Extra time: {change.extra_time}</span>
                      </div>
                    )}
                    <div className="ml-6 mt-2 space-y-1">
                      <p className="text-gray-600 text-xs">
                        Added: {new Date(change.added_at).toLocaleDateString()}
                      </p>
                      {change.completed && change.completed_at && (
                        <>
                          <p className="text-green-700 text-xs font-medium">
                            Completed on: {new Date(change.completed_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {change.started_at && (
                            <p className="text-gray-500 text-xs">
                              Duration: {calculateDuration(change.started_at, change.completed_at) || 'N/A'}
                            </p>
                          )}
                        </>
                      )}
                    </div>
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
