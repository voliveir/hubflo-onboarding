"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PrimaryButton, SecondaryButton } from "@/components/ui/button-variants"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Settings, FileText, Users, Calendar, Star, ExternalLink } from "lucide-react"

interface SupportLink {
  url: string
  title: string
}

interface ChecklistTask {
  id: string
  title: string
  description: string
  subtasks?: string[]
  completed: boolean
  accountability: "Client" | "Hubflo"
  section: string
  videoUrls?: string[]
  supportLinks?: SupportLink[]
}

interface ClientChecklistProps {
  clientId: string
  clientName: string
  client: {
    success_package: string
    projects_enabled?: boolean
  }
}

export function ClientChecklist({ clientId, clientName, client }: ClientChecklistProps) {
  const [tasks, setTasks] = useState<ChecklistTask[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set())
  const [expandedSupport, setExpandedSupport] = useState<Set<string>>(new Set())

  // Define the checklist structure based on the new requirements
  const getChecklistTasks = (): ChecklistTask[] => {
    const baseTasks: ChecklistTask[] = [
      // Section 1: Setup Basics & Foundations
      {
        id: "basic-setup",
        title: "Basic Setup",
        description: "General user profile information and organization details. Absolute requirement to be filled.",
        subtasks: ["My Profile", "Organization & Branding"],
        completed: false,
        accountability: "Client",
        section: "Setup Basics & Foundations",
        videoUrls: [
          "https://www.tella.tv/video/customize-your-personal-hubflo-profile-v2-bqt1",
          "https://www.tella.tv/video/update-organization-and-branding-naming-convention-for-project-tab-v2-1-em66",
        ],
        supportLinks: [
          {
            url: "https://support.hubflo.com/en/articles/11099514-configure-your-personal-profile-on-hubflo",
            title: "Configure Your Personal Profile on Hubflo",
          },
          {
            url: "https://support.hubflo.com/en/articles/11089009-new-to-hubflo-start-here",
            title: "New to Hubflo? Start here.",
          },
          {
            url: "https://support.hubflo.com/en/articles/11094386-connect-your-email-to-hubflo",
            title: "Connect Your Email to Hubflo",
          },
        ],
      },
      {
        id: "invite-users",
        title: "Invite and Manage Users",
        description: "Invite organizational team members to Hubflo platform",
        completed: false,
        accountability: "Client",
        section: "Setup Basics & Foundations",
        videoUrls: ["https://www.tella.tv/video/inviting-and-managing-internal-users-v2-1-d5i1"],
        supportLinks: [
          {
            url: "https://support.hubflo.com/en/articles/11114630-invite-internal-users",
            title: "Invite Internal Users",
          },
        ],
      },
      {
        id: "general-settings",
        title: "Setup General Settings/Domain",
        description: "Configure your client portal settings and domain",
        subtasks: [
          "Client Portal Subdomain (link clients will be redirect to in order to login. Ex. 'hubflo-onboarding.hubflo.com')",
          "Title",
          "Headline",
          "Login Welcome Message",
          "Pinned Notes (or Announcements)",
          "Client Invite Message",
        ],
        completed: false,
        accountability: "Client",
        section: "Setup Basics & Foundations",
        videoUrls: ["https://www.tella.tv/video/customize-your-general-settingsdomain-4-b96e"],
        supportLinks: [
          {
            url: "https://support.hubflo.com/en/articles/11099790-setting-up-your-business-profile-billing-information",
            title: "Setting Up Your Business Profile & Billing Information",
          },
          {
            url: "https://support.hubflo.com/en/articles/9419546-set-up-your-custom-domain",
            title: "Set Up Your Custom Domain",
          },
        ],
      },
      {
        id: "global-items",
        title: "Configure Global Items",
        description:
          "Global Items (circle at upper part of client portal which is applied to all portals and templates regardless of existing or new)",
        completed: false,
        accountability: "Client",
        section: "Setup Basics & Foundations",
        videoUrls: ["https://www.tella.tv/video/cm8ghg9v5001b09l8gxnqbvec/view"],
        supportLinks: [
          {
            url: "https://support.hubflo.com/en/articles/9507360-set-up-global-items",
            title: "Set Up Global Items",
          },
        ],
      },
      // Section 3: Setup Workspaces & Tasks
      {
        id: "task-templates",
        title: "Create Task Template(s)",
        description: "Create comprehensive task templates for your workflow",
        subtasks: ["Create Sections", "Create Tasks", "Create Subtasks", "Optional: Add Lists/Descriptions"],
        completed: false,
        accountability: "Client",
        section: "Setup Workspaces & Tasks",
        videoUrls: ["https://www.tella.tv/video/streamline-projects-with-task-templates-8kcl"],
        supportLinks: [
          {
            url: "https://support.hubflo.com/en/articles/6781917-getting-started-with-tasks",
            title: "Getting Started with Tasks",
          },
          {
            url: "https://support.hubflo.com/en/articles/8307170-organize-tasks-in-sections",
            title: "Organize Tasks in Sections",
          },
        ],
      },
      {
        id: "workspace-templates",
        title: "Create Workspace Template(s)",
        description: "This is a critical task item to cater towards your business needs.",
        subtasks: ["Title", "Subtitle", "Welcome Message", "Tasks / Subtasks / Links", "Folders / Embeds"],
        completed: false,
        accountability: "Client",
        section: "Setup Workspaces & Tasks",
        videoUrls: [
          "https://www.tella.tv/video/how-to-create-workspace-client-portals-from-workspace-templates-4-e6os",
        ],
        supportLinks: [
          {
            url: "https://support.hubflo.com/en/articles/11101205-create-and-set-up-a-client-workspace",
            title: "Create and Set Up a Client Workspace",
          },
          {
            url: "https://support.hubflo.com/en/articles/11101377-invite-clients-manage-access-to-workspaces",
            title: "Invite Clients & Manage Access to Workspaces",
          },
          {
            url: "https://support.hubflo.com/en/articles/11101290-what-clients-see-in-a-portal-client-view-guide",
            title: "What Clients See in a Portal (Client View Guide)",
          },
          {
            url: "https://support.hubflo.com/en/articles/9165051-add-a-client-portal-button-to-your-website",
            title: 'Add a "Client Portal" Button to Your Website',
          },
          {
            url: "https://support.hubflo.com/en/articles/8967614-managing-files-uploaded-by-clients-in-the-portal",
            title: "Managing Files Uploaded by Clients in the Portal",
          },
        ],
      },
    ]

    // Add project tasks if projects are enabled
    if (client.projects_enabled) {
      baseTasks.splice(
        4,
        0,
        {
          id: "custom-fields",
          title: "Add Custom Fields To Your Project",
          description: "Customize your project fields to match your workflow",
          completed: false,
          accountability: "Client",
          section: "Setup Your Project Board",
          videoUrls: ["https://www.tella.tv/video/how-to-add-custom-fields-to-your-projects-3-frtl"],
          supportLinks: [
            {
              url: "https://support.hubflo.com/en/articles/8613085-create-and-manage-custom-fields",
              title: "Create and Manage Custom Fields",
            },
          ],
        },
        {
          id: "configure-project-board",
          title: "Configure Your Project Board (Organize Internally)",
          description: "Set up your project board organization and structure",
          completed: false,
          accountability: "Client",
          section: "Setup Your Project Board",
          videoUrls: ["https://www.tella.tv/video/configuring-project-boards-1-8t4g"],
          supportLinks: [
            {
              url: "https://support.hubflo.com/en/articles/11128526-getting-started-with-projects",
              title: "Getting Started with Projects",
            },
          ],
        },
      )
    }

    // Add success session for premium packages
    if (["premium", "gold", "elite"].includes(client.success_package.toLowerCase())) {
      baseTasks.push({
        id: "success-session",
        title:
          "Book a call with your Success partner to discuss completed tasks and discuss automations and integrations",
        description: "Schedule your next session to review progress and plan advanced features",
        completed: false,
        accountability: "Client",
        section: "Schedule session with Success team",
      })
    }

    return baseTasks
  }

  useEffect(() => {
    const loadChecklistData = async () => {
      try {
        setLoading(true)

        // Get the base tasks structure
        const baseTasks = getChecklistTasks()

        // Load completion status from database
        const { getTaskCompletions } = await import("@/lib/database")
        const completions = await getTaskCompletions(clientId)

        // Apply completion status from database
        const tasksWithCompletion = baseTasks.map((task) => ({
          ...task,
          completed: completions[task.id] || false,
        }))

        setTasks(tasksWithCompletion)
      } catch (error) {
        console.error("Error loading checklist data:", error)
        // Fallback to base tasks without completion status
        setTasks(getChecklistTasks())
      } finally {
        setLoading(false)
      }
    }

    if (clientId && clientId !== "undefined") {
      loadChecklistData()
    } else {
      // If no valid clientId, just show the base tasks
      setTasks(getChecklistTasks())
      setLoading(false)
    }
  }, [clientId, client])

  const toggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    try {
      setUpdating(taskId)

      // Update local state immediately for responsive UI
      const newCompleted = !task.completed
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: newCompleted } : t)))

      // Save to database for persistent storage with webhook data
      if (clientId && clientId !== "undefined") {
        try {
          const { updateTaskCompletion } = await import("@/lib/database")
          // Pass the task title for webhook integration
          await updateTaskCompletion(clientId, taskId, newCompleted, task.title)
        } catch (dbError) {
          console.error("Database save failed:", dbError)
          // Revert local state on database error
          setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: task.completed } : t)))
          throw dbError
        }
      }
    } catch (error) {
      console.error("Error toggling task:", error)
      // Show user-friendly error message
      alert("Failed to save task status. Please try again.")
    } finally {
      setUpdating(null)
    }
  }

  const getSectionColor = (section: string) => {
    switch (section) {
      case "Setup Basics & Foundations":
        return "border-[#ECB22D] bg-yellow-50"
      case "Setup Your Project Board":
        return "border-[#ECB22D] bg-yellow-50"
      case "Setup Workspaces & Tasks":
        return "border-[#ECB22D] bg-yellow-50"
      case "Schedule session with Success team":
        return "border-[#ECB22D] bg-yellow-50"
      default:
        return "border-[#ECB22D] bg-yellow-50"
    }
  }

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "Setup Basics & Foundations":
        return <Settings className="h-5 w-5 text-[#010124]" />
      case "Setup Your Project Board":
        return <FileText className="h-5 w-5 text-[#010124]" />
      case "Setup Workspaces & Tasks":
        return <Users className="h-5 w-5 text-[#010124]" />
      case "Schedule session with Success team":
        return <Calendar className="h-5 w-5 text-[#010124]" />
      default:
        return <CheckCircle className="h-5 w-5 text-[#010124]" />
    }
  }

  const toggleVideo = (taskId: string) => {
    setExpandedVideos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const toggleSupport = (taskId: string) => {
    setExpandedSupport((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const getTellaEmbedUrl = (url: string) => {
    // Extract video ID from Tella URL
    const match = url.match(/tella\.tv\/video\/([^/?]+)/)
    if (match) {
      return `https://www.tella.tv/video/${match[1]}/embed`
    }
    return url
  }

  // Group tasks by section
  const tasksBySection = tasks.reduce(
    (acc, task) => {
      if (!acc[task.section]) {
        acc[task.section] = []
      }
      acc[task.section].push(task)
      return acc
    },
    {} as Record<string, ChecklistTask[]>,
  )

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (loading) {
    return (
      <section className="py-16 px-4 bg-transparent">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ECB22D] mx-auto"></div>
            <p className="mt-2 text-white">Loading your onboarding checklist...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-transparent">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Your Onboarding Checklist</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Complete these essential tasks to get the most out of Hubflo. Each section builds upon the previous one to
            ensure a smooth setup process.
          </p>
        </div>

        {/* Overall Progress */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="rounded-xl border-2 border-yellow-400 bg-[#18162a] shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-400 rounded-full p-2">
                <CheckCircle className="h-6 w-6 text-[#18162a]" />
              </div>
              <div>
                <div className="text-white font-semibold text-lg">Overall Implementation Progress</div>
              </div>
            </div>
            <div className="relative w-full h-4 bg-[#23213a] rounded-full overflow-hidden my-4">
              <div className="absolute left-0 top-0 h-4 bg-yellow-400 rounded-full transition-all duration-300" style={{ width: `${overallProgress}%` }}></div>
            </div>
            <div className="text-gray-400 text-sm mt-2">Let's get started with your Hubflo onboarding journey.</div>
          </div>
        </div>

        {/* Checklist Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          {Object.entries(tasksBySection).map(([sectionName, sectionTasks]) => {
            const sectionCompleted = sectionTasks.filter((task) => task.completed).length
            const sectionTotal = sectionTasks.length
            const sectionProgress = sectionTotal > 0 ? Math.round((sectionCompleted / sectionTotal) * 100) : 0

            return (
              <div key={sectionName} className="rounded-xl border-2 border-yellow-400 bg-[#18162a] shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-400 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-base">{sectionName}</span>
                    <span className="text-yellow-400 font-semibold text-sm">{sectionProgress}%</span>
                  </div>
                  <span className="text-gray-400 text-xs">{sectionCompleted} of {sectionTotal} tasks</span>
                </div>
                <div className="p-6">
                  {sectionTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`relative rounded-xl border border-yellow-400 bg-[#23213a] p-5 mb-4 shadow-sm flex flex-col transition hover:shadow-lg hover:border-yellow-300 ${task.completed ? 'opacity-60 line-through bg-[#18162a]' : ''}`}
                    >
                      {task.accountability && (
                        <span className="absolute top-4 right-4 bg-yellow-400 text-[#18162a] text-xs font-semibold px-3 py-1 rounded-full">
                          {task.accountability}
                        </span>
                      )}
                      <div className="font-semibold text-gray-100 text-base mb-1">{task.title}</div>
                      <div className="text-gray-400 text-sm mb-3">{task.description}</div>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="ml-2 mb-3">
                          <div className="text-xs font-medium text-gray-300 mb-1">Includes:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {task.subtasks.map((subtask, idx) => (
                              <li key={idx} className="text-xs text-gray-400">{subtask}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Buttons */}
                      <div className="flex gap-3 mt-2">
                        {task.videoUrls && task.videoUrls.length > 0 && (
                          <PrimaryButton
                            type="button"
                            onClick={() => toggleVideo(task.id)}
                            className="bg-yellow-400 text-black font-semibold rounded-lg px-5 py-2 hover:bg-yellow-300"
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                            </svg>
                            {expandedVideos.has(task.id) ? "Hide Videos" : "Watch Tutorials"}
                          </PrimaryButton>
                        )}
                        {task.supportLinks && task.supportLinks.length > 0 && (
                          <PrimaryButton
                            type="button"
                            onClick={() => toggleSupport(task.id)}
                            className="bg-yellow-400 text-black font-semibold rounded-lg px-5 py-2 hover:bg-yellow-300"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {expandedSupport.has(task.id) ? "Hide Guides" : "View Support Guides"}
                          </PrimaryButton>
                        )}
                      </div>
                      {/* Video/Support Sections (unchanged) */}
                      {/* ... existing code for expanded videos/support ... */}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
