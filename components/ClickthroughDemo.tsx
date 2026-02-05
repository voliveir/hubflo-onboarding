"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MousePointerClick, ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { ClickthroughDemoStep, ClickthroughDemoContentData } from "@/lib/types"

interface ClickthroughDemoProps {
  contentData: ClickthroughDemoContentData
  onComplete: () => void
}

export function ClickthroughDemo({ contentData, onComplete }: ClickthroughDemoProps) {
  const steps = contentData?.steps ?? []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [finished, setFinished] = useState(false)

  if (steps.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center text-amber-800">
        <p className="font-medium">No steps configured for this demo.</p>
        <p className="mt-2 text-sm">Add steps and hotspots in the University admin.</p>
      </div>
    )
  }

  const step = steps[currentIndex]
  const progressPercent = ((currentIndex + (finished ? 1 : 0)) / steps.length) * 100

  const handleHotspotClick = (targetStepId: string) => {
    if (targetStepId === "complete") {
      // Only finish when we're actually on the last step
      if (currentIndex >= steps.length - 1) {
        setFinished(true)
        onComplete()
        return
      }
      // If there are more steps, go to the next one (in case hotspot was set to "complete" by mistake)
      setCurrentIndex((i) => Math.min(i + 1, steps.length - 1))
      return
    }
    const nextIndex = steps.findIndex((s) => s.id === targetStepId)
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex)
    }
  }

  const handleWrongClick = (hint?: string) => {
    toast({
      title: "Try again",
      description: hint ?? "Click the highlighted area to continue.",
      variant: "default",
    })
  }

  const goToNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      setFinished(true)
      onComplete()
    }
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border-2 border-green-200 bg-green-50/80 p-8 sm:p-12 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-green-900 mb-2">You’re all set!</h3>
        <p className="text-green-800">You’ve completed this interactive demo.</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">Step {currentIndex + 1} of {steps.length}</span>
          <span className="text-brand-gold font-medium">Click the screen to continue</span>
        </div>
        <Progress value={progressPercent} className="h-2 rounded-full" />
      </div>

      {/* Step title & description */}
      {(step.title || step.description) && (
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
          {step.title && (
            <h4 className="font-semibold text-[#060520] flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-brand-gold" />
              {step.title}
            </h4>
          )}
          {step.description && (
            <p className="text-gray-600 text-sm mt-1">{step.description}</p>
          )}
        </div>
      )}

      {/* Image with hotspots - overlay is exactly over the image so % coords match */}
      <div className="flex justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-lg p-2 sm:p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative inline-block max-w-full"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("button")) return
              const firstHint = step.hotspots?.[0]?.hint
              handleWrongClick(firstHint)
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={step.image_url}
              alt={step.title ?? `Step ${currentIndex + 1}`}
              className="block max-h-[70vh] w-auto rounded-lg shadow-inner select-none"
              draggable={false}
              style={{ pointerEvents: "none" }}
            />
            {/* Hotspot overlay - same size as image; visible outline so clients see where to click */}
            <div className="absolute inset-0 rounded-lg cursor-default">
              {step.hotspots?.map((hotspot, i) => (
                <button
                  key={i}
                  type="button"
                  className="absolute cursor-pointer rounded border-2 border-dashed border-brand-gold bg-brand-gold/20 transition-all duration-200 hover:bg-brand-gold/35 hover:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-1 focus:ring-offset-white"
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                    width: `${hotspot.width}%`,
                    height: `${hotspot.height}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleHotspotClick(hotspot.target_step_id)
                  }}
                  aria-label={hotspot.hint ?? "Continue to next step"}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Skip / Next (accessibility fallback) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
          Click the correct area on the screen above, or use the button below.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToNext}
          className="rounded-xl border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10"
        >
          {currentIndex < steps.length - 1 ? (
            <>
              Skip to next step
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              Finish demo
              <CheckCircle className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
