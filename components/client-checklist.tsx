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
  clientSlug: string
  client: {
    success_package: string
    projects_enabled?: boolean
  }
}

export function ClientChecklist({ clientId, clientName, clientSlug, client }: ClientChecklistProps) {
  const [tasks, setTasks] = useState<ChecklistTask[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set())
  const [expandedSupport, setExpandedSupport] = useState<Set<string>>(new Set())

  // Define the checklist structure based on the new requirements
  const getChecklistTasks = (): ChecklistTask[] => {
    const baseTasks: ChecklistTask[] = [
      // Section 1: Setup Basics & Foundations (Hubflo Labs is a separate section above this checklist)
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
      <div className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ECB22D] mx-auto"></div>
            <p className="mt-2" style={{ color: '#64748b' }}>Loading your onboarding checklist...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
            <CheckCircle className="h-4 w-4 text-brand-gold" />
            <span className="text-brand-gold font-medium text-sm">Onboarding Tasks</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#060520' }}>Your Onboarding Checklist</h2>
          <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
            We recommend starting with Hubflo Labs to become a Hubflo expert. All our courses, tutorials, and in-depth education are there. This checklist covers the most basic steps required to go live with a minimal viable portal; Hubflo Labs expands on adding and mastering everything else. Each section builds on the previous for a smooth setup.
          </p>
        </div>

        {/* Overall Progress */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-[#ECB22D] rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#010124]" />
              </div>
              <div>
                <div className="text-2xl font-bold mb-1" style={{ color: '#060520' }}>Overall Implementation Progress</div>
                <p className="text-base leading-relaxed" style={{ color: '#64748b' }}>Your complete onboarding progress across all services</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium" style={{ color: '#64748b' }}>Completion Status</span>
                <span className="text-base font-bold" style={{ color: '#060520' }}>{overallProgress}% Complete</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-[#ECB22D] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center space-x-2 text-base" style={{ color: '#64748b' }}>
                <Star className="h-5 w-5 text-[#ECB22D]" />
                <span>Let's get started with your Hubflo onboarding journey.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          {Object.entries(tasksBySection).map(([sectionName, sectionTasks]) => {
            const sectionCompleted = sectionTasks.filter((task) => task.completed).length
            const sectionTotal = sectionTasks.length
            const sectionProgress = sectionTotal > 0 ? Math.round((sectionCompleted / sectionTotal) * 100) : 0

            return (
              <div key={sectionName} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                      {getSectionIcon(sectionName)}
                    </div>
                    <div>
                      <div className="text-xl font-bold mb-1" style={{ color: '#060520' }}>{sectionName}</div>
                      <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
                        {sectionCompleted} of {sectionTotal} tasks completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: '#060520' }}>{sectionProgress}%</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>Complete</div>
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-[#ECB22D] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sectionProgress}%` }}
                  ></div>
                </div>
                <div className="space-y-6 mt-8">
                  {sectionTasks.map((task) => (
                    <div key={task.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-2 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          disabled={updating === task.id}
                          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            task.completed
                              ? "bg-[#ECB22D] border-[#ECB22D] text-[#010124]"
                              : "border-gray-300 hover:border-[#ECB22D]"
                          } ${updating === task.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {updating === task.id ? (
                            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            task.completed && <CheckCircle className="h-3 w-3" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`font-semibold ${task.completed ? "line-through" : ""}`}
                                style={{ color: task.completed ? '#64748b' : '#060520' }}
                              >
                                {task.title}
                              </h4>
                            </div>
                            <Badge variant="outline" className="text-xs border-[#ECB22D] text-[#ECB22D] bg-transparent">
                              {task.accountability}
                            </Badge>
                          </div>
                          <p
                            className={`text-sm mb-3 leading-relaxed ${task.completed ? "line-through" : ""}`}
                            style={{ color: task.completed ? '#94a3b8' : '#64748b' }}
                          >
                            {task.description}
                          </p>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="ml-4 mb-3">
                              <p className="text-xs font-medium mb-2" style={{ color: '#060520' }}>Includes:</p>
                              <ul className="space-y-1">
                                {task.subtasks.map((subtask, index) => (
                                  <li
                                    key={index}
                                    className={`text-xs flex items-center space-x-2 ${task.completed ? "line-through" : ""}`}
                                    style={{ color: task.completed ? '#94a3b8' : '#64748b' }}
                                  >
                                    <span className="w-1 h-1 bg-[#ECB22D] rounded-full"></span>
                                    <span>{subtask}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Resources Section */}
                          {(task.videoUrls?.length || task.supportLinks?.length) && (
                            <div className="mt-4 border-t border-gray-200 pt-4">
                              <div className="flex flex-wrap gap-2">
                                {/* Video Tutorial Button */}
                                {task.videoUrls && task.videoUrls.length > 0 && (
                                  <PrimaryButton
                                    type="button"
                                    onClick={() => toggleVideo(task.id)}
                                    className="flex items-center gap-2 px-6 py-2 text-base"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                    </svg>
                                    {expandedVideos.has(task.id) ? "Hide Videos" : "Watch Tutorials"}
                                  </PrimaryButton>
                                )}

                                {/* Support Documentation Button */}
                                {task.supportLinks && task.supportLinks.length > 0 && (
                                  <SecondaryButton
                                    type="button"
                                    onClick={() => toggleSupport(task.id)}
                                    className="flex items-center gap-2 px-6 py-2 text-base"
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    {expandedSupport.has(task.id) ? "Hide Guides" : "View Support Guides"}
                                  </SecondaryButton>
                                )}
                              </div>

                              {/* Video Tutorial Section */}
                              {expandedVideos.has(task.id) && task.videoUrls && task.videoUrls.length > 0 && (
                                <div className="mt-4 space-y-4">
                                  {task.videoUrls.map((videoUrl, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                      {task.videoUrls!.length > 1 && (
                                        <h5 className="text-sm font-medium mb-2" style={{ color: '#060520' }}>
                                          Tutorial {index + 1}
                                          {task.id === "basic-setup" && index === 0 && ": Personal Profile"}
                                          {task.id === "basic-setup" && index === 1 && ": Organization & Branding"}
                                        </h5>
                                      )}
                                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                                        <iframe
                                          src={getTellaEmbedUrl(videoUrl)}
                                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                                          frameBorder="0"
                                          allowFullScreen
                                          title={`Tutorial video for ${task.title}${task.videoUrls!.length > 1 ? ` - Part ${index + 1}` : ""}`}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Support Documentation Section */}
                              {expandedSupport.has(task.id) && task.supportLinks && task.supportLinks.length > 0 && (
                                <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <h5 className="text-sm font-medium mb-3" style={{ color: '#060520' }}>
                                    📖 Support Documentation
                                  </h5>
                                  <div className="space-y-2">
                                    {task.supportLinks.map((link, index) => (
                                      <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-brand-gold/60 hover:bg-gray-50 transition-colors group"
                                      >
                                        <span className="text-sm font-medium group-hover:text-brand-gold" style={{ color: '#64748b' }}>
                                          {link.title}
                                        </span>
                                        <ExternalLink className="h-4 w-4 text-brand-gold" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
