"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  MapPin,
  Flag,
  Mountain,
  Waves,
  TreePine,
  Building2,
  Star,
  Trophy,
  Rocket,
  Target,
  Zap,
  Users,
  Settings,
  Play,
  Pause,
  AlertTriangle,
  FileText,
} from "lucide-react"
import {
  getClientMilestones,
  calculateMilestoneCompletion,
} from "@/lib/database"
import type { Client, ImplementationMilestone } from "@/lib/types"

interface ImplementationMilestonesRoadProps {
  client: Client
}

export function ImplementationMilestonesRoad({ client }: ImplementationMilestonesRoadProps) {
  const [milestones, setMilestones] = useState<ImplementationMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [selectedMilestone, setSelectedMilestone] = useState<ImplementationMilestone | null>(null)

  useEffect(() => {
    loadMilestones()
  }, [client.id])

  const loadMilestones = async () => {
    setLoading(true)
    try {
      const [milestonesData, completion] = await Promise.all([
        getClientMilestones(client.id),
        calculateMilestoneCompletion(client.id),
      ])
      setMilestones(milestonesData || [])
      setCompletionPercentage(completion || 0)
    } catch (error) {
      console.error("Error loading milestones:", error)
      toast.error("Failed to load milestones")
      setMilestones([])
      setCompletionPercentage(0)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-400" />
      case "in_progress":
        return <Clock className="h-6 w-6 text-yellow-400" />
      case "blocked":
        return <AlertCircle className="h-6 w-6 text-red-400" />
      default:
        return <XCircle className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200"
      case "in_progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "blocked":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "setup":
        return <Settings className="h-4 w-4" />
      case "consultation":
        return <Users className="h-4 w-4" />
      case "configuration":
        return <Target className="h-4 w-4" />
      case "integration":
        return <Zap className="h-4 w-4" />
      case "testing":
        return <Play className="h-4 w-4" />
      case "training":
        return <Users className="h-4 w-4" />
      case "deployment":
        return <Rocket className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "setup":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "consultation":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "configuration":
        return "bg-green-50 text-green-700 border-green-200"
      case "integration":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "testing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "training":
        return "bg-pink-50 text-pink-700 border-pink-200"
      case "deployment":
        return "bg-indigo-50 text-indigo-700 border-indigo-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getThemeIcon = () => {
    const theme = client.milestone_road_theme || 'default'
    switch (theme) {
      case "mountain":
        return <Mountain className="h-8 w-8 text-[#F2C94C]" />
      case "ocean":
        return <Waves className="h-8 w-8 text-[#F2C94C]" />
      case "forest":
        return <TreePine className="h-8 w-8 text-[#F2C94C]" />
      case "city":
        return <Building2 className="h-8 w-8 text-[#F2C94C]" />
      default:
        return <Flag className="h-8 w-8 text-[#F2C94C]" />
    }
  }

  const getRoadPath = (index: number, total: number) => {
    // Create a more natural winding road path with smoother curves
    const progress = index / (total - 1)
    const curve = Math.sin(progress * Math.PI * 1.5) * 30 + Math.cos(progress * Math.PI * 0.8) * 15
    const yOffset = progress * 80 + curve
    
    // Make the road more compact - use 90% of width and add padding
    const leftPosition = 5 + (progress * 90) // 5% padding on each side
    
    return {
      left: `${leftPosition}%`,
      top: `${yOffset}%`,
      transform: `translate(-50%, -50%)`,
    }
  }

  const getRoadConnector = (index: number, total: number) => {
    if (index === total - 1 || total <= 1) return null
    
    const progress = index / (total - 1)
    const nextProgress = (index + 1) / (total - 1)
    const curve = Math.sin(progress * Math.PI * 1.5) * 30 + Math.cos(progress * Math.PI * 0.8) * 15
    const nextCurve = Math.sin(nextProgress * Math.PI * 1.5) * 30 + Math.cos(nextProgress * Math.PI * 0.8) * 15
    
    const startY = progress * 80 + curve
    const endY = nextProgress * 80 + nextCurve
    
    // Use the same compact positioning as getRoadPath
    const startX = 5 + (progress * 90)
    const endX = 5 + (nextProgress * 90)
    const controlX = (startX + endX) / 2
    
    const path = `M ${startX} ${startY} Q ${controlX} ${(startY + endY) / 2} ${endX} ${endY}`
    
    return (
      <svg
        key={`connector-${index}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <path
          d={path}
          stroke={`url(#roadGradient-${index})`}
          strokeWidth="4"
          fill="none"
          strokeDasharray={milestones[index]?.status === "completed" ? "0" : "8,8"}
          className="transition-all duration-700"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id={`roadGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F2C94C" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#F2C94C" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F2994A" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="mb-10 max-w-6xl mx-auto rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="relative p-12">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="text-2xl mb-4">⏳</div>
              <div className="text-lg font-medium" style={{ color: '#64748b' }}>Loading implementation milestones...</div>
              <div className="mt-4 flex justify-center gap-2">
                <div className="w-2 h-2 bg-[#F2C94C] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#F2994A] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-[#F2C94C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (milestones.length === 0) {
    return (
      <div className="mb-10 max-w-6xl mx-auto rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="relative p-12 text-center">
          <div className="text-6xl mb-6">🚀</div>
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#060520' }}>Implementation Milestones</h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
            Your implementation journey will be tracked here with beautiful milestone progress indicators and a winding road visualization.
          </p>
          <div className="text-base" style={{ color: '#64748b' }}>
            Milestones will appear here once your implementation manager sets them up.
          </div>
          
          {/* Decorative elements */}
          <div className="mt-8 flex justify-center gap-4">
            <div className="w-3 h-3 bg-brand-gold/30 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-brand-gold/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-brand-gold/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10 max-w-6xl mx-auto rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden">
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-2" style={{ color: '#060520' }}>
              {getThemeIcon()}
              Implementation Milestones
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: '#64748b' }}>
              Your journey to successful implementation - {completionPercentage}% complete
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-brand-gold drop-shadow-lg">{completionPercentage}%</div>
            <div className="text-sm font-medium" style={{ color: '#64748b' }}>Complete</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: '#64748b' }}>Progress</span>
            <span className="text-sm font-medium text-brand-gold">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#F2C94C] to-[#F2994A] rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Winding Road Visualization */}
        <div className="relative min-h-[300px] mb-8">
          {/* Road connectors */}
          {milestones.map((_, index) => getRoadConnector(index, milestones.length))}
          
          {/* Milestone markers */}
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className="absolute cursor-pointer transition-all duration-300 hover:scale-110 group"
              style={getRoadPath(index, milestones.length)}
            >
              {/* Milestone marker */}
              <div className="relative">
                <div className={`
                  w-20 h-20 rounded-full border-3 flex items-center justify-center shadow-lg
                  ${milestone.status === "completed" 
                    ? "bg-green-500/20 border-green-400 shadow-green-500/30" 
                    : milestone.status === "in_progress"
                    ? "bg-yellow-500/20 border-yellow-400 shadow-yellow-500/30 animate-pulse"
                    : "bg-gray-100 border-gray-200"
                  }
                  transition-all duration-300 backdrop-blur-sm
                `}>
                  <div className="text-2xl">
                    {getStatusIcon(milestone.status)}
                  </div>
                </div>
                
                {/* Milestone number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-[#F2C94C] to-[#F2994A] rounded-full flex items-center justify-center text-sm font-bold text-[#010124] shadow-lg">
                  {milestone.order_index}
                </div>
              </div>

              {/* Milestone info card */}
              <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-72 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-4 max-w-[280px]">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">
                        {getStatusIcon(milestone.status)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base mb-2" style={{ color: '#060520' }}>{milestone.title}</h4>
                      {milestone.description && (
                        <p className="text-sm mb-3 leading-relaxed" style={{ color: '#64748b' }}>{milestone.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        <Badge className={`text-xs ${getCategoryColor(milestone.category)} border-0`}>
                          {getCategoryIcon(milestone.category)}
                          <span className="ml-1 font-medium">{milestone.category}</span>
                        </Badge>
                        {milestone.estimated_days && (
                          <Badge variant="outline" className="text-xs border-gray-200" style={{ color: '#64748b' }}>
                            {milestone.estimated_days}d
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Milestones list */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: '#060520' }}>
            <MapPin className="h-5 w-5 text-brand-gold" />
            Milestone Details
          </h3>
          <div className="grid gap-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-brand-gold/40 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-lg"
                onClick={() => setSelectedMilestone(milestone)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-2xl">
                      {getStatusIcon(milestone.status)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold group-hover:text-brand-gold transition-colors text-lg truncate" style={{ color: '#060520' }}>
                      {milestone.title}
                    </div>
                    {milestone.description && (
                      <div className="text-sm mt-1 line-clamp-2" style={{ color: '#64748b' }}>{milestone.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={`${getCategoryColor(milestone.category)} border-0 font-medium text-xs`}>
                    {getCategoryIcon(milestone.category)}
                    <span className="ml-1">{milestone.category}</span>
                  </Badge>
                  <Badge className={`${getStatusColor(milestone.status)} border-0 font-medium text-xs`}>
                    {milestone.status.replace("_", " ")}
                  </Badge>
                  {milestone.estimated_days && (
                    <Badge variant="outline" className="border-gray-200 font-medium text-xs" style={{ color: '#64748b' }}>
                      {milestone.estimated_days}d
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestone Detail Dialog */}
      <Dialog open={!!selectedMilestone} onOpenChange={() => setSelectedMilestone(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-3 text-xl" style={{ color: '#060520' }}>
                <div className="text-2xl">
                  {selectedMilestone && getStatusIcon(selectedMilestone.status)}
                </div>
                <span>{selectedMilestone?.title}</span>
              </DialogTitle>
              {selectedMilestone?.description && (
                <DialogDescription className="text-base leading-relaxed" style={{ color: '#64748b' }}>
                  {selectedMilestone.description}
                </DialogDescription>
              )}
            </DialogHeader>
            {selectedMilestone && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Badge className={`${getCategoryColor(selectedMilestone.category)} border-0 font-medium`}>
                    {getCategoryIcon(selectedMilestone.category)}
                    <span className="ml-1">{selectedMilestone.category}</span>
                  </Badge>
                  <Badge className={`${getStatusColor(selectedMilestone.status)} border-0 font-medium`}>
                    {selectedMilestone.status.replace("_", " ")}
                  </Badge>
                  {selectedMilestone.estimated_days && (
                    <Badge variant="outline" className="border-gray-200 font-medium" style={{ color: '#64748b' }}>
                      {selectedMilestone.estimated_days} days estimated
                    </Badge>
                  )}
                </div>
              
              {selectedMilestone.completed_at && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="text-green-700 font-semibold">Completed</div>
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
                    {new Date(selectedMilestone.completed_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              )}
              
              {selectedMilestone.notes && (
                <div>
                  <div className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#060520' }}>
                    <FileText className="h-4 w-4 text-brand-gold" />
                    Notes
                  </div>
                  <div className="text-sm bg-gray-50 p-4 rounded-xl border border-gray-200 leading-relaxed" style={{ color: '#64748b' }}>
                    {selectedMilestone.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
