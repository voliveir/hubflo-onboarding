"use client"
import dynamic from "next/dynamic"
import React, { useEffect, useState } from "react"
import type { WorkflowBuilderProps } from "./WorkflowBuilder"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  enabled: boolean
  clientId: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

const WorkflowBuilder = dynamic<WorkflowBuilderProps>(
  () => import("./WorkflowBuilder").then(mod => mod.WorkflowBuilder),
  { ssr: false }
)

export function ClientWorkflowBuilderWrapper({ enabled, clientId }: Props) {
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [initialNodes, setInitialNodes] = useState<any[]>([])
  const [initialEdges, setInitialEdges] = useState<any[]>([])

  useEffect(() => {
    if (!enabled) return
    async function fetchTemplates() {
      const { data, error } = await supabase
        .from("workflow_templates")
        .select("*")
        .eq("is_global", true)
        .order("created_at", { ascending: false })
      console.log("Fetched templates:", data, "Error:", error)
      if (!error && data) setTemplates(data)
    }
    fetchTemplates()
  }, [enabled])

  const handleLoadTemplate = () => setShowLoadModal(true)

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplateId(e.target.value)
  }

  const handleLoadTemplateConfirm = () => {
    const template = templates.find(t => t.id === selectedTemplateId)
    if (template) {
      let wf = template.template_json
      if (typeof wf === "string") {
        try { wf = JSON.parse(wf) } catch {}
      }
      setInitialNodes(wf && wf.nodes ? wf.nodes : [])
      setInitialEdges(wf && wf.edges ? wf.edges : [])
    }
    setShowLoadModal(false)
  }

  if (!enabled) return null

  // Debug: log templates before rendering
  console.log("Templates before rendering dropdown:", templates, Array.isArray(templates));

  return (
    <div>
      <WorkflowBuilder
        clientId={clientId}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        showSaveAsTemplate={false}
      />
      {showLoadModal && (
        <Dialog open={true} onOpenChange={open => { if (!open) setShowLoadModal(false) }}>
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Load Template</h3>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 && (
                    <SelectItem value="" disabled>No templates available</SelectItem>
                  )}
                  {templates.map(t => (
                    <SelectItem key={String(t.id)} value={String(t.id)}>{t.name || t.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowLoadModal(false)}>Cancel</Button>
                <Button onClick={handleLoadTemplateConfirm} disabled={!selectedTemplateId}>Load</Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
} 