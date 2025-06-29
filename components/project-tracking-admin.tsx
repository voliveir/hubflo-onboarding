"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Phone,
  FileText,
  Zap,
  Users,
  Slack,
  ExternalLink,
  Globe,
  Settings,
  Star,
} from "lucide-react"
import {
  updateProjectTracking,
  calculateProjectCompletion,
  getMasterIntegrations,
  getClientIntegrations,
  addIntegrationToClient,
  removeIntegrationFromClient,
  updateClientIntegration,
  type Client,
  type Integration,
  type ClientIntegration,
} from "@/lib/database"
import { ClientImplementationProgress } from "./client-implementation-progress"

interface ProjectTask {
  id: string
  client_id: string
  title: string
  description?: string
  is_completed: boolean
  sort_order: number
  created_at: string
}

interface ProjectTrackingAdminProps {
  client: Client
}

interface IntegrationWithSelection extends Integration {
  isSelected: boolean
  priority: number
  isFeatured: boolean
  clientIntegrationId?: string
}

export function ProjectTrackingAdmin({ client }: ProjectTrackingAdminProps) {
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({ title: "", description: "" })
  const [showAddForm, setShowAddForm] = useState(false)
  const [tracking, setTracking] = useState({
    calls_scheduled: client.calls_scheduled || 0,
    calls_completed: client.calls_completed || 0,
    forms_setup: client.forms_setup || 0,
    smartdocs_setup: client.smartdocs_setup || 0,
    zapier_integrations_setup: client.zapier_integrations_setup || 0,
    migration_completed: client.migration_completed || false,
    slack_access_granted: client.slack_access_granted || false,
  })

  // Integration management state
  const [masterIntegrations, setMasterIntegrations] = useState<Integration[]>([])
  const [clientIntegrations, setClientIntegrations] = useState<ClientIntegration[]>([])
  const [integrationsWithSelection, setIntegrationsWithSelection] = useState<IntegrationWithSelection[]>([])
  const [integrationsLoading, setIntegrationsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Create updated client object for progress component
  const [updatedClient, setUpdatedClient] = useState<Client>({
    ...client,
    ...tracking,
  })

  // Update the client object whenever tracking changes
  useEffect(() => {
    setUpdatedClient({
      ...client,
      ...tracking,
    })
  }, [client, tracking])

  useEffect(() => {
    if (client?.id) {
      fetchTasks()
      fetchIntegrations()
    }
  }, [client?.id])

  const fetchTasks = async () => {
    if (!client?.id) {
      console.error("No client ID provided")
      setLoading(false)
      return
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(client.id)) {
      console.error("Invalid UUID format for client ID:", client.id)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Check if the table exists first
      const { data: tableCheck, error: tableError } = await supabase.from("client_project_tasks").select("id").limit(1)

      if (tableError && tableError.code === "42P01") {
        // Table doesn't exist, show message
        console.log("client_project_tasks table doesn't exist yet")
        setTasks([])
        return
      }

      const { data, error } = await supabase
        .from("client_project_tasks")
        .select("*")
        .eq("client_id", client.id)
        .order("sort_order")

      if (error) {
        if (error.code === "42P01") {
          // Table doesn't exist
          console.log("client_project_tasks table doesn't exist")
          setTasks([])
          return
        }
        throw error
      }

      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to load tasks. Please run the database migration script.")
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchIntegrations = async () => {
    if (!client?.id) return

    setIntegrationsLoading(true)
    try {
      const [masterData, clientData] = await Promise.all([getMasterIntegrations(), getClientIntegrations(client.id)])

      setMasterIntegrations(masterData)
      setClientIntegrations(clientData)

      // Create combined data with selection status
      const combined = masterData.map((integration) => {
        const clientIntegration = clientData.find((ci) => ci.integration_id === integration.id)
        return {
          ...integration,
          isSelected: !!clientIntegration,
          priority: clientIntegration?.sort_order || 1,
          isFeatured: clientIntegration?.is_featured || false,
          clientIntegrationId: clientIntegration?.id,
        }
      })

      setIntegrationsWithSelection(combined)
    } catch (error) {
      console.error("Error fetching integrations:", error)
      toast.error("Failed to load integrations")
    } finally {
      setIntegrationsLoading(false)
    }
  }

  const handleIntegrationToggle = async (integrationId: string, isSelected: boolean) => {
    if (!client?.id) return

    try {
      if (isSelected) {
        // Add integration to client
        const integration = integrationsWithSelection.find((i) => i.id === integrationId)
        if (!integration) return

        await addIntegrationToClient(client.id, integrationId, {
          is_featured: integration.isFeatured,
          sort_order: integration.priority,
          is_enabled: true,
        })
      } else {
        // Remove integration from client
        const integration = integrationsWithSelection.find((i) => i.id === integrationId)
        if (!integration?.clientIntegrationId) return

        await removeIntegrationFromClient(integration.clientIntegrationId)
      }

      // Refresh integrations
      await fetchIntegrations()
      toast.success(isSelected ? "Integration added" : "Integration removed")
    } catch (error) {
      console.error("Error toggling integration:", error)
      toast.error("Failed to update integration")
    }
  }

  const handlePriorityChange = async (integrationId: string, priority: number) => {
    if (!client?.id) return

    try {
      const integration = integrationsWithSelection.find((i) => i.id === integrationId)
      if (!integration?.clientIntegrationId) return

      await updateClientIntegration(integration.clientIntegrationId, {
        sort_order: priority,
      })

      // Update local state
      setIntegrationsWithSelection((prev) => prev.map((i) => (i.id === integrationId ? { ...i, priority } : i)))

      toast.success("Priority updated")
    } catch (error) {
      console.error("Error updating priority:", error)
      toast.error("Failed to update priority")
    }
  }

  const handleFeaturedToggle = async (integrationId: string, isFeatured: boolean) => {
    if (!client?.id) return

    try {
      const integration = integrationsWithSelection.find((i) => i.id === integrationId)
      if (!integration?.clientIntegrationId) return

      await updateClientIntegration(integration.clientIntegrationId, {
        is_featured: isFeatured,
      })

      // Update local state
      setIntegrationsWithSelection((prev) => prev.map((i) => (i.id === integrationId ? { ...i, isFeatured } : i)))

      toast.success(isFeatured ? "Marked as featured" : "Removed from featured")
    } catch (error) {
      console.error("Error updating featured status:", error)
      toast.error("Failed to update featured status")
    }
  }

  const addTask = async () => {
    if (!newTask.title.trim() || !client?.id) return

    try {
      const maxSortOrder = Math.max(...tasks.map((t) => t.sort_order), 0)
      const { data, error } = await supabase
        .from("client_project_tasks")
        .insert({
          client_id: client.id,
          title: newTask.title,
          description: newTask.description,
          sort_order: maxSortOrder + 1,
          is_completed: false,
        })
        .select()
        .single()

      if (error) throw error

      setTasks([...tasks, data])
      setNewTask({ title: "", description: "" })
      setShowAddForm(false)
      toast.success("Task added successfully")
    } catch (error) {
      console.error("Error adding task:", error)
      toast.error("Failed to add task")
    }
  }

  const updateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    try {
      const { error } = await supabase.from("client_project_tasks").update(updates).eq("id", taskId)

      if (error) throw error

      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)))
      toast.success("Task updated successfully")
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("client_project_tasks").delete().eq("id", taskId)

      if (error) throw error

      setTasks(tasks.filter((task) => task.id !== taskId))
      toast.success("Task deleted successfully")
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
    }
  }

  const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    await updateTask(taskId, { is_completed: isCompleted })
  }

  const handleSaveTracking = async () => {
    if (!client?.id) {
      toast.error("No client ID available")
      return
    }

    setLoading(true)
    try {
      await updateProjectTracking(client.id, tracking)
      await calculateProjectCompletion(client.id)
      toast.success("Project tracking updated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update tracking")
    } finally {
      setLoading(false)
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "zapier":
        return <Zap className="h-4 w-4 text-orange-500" />
      case "native":
        return <Globe className="h-4 w-4 text-blue-500" />
      case "api":
        return <Settings className="h-4 w-4 text-green-500" />
      default:
        return <ExternalLink className="h-4 w-4 text-gray-500" />
    }
  }

  const getIntegrationBadge = (type: string) => {
    switch (type) {
      case "zapier":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
            ZAPIER
          </Badge>
        )
      case "native":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
            NATIVE
          </Badge>
        )
      case "api":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            API
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
            INTEGRATION
          </Badge>
        )
    }
  }

  const categories = ["all", ...Array.from(new Set(masterIntegrations.map((i) => i.category)))]
  const filteredIntegrations =
    selectedCategory === "all"
      ? integrationsWithSelection
      : integrationsWithSelection.filter((i) => i.category === selectedCategory)

  const selectedIntegrationsCount = integrationsWithSelection.filter((i) => i.isSelected).length

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No client data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview - Now driven by Implementation Manager data */}
      <ClientImplementationProgress client={updatedClient} />

      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracking">Implementation Tracking</TabsTrigger>
          <TabsTrigger value="integrations">
            Integration Management
            {selectedIntegrationsCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {selectedIntegrationsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks">Project Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          {/* Implementation Manager Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">IM</span>
                </div>
                <span>Implementation Manager Tracking</span>
              </CardTitle>
              <CardDescription>Track progress for {client.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Calls Tracking */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold">Zoom Calls</h4>
                    <Badge variant="outline">Unlimited</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calls_scheduled">Scheduled</Label>
                      <Input
                        id="calls_scheduled"
                        type="number"
                        min="0"
                        value={tracking.calls_scheduled}
                        onChange={(e) =>
                          setTracking({ ...tracking, calls_scheduled: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="calls_completed">Completed</Label>
                      <Input
                        id="calls_completed"
                        type="number"
                        min="0"
                        max={tracking.calls_scheduled}
                        value={tracking.calls_completed}
                        onChange={(e) =>
                          setTracking({ ...tracking, calls_completed: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <Progress
                    value={
                      tracking.calls_scheduled > 0 ? (tracking.calls_completed / tracking.calls_scheduled) * 100 : 0
                    }
                    className="h-2"
                  />
                </div>

                {/* Forms & SmartDocs */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold">Forms & SmartDocs</h4>
                    <Badge variant="outline">Unlimited</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="forms_setup">Forms Setup</Label>
                      <Input
                        id="forms_setup"
                        type="number"
                        min="0"
                        value={tracking.forms_setup}
                        onChange={(e) =>
                          setTracking({ ...tracking, forms_setup: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="smartdocs_setup">SmartDocs Setup</Label>
                      <Input
                        id="smartdocs_setup"
                        type="number"
                        min="0"
                        value={tracking.smartdocs_setup}
                        onChange={(e) =>
                          setTracking({ ...tracking, smartdocs_setup: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <Progress value={((tracking.forms_setup + tracking.smartdocs_setup) / 2) * 100} className="h-2" />
                </div>

                {/* Zapier Integrations */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold">Zapier Integrations</h4>
                    <Badge variant="outline">Unlimited</Badge>
                  </div>
                  <div>
                    <Label htmlFor="zapier_integrations_setup">Integrations Setup</Label>
                    <Input
                      id="zapier_integrations_setup"
                      type="number"
                      min="0"
                      value={tracking.zapier_integrations_setup}
                      onChange={(e) =>
                        setTracking({ ...tracking, zapier_integrations_setup: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                {/* Elite Package Features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold">Elite Features</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="migration_completed">Migration Completed</Label>
                      <Switch
                        id="migration_completed"
                        checked={tracking.migration_completed}
                        onCheckedChange={(checked) => setTracking({ ...tracking, migration_completed: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slack_access_granted" className="flex items-center space-x-2">
                        <Slack className="h-4 w-4" />
                        <span>Slack Access Granted</span>
                      </Label>
                      <Switch
                        id="slack_access_granted"
                        checked={tracking.slack_access_granted}
                        onCheckedChange={(checked) => setTracking({ ...tracking, slack_access_granted: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveTracking} disabled={loading} className="w-full">
                {loading ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Progress
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Integration Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span>Integration Management</span>
                </div>
                <Badge variant="outline">{selectedIntegrationsCount} Selected</Badge>
              </CardTitle>
              <CardDescription>
                Customize which integrations appear on {client.name}'s onboarding page. Select integrations and assign
                priority levels (1-3) to control display order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="category-filter">Filter by Category:</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Integration Selection */}
              {integrationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading integrations...</p>
                </div>
              ) : filteredIntegrations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No integrations available in this category.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIntegrations.map((integration) => (
                    <div key={integration.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Checkbox
                            checked={integration.isSelected}
                            onCheckedChange={(checked) => handleIntegrationToggle(integration.id, checked as boolean)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              {getIntegrationIcon(integration.integration_type)}
                              <h4 className="font-medium text-sm break-words">{integration.title}</h4>
                              {getIntegrationBadge(integration.integration_type)}
                              {integration.isFeatured && (
                                <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{integration.description}</p>
                            <Badge variant="outline" className="text-xs">
                              {integration.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Priority and Featured Controls - Only show if selected */}
                      {integration.isSelected && (
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`priority-${integration.id}`} className="text-sm">
                                Priority:
                              </Label>
                              <Select
                                value={integration.priority.toString()}
                                onValueChange={(value) => handlePriorityChange(integration.id, Number.parseInt(value))}
                              >
                                <SelectTrigger className="w-20 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1</SelectItem>
                                  <SelectItem value="2">2</SelectItem>
                                  <SelectItem value="3">3</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`featured-${integration.id}`}
                                checked={integration.isFeatured}
                                onCheckedChange={(checked) => handleFeaturedToggle(integration.id, checked as boolean)}
                              />
                              <Label htmlFor={`featured-${integration.id}`} className="text-sm">
                                Featured
                              </Label>
                            </div>
                          </div>
                          {integration.external_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={integration.external_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Preview
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {selectedIntegrationsCount > 0 && (
                <div className="border-t pt-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Selection Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Total Selected:</span>
                        <span className="font-medium ml-2">{selectedIntegrationsCount}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Featured:</span>
                        <span className="font-medium ml-2">
                          {integrationsWithSelection.filter((i) => i.isSelected && i.isFeatured).length}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      These integrations will appear on {client.name}'s onboarding page. Featured integrations will be
                      highlighted at the top.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          {/* Project Tasks Management */}
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
              <CardDescription>Manage custom onboarding tasks for this client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Task Form */}
              {showAddForm && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="new-title">Task Title</Label>
                      <Input
                        id="new-title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Enter task title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-description">Description (Optional)</Label>
                      <Textarea
                        id="new-description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Enter task description"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addTask} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Save Task
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false)
                          setNewTask({ title: "", description: "" })
                        }}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Task Button */}
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Button>
              )}

              {/* Tasks List */}
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading tasks...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">No tasks created yet.</p>
                    <p className="text-sm text-gray-400">
                      {showAddForm
                        ? "Fill out the form above to add your first task."
                        : "Click 'Add New Task' to get started."}
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              checked={task.is_completed}
                              onChange={(e) => toggleTaskCompletion(task.id, e.target.checked)}
                              className="rounded"
                            />
                            <h4 className={`font-medium ${task.is_completed ? "line-through text-gray-500" : ""}`}>
                              {task.title}
                            </h4>
                            <Badge variant={task.is_completed ? "default" : "secondary"}>
                              {task.is_completed ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                          {task.description && <p className="text-sm text-gray-600 ml-6">{task.description}</p>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingTask(task.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Summary */}
              {tasks.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress:</span>
                    <span>
                      {tasks.filter((t) => t.is_completed).length} of {tasks.length} tasks completed
                    </span>
                  </div>
                  <Progress
                    value={tasks.length > 0 ? (tasks.filter((t) => t.is_completed).length / tasks.length) * 100 : 0}
                    className="h-2 mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
