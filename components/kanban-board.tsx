"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  UserPlus,
  Phone,
  PhoneCall,
  PhoneIncoming,
  GraduationCap,
  Users,
  Package,
  Calendar,
  Clock,
  Edit,
  Move,
  Plus,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Settings,
  Puzzle,
  Calendar as CalendarIcon,
  Archive,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  getKanbanWorkflows,
  getAllClientsWithStages,
  moveClientToStage,
  createKanbanActivity,
  initializeKanbanSystem,
  updateClient,
  createClientFollowUp,
  getUpcomingClientFollowUps,
} from "@/lib/database"
import {
  type KanbanWorkflow,
  type ClientWithStage,
  type Client,
} from "@/lib/types"
import { Calendar as KanbanDatePicker } from "@/components/ui/calendar"
import { addDays, format } from "date-fns"

interface KanbanBoardProps {
  initialPackage?: "light" | "premium" | "gold" | "elite"
}

interface ClientCardProps {
  client: ClientWithStage
  workflow: KanbanWorkflow
  onMoveClient: (clientId: string, newStage: string) => void
  onViewClient: (client: ClientWithStage) => void
}

type StageKey =
  | "new"
  | "call"
  | "first_call"
  | "second_call"
  | "third_call"
  | "graduation"
  | "configurations"
  | "integrations"
  | "verification"

function getStageIcon(stageKey: StageKey | "archived") {
  switch (stageKey) {
    case "new":
      return <UserPlus className="h-4 w-4" />
    case "call":
    case "first_call":
      return <Phone className="h-4 w-4" />
    case "second_call":
      return <PhoneCall className="h-4 w-4" />
    case "third_call":
      return <PhoneIncoming className="h-4 w-4" />
    case "configurations":
      return <Settings className="h-4 w-4" />
    case "integrations":
      return <Puzzle className="h-4 w-4" />
    case "verification":
      return <CheckCircle className="h-4 w-4" />
    case "graduation":
      return <GraduationCap className="h-4 w-4" />
    case "archived":
      return <Archive className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

function ClientCard({ client, workflow, onMoveClient, onViewClient }: ClientCardProps) {
  const [isMoving, setIsMoving] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [selectedStage, setSelectedStage] = useState("")
  const [moveNotes, setMoveNotes] = useState("")

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case "light":
        return "bg-green-100 text-green-800"
      case "premium":
        return "bg-blue-100 text-blue-800"
      case "gold":
        return "bg-yellow-100 text-yellow-800"
      case "elite":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 50) return "text-orange-600"
    return "text-red-600"
  }

  const handleMove = async () => {
    if (!selectedStage) return

    setIsMoving(true)
    try {
      await onMoveClient(client.id, selectedStage)
      setShowMoveDialog(false)
      setSelectedStage("")
      setMoveNotes("")
      toast.success(`Moved ${client.name} to ${selectedStage}`)
    } catch (error) {
      console.error("Error moving client:", error)
      toast.error("Failed to move client")
    } finally {
      setIsMoving(false)
    }
  }

  const getDaysInStage = () => {
    if (!client.stage?.stage_started_at) return 0
    const startDate = new Date(client.stage.stage_started_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysInStage = getDaysInStage()
  const isStuck = daysInStage > 7

  const eliteStages = [
    { value: "new", label: "New Client" },
    { value: "configurations", label: "Configurations" },
    { value: "integrations", label: "Integrations" },
    { value: "verification", label: "Verification" },
    { value: "graduation", label: "Graduation" },
    { value: "archived", label: "Archived" },
  ]
  const defaultStages = [
    { value: "new", label: "New Client" },
    { value: "call", label: "Onboarding Call (Light)" },
    { value: "first_call", label: "1st Onboarding Call" },
    { value: "second_call", label: "2nd Onboarding Call" },
    { value: "third_call", label: "3rd Onboarding Call" },
    { value: "graduation", label: "Graduation" },
    { value: "archived", label: "Archived" },
  ]
  const stageOptions = client.success_package === "elite" ? eliteStages : defaultStages

  return (
    <>
      <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewClient(client)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{client.name}</h4>
              <p className="text-xs text-gray-500 truncate">{client.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowMoveDialog(true)
              }}
              className="ml-2"
            >
              <Move className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`text-xs ${getPackageColor(client.success_package)}`}>
                {client.success_package}
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>{client.number_of_users}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Progress: <span className={getProgressColor(client.project_completion_percentage)}>{client.project_completion_percentage}%</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{daysInStage}d</span>
              </div>
            </div>

            {isStuck && (
              <div className="flex items-center space-x-1 text-xs text-orange-600">
                <AlertCircle className="h-3 w-3" />
                <span>Stuck for {daysInStage} days</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Calls: {client.calls_completed}/{client.calls_scheduled}</span>
              <span>Created: {new Date(client.created_at).toLocaleDateString()}</span>
            </div>
            
            {/* Milestone dates based on package type */}
            {client.success_package === "light" && client.light_onboarding_call_date && (
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>Onboarding Call: {new Date(client.light_onboarding_call_date).toLocaleDateString()}</span>
              </div>
            )}
            
            {client.success_package === "premium" && (
              <>
                {client.premium_first_call_date && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>1st Call: {new Date(client.premium_first_call_date).toLocaleDateString()}</span>
                  </div>
                )}
                {client.premium_second_call_date && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>2nd Call: {new Date(client.premium_second_call_date).toLocaleDateString()}</span>
                  </div>
                )}
              </>
            )}
            
            {client.success_package === "gold" && (
              <>
                {client.gold_first_call_date && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>1st Call: {new Date(client.gold_first_call_date).toLocaleDateString()}</span>
                  </div>
                )}
                {client.gold_second_call_date && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>2nd Call: {new Date(client.gold_second_call_date).toLocaleDateString()}</span>
                  </div>
                )}
                {client.gold_third_call_date && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>3rd Call: {new Date(client.gold_third_call_date).toLocaleDateString()}</span>
                  </div>
                )}
              </>
            )}
            
            {client.success_package === "elite" && (
              <>
                {client.elite_configurations_started_date && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>Config Started: {new Date(client.elite_configurations_started_date).toLocaleDateString()}</span>
                  </div>
                )}
                {client.elite_integrations_started_date && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>Integrations Started: {new Date(client.elite_integrations_started_date).toLocaleDateString()}</span>
                  </div>
                )}
                {client.elite_verification_completed_date && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>Verification: {new Date(client.elite_verification_completed_date).toLocaleDateString()}</span>
                  </div>
                )}
              </>
            )}
            
            {client.graduation_date && (
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>Graduated: {new Date(client.graduation_date).toLocaleDateString()}</span>
                {client.created_at && (
                  <span>
                    Time to Graduate: {
                      Math.max(1, Math.ceil((new Date(client.graduation_date).getTime() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)))
                    } days
                  </span>
                )}
              </div>
            )}
            {client.stage?.current_stage === "graduation" && (
              <div className="flex justify-end mt-2">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onMoveClient(client.id, "archived") }}>
                  <Archive className="h-4 w-4 mr-1" /> Archive
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move {client.name}</DialogTitle>
            <DialogDescription>Select the new stage for this client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="stage-select">New Stage</Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a stage" />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="move-notes">Notes (Optional)</Label>
              <Textarea
                id="move-notes"
                value={moveNotes}
                onChange={(e) => setMoveNotes(e.target.value)}
                placeholder="Add any notes about this move..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleMove} disabled={!selectedStage || isMoving}>
                {isMoving ? "Moving..." : "Move Client"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function KanbanColumn({ 
  title, 
  description, 
  clients, 
  workflow, 
  onMoveClient, 
  onViewClient,
  color = "#3B82F6" 
}: {
  title: string
  description: string
  clients: ClientWithStage[]
  workflow: KanbanWorkflow
  onMoveClient: (clientId: string, newStage: string) => void
  onViewClient: (client: ClientWithStage) => void
  color?: string
}) {
  return (
    <div className="flex-1 min-w-0">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
              <div style={{ color }}>{getStageIcon(workflow.stage_key as StageKey)}</div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {clients.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                workflow={workflow}
                onMoveClient={onMoveClient}
                onViewClient={onViewClient}
              />
            ))}
            {clients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">No clients in this stage</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function KanbanBoard({ initialPackage = "premium" }: KanbanBoardProps) {
  const [selectedPackage, setSelectedPackage] = useState(initialPackage)
  const [workflows, setWorkflows] = useState<KanbanWorkflow[]>([])
  const [clients, setClients] = useState<ClientWithStage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<ClientWithStage | null>(null)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [editingDate, setEditingDate] = useState(false)
  const [newCreatedAt, setNewCreatedAt] = useState<Date | null>(null)
  const [savingDate, setSavingDate] = useState(false)
  const [editingGraduationDate, setEditingGraduationDate] = useState(false)
  const [newGraduationDate, setNewGraduationDate] = useState<Date | null>(null)
  const [savingGraduationDate, setSavingGraduationDate] = useState(false)
  
  // Milestone date editing states
  const [editingMilestoneDate, setEditingMilestoneDate] = useState<string | null>(null)
  const [newMilestoneDate, setNewMilestoneDate] = useState<Date | null>(null)
  const [savingMilestoneDate, setSavingMilestoneDate] = useState(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [followUpDays, setFollowUpDays] = useState<number | "custom">(7)
  const [customFollowUpDate, setCustomFollowUpDate] = useState<Date | null>(null)
  const [followUpTitle, setFollowUpTitle] = useState("")
  const [followUpNotes, setFollowUpNotes] = useState("")
  const [creatingFollowUp, setCreatingFollowUp] = useState(false)

  const pathname = usePathname();

  useEffect(() => {
    fetchData()
  }, [selectedPackage])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Try to initialize kanban system if needed
      await initializeKanbanSystem()
      
      const [workflowsData, clientsData] = await Promise.all([
        getKanbanWorkflows(selectedPackage),
        getAllClientsWithStages(),
      ])
      setWorkflows(workflowsData)
      setClients(clientsData)
    } catch (error) {
      console.error("Error fetching kanban data:", error)
      toast.error("Failed to load kanban board")
    } finally {
      setLoading(false)
    }
  }

  const handleMoveClient = async (clientId: string, newStage: string) => {
    try {
      await moveClientToStage(clientId, newStage)
      await fetchData() // Refresh data
    } catch (error) {
      console.error("Error moving client:", error)
      throw error
    }
  }

  const handleViewClient = (client: ClientWithStage) => {
    setSelectedClient(client)
    setShowClientDialog(true)
  }

  const getClientsForStage = (stageKey: string) => {
    return clients.filter(
      (client) => 
        client.success_package === selectedPackage && 
        client.stage?.current_stage === stageKey
    )
  }

  const getPackageStats = () => {
    const packageClients = clients.filter(client => client.success_package === selectedPackage)
    const total = packageClients.length
    const graduated = packageClients.filter(client => client.stage?.current_stage === "graduation").length
    const inProgress = total - graduated
    const avgProgress = packageClients.length > 0 
      ? Math.round(packageClients.reduce((sum, c) => sum + c.project_completion_percentage, 0) / packageClients.length)
      : 0

    return { total, graduated, inProgress, avgProgress }
  }

  const stats = getPackageStats()

  const handleEditDate = () => {
    setEditingDate(true)
    setNewCreatedAt(selectedClient?.created_at ? new Date(selectedClient.created_at) : new Date())
  }

  const handleSaveDate = async () => {
    if (!selectedClient || !newCreatedAt) return
    setSavingDate(true)
    try {
      await updateClient(selectedClient.id, { created_at: newCreatedAt.toISOString() })
      setSelectedClient({ ...selectedClient, created_at: newCreatedAt.toISOString() })
      setEditingDate(false)
      toast.success("Created date updated!")
    } catch (error) {
      toast.error("Failed to update date")
    } finally {
      setSavingDate(false)
    }
  }

  const handleEditGraduationDate = () => {
    setEditingGraduationDate(true)
    setNewGraduationDate(selectedClient?.graduation_date ? new Date(selectedClient.graduation_date) : null)
  }

  const handleSaveGraduationDate = async () => {
    if (!selectedClient) return
    setSavingGraduationDate(true)
    try {
      await updateClient(selectedClient.id, { graduation_date: newGraduationDate ? newGraduationDate.toISOString().slice(0, 10) : null })
      setSelectedClient({ ...selectedClient, graduation_date: newGraduationDate ? newGraduationDate.toISOString().slice(0, 10) : null })
      setEditingGraduationDate(false)
      toast.success("Graduation date updated!")
    } catch (error) {
      toast.error("Failed to update graduation date")
    } finally {
      setSavingGraduationDate(false)
    }
  }

  const handleEditMilestoneDate = (milestoneKey: string) => {
    setEditingMilestoneDate(milestoneKey)
    const currentDate = (selectedClient as any)?.[milestoneKey] as string
    setNewMilestoneDate(currentDate ? new Date(currentDate) : null)
  }

  const handleSaveMilestoneDate = async () => {
    if (!selectedClient || !editingMilestoneDate) return
    setSavingMilestoneDate(true)
    try {
      const updateData: any = {}
      updateData[editingMilestoneDate] = newMilestoneDate ? newMilestoneDate.toISOString().slice(0, 10) : null
      
      await updateClient(selectedClient.id, updateData)
      setSelectedClient({ ...selectedClient, ...updateData })
      setEditingMilestoneDate(null)
      toast.success("Milestone date updated!")
    } catch (error) {
      toast.error("Failed to update milestone date")
    } finally {
      setSavingMilestoneDate(false)
    }
  }

  const getMilestoneDateField = (milestoneKey: string, label: string) => {
    const currentDate = (selectedClient as any)?.[milestoneKey] as string
    const isEditing = editingMilestoneDate === milestoneKey
    
    return (
      <div key={milestoneKey}>
        <Label>{label}</Label>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{currentDate ? new Date(currentDate).toLocaleDateString() : "-"}</span>
          <Button size="sm" variant="ghost" onClick={() => handleEditMilestoneDate(milestoneKey)}>
            <CalendarIcon className="h-4 w-4" /> Edit
          </Button>
        </div>
        {isEditing && (
          <div className="mt-2 space-y-2">
            <KanbanDatePicker
              mode="single"
              selected={newMilestoneDate || undefined}
              onSelect={(date) => setNewMilestoneDate(date ?? null)}
              initialFocus
            />
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => setEditingMilestoneDate(null)} disabled={savingMilestoneDate}>Cancel</Button>
              <Button size="sm" onClick={handleSaveMilestoneDate} disabled={savingMilestoneDate}>{savingMilestoneDate ? "Saving..." : "Save Date"}</Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab navigation for Kanban/Gantt */}
      <div className="mb-4">
        <div className="flex space-x-2 border-b border-gray-200">
          <Link href="/admin/kanban" legacyBehavior>
            <a className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${pathname === "/admin/kanban" ? "border-[#ECB22D] text-[#010124] bg-white" : "border-transparent text-gray-500 hover:text-[#010124]"}`}>Kanban Board</a>
          </Link>
          <Link href="/admin/kanban/gantt" legacyBehavior>
            <a className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${pathname === "/admin/kanban/gantt" ? "border-[#ECB22D] text-[#010124] bg-white" : "border-transparent text-gray-500 hover:text-[#010124]"}`}>Gantt Chart</a>
          </Link>
        </div>
      </div>
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-4">
                Kanban Board
              </CardTitle>
              <CardDescription>Track clients through their {selectedPackage} package workflow</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-gray-600">Total Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.graduated}</div>
                <div className="text-xs text-gray-600">Graduated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</div>
                <div className="text-xs text-gray-600">Avg Progress</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Package selector */}
      <Tabs value={selectedPackage} onValueChange={(value) => setSelectedPackage(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="light">Light</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="gold">Gold</TabsTrigger>
          <TabsTrigger value="elite">Elite</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPackage} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {workflows.map((workflow) => (
              <KanbanColumn
                key={workflow.stage_key}
                title={workflow.stage_name}
                description={workflow.stage_description || ""}
                clients={getClientsForStage(workflow.stage_key)}
                workflow={workflow}
                onMoveClient={handleMoveClient}
                onViewClient={handleViewClient}
                color={workflow.color}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Client Details Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedClient?.name}</DialogTitle>
            <DialogDescription>Client details and quick actions</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-gray-600">{selectedClient.email}</p>
                </div>
                <div>
                  <Label>Package</Label>
                  <Badge className="mt-1">{selectedClient.success_package}</Badge>
                </div>
                <div>
                  <Label>Current Stage</Label>
                  <p className="text-sm text-gray-600">{selectedClient.stage?.current_stage}</p>
                </div>
                <div>
                  <Label>Progress</Label>
                  <p className="text-sm text-gray-600">{selectedClient.project_completion_percentage}%</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button asChild className="flex-1">
                  <Link href={`/admin/clients/${selectedClient.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href={`/admin/clients/${selectedClient.id}/tracking`}>
                    <Move className="h-4 w-4 mr-2" />
                    Track Progress
                  </Link>
                </Button>
              </div>

              <div>
                <Label>Created</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedClient.created_at ? new Date(selectedClient.created_at).toLocaleDateString() : "-"}</span>
                  <Button size="sm" variant="ghost" onClick={handleEditDate}>
                    <CalendarIcon className="h-4 w-4" /> Edit
                  </Button>
                </div>
                {editingDate && (
                  <div className="mt-2 space-y-2">
                    <KanbanDatePicker
                      mode="single"
                      selected={newCreatedAt || undefined}
                      onSelect={(date) => setNewCreatedAt(date ?? null)}
                      initialFocus
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingDate(false)} disabled={savingDate}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveDate} disabled={!newCreatedAt || savingDate}>{savingDate ? "Saving..." : "Save Date"}</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Milestone dates based on package type */}
              {selectedClient.success_package === "light" && (
                getMilestoneDateField("light_onboarding_call_date", "Onboarding Call Date")
              )}
              
              {selectedClient.success_package === "premium" && (
                <div className="space-y-4">
                  {getMilestoneDateField("premium_first_call_date", "1st Onboarding Call Date")}
                  {getMilestoneDateField("premium_second_call_date", "2nd Onboarding Call Date")}
                </div>
              )}
              
              {selectedClient.success_package === "gold" && (
                <div className="space-y-4">
                  {getMilestoneDateField("gold_first_call_date", "1st Onboarding Call Date")}
                  {getMilestoneDateField("gold_second_call_date", "2nd Onboarding Call Date")}
                  {getMilestoneDateField("gold_third_call_date", "3rd Onboarding Call Date")}
                </div>
              )}
              
              {selectedClient.success_package === "elite" && (
                <div className="space-y-4">
                  {getMilestoneDateField("elite_configurations_started_date", "Configurations Started Date")}
                  {getMilestoneDateField("elite_integrations_started_date", "Integrations Started Date")}
                  {getMilestoneDateField("elite_verification_completed_date", "Verification Completed Date")}
                </div>
              )}

              <div>
                <Label>Graduation Date</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedClient.graduation_date ? new Date(selectedClient.graduation_date).toLocaleDateString() : "-"}</span>
                  <Button size="sm" variant="ghost" onClick={handleEditGraduationDate}>
                    <CalendarIcon className="h-4 w-4" /> Edit
                  </Button>
                </div>
                {editingGraduationDate && (
                  <div className="mt-2 space-y-2">
                    <KanbanDatePicker
                      mode="single"
                      selected={newGraduationDate || undefined}
                      onSelect={(date) => setNewGraduationDate(date ?? null)}
                      initialFocus
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingGraduationDate(false)} disabled={savingGraduationDate}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveGraduationDate} disabled={savingGraduationDate}>{savingGraduationDate ? "Saving..." : "Save Date"}</Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button variant="outline" onClick={() => setShowFollowUpModal(true)}>
                  + Create Follow-up
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showFollowUpModal} onOpenChange={setShowFollowUpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Follow-up for {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={followUpTitle} onChange={e => setFollowUpTitle(e.target.value)} placeholder="Follow-up title (e.g. Check-in call)" />
            </div>
            <div>
              <Label>Due In</Label>
              <Select value={String(followUpDays)} onValueChange={v => setFollowUpDays(v === "custom" ? "custom" : Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="custom">Custom date</SelectItem>
                </SelectContent>
              </Select>
              {followUpDays === "custom" && (
                <div className="mt-2">
                  <KanbanDatePicker
                    mode="single"
                    selected={customFollowUpDate || undefined}
                    onSelect={date => setCustomFollowUpDate(date ?? null)}
                    initialFocus
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea value={followUpNotes} onChange={e => setFollowUpNotes(e.target.value)} placeholder="Add any notes for this follow-up..." rows={3} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowFollowUpModal(false)} disabled={creatingFollowUp}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!selectedClient) return
                  setCreatingFollowUp(true)
                  let dueDate: string
                  let milestone: number | null
                  if (followUpDays === "custom") {
                    if (!customFollowUpDate) {
                      toast.error("Please select a custom date")
                      setCreatingFollowUp(false)
                      return
                    }
                    dueDate = format(customFollowUpDate, "yyyy-MM-dd")
                    milestone = null
                  } else {
                    dueDate = format(addDays(new Date(), followUpDays), "yyyy-MM-dd")
                    milestone = followUpDays
                  }
                  // Check for duplicate
                  const existing = await getUpcomingClientFollowUps({ daysAhead: 30, includeCompleted: true }) as Array<{ client_id: string, type?: string, milestone?: number, due_date: string }>
                  const duplicate = existing.find(fu => fu.client_id === selectedClient.id && fu.type === "manual" && fu.milestone === milestone && fu.due_date === dueDate)
                  if (duplicate) {
                    toast.error("A follow-up for this client, milestone, and date already exists.")
                    setCreatingFollowUp(false)
                    return
                  }
                  const result = await createClientFollowUp({
                    client_id: selectedClient.id,
                    title: followUpTitle || "Follow-up",
                    due_date: dueDate,
                    notes: followUpNotes,
                    milestone,
                  })
                  if (result) {
                    toast.success("Follow-up created!")
                    setShowFollowUpModal(false)
                    setFollowUpTitle("")
                    setFollowUpNotes("")
                    setFollowUpDays(7)
                    setCustomFollowUpDate(null)
                  } else {
                    toast.error("Failed to create follow-up")
                  }
                  setCreatingFollowUp(false)
                }}
                disabled={creatingFollowUp || (!followUpTitle && !followUpNotes)}
              >
                {creatingFollowUp ? "Creating..." : "Create Follow-up"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 