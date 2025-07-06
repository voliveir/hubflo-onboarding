"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { CheckCircle, Star, Info, Circle } from "lucide-react"
import { motion } from "framer-motion"

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
    <div className="mb-10 max-w-6xl mx-auto rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 relative overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <h3 className="text-2xl font-bold text-white text-center">Onboarding Progress</h3>
          <span className="relative group cursor-pointer">
            <Info className="h-5 w-5 text-brand-gold" />
            <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm text-xs text-white rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 border border-white/20">
              This tracker updates automatically as you complete your onboarding tasks inside your Hubflo Example Client Portal.<br />Only top-level tasks count toward progress—subtasks do not affect this bar.
            </span>
          </span>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          {/* Task list - 1 column on mobile */}
          <div className="flex-1">
            <ul className="space-y-4">
              {tasksWithStatus.map((task, i) => (
                <li key={task.key} className="flex items-center gap-4 group rounded-xl px-4 py-3 transition-all duration-200 bg-white/5 border border-white/10 hover:bg-white/10"> 
                  <span className={`flex items-center justify-center rounded-full border-2 ${task.completed ? 'bg-brand-gold border-brand-gold' : 'bg-white/20 border-white/30'} w-8 h-8 transition-all duration-300`}>
                    {task.completed ? <CheckCircle className="h-5 w-5 text-white" /> : <Circle className="h-5 w-5 text-white/60" />}
                  </span>
                  <span className={`text-base font-medium transition-colors duration-200 flex items-center ${task.completed ? 'line-through text-white/60' : 'text-white group-hover:text-brand-gold'}`}>
                    {task.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Progress bar and percentage */}
          <div className="flex-1 flex flex-col justify-center items-center gap-6">
            <div className="w-full flex flex-col items-center">
              <div className="w-full mb-3 flex justify-between text-sm text-white/80">
                <span>{completed} of {total} tasks complete</span>
                <span>{percent}%</span>
              </div>
              <div className="w-full relative">
                <div className="w-full h-8 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ 
                      width: `${percent}%`,
                      height: '100%',
                      background: 'linear-gradient(to right, #ECB22D, rgba(236, 178, 45, 0.8))',
                      borderRadius: '9999px'
                    }}
                  />
                </div>
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-white">{percent}% Complete</span>
              </div>
            </div>
            
            {/* Milestones */}
            <div className="flex gap-4 mt-4">
              {MILESTONES.map((m, i) => (
                <div
                  key={i}
                  className={`w-20 h-20 flex flex-col items-center justify-center rounded-full border-2 transition-all duration-300 px-2 ${percent >= m.percent ? 'bg-brand-gold border-brand-gold' : 'bg-white/10 border-white/20'}`}
                  style={{ filter: percent >= m.percent ? 'none' : 'grayscale(1) opacity(0.6)' }}
                >
                  <span className={`mb-1 flex items-center justify-center ${percent >= m.percent ? 'text-white' : 'text-white/60'}`}>{m.icon}</span>
                  <span className={`text-[10px] font-semibold text-center whitespace-normal break-words max-w-[70px] leading-snug ${percent >= m.percent ? 'text-white' : 'text-white/60'}`}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {loading && <div className="mt-4 text-sm text-white/60 text-center">Loading progress...</div>}
        {error && <div className="mt-4 text-sm text-red-400 text-center">{error}</div>}
      </div>
    </div>
  )
} 