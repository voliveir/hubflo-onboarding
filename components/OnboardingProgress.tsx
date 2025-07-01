"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Info, Circle } from "lucide-react"

interface OnboardingProgressProps {
  clientId: string
  projectsEnabled: boolean
}

export default function OnboardingProgress({ clientId, projectsEnabled }: OnboardingProgressProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedKeys, setCompletedKeys] = useState<string[]>([])

  const TASKS = [
    { key: "basics", label: "Setup Basics & Foundations" },
    ...(projectsEnabled ? [{ key: "project_board", label: "Setup Your Project Board" }] : []),
    { key: "workspace_templates", label: "Setup Workspace Template(s)" },
  ]

  const MILESTONES = [
    { percent: 33, icon: <CheckCircle className="h-6 w-6" />, label: "First Task Complete" },
    { percent: 66, icon: <Star className="h-6 w-6 text-yellow-500" />, label: "Almost There" },
    { percent: 100, icon: <span className="text-2xl">🏁</span>, label: "You're All Set!" },
  ]

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

  // Find the current milestone
  let currentMilestoneIdx = 0
  if (percent >= 100) currentMilestoneIdx = 2
  else if (percent >= 66) currentMilestoneIdx = 1
  else if (percent >= 33) currentMilestoneIdx = 0

  return (
    <div className="mb-10 max-w-6xl mx-auto rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-yellow-50 via-white to-white relative overflow-hidden">
      {/* Top accent bar */}
      <div className="h-2 w-full bg-gradient-to-r from-[#ECB22D] to-[#FFD700] rounded-t-3xl" />
      <div className="p-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-2xl font-extrabold text-[#010124] text-center tracking-tight">Onboarding Progress</h3>
          <span className="relative group cursor-pointer">
            <Info className="h-5 w-5 text-[#ECB22D]" />
            <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white text-xs text-gray-700 rounded shadow-lg p-3 opacity-0 group-hover:opacity-100 transition pointer-events-none z-20">
              This tracker updates automatically as you complete your onboarding tasks inside your Hubflo Example Client Portal.<br />Only top-level tasks count toward progress—subtasks do not affect this bar.
            </span>
          </span>
        </div>
        <div className="text-xs text-gray-500 text-center mb-6">This tracker updates automatically as you complete your onboarding tasks inside your Hubflo Example Client Portal. Only top-level tasks count toward progress—subtasks do not affect this bar.</div>
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Stepper */}
          <div className="flex-1 flex flex-col gap-0 relative">
            <div className="absolute left-4 top-8 bottom-8 w-1 bg-gradient-to-b from-[#ECB22D] to-gray-200 opacity-30 rounded-full z-0 md:block hidden" />
            <ul className="space-y-6 z-10 relative">
              {tasksWithStatus.map((task, i) => (
                <li key={task.key} className={`flex items-center gap-4 group rounded-xl px-3 py-2 transition-all duration-200 ${task.completed ? 'bg-yellow-100 border border-[#ECB22D]' : 'bg-gray-50 border border-gray-200'} hover:bg-yellow-50`}> 
                  <span className={`flex items-center justify-center rounded-full border-4 ${task.completed ? 'bg-[#ECB22D] border-[#ECB22D] shadow-lg' : 'bg-gray-100 border-gray-400'} w-10 h-10 transition-all duration-300`}>{task.completed ? <CheckCircle className="h-6 w-6 text-[#010124]" /> : <Circle className="h-6 w-6 text-gray-400" />}</span>
                  <span className={`text-lg font-semibold transition-colors duration-200 flex items-center ${task.completed ? 'line-through text-gray-400' : 'text-[#010124] group-hover:text-[#ECB22D]'}`}>{task.label}</span>
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
                <Progress value={percent} className="h-7 bg-gray-100 rounded-full" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-extrabold text-[#010124]">{percent}% Complete</span>
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              {MILESTONES.map((m, i) => (
                <div
                  key={i}
                  className={`w-24 h-24 flex flex-col items-center justify-center rounded-full border-4 transition-all duration-300 px-2 ${percent >= m.percent ? 'bg-[#ECB22D] border-[#ECB22D] shadow-lg' : 'bg-gray-100 border-gray-300'}`}
                  style={{ filter: percent >= m.percent ? 'none' : 'grayscale(1) opacity(0.6)' }}
                >
                  <span className={`mb-1 flex items-center justify-center ${percent >= m.percent ? 'text-[#010124]' : 'text-gray-400'}`}>{m.icon}</span>
                  <span className={`text-[11px] font-semibold text-center whitespace-normal break-words max-w-[90px] leading-snug ${percent >= m.percent ? 'text-[#010124]' : 'text-gray-400'}`}>{m.label}</span>
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