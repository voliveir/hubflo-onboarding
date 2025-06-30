"use client"
import dynamic from "next/dynamic"
import React from "react"
import type { WorkflowBuilderProps } from "./WorkflowBuilder"

interface Props {
  enabled: boolean
  clientId: string
}

const WorkflowBuilder = dynamic<WorkflowBuilderProps>(
  () => import("./WorkflowBuilder").then(mod => mod.WorkflowBuilder),
  { ssr: false }
)

export function ClientWorkflowBuilderWrapper({ enabled, clientId }: Props) {
  if (!enabled) return null
  return <WorkflowBuilder clientId={clientId} />
} 