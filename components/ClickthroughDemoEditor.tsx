"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, MousePointerClick, Image as ImageIcon } from "lucide-react"
import type { ClickthroughDemoContentData, ClickthroughDemoStep, ClickthroughDemoHotspot } from "@/lib/types"

function defaultStepId(index: number) {
  return `step_${index + 1}`
}

interface ClickthroughDemoEditorProps {
  value: ClickthroughDemoContentData
  onChange: (value: ClickthroughDemoContentData) => void
}

export function ClickthroughDemoEditor({ value, onChange }: ClickthroughDemoEditorProps) {
  const steps = value?.steps ?? []

  const updateSteps = useCallback(
    (next: ClickthroughDemoStep[]) => {
      onChange({ steps: next })
    },
    [onChange]
  )

  const addStep = () => {
    const id = defaultStepId(steps.length)
    updateSteps([
      ...steps,
      { id, image_url: "", title: "", description: "", hotspots: [] },
    ])
  }

  const removeStep = (index: number) => {
    const next = steps.filter((_, i) => i !== index)
    // Re-id steps so targets still make sense
    next.forEach((s, i) => {
      s.id = defaultStepId(i)
    })
    updateSteps(next)
  }

  const updateStep = (index: number, patch: Partial<ClickthroughDemoStep>) => {
    const next = [...steps]
    next[index] = { ...next[index], ...patch }
    updateSteps(next)
  }

  const addHotspot = (stepIndex: number, initial?: Partial<ClickthroughDemoHotspot>) => {
    const step = steps[stepIndex]
    const targetOptions = steps
      .map((s, i) => (i > stepIndex ? s.id : null))
      .filter(Boolean) as string[]
    const target = targetOptions[0] ?? "complete"
    const newHotspot: ClickthroughDemoHotspot = {
      x: 10,
      y: 10,
      width: 15,
      height: 8,
      target_step_id: target,
      hint: "",
      ...initial,
    }
    const next = [...steps]
    next[stepIndex] = {
      ...next[stepIndex],
      hotspots: [...(next[stepIndex].hotspots ?? []), newHotspot],
    }
    updateSteps(next)
  }

  const updateHotspot = (
    stepIndex: number,
    hotspotIndex: number,
    patch: Partial<ClickthroughDemoHotspot>
  ) => {
    const next = [...steps]
    const arr = [...(next[stepIndex].hotspots ?? [])]
    arr[hotspotIndex] = { ...arr[hotspotIndex], ...patch }
    next[stepIndex] = { ...next[stepIndex], hotspots: arr }
    updateSteps(next)
  }

  const removeHotspot = (stepIndex: number, hotspotIndex: number) => {
    const next = [...steps]
    const arr = (next[stepIndex].hotspots ?? []).filter((_, i) => i !== hotspotIndex)
    next[stepIndex] = { ...next[stepIndex], hotspots: arr }
    updateSteps(next)
  }

  const targetOptions = (currentStepIndex: number) => {
    const options: { value: string; label: string }[] = []
    steps.forEach((s, i) => {
      if (i > currentStepIndex) options.push({ value: s.id, label: `Go to ${s.title || s.id}` })
    })
    options.push({ value: "complete", label: "Complete demo" })
    return options.length ? options : [{ value: "complete", label: "Complete demo" }]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Add steps (screenshots). For each step, add clickable hotspots. Users click the right area to advance.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addStep} className="gap-1">
          <Plus className="h-4 w-4" />
          Add step
        </Button>
      </div>

      {steps.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center text-gray-500">
          <ImageIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          <p>No steps yet. Click &quot;Add step&quot; to add the first screen.</p>
        </div>
      )}

      {steps.map((step, stepIndex) => (
        <StepCard
          key={step.id}
          step={step}
          stepIndex={stepIndex}
          steps={steps}
          onUpdate={(patch) => updateStep(stepIndex, patch)}
          onRemove={() => removeStep(stepIndex)}
          onAddHotspot={() => addHotspot(stepIndex)}
          onAddHotspotWithRect={(rect) => addHotspot(stepIndex, { ...rect, target_step_id: targetOptions(stepIndex)[0]?.value ?? "complete" })}
          onUpdateHotspot={(hotspotIndex, patch) => updateHotspot(stepIndex, hotspotIndex, patch)}
          onRemoveHotspot={(hotspotIndex) => removeHotspot(stepIndex, hotspotIndex)}
          targetOptions={targetOptions(stepIndex)}
        />
      ))}
    </div>
  )
}

interface StepCardProps {
  step: ClickthroughDemoStep
  stepIndex: number
  steps: ClickthroughDemoStep[]
  onUpdate: (patch: Partial<ClickthroughDemoStep>) => void
  onRemove: () => void
  onAddHotspot: () => void
  onAddHotspotWithRect: (rect: { x: number; y: number; width: number; height: number }) => void
  onUpdateHotspot: (index: number, patch: Partial<ClickthroughDemoHotspot>) => void
  onRemoveHotspot: (index: number) => void
  targetOptions: { value: string; label: string }[]
}

function StepCard({
  step,
  stepIndex,
  steps,
  onUpdate,
  onRemove,
  onAddHotspot,
  onAddHotspotWithRect,
  onUpdateHotspot,
  onRemoveHotspot,
  targetOptions,
}: StepCardProps) {
  const [clickMode, setClickMode] = useState<"idle" | "first" | "second">("idle")
  const [firstPoint, setFirstPoint] = useState<{ x: number; y: number } | null>(null)
  const hotspots = step.hotspots ?? []

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const img = target.querySelector("img")
    if (!img || !img.naturalWidth) return
    const imgRect = img.getBoundingClientRect()
    const relX = (e.clientX - imgRect.left) / imgRect.width
    const relY = (e.clientY - imgRect.top) / imgRect.height
    const x = Math.max(0, Math.min(100, relX * 100))
    const y = Math.max(0, Math.min(100, relY * 100))

    if (clickMode === "idle") return
    if (clickMode === "first") {
      setFirstPoint({ x, y })
      setClickMode("second")
      return
    }
    if (clickMode === "second" && firstPoint) {
      const x1 = Math.min(firstPoint.x, x)
      const x2 = Math.max(firstPoint.x, x)
      const y1 = Math.min(firstPoint.y, y)
      const y2 = Math.max(firstPoint.y, y)
      const width = Math.max(2, x2 - x1)
      const height = Math.max(2, y2 - y1)
      onAddHotspotWithRect({
        x: Math.round(x1 * 10) / 10,
        y: Math.round(y1 * 10) / 10,
        width: Math.round(width * 10) / 10,
        height: Math.round(height * 10) / 10,
      })
      setClickMode("idle")
      setFirstPoint(null)
    }
  }

  const startClickMode = () => {
    setFirstPoint(null)
    setClickMode("first")
  }

  const cancelClickMode = () => {
    setClickMode("idle")
    setFirstPoint(null)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-[#060520]">Step {stepIndex + 1}</span>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3">
        <div>
          <Label className="text-[#060520]">Image URL</Label>
          <Input
            value={step.image_url}
            onChange={(e) => onUpdate({ image_url: e.target.value })}
            placeholder="https://... or upload and paste URL"
            className="mt-1 text-[#060520]"
          />
        </div>
        <div>
          <Label className="text-[#060520]">Title (optional)</Label>
          <Input
            value={step.title ?? ""}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="e.g. Dashboard"
            className="mt-1 text-[#060520]"
          />
        </div>
        <div>
          <Label className="text-[#060520]">Description (optional)</Label>
          <Textarea
            value={step.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="e.g. Click the Settings icon to continue."
            rows={2}
            className="mt-1 text-[#060520]"
          />
        </div>
      </div>

      {/* Image preview + click-to-add hotspot */}
      {step.image_url && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-[#060520]">Preview &amp; hotspot picker</Label>
            {clickMode === "idle" ? (
              <Button type="button" variant="outline" size="sm" onClick={startClickMode} className="gap-1">
                <MousePointerClick className="h-3.5 w-3.5" />
                Add hotspot by clicking image
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-amber-700">
                  {clickMode === "first" ? "Click top-left of the clickable area" : "Click bottom-right of the clickable area"}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={cancelClickMode}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div
            className="relative inline-block max-w-full rounded-lg border-2 overflow-hidden bg-gray-100"
            style={{
              borderColor: clickMode !== "idle" ? "var(--brand-gold, #c9a227)" : undefined,
              cursor: clickMode !== "idle" ? "crosshair" : undefined,
            }}
            onClick={handleImageClick}
            role={clickMode !== "idle" ? "button" : undefined}
            aria-label={clickMode === "first" ? "Click top-left of hotspot" : clickMode === "second" ? "Click bottom-right of hotspot" : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={step.image_url}
              alt={step.title ?? `Step ${stepIndex + 1}`}
              className="block max-h-48 w-auto pointer-events-none select-none"
              draggable={false}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement
                if (img.naturalWidth) setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
              }}
            />
            {step.hotspots?.map((h, i) => (
              <div
                key={i}
                className="absolute border-2 border-brand-gold bg-brand-gold/20 pointer-events-none rounded"
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: `${h.width}%`,
                  height: `${h.height}%`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hotspots list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[#060520]">Clickable areas (hotspots)</Label>
          <Button type="button" variant="outline" size="sm" onClick={onAddHotspot} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add hotspot
          </Button>
        </div>
        {hotspots.length === 0 && (
          <p className="text-xs text-gray-500">Add at least one hotspot. Users click it to go to the next step or complete the demo.</p>
        )}
        <div className="space-y-2">
          {hotspots.map((h, hi) => (
            <div
              key={hi}
              className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100"
            >
              <div className="grid grid-cols-4 gap-1 w-full sm:w-auto">
                <div>
                  <span className="text-xs text-gray-500">x%</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={h.x}
                    onChange={(e) => onUpdateHotspot(hi, { x: Number(e.target.value) })}
                    className="h-8 w-14 text-[#060520]"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-500">y%</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={h.y}
                    onChange={(e) => onUpdateHotspot(hi, { y: Number(e.target.value) })}
                    className="h-8 w-14 text-[#060520]"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-500">w%</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={h.width}
                    onChange={(e) => onUpdateHotspot(hi, { width: Number(e.target.value) })}
                    className="h-8 w-14 text-[#060520]"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-500">h%</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={h.height}
                    onChange={(e) => onUpdateHotspot(hi, { height: Number(e.target.value) })}
                    className="h-8 w-14 text-[#060520]"
                  />
                </div>
              </div>
              <select
                className="h-8 rounded-md border border-gray-300 bg-white text-[#060520] text-sm min-w-[140px]"
                value={h.target_step_id}
                onChange={(e) => onUpdateHotspot(hi, { target_step_id: e.target.value })}
              >
                {targetOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Hint (wrong click)"
                value={h.hint ?? ""}
                onChange={(e) => onUpdateHotspot(hi, { hint: e.target.value })}
                className="h-8 flex-1 min-w-[120px] text-[#060520] text-sm"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveHotspot(hi)} className="text-red-600 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
