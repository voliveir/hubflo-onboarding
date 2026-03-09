"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PrimaryButton, SecondaryButton } from "@/components/ui/button-variants"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Settings, FileText, Users, Calendar, Star, ExternalLink, FileSignature, ClipboardList, Rocket, Target, Lock, Key } from "lucide-react"

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

  const [unlockedSections, setUnlockedSections] = useState<{ contract: boolean; form: boolean; project: boolean }>({
    contract: false,
    form: false,
    project: false,
  })

  // Define the checklist structure based on the new requirements
  const getChecklistTasks = (unlocked: { contract: boolean; form: boolean; project: boolean }): ChecklistTask[] => {
    const baseTasks: ChecklistTask[] = [
      // Section 1: Setup Basics & Foundations (Hubflo Labs is a separate section above this checklist)
      {
        id: "basic-setup",
        title: "Basic Setup",
        description:
          "Complete your personal profile (name, photo, contact info) so clients and teammates know who they're working with. Then set up your organization details and branding — including your business name, logo, and naming conventions for projects or client folders. This information appears across Hubflo and helps keep everything consistent. These fields are required before you can go live.",
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
        description:
          "Add your internal team members (colleagues, admins, contractors) to Hubflo so they can access workspaces, manage clients, and collaborate. You control who has access and what they can see. Invited users receive an email to set up their account and can start working right away.",
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
        description:
          "Customize the client-facing side of your portal. Set your subdomain (e.g. yourbusiness.hubflo.com) — the URL clients use to log in. Add a title, headline, and login welcome message so they know they're in the right place. Use Pinned Notes for announcements that stay visible, and customize the Client Invite Message so new clients receive a clear, on-brand invitation when you add them.",
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
          "Global Items are the circular buttons or links that appear at the top of every client portal — they apply to all portals and templates, including new ones you create later. Use them for things clients always need: Contact Support, Submit a Request, View Policies, or links to key resources. Set them once and they appear everywhere, so you don't have to add them to each workspace manually.",
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
        description:
          "Build reusable task templates that reflect your client workflow. Start with sections to group related work (e.g. Onboarding, Deliverables, Feedback). Add tasks and subtasks so clients know exactly what to do. Include lists or descriptions where helpful — for example, a checklist of documents to upload or steps to complete. Once built, these templates can be attached to any workspace so you're not recreating the same tasks from scratch.",
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
        description:
          "Workspace templates are the backbone of your client portals. Each template defines what a client sees when you add them — a title, subtitle, welcome message, and the tasks, links, folders, or embeds you've assembled. When you onboard a new client, you assign a template and they get a ready-made portal. Create templates for different service types (e.g. one for retainer clients, another for one-off projects) so each client gets the right experience from day one.",
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

    const contractTasks: ChecklistTask[] = [
      {
        id: "contract-pdf",
        title: "Convert Your Contract Template to PDF",
        description:
          "Prepare your contract in Google Docs or Word. Leave blank space where clients will need to fill in details (name, address, etc.) and where you'll need dynamic text (e.g., terms, pricing). Export to PDF for upload — the whitespace ensures SmartDocs can place fields exactly where signees need to complete them.",
        subtasks: ["Leave blank space for fields signees will fill out", "Leave blank space for sections that need dynamic replacement"],
        completed: false,
        accountability: "Client",
        section: "Setup Your Contract",
        supportLinks: [
          { url: "https://support.hubflo.com/en/articles/9455020-create-and-manage-smartdocs", title: "Create and Manage SmartDocs" },
          { url: "https://support.hubflo.com/en/collections/9572880-smartdocs", title: "SmartDocs Help Center" },
        ],
      },
      {
        id: "contract-upload-smartdoc",
        title: "Upload Your Contract as a SmartDoc",
        description:
          "Head to SmartDocs in Hubflo and upload your PDF or Word document. SmartDocs lets you send contracts for signature or approval to clients — manually or automatically — with an experience familiar from tools like DocuSign. When you have a new client, you can send your main SmartDoc or duplicate it to create a fresh instance.",
        completed: false,
        accountability: "Client",
        section: "Setup Your Contract",
        supportLinks: [{ url: "https://support.hubflo.com/en/articles/9455020-create-and-manage-smartdocs", title: "Create and Manage SmartDocs" }],
      },
      {
        id: "contract-add-fields",
        title: "Add Fields for Signees to Complete",
        description:
          "Drag & drop fields onto your SmartDoc where clients need to enter information: name, email, address, and any custom fields. For static text sections (like terms), use the heading field and type your content. Clients receive automatic reminders if they haven't completed their assigned SmartDoc.",
        subtasks: ["Add name, email, address, and other signee fields", "Use heading fields for static sections like terms"],
        completed: false,
        accountability: "Client",
        section: "Setup Your Contract",
        supportLinks: [{ url: "https://support.hubflo.com/en/articles/9455020-create-and-manage-smartdocs", title: "Create and Manage SmartDocs" }],
      },
    ]

    const formTasks: ChecklistTask[] = [
      {
        id: "create-first-form",
        title: "Create Your First Form",
        description:
          "Forms are one of the most powerful features of Hubflo. Assign forms to clients or display them in the portal. Clients receive automatic reminders and can fill at their own pace (auto-saves). Submissions are linked to their profile — no need to ask for email. Most clients start with an intake/onboarding form. Go to Forms → New Form, add your questions, then use Send to assign to a client, pin for portal visibility, or grab the link for your website.",
        subtasks: [
          "Go to Forms and click New Form",
          "Add your questions (e.g., intake/onboarding fields)",
          "Assign via Send, pin to portal, or share the form link",
        ],
        completed: false,
        accountability: "Client",
        section: "Setup Your First Form",
        supportLinks: [{ url: "https://support.hubflo.com/en/articles/10335671-create-and-manage-hubflo-forms", title: "Create and Manage Hubflo Forms" }],
      },
    ]

    if (unlocked.contract) baseTasks.push(...contractTasks)
    if (unlocked.form) baseTasks.push(...formTasks)

    const projectTasks: ChecklistTask[] = [
      {
        id: "custom-fields",
        title: "Add Custom Fields To Your Project",
        description:
          "Define the data you want to track on each project — status, deadline, budget, client type, or anything else that matters to your workflow. Custom fields appear on project cards and in filters, so you can see at a glance what's in progress, overdue, or ready for handoff. Add fields that match how you actually work, not just the defaults.",
        completed: false,
        accountability: "Client",
        section: "Setup Your Project Board",
        videoUrls: ["https://www.tella.tv/video/how-to-add-custom-fields-to-your-projects-3-frtl"],
        supportLinks: [{ url: "https://support.hubflo.com/en/articles/8613085-create-and-manage-custom-fields", title: "Create and Manage Custom Fields" }],
      },
      {
        id: "configure-project-board",
        title: "Configure Your Project Board (Organize Internally)",
        description:
          "Organize your project board so your team can find and manage work efficiently. Set up columns or stages (e.g. Not Started, In Progress, Review, Complete) that mirror your process. Decide how projects are grouped, sorted, and filtered. This is your internal view — clients see their own workspaces; the project board is where you track everything across clients.",
        completed: false,
        accountability: "Client",
        section: "Setup Your Project Board",
        videoUrls: ["https://www.tella.tv/video/configuring-project-boards-1-8t4g"],
        supportLinks: [{ url: "https://support.hubflo.com/en/articles/11128526-getting-started-with-projects", title: "Getting Started with Projects" }],
      },
    ]

    if (unlocked.project) baseTasks.splice(4, 0, ...projectTasks)

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

    // Add Maximize client engagement (always last — after "ready to invite" for Light, after Schedule for higher packages)
    baseTasks.push(
      {
        id: "portal-button-website",
        title: "Add a Client Login Button to Your Website",
        description:
          "Once you have your customized Client Portal set up (Hubflo subdomain or custom domain), add a button on your website that links to your portal. On Wix or WordPress, this takes just a few clicks: go to Client Portal, click the Preview portal tab, grab your portal URL, then add that link to a button or navigation item on your site. The easier it is for clients to find the portal, the more they'll use it.",
        subtasks: ["Go to Client Portal → Preview portal and grab your portal URL", "Add the link to a button or nav on your website"],
        completed: false,
        accountability: "Client",
        section: "Maximize Client Engagement",
        supportLinks: [
          {
            url: "https://support.hubflo.com/en/articles/9165051-add-a-client-portal-button-to-your-website",
            title: "Add a Client Portal Button to Your Website",
          },
        ],
      },
      {
        id: "portal-email-signature",
        title: "Add a Link to Your Portal in Your Email Signature",
        description:
          "Include your Client Portal link in your email signature so every message you send reminds clients where they can log in. This creates a steady, low-friction touchpoint that keeps the portal top of mind without extra effort from you.",
        completed: false,
        accountability: "Client",
        section: "Maximize Client Engagement",
      },
      {
        id: "customize-invite-message",
        title: "Customize Your Client Portal Email Invite",
        description:
          "Beyond the default invitation, you can craft a personalized message that explains how you'll use the portal and what's in it for clients. A clear, tailored message sets expectations and drives engagement — clients who understand the value are more likely to participate actively. Go to Settings → Client Portal → scroll down to customize your invite message.",
        subtasks: ["Go to Settings → Client Portal → scroll down", "Write a message that explains your intent and the portal's value"],
        completed: false,
        accountability: "Client",
        section: "Maximize Client Engagement",
      },
      {
        id: "enable-mobile-app",
        title: "Enable the Client Portal Mobile App (If Purchased)",
        description:
          "If you've purchased the mobile app add-on, enable it so clients can access their portal on the go. The Hubflo mobile app is available on iOS and Android, giving clients a familiar way to view workspaces, complete tasks, and stay updated.",
        completed: false,
        accountability: "Client",
        section: "Maximize Client Engagement",
        supportLinks: [
          {
            url: "https://support.hubflo.com/en/articles/8822311-hubflo-apps-for-mobile-desktop-chrome",
            title: "Hubflo Apps for Mobile, Desktop & Chrome",
          },
        ],
      },
      {
        id: "educate-clients-consistency",
        title: "Educate Your Clients with Consistency",
        description:
          "Many clients are used to email or text for everything, so some will need reminders to use the portal until it becomes second nature. If a client keeps emailing you for files that are already in their portal — and you keep sending them via email — you're reinforcing their old habit instead of adoption. Stay consistent: direct them to the portal each time they ask for something that's already there. Within a few weeks, they'll learn to check the portal first, saving you hours of repetitive work.",
        completed: false,
        accountability: "Client",
        section: "Maximize Client Engagement",
      },
    )

    return baseTasks
  }

  useEffect(() => {
    const loadChecklistData = async () => {
      try {
        setLoading(true)

        const { getTaskCompletions } = await import("@/lib/database")
        const completions = clientId && clientId !== "undefined" ? await getTaskCompletions(clientId) : {}

        const unlocked = {
          contract: !!completions["section-unlock-contract"],
          form: !!completions["section-unlock-form"],
          project: !!completions["section-unlock-project"],
        }
        setUnlockedSections(unlocked)

        const baseTasks = getChecklistTasks(unlocked)
        const tasksWithCompletion = baseTasks.map((task) => ({
          ...task,
          completed: completions[task.id] || false,
        }))

        setTasks(tasksWithCompletion)
      } catch (error) {
        console.error("Error loading checklist data:", error)
        setTasks(getChecklistTasks({ contract: false, form: false, project: false }))
      } finally {
        setLoading(false)
      }
    }

    if (clientId && clientId !== "undefined") {
      loadChecklistData()
    } else {
      setTasks(getChecklistTasks({ contract: false, form: false, project: false }))
      setLoading(false)
    }
  }, [clientId, client])

  const handleUnlockSection = async (section: "contract" | "form" | "project") => {
    try {
      setUpdating(`unlock-${section}`)
      const newUnlocked = { ...unlockedSections, [section]: true }

      if (clientId && clientId !== "undefined") {
        const { updateTaskCompletion, getTaskCompletions } = await import("@/lib/database")
        await updateTaskCompletion(clientId, `section-unlock-${section}`, true)
        const completions = await getTaskCompletions(clientId)
        const baseTasks = getChecklistTasks(newUnlocked)
        const tasksWithCompletion = baseTasks.map((task) => ({
          ...task,
          completed: completions[task.id] || false,
        }))
        setTasks(tasksWithCompletion)
      } else {
        setTasks(getChecklistTasks(newUnlocked))
      }
      setUnlockedSections(newUnlocked)
    } catch (error) {
      console.error("Error unlocking section:", error)
      alert("Failed to unlock. Please try again.")
    } finally {
      setUpdating(null)
    }
  }

  const handleLockSection = async (section: "contract" | "form" | "project") => {
    if (!confirm("Hide these tasks? You can add them back anytime by clicking the lock.")) return
    try {
      setUpdating(`lock-${section}`)
      const newUnlocked = { ...unlockedSections, [section]: false }

      if (clientId && clientId !== "undefined") {
        const { updateTaskCompletion, getTaskCompletions } = await import("@/lib/database")
        await updateTaskCompletion(clientId, `section-unlock-${section}`, false)
        const completions = await getTaskCompletions(clientId)
        const baseTasks = getChecklistTasks(newUnlocked)
        const tasksWithCompletion = baseTasks.map((task) => ({
          ...task,
          completed: completions[task.id] || false,
        }))
        setTasks(tasksWithCompletion)
      } else {
        setTasks(getChecklistTasks(newUnlocked))
      }
      setUnlockedSections(newUnlocked)
    } catch (error) {
      console.error("Error locking section:", error)
      alert("Failed to hide these tasks. Please try again.")
    } finally {
      setUpdating(null)
    }
  }

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
      case "Setup Your Contract":
        return "border-[#ECB22D] bg-yellow-50"
      case "Setup Your First Form":
        return "border-[#ECB22D] bg-yellow-50"
      case "Schedule session with Success team":
        return "border-[#ECB22D] bg-yellow-50"
      case "Maximize Client Engagement":
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
      case "Setup Your Contract":
        return <FileSignature className="h-5 w-5 text-[#010124]" />
      case "Setup Your First Form":
        return <ClipboardList className="h-5 w-5 text-[#010124]" />
      case "Schedule session with Success team":
        return <Calendar className="h-5 w-5 text-[#010124]" />
      case "Maximize Client Engagement":
        return <Target className="h-5 w-5 text-[#010124]" />
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

  const isPremium = ["premium", "gold", "elite"].includes(client.success_package?.toLowerCase() || "")
  const sectionOrder = [
    "Setup Basics & Foundations",
    "Setup Your Project Board",
    "Setup Workspaces & Tasks",
    "Setup Your Contract",
    "Setup Your First Form",
    ...(isPremium ? (["Schedule session with Success team"] as const) : []),
    "Maximize Client Engagement",
  ]

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const LockCard = ({
    section,
    question,
    unlockTaskId,
  }: {
    section: "contract" | "form" | "project"
    question: string
    unlockTaskId: string
  }) => (
    <div>
      <button
        type="button"
        onClick={() => handleUnlockSection(section)}
        disabled={updating === unlockTaskId}
        className="w-full bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-brand-gold/50 hover:bg-brand-gold/5 p-8 text-left transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center border-2 border-gray-200 group-hover:border-brand-gold/40 bg-gray-50 group-hover:bg-brand-gold/10 transition-colors">
            <Lock className="h-7 w-7 text-gray-400 group-hover:text-brand-gold" />
          </div>
          <div className="flex-1">
            <p className="text-base font-medium mb-1" style={{ color: '#060520' }}>
              {question}
            </p>
            <p className="text-sm flex items-center gap-2" style={{ color: '#64748b' }}>
              <Key className="h-4 w-4 text-brand-gold" />
              Click to add these tasks to your checklist
            </p>
          </div>
          {updating === unlockTaskId ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Key className="h-5 w-5 text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </button>
    </div>
  )

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
            To reach your minimal viable portal (MVP), complete the tasks below. To become a Hubflo expert or learn more, Hubflo Labs is the go-to for courses and in-depth education.
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
          {sectionOrder.map((sectionName) => {
            if (sectionName === "Setup Your Project Board" && !unlockedSections.project) {
              return (
                <div key={sectionName}>
                  <LockCard section="project" question="Planning to use the project board?" unlockTaskId="unlock-project" />
                </div>
              )
            }
            if (sectionName === "Setup Your Contract" && !unlockedSections.contract) {
              return (
                <div key={sectionName}>
                  <LockCard section="contract" question="Planning to use contracts?" unlockTaskId="unlock-contract" />
                </div>
              )
            }
            if (sectionName === "Setup Your First Form" && !unlockedSections.form) {
              return (
                <div key={sectionName} className="space-y-8">
                  <LockCard section="form" question="Planning to use forms?" unlockTaskId="unlock-form" />
                  <div className="bg-gradient-to-br from-brand-gold/5 to-brand-gold/10 rounded-2xl border-2 border-brand-gold/30 shadow-sm p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-brand-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Rocket className="h-7 w-7 text-brand-gold" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#060520' }}>
                          You're ready to invite your first client
                        </h3>
                        <p className="text-base leading-relaxed" style={{ color: '#64748b' }}>
                          If you've completed all the tasks above, you now have your minimal viable portal. Invite your first client and run a test to see everything in action — workspaces, tasks, and any forms or contracts you've set up.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            const sectionTasks = tasksBySection[sectionName] || []
            if (sectionTasks.length === 0) return null

            const sectionCompleted = sectionTasks.filter((task) => task.completed).length
            const sectionTotal = sectionTasks.length
            const sectionProgress = sectionTotal > 0 ? Math.round((sectionCompleted / sectionTotal) * 100) : 0

            return (
              <div key={sectionName} className="space-y-8">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
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
                {(() => {
                  const gatedSection =
                    sectionName === "Setup Your Project Board"
                      ? ("project" as const)
                      : sectionName === "Setup Your Contract"
                        ? ("contract" as const)
                        : sectionName === "Setup Your First Form"
                          ? ("form" as const)
                          : null
                  return gatedSection ? (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleLockSection(gatedSection)}
                        disabled={updating === `lock-${gatedSection}`}
                        className="flex items-center gap-2 text-sm hover:text-brand-gold transition-colors disabled:opacity-50"
                        style={{ color: '#64748b' }}
                      >
                        <Lock className="h-4 w-4" />
                        Changed your mind? Hide these tasks
                      </button>
                    </div>
                  ) : null
                })()}
                {sectionName === "Maximize Client Engagement" && (
                  <p className="mt-6 text-base leading-relaxed" style={{ color: '#64748b' }}>
                    As with every app or website, the best way to drive your clients to your portal is to make it as easy as possible for them to access it and to ensure they understand how you'll use it.
                  </p>
                )}
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
              {sectionName === "Setup Your First Form" && (
                <div className="bg-gradient-to-br from-brand-gold/5 to-brand-gold/10 rounded-2xl border-2 border-brand-gold/30 shadow-sm p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-brand-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Rocket className="h-7 w-7 text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#060520' }}>
                        You're ready to invite your first client
                      </h3>
                      <p className="text-base leading-relaxed" style={{ color: '#64748b' }}>
                        If you've completed all the tasks above, you now have your minimal viable portal. Invite your first client and run a test to see everything in action — workspaces, tasks, and any forms or contracts you've set up.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
