"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { WorkflowBuilder } from "@/components/WorkflowBuilder"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { format } from "date-fns"
import { Dialog } from "@/components/ui/dialog"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

export default function AdminWorkflowTemplatesManager() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [workflow, setWorkflow] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [latestNodes, setLatestNodes] = useState<any[]>([])
  const [latestEdges, setLatestEdges] = useState<any[]>([])

  // Fetch templates
  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from("workflow_templates")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) setError("Failed to load templates.")
    setTemplates(data || [])
    setLoading(false)
  }

  // Save as new template or update existing
  async function saveTemplate() {
    setSaving(true)
    setMessage(null)
    if (!name.trim()) {
      setMessage("Template name is required.")
      setSaving(false)
      return
    }
    const payload = {
      name: name.trim(),
      description: description.trim(),
      template_json: workflow,
      is_global: true,
    }
    let result
    if (selectedTemplate) {
      result = await supabase
        .from("workflow_templates")
        .update(payload)
        .eq("id", selectedTemplate.id)
    } else {
      result = await supabase
        .from("workflow_templates")
        .insert([payload])
    }
    if (result.error) {
      setMessage("Failed to save template.")
    } else {
      setMessage(selectedTemplate ? "Template updated!" : "Template saved!")
      setSelectedTemplate(null)
      setName("")
      setDescription("")
      setWorkflow({ nodes: [], edges: [] })
      fetchTemplates()
    }
    setSaving(false)
  }

  // Load a template into the builder
  function loadTemplate(template: any) {
    let wf = template.template_json
    if (typeof wf === "string") {
      try { wf = JSON.parse(wf) } catch {}
    }
    setSelectedTemplate(template)
    setName(template.name)
    setDescription(template.description || "")
    setWorkflow(wf && wf.nodes && wf.edges ? wf : { nodes: [], edges: [] })
    setLatestNodes(wf && wf.nodes ? wf.nodes : [])
    setLatestEdges(wf && wf.edges ? wf.edges : [])
    setMessage(null)
    console.log("Loaded template:", wf)
  }

  // Start a new template
  function newTemplate() {
    setSelectedTemplate(null)
    setName("")
    setDescription("")
    setWorkflow({ nodes: [], edges: [] })
    setLatestNodes([])
    setLatestEdges([])
    setMessage(null)
  }

  // Delete template
  async function deleteTemplate(id: string) {
    await supabase.from("workflow_templates").delete().eq("id", id)
    if (selectedTemplate && selectedTemplate.id === id) {
      newTemplate()
    }
    fetchTemplates()
  }

  // Handler for builder's Save as Template button
  function handleSaveTemplate(nodes: any[], edges: any[]) {
    setWorkflow({ nodes, edges })
    setLatestNodes(nodes)
    setLatestEdges(edges)
    setShowSaveModal(true)
  }

  // Handler for builder's Load Template button
  function handleLoadTemplate() {
    setShowLoadModal(true)
  }

  // Save template from modal
  async function saveTemplateFromModal() {
    setSaving(true)
    setMessage(null)
    if (!name.trim()) {
      setMessage("Template name is required.")
      setSaving(false)
      return
    }
    // Always use the latest nodes/edges from the builder
    const payload = {
      name: name.trim(),
      description: description.trim(),
      template_json: {
        nodes: latestNodes,
        edges: latestEdges,
      },
      is_global: true,
    }
    console.log("Saving template with nodes:", latestNodes, "and edges:", latestEdges)
    let result
    if (selectedTemplate) {
      result = await supabase
        .from("workflow_templates")
        .update(payload)
        .eq("id", selectedTemplate.id)
    } else {
      result = await supabase
        .from("workflow_templates")
        .insert([payload])
    }
    if (result.error) {
      setMessage("Failed to save template.")
    } else {
      setMessage(selectedTemplate ? "Template updated!" : "Template saved!")
      setSelectedTemplate(null)
      setName("")
      setDescription("")
      setWorkflow({ nodes: [], edges: [] })
      setLatestNodes([])
      setLatestEdges([])
      fetchTemplates()
      setShowSaveModal(false)
    }
    setSaving(false)
  }

  // Load template from modal
  function loadTemplateFromModal(template: any) {
    let wf = template.template_json
    if (typeof wf === "string") {
      try { wf = JSON.parse(wf) } catch {}
    }
    setSelectedTemplate(template)
    setName(template.name)
    setDescription(template.description || "")
    setWorkflow(wf && wf.nodes && wf.edges ? wf : { nodes: [], edges: [] })
    setLatestNodes(wf && wf.nodes ? wf.nodes : [])
    setLatestEdges(wf && wf.edges ? wf.edges : [])
    setMessage(null)
    setShowLoadModal(false)
    console.log("Loaded template:", wf)
  }

  // Memoize nodes and edges to prevent infinite update loops in WorkflowBuilder
  const memoizedNodes = useMemo(() => workflow.nodes, [workflow.nodes])
  const memoizedEdges = useMemo(() => workflow.edges, [workflow.edges])

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-4xl mx-auto mt-8 p-8">
        <Button className="mb-4" onClick={newTemplate} variant="secondary">New Template</Button>
        <WorkflowBuilder
          clientId={"template"}
          initialNodes={memoizedNodes}
          initialEdges={memoizedEdges}
          onChange={(nodes: any[], edges: any[]) => {
            setWorkflow({ nodes, edges })
            setLatestNodes(nodes)
            setLatestEdges(edges)
          }}
          isTemplateMode={true}
          onSaveTemplate={handleSaveTemplate}
          onLoadTemplate={handleLoadTemplate}
        />
        {message && <div className="mb-4 text-center text-lg font-medium text-green-700">{message}</div>}
      </div>
      {/* Save Template Modal */}
      {showSaveModal && (
        <Dialog open={true} onOpenChange={open => { if (!open) setShowSaveModal(false) }}>
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Save as Template</h3>
              <Input
                placeholder="Template Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mb-4"
              />
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="mb-4"
              />
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowSaveModal(false)}>Cancel</Button>
                <Button onClick={saveTemplateFromModal} disabled={!name.trim() || saving}>{saving ? "Saving..." : "Save Template"}</Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
      {/* Load Template Modal */}
      {showLoadModal && (
        <Dialog open={true} onOpenChange={open => { if (!open) setShowLoadModal(false) }}>
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Load Template</h3>
              <select
                className="w-full border rounded px-3 py-2 mb-4"
                value={selectedTemplate?.id || ""}
                onChange={e => {
                  const t = templates.find(t => t.id === e.target.value)
                  if (t) loadTemplateFromModal(t)
                }}
              >
                <option value="">Select a template...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowLoadModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
      {/* Template List (optional, for management) */}
      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-xl font-bold mb-4">Saved Templates</h2>
        {loading ? (
          <div className="text-gray-500">Loading templates...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : templates.length === 0 ? (
          <div className="text-gray-400">No templates found.</div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <div className="font-semibold text-lg">{t.name}</div>
                  <div className="text-gray-500 text-sm">{t.description}</div>
                  <div className="text-xs text-gray-400 mt-1">Created {format(new Date(t.created_at), "PPP p")}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => loadTemplateFromModal(t)}>Load</Button>
                  <Button variant="destructive" onClick={() => deleteTemplate(t.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 