"use client"
import dynamic from "next/dynamic"
import React, { useEffect, useState } from "react"
import type { WorkflowBuilderProps } from "./WorkflowBuilder"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { useReveal } from "@/hooks/useReveal"
import { cn } from "@/lib/utils"
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
  const { ref, isVisible } = useReveal()
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
    <div ref={ref} className={cn("", isVisible && "animate-fade-in-up")}>
      <WorkflowBuilder
        clientId={clientId}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        showSaveAsTemplate={false}
      />
      {showLoadModal && (
        <Dialog open={true} onOpenChange={open => { if (!open) setShowLoadModal(false) }}>
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-white">Load Template</h3>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="w-full mb-4 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20">
                  {templates.length === 0 && (
                    <SelectItem value="" disabled className="text-white/60">No templates available</SelectItem>
                  )}
                  {templates.map(t => (
                    <SelectItem key={String(t.id)} value={String(t.id)} className="text-white hover:bg-white/10">{t.name || t.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowLoadModal(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleLoadTemplateConfirm} 
                  disabled={!selectedTemplateId}
                  className="bg-brand-gold hover:bg-brand-gold/90 text-brand-DEFAULT transition-all duration-200 hover:scale-105"
                >
                  Load
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
} 