"use client"
import dynamic from "next/dynamic"
import React from "react"
import type { WorkflowBuilderProps } from "./WorkflowBuilder"
import { useReveal } from "@/hooks/useReveal"
import { cn } from "@/lib/utils"

interface Props {
  enabled: boolean
  clientId: string
}

const WorkflowBuilder = dynamic<WorkflowBuilderProps>(
  () => import("./WorkflowBuilder").then(mod => mod.WorkflowBuilder),
  { ssr: false }
)

export function ClientWorkflowBuilderWrapper({ enabled, clientId }: Props) {
  const { ref, isVisible } = useReveal()

  if (!enabled) return null

  return (
    <div ref={ref} className={cn("max-w-7xl mx-auto", isVisible && "animate-fade-in-up")}> 
      <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur rounded-2xl border border-brand-gold/40 px-8 py-6">
        <WorkflowBuilder
          clientId={clientId}
          showSaveAsTemplate={false}
        />
      </div>
    </div>
  )
} 