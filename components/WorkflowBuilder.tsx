"use client"

import React, { useCallback, useEffect, useState } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  NodeTypes,
} from "reactflow"
import "reactflow/dist/style.css"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export interface WorkflowBuilderProps {
  clientId: string
}

const nodeTypes: NodeTypes = {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

const typeColors: Record<string, string> = {
  task: "#FBC02D",      // yellow
  approval: "#43A047",  // green
  meeting: "#1976D2",   // blue
  form: "#8E24AA",      // purple
  doc: "#F4511E",       // orange
  default: "#BDBDBD",   // gray
}

export function WorkflowBuilder({ clientId }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [userInitiatedEdit, setUserInitiatedEdit] = useState(false)

  // Fetch workflow on mount
  useEffect(() => {
    async function fetchWorkflow() {
      setLoading(true)
      setMessage(null)
      const { data, error } = await supabase
        .from("clients")
        .select("workflow")
        .eq("id", clientId)
        .single()
      if (error) {
        setMessage("Failed to load workflow.")
        setLoading(false)
        return
      }
      const workflow = data?.workflow || { nodes: [], edges: [] }
      setNodes(workflow.nodes || [])
      setEdges(workflow.edges || [])
      setEditingNode(null)
      setEditData(null)
      setUserInitiatedEdit(false)
      setLoading(false)
      console.log("After loading workflow, editingNode:", editingNode)
    }
    fetchWorkflow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Add node button (adds a new node at a random position)
  const addNode = () => {
    const id = (nodes.length + 1).toString()
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "default",
        position: { x: Math.random() * 400 + 50, y: Math.random() * 200 + 50 },
        data: {
          label: `New Step ${id}`,
          type: "task",
          description: "",
          link: "",
        },
      },
    ])
  }

  // Save workflow to backend
  const saveWorkflow = async () => {
    setSaving(true)
    setMessage(null)
    const { error } = await supabase
      .from("clients")
      .update({ workflow: { nodes, edges } })
      .eq("id", clientId)
    if (error) {
      setMessage("Failed to save workflow.")
    } else {
      setMessage("Workflow saved!")
    }
    setSaving(false)
  }

  // Node click handler
  const onNodeClick = (_: any, node: Node) => {
    console.log("Node clicked:", node)
    setEditingNode(node)
    setEditData({ ...node.data })
    setUserInitiatedEdit(true)
  }

  // Save node edits
  const saveNodeEdit = () => {
    if (!editingNode) return
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNode.id
          ? { ...n, data: { ...editData } }
          : n
      )
    )
    setEditingNode(null)
    setEditData(null)
  }

  // Color code nodes by type
  const coloredNodes = nodes.map((node) => ({
    ...node,
    style: {
      ...node.style,
      background: typeColors[node.data?.type] || typeColors.default,
      color: "#fff",
      border: "2px solid #222",
      fontWeight: 600,
    },
  }))

  return (
    <section className="py-16 px-4 bg-transparent">
      <div className="container mx-auto flex flex-col items-center">
        <div className="w-full max-w-7xl">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-visible">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#ECB22D]/30 to-[#FFFBEA] rounded-t-2xl">
              <h2 className="text-2xl font-bold text-[#010124]">Workflow Builder</h2>
              <div className="flex gap-2">
                <button
                  onClick={addNode}
                  className="bg-[#ECB22D] hover:bg-[#d4a029] text-[#010124] font-semibold px-5 py-2 rounded shadow border border-[#ECB22D] transition"
                  disabled={loading || saving}
                >
                  + Add Step
                </button>
                <button
                  onClick={saveWorkflow}
                  className="bg-[#010124] hover:bg-[#22223b] text-[#ECB22D] font-semibold px-5 py-2 rounded shadow border border-[#010124] transition"
                  disabled={loading || saving}
                >
                  {saving ? "Saving..." : "Save Workflow"}
                </button>
              </div>
            </div>
            <div className="px-8 pt-6 pb-8">
              <p className="text-gray-600 text-lg mb-4 text-center">
                Collaboratively design your onboarding and service workflows here.
              </p>
              {message && <div className="mb-4 text-center text-lg font-medium text-green-700">{message}</div>}
              <div style={{ height: 500, width: '100%', maxWidth: 1200, margin: '0 auto', background: "#f9fafb", borderRadius: 12 }} className="overflow-hidden">
                <ReactFlow
                  nodes={coloredNodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                  onNodeClick={onNodeClick}
                  defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                >
                  <MiniMap />
                  <Controls />
                  <Background gap={16} size={1} />
                </ReactFlow>
              </div>
              {loading && <div className="mt-4 text-gray-500">Loading workflow...</div>}
            </div>
          </div>
        </div>
        {/* Node Edit Modal */}
        {editingNode && typeof editingNode.id === 'string' && editingNode.id.length > 0 && userInitiatedEdit && (
          <Dialog open={true} onOpenChange={(open) => { if (!open) { setEditingNode(null); setUserInitiatedEdit(false); } }}>
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Edit Step</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Label/Title</label>
                    <Input
                      value={editData?.label || ""}
                      onChange={e => setEditData((d: any) => ({ ...d, label: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={editData?.type || "task"}
                      onChange={e => setEditData((d: any) => ({ ...d, type: e.target.value }))}
                    >
                      <option value="task">Task</option>
                      <option value="approval">Approval</option>
                      <option value="meeting">Meeting</option>
                      <option value="form">Form</option>
                      <option value="doc">Doc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description/Notes</label>
                    <Textarea
                      value={editData?.description || ""}
                      onChange={e => setEditData((d: any) => ({ ...d, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link</label>
                    <Input
                      value={editData?.link || ""}
                      onChange={e => setEditData((d: any) => ({ ...d, link: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => { setEditingNode(null); setUserInitiatedEdit(false); }}>Cancel</Button>
                  <Button onClick={saveNodeEdit}>Save</Button>
                </div>
              </div>
            </div>
          </Dialog>
        )}
      </div>
    </section>
  )
} 