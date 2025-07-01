"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Award, Star, Circle } from "lucide-react"

interface OnboardingProgressProps {
  clientId: string
}

const TASKS = [
  { key: "basics", label: "Setup Basics & Foundations" },
  { key: "project_board", label: "Setup Your Project Board" },
  { key: "workspace_templates", label: "Setup Workspace Template(s)" },
]

export default function OnboardingProgress({ clientId }: OnboardingProgressProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedKeys, setCompletedKeys] = useState<string[]>([])

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("task_completions")
        .select("task_id, is_completed")
        .eq("client_id", clientId)
        .eq("is_completed", true)
      if (error) setError("Failed to load progress")
      else setCompletedKeys((data || []).map((t: any) => t.task_id))
      setLoading(false)
    }
    if (clientId) fetchTasks()
  }, [clientId])

  const tasksWithStatus = TASKS.map(task => ({
    ...task,
    completed: completedKeys.includes(task.key)
  }))
  const total = TASKS.length
  const completed = tasksWithStatus.filter(t => t.completed).length
  const percent = total ? Math.round((completed / total) * 100) : 0

  const badgeStates = [
    { icon: CheckCircle, label: "First Task Complete", achieved: completed > 0 },
    { icon: Award, label: "Halfway There", achieved: completed >= 2 },
    { icon: Star, label: "Onboarding Master", achieved: completed === total },
  ]

  return (
    <div className="mb-10 max-w-2xl mx-auto rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-yellow-50 via-white to-white relative overflow-hidden">
      {/* Top accent bar */}
      <div className="h-2 w-full bg-gradient-to-r from-[#ECB22D] to-[#FFD700] rounded-t-3xl" />
      <div className="p-8">
        <h3 className="text-2xl font-extrabold text-[#010124] text-center mb-6 tracking-tight">Onboarding Progress</h3>
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Stepper */}
          <div className="flex-1 flex flex-col gap-0 relative">
            <div className="absolute left-4 top-8 bottom-8 w-1 bg-gradient-to-b from-[#ECB22D] to-gray-200 opacity-30 rounded-full z-0 md:block hidden" />
            <ul className="space-y-6 z-10 relative">
              {tasksWithStatus.map((task, i) => (
                <li key={task.key} className="flex items-center gap-4 group">
                  <span className={`flex items-center justify-center rounded-full border-4 ${task.completed ? 'bg-[#ECB22D] border-[#ECB22D] shadow-lg' : 'bg-white border-gray-200'} w-10 h-10 transition-all duration-300`}>{task.completed ? <CheckCircle className="h-6 w-6 text-[#010124]" /> : <Circle className="h-6 w-6 text-gray-300" />}</span>
                  <span className={`text-lg font-semibold transition-colors duration-200 ${task.completed ? 'line-through text-gray-400' : 'text-[#010124] group-hover:text-[#ECB22D]'}`}>{task.label}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Progress and badges */}
          <div className="flex-1 flex flex-col justify-center items-center gap-6">
            <div className="w-full flex flex-col items-center">
              <div className="w-full mb-2 flex justify-between text-xs text-gray-500">
                <span>{completed} of {total} tasks complete</span>
                <span>{percent}%</span>
              </div>
              <div className="w-full relative">
                <Progress value={percent} className="h-6 bg-gray-100 rounded-full" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-[#010124]">{percent}% Complete</span>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {badgeStates.map((b, i) => (
                <div
                  key={i}
                  className={`w-14 h-14 flex flex-col items-center justify-center rounded-full border-4 transition-all duration-300 ${b.achieved ? 'bg-[#ECB22D] border-[#ECB22D] shadow-lg' : 'bg-gray-100 border-gray-200'}`}
                  style={{ filter: b.achieved ? 'none' : 'grayscale(1) opacity(0.6)' }}
                >
                  <b.icon className={`h-6 w-6 mb-1 ${b.achieved ? 'text-[#010124]' : 'text-gray-400'}`} />
                  <span className={`text-xs font-semibold text-center ${b.achieved ? 'text-[#010124]' : 'text-gray-400'}`}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {loading && <div className="mt-4 text-sm text-gray-500 text-center">Loading progress...</div>}
        {error && <div className="mt-4 text-sm text-red-500 text-center">{error}</div>}
      </div>
    </div>
  )
} 