// Removed 'use client' to make this a Server Component

import { ClientImplementationProgress } from "@/components/client-implementation-progress"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  FileText,
  Zap,
  Settings,
  Play,
  ArrowRight,
  Smartphone,
  Clock,
  ExternalLink,
  Monitor,
  Chrome,
  Star,
  CheckCircle,
  TrendingUp,
  Mail,
  Layout,
  Calendar,
  Kanban,
  ChevronDown,
} from "lucide-react"
import { OnboardingAccessGuide } from "@/components/onboarding-access-guide"
import { ClientIntegrationsSection } from "@/components/client-integrations-section"
import { ClientFeaturesSection } from "@/components/client-features-section"
import { getClientBySlug, getClientIntegrations, getClientFeaturesForPortal } from "@/lib/database"
import Image from "next/image"
import type { ClientIntegration, ClientFeature } from "@/lib/types"
import { IndustryWorkflows } from "@/components/industry-workflows"
import { ClientWorkflowBuilderWrapper } from "@/components/ClientWorkflowBuilderWrapper"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import * as React from "react"
import CollapsibleVideos, { CollapsibleLinks } from "@/components/CollapsibleVideos"
import OnboardingProgressClient from './OnboardingProgressClient'
import { Input } from "@/components/ui/input"
import { FeedbackBoardClientView } from '@/components/FeedbackBoardClientView'

interface ClientPageProps {
  params: {
    slug: string
  }
}

export default async function ClientPage({ params }: ClientPageProps) {
  const client = await getClientBySlug(params.slug)

  if (!client) {
    notFound()
  }

  // Only show active clients to the public
  if (client.status !== "active") {
    notFound()
  }

  // Get client integrations - handle errors gracefully
  let integrations: ClientIntegration[] = []
  let integrationsError = false

  try {
    integrations = await getClientIntegrations(client.id)
  } catch (error) {
    console.error("Error fetching integrations:", error)
    integrationsError = true
    // Continue without integrations if there's an error
  }

  // Fetch client features for portal (server-side)
  let features: ClientFeature[] = []
  try {
    features = await getClientFeaturesForPortal(client.id)
  } catch (error) {
    console.error("Error fetching client features for portal:", error)
    features = []
  }

  // Safe property extraction with fallbacks
  const clientName = client?.name || "Client"
  const successPackage = client?.success_package || "premium"
  const welcomeMessage = client?.welcome_message || `Welcome to your ${successPackage} onboarding experience!`
  const logoUrl = client?.logo_url || null
  const videoUrl = client?.video_url || null
  const showZapierIntegrations = client?.show_zapier_integrations ?? true
  const projectsEnabled = client?.projects_enabled ?? false
  const customAppLabel = getCustomAppLabel(client?.custom_app)

  // Safe string operations with null checks
  const clientInitial = clientName && clientName.length > 0 ? clientName.charAt(0).toUpperCase() : "C"
  const packageDisplayName =
    successPackage && successPackage.length > 0
      ? successPackage.charAt(0).toUpperCase() + successPackage.slice(1)
      : "Premium"

  const getPackageColor = (pkg: string) => {
    switch (pkg.toLowerCase()) {
      case "light":
        return "bg-yellow-100 text-yellow-800"
      case "premium":
        return "bg-yellow-200 text-yellow-900"
      case "gold":
        return "bg-yellow-300 text-yellow-900"
      case "elite":
        return "bg-yellow-400 text-yellow-900"
      case "starter":
        return "bg-yellow-100 text-yellow-800"
      case "professional":
        return "bg-yellow-200 text-yellow-900"
      case "enterprise":
        return "bg-yellow-300 text-yellow-900"
      default:
        return "bg-yellow-200 text-yellow-900"
    }
  }

  const getPackageEmoji = (pkg: string) => {
    switch (pkg.toLowerCase()) {
      case "light":
        return "🟢"
      case "premium":
        return "🔵"
      case "gold":
        return "🟡"
      case "elite":
        return "🔴"
      case "starter":
        return "⚪"
      case "professional":
        return "🟣"
      case "enterprise":
        return "🟦"
      default:
        return "🔵"
    }
  }

  // Check if we should show the custom app section
  const showCustomAppSection = customAppLabel === "Gray Label" || customAppLabel === "White Label"

  // Check if we should show the upselling section (all packages except Elite)
  const showUpsellSection = successPackage.toLowerCase() !== "elite"

  // Add helper for progress calculation
  function getWhiteLabelProgress(checklist: any) {
    if (!checklist) return 0
    const steps = [
      "create_assets",
      "create_natively_app",
      "create_test_user",
      "test_login",
      "download_and_create_ios_app",
      "submit",
    ]
    const total = steps.length
    const completed = steps.filter((k) => checklist[k]).length
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-[#010124] border-b border-[#ECB22D] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/hubflo-logo.png" alt="Hubflo" width={32} height={32} className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-white">Hubflo</span>
              <span className="text-[#ECB22D]">×</span>
              {logoUrl ? (
                <Image
                  src={logoUrl || "/placeholder.svg"}
                  alt={`${clientName} logo`}
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              ) : (
                <span className="text-lg font-semibold text-white">{clientName}</span>
              )}
            </div>
            <Badge variant="secondary" className={getPackageColor(successPackage)}>
              {packageDisplayName} Package
            </Badge>
          </div>
        </div>
      </header>

      {/* Quick Navigation Bar */}
      <nav className="sticky top-[64px] z-40 bg-white/90 border-b border-[#ECB22D] shadow-sm">
        <div className="container mx-auto px-4 py-2 flex flex-wrap gap-2 justify-center">
          <a href="#welcome" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Welcome</a>
          <a href="#progress" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Progress</a>
          <a href="#workflows" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Workflows</a>
          <a href="#next-steps" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Next Steps</a>
          <a href="#integrations" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Integrations</a>
          <a href="#feedback" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Feedback/Bugs/Requests</a>
          <a href="#apps" className="text-[#010124] hover:text-[#ECB22D] font-medium px-3 py-1 rounded transition-colors">Apps</a>
        </div>
      </nav>

      {/* Personalized Hero Section */}
      <section id="welcome" className="py-16 px-4 bg-[#010124] text-white scroll-mt-32">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome, <span className="text-[#ECB22D]">{clientName}</span>!
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">{welcomeMessage}</p>
          <Button
            size="lg"
            className="bg-[#ECB22D] hover:bg-[#d4a029] text-[#010124] text-lg px-8 py-3 rounded-full font-semibold"
            asChild
          >
            <a href="https://app.hubflo.com" target="_blank" rel="noopener noreferrer">
              Start Your Setup <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Personalized Video */}
      {videoUrl && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto">
              <Card className="border-[#ECB22D] border-2">
                <CardHeader className="bg-[#010124] text-white">
                  <CardTitle className="text-center">Your Personal Welcome Video</CardTitle>
                  <CardDescription className="text-center text-gray-300">
                    A customized walkthrough specifically for {clientName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-16 w-16 text-[#ECB22D] mx-auto mb-4" />
                      <p className="text-[#010124] font-semibold">Personal Welcome Video</p>
                      <p className="text-sm text-gray-600">Customized for {clientName}</p>
                      <p className="text-xs text-gray-400 mt-2">{videoUrl}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Package-Specific Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#010124] mb-4">
              Your{" "}
              <span className="text-[#ECB22D]">
                {getPackageEmoji(successPackage)} {packageDisplayName}
              </span>{" "}
              Package Includes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {"Here's everything included in your success package to ensure a smooth onboarding experience."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="text-center border-[#ECB22D] border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-[#010124]" />
                </div>
                <CardTitle className="text-lg text-[#010124]">
                  {successPackage === "elite"
                    ? "Unlimited"
                    : successPackage === "gold"
                      ? "Up to 3"
                      : successPackage === "premium"
                        ? "2"
                        : "1"}{" "}
                  Onboarding Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Personal guidance from our onboarding specialists</p>
              </CardContent>
            </Card>

            <Card className="text-center border-[#ECB22D] border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="h-6 w-6 text-[#010124]" />
                </div>
                <CardTitle className="text-lg text-[#010124]">
                  {successPackage === "elite"
                    ? "Custom Integrations"
                    : successPackage === "gold"
                      ? "Advanced Zapier"
                      : successPackage === "premium"
                        ? "Basic Zapier"
                        : "Video Tutorials"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {successPackage === "elite"
                    ? "API and partner tool integrations"
                    : successPackage === "gold"
                      ? "Advanced workflows and integrations"
                      : successPackage === "premium"
                        ? "Basic automation setup"
                        : "Self-guided learning resources"}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-[#ECB22D] border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-6 w-6 text-[#010124]" />
                </div>
                <CardTitle className="text-lg text-[#010124]">
                  {successPackage === "elite"
                    ? "Full Migration"
                    : successPackage === "gold"
                      ? "Up to 4 Forms/SmartDocs"
                      : successPackage === "premium"
                        ? "Up to 2 Forms/SmartDocs"
                        : "Chat Support"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {successPackage === "elite"
                    ? "Complete data migration assistance"
                    : successPackage === "gold"
                      ? "Advanced form and document setup"
                      : successPackage === "premium"
                        ? "Basic form and document setup"
                        : "Real-time chat assistance"}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-[#ECB22D] border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Settings className="h-6 w-6 text-[#010124]" />
                </div>
                <CardTitle className="text-lg text-[#010124]">
                  {successPackage === "elite"
                    ? "Dedicated Manager"
                    : successPackage === "gold"
                      ? "Priority Support"
                      : successPackage === "premium"
                        ? "Priority Support"
                        : "Standard Support"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {successPackage === "elite"
                    ? "Direct Slack access to account manager"
                    : successPackage === "gold"
                      ? "Priority support during onboarding"
                      : successPackage === "premium"
                        ? "Priority support during onboarding"
                        : "Standard support channels"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Implementation Progress Section - RESTORED */}
      <section id="progress" className="py-16 px-4 bg-white scroll-mt-32">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <ClientImplementationProgress client={client} />
          </div>
        </div>
      </section>

      {/* Onboarding Access Guide - NEW SECTION */}
      <OnboardingAccessGuide clientName={clientName} />

      {/* Visual Workflows Section - move here before Next Steps */}
      <section id="workflows" className="scroll-mt-32">
        <IndustryWorkflows />
      </section>

      {/* Blueprint Your Process Section */}
      {(client.workflow_builder_enabled || (client.show_figma_workflow && client.figma_workflow_url)) && (
        <section className="py-16 px-0 bg-white w-full">
          <div className="w-full max-w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#010124] mb-3">
                Blueprint Your Process
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Turn your onboarding process into a clear, visual journey.
              </p>
            </div>
            {/* Figma Embed and Workflow Builder */}
            {client.show_figma_workflow && client.figma_workflow_url && (
              <section className="py-0 px-0 bg-transparent">
                <div className="container mx-auto flex flex-col items-center">
                  <div className="w-full max-w-7xl">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-visible">
                      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#ECB22D]/30 to-[#FFFBEA] rounded-t-2xl">
                        <h2 className="text-2xl font-bold text-[#010124]">Visual Workflow (Figma)</h2>
                      </div>
                      <div className="px-8 pt-6 pb-8 flex justify-center">
                        <div className="w-full" style={{ height: 500, maxWidth: 1200, margin: '0 auto', background: '#f9fafb', borderRadius: 12, pointerEvents: 'auto' }}>
                          <iframe
                            src={
                              client.figma_workflow_url.startsWith("https://embed.figma.com/")
                                ? client.figma_workflow_url
                                : `https://embed.figma.com/embed?embed_host=share&url=${encodeURIComponent(client.figma_workflow_url)}`
                            }
                            style={{ width: "100%", height: "100%", border: 0, borderRadius: 12, background: '#f9fafb' }}
                            allowFullScreen
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
            {client.workflow_builder_enabled && (
              <ClientWorkflowBuilderWrapper enabled={client.workflow_builder_enabled} clientId={client.id} />
            )}
          </div>
        </section>
      )}

      {/* Next Steps */}
      <section id="next-steps" className="py-16 px-4 bg-white scroll-mt-32">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#010124] mb-4">Your Next Steps</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {"Let's get you started with these essential setup tasks tailored for your business."}
            </p>
          </div>

          <div
            className={`grid gap-6 max-w-6xl mx-auto ${successPackage.toLowerCase() === "light" ? "md:grid-cols-2 justify-center" : "md:grid-cols-3"}`}
          >
            {/* Card 1: Access Workspace */}
            <Card className="hover:shadow-lg transition-shadow flex flex-col h-full border-[#ECB22D] border">
              <CardHeader className="flex-shrink-0">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-10 h-10 bg-[#ECB22D] rounded-full flex items-center justify-center mb-2">
                    <Mail className="h-6 w-6 text-[#010124]" />
                  </div>
                  <CardTitle className="text-lg leading-tight text-[#010124] text-center">
                    Access your Hubflo Admin Workspace
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-gray-600 mb-6 flex-grow text-center">
                  Log into your Hubflo Admin Workspace and start exploring!
                </p>
                <Button className="w-full bg-[#010124] hover:bg-[#020135] text-white mt-auto" asChild>
                  <a href="https://app.hubflo.com" target="_blank" rel="noopener noreferrer">
                    Access Workspace
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Complete Setup */}
            <Card className="hover:shadow-lg transition-shadow flex flex-col h-full border-[#ECB22D] border">
              <CardHeader className="flex-shrink-0">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-10 h-10 bg-[#ECB22D] rounded-full flex items-center justify-center mb-2">
                    <Layout className="h-6 w-6 text-[#010124]" />
                  </div>
                  <CardTitle className="text-lg leading-tight text-[#010124] text-center">
                    Complete Onboarding Checklist
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-gray-600 mb-6 flex-grow text-center">
                  Work through the essential setup tasks to get your Hubflo workspace ready for your business needs!
                </p>
                <Button className="w-full bg-[#ECB22D] hover:bg-[#d4a029] text-[#010124] font-semibold mt-auto" asChild>
                  <a href="https://hubflo-onboarding.hubflo.com/" target="_blank" rel="noopener noreferrer">
                    Start Setup
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Schedule Call - only show if not light package */}
            {successPackage.toLowerCase() !== "light" && (
              <Card className="hover:shadow-lg transition-shadow flex flex-col h-full border-[#ECB22D] border">
                <CardHeader className="flex-shrink-0">
                  <div className="flex flex-col items-center mb-2">
                    <div className="w-10 h-10 bg-[#ECB22D] rounded-full flex items-center justify-center mb-2">
                      <Calendar className="h-6 w-6 text-[#010124]" />
                    </div>
                    <CardTitle className="text-lg leading-tight text-[#010124] text-center">
                      Schedule Your Next Onboarding Call
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="text-gray-600 mb-6 flex-grow text-center">
                    Book your next onboarding call once you've completed your tasks and are ready to proceed to
                    automations and integrations (as well as any questions lingering from your initial play around in
                    Hubflo!)
                  </p>
                  <Button className="w-full bg-[#010124] hover:bg-[#020135] text-white mt-auto" asChild>
                    <a
                      href="https://calendly.com/vanessa-hubflo/onboarding-kickoff-with-hubflo-clone"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Schedule Call
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resources Section */}
          <div className="mt-12">
            <OnboardingProgressClient clientId={client.id} projectsEnabled={projectsEnabled} />
          </div>
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold text-[#010124] mb-6 text-center">Helpful Resources & Tutorials</h3>
            <div className="rounded-xl shadow-lg border-2 border-[#ECB22D] bg-white">
              <Accordion type="multiple" className="">
                {/* Basics & Foundations */}
                <AccordionItem value="basics">
                  <AccordionTrigger className="text-lg font-bold flex items-center gap-2 px-6 py-4 hover:bg-yellow-50 transition rounded-t-xl">
                    <Settings className="h-5 w-5 text-[#ECB22D]" />
                    <span>Setup Basics & Foundations</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-6 pt-2">
                    <div className="flex items-center gap-2 mb-2"><span className="bg-[#ECB22D] text-[#010124] text-xs font-semibold px-2 py-1 rounded">Subtasks</span></div>
                    <ul className="list-disc list-inside mb-4 text-gray-700 ml-4">
                      <li>Basic Setup</li>
                      <li>Invite & Manage Users</li>
                      <li>Setup General Settings/Domain</li>
                      <li>Configure Global Items</li>
                    </ul>
                    <CollapsibleVideos
                      videos={[
                        { title: "Basic Setup", links: [
                          { url: "https://www.tella.tv/video/customize-your-personal-hubflo-profile-v2-bqt1" },
                          { url: "https://www.tella.tv/video/update-organization-and-branding-naming-convention-for-project-tab-v2-1-em66" },
                        ] },
                        { title: "Invite & Manage Users", links: [
                          { url: "https://www.tella.tv/video/inviting-and-managing-internal-users-v2-1-d5i1" },
                        ] },
                        { title: "Setup General Settings/Domain", links: [
                          { url: "https://www.tella.tv/video/customize-your-general-settingsdomain-4-b96e" },
                        ] },
                        { title: "Configure Global Items", links: [
                          { url: "https://www.tella.tv/video/configuring-global-items-v2-bvec" },
                        ] },
                      ]}
                    />
                    <CollapsibleLinks
                      buttonLabel="Support Articles"
                      links={[
                        { label: "Overview: What is Hubflo?", url: "https://support.hubflo.com/en/articles/11088991-overview-what-is-hubflo" },
                        { label: "New to Hubflo? Start here.", url: "https://support.hubflo.com/en/articles/11089009-new-to-hubflo-start-here" },
                        { label: "Custom Domain vs Subdomain on Hubflo", url: "https://support.hubflo.com/en/articles/11326448-custom-domain-vs-subdomain-on-hubflo" },
                        { label: "Connect Your Email to Hubflo", url: "https://support.hubflo.com/en/articles/11094386-connect-your-email-to-hubflo" },
                        { label: "Configure Your Personal Profile on Hubflo", url: "https://support.hubflo.com/en/articles/11099514-configure-your-personal-profile-on-hubflo" },
                        { label: "Setting Up Your Business Profile & Billing Information", url: "https://support.hubflo.com/en/articles/11099790-setting-up-your-business-profile-billing-information" },
                        { label: "Invite Internal Users", url: "https://support.hubflo.com/en/articles/11114630-invite-internal-users" },
                        { label: "Set Up Global Items", url: "https://support.hubflo.com/en/articles/9507360-set-up-global-items" },
                      ]}
                    />
                  </AccordionContent>
                </AccordionItem>
                {/* Project Board - only if enabled */}
                {projectsEnabled && (
                  <AccordionItem value="project-board">
                    <AccordionTrigger className="text-lg font-bold flex items-center gap-2 px-6 py-4 hover:bg-yellow-50 transition">
                      <Kanban className="h-5 w-5 text-[#ECB22D]" />
                      <span>Setup Your Project Board</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-6 pt-2">
                      <div className="flex items-center gap-2 mb-2"><span className="bg-[#ECB22D] text-[#010124] text-xs font-semibold px-2 py-1 rounded">Subtasks</span></div>
                      <ul className="list-disc list-inside mb-4 text-gray-700 ml-4">
                        <li>Add Custom Fields to your Project</li>
                        <li>Configure Your Project Board (Organize Internally)</li>
                      </ul>
                      <CollapsibleVideos
                        videos={[
                          { title: "Add Custom Fields to your Project", links: [
                            { url: "https://www.tella.tv/video/cm5zycgb8000b0alad26vfrtl/view" },
                          ] },
                          { title: "Configure Your Project Board (Organize Internally)", links: [
                            { url: "https://www.tella.tv/video/configuring-project-boards-1-8t4g" },
                          ] },
                        ]}
                      />
                      <CollapsibleLinks
                        buttonLabel="Support Articles"
                        links={[
                          { label: "Getting Started with Projects", url: "https://support.hubflo.com/en/articles/11128526-getting-started-with-projects" },
                          { label: "Project Status Tracker", url: "https://support.hubflo.com/en/articles/10290166-project-status-tracker" },
                          { label: "Tracking and Managing Your Expenses in Hubflo", url: "https://support.hubflo.com/en/articles/11462734-tracking-and-managing-your-expenses-in-hubflo" },
                          { label: "Archive a Project", url: "https://support.hubflo.com/en/articles/8907441-archive-a-project" },
                          { label: "Unlink a Contact from a Project", url: "https://support.hubflo.com/en/articles/11592511-unlink-a-contact-from-a-project" },
                          { label: "Organize Tasks in Sections", url: "https://support.hubflo.com/en/articles/8307170-organize-tasks-in-sections" },
                          { label: "Assign Tasks to Clients in the Portal", url: "https://support.hubflo.com/en/articles/11378679-assign-tasks-to-clients-in-the-portal" },
                          { label: "Add Comments to Collaborate on Tasks", url: "https://support.hubflo.com/en/articles/9292454-add-comments-to-collaborate-on-tasks" },
                        ]}
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}
                {/* Workspace Templates */}
                <AccordionItem value="workspace-templates">
                  <AccordionTrigger className="text-lg font-bold flex items-center gap-2 px-6 py-4 hover:bg-yellow-50 transition rounded-b-xl">
                    <FileText className="h-5 w-5 text-[#ECB22D]" />
                    <span>Setup Workspace Template(s)</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-6 pt-2">
                    <div className="flex items-center gap-2 mb-2"><span className="bg-[#ECB22D] text-[#010124] text-xs font-semibold px-2 py-1 rounded">Subtasks</span></div>
                    <ul className="list-disc list-inside mb-4 text-gray-700 ml-4">
                      <li>Create Task Template(s)</li>
                      <li>Create Workspace Template(s)</li>
                    </ul>
                    <CollapsibleVideos
                      videos={[
                        { title: "Create Task Template(s)", links: [
                          { url: "https://www.tella.tv/video/streamline-projects-with-task-templates-8kcl" },
                        ] },
                        { title: "Create Workspace Template(s)", links: [
                          { url: "https://www.tella.tv/video/how-to-create-workspace-client-portals-from-workspace-templates-4-e6os" },
                        ] },
                      ]}
                    />
                    <CollapsibleLinks
                      buttonLabel="Support Articles"
                      links={[
                        { label: "Create and Set Up a Client Workspace", url: "https://support.hubflo.com/en/articles/11101205-create-and-set-up-a-client-workspace" },
                        { label: "What Clients See in a Portal (Client View Guide)", url: "https://support.hubflo.com/en/articles/11101290-what-clients-see-in-a-portal-client-view-guide" },
                        { label: "Add a Client Portal Button to Your Website", url: "https://support.hubflo.com/en/articles/9165051-add-a-client-portal-button-to-your-website" },
                        { label: "Collaborating with Clients on Tasks", url: "https://support.hubflo.com/en/articles/9043216-collaborating-with-clients-on-tasks" },
                      ]}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Integrations Section - Pass showDefault=true to ensure default integrations show */}
      <section id="integrations" className="scroll-mt-32">
        {(client.show_zapier_integrations || integrations.length > 0) && (
          <ClientIntegrationsSection
            clientId={client.id}
            clientName={clientName}
            integrations={integrationsError ? undefined : (integrations
              .filter(i => ["zapier", "native", "api"].includes(i.integration_type))
              .map(i => ({
                id: i.id,
                title: i.title,
                description: i.description,
                category: i.category,
                integration_type: i.integration_type as "zapier" | "native" | "api",
                external_url: i.external_url,
                is_featured: i.is_featured,
                sort_order: i.sort_order,
              })) as any)}
            showDefault={true}
            successPackage={successPackage}
          />
        )}
      </section>

      {/* Feedback Board Section */}
      <section id="feedback" className="scroll-mt-32">
        {(client.feedback_board_enabled ?? true) && (
          <div className="py-16 px-4 bg-gray-50">
            <div className="container mx-auto">
              <div className="max-w-6xl mx-auto">
                <FeedbackBoardClientView clientId={client.id} />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Custom Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <ClientFeaturesSection features={features} />
          </div>
        </div>
      </section>

      {/* Custom App Section - Only show for Gray Label or White Label */}
      {showCustomAppSection && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#010124] mb-4">
                  Your <span className="text-[#ECB22D]">{customAppLabel}</span> Mobile App
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {customAppLabel === "Gray Label"
                    ? "Access your branded Hubflo mobile app and share it with your clients for seamless project management on the go."
                    : "Your custom white label mobile app is being prepared specifically for your brand and business needs."}
                </p>
              </div>

              {customAppLabel === "Gray Label" && (
                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                  {/* Apple App Store */}
                  <Card className="flex flex-col h-full min-h-[400px] text-center border-[#ECB22D] border hover:shadow-lg transition-shadow">
                    <CardContent className="flex flex-col flex-1 justify-between p-6">
                      <div>
                        <div className="w-16 h-16 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                          <Smartphone className="h-8 w-8 text-[#010124]" />
                        </div>
                        <div className="text-xl text-[#010124] font-bold mb-1">iOS App Store</div>
                        <div className="text-gray-600 mb-2">Download for iPhone and iPad</div>
                        <div className="text-sm text-gray-600 mb-6">
                          Your Gray Label Hubflo app is available on the Apple App Store. Please share this link with your clients to give them mobile access to their projects.
                        </div>
                      </div>
                      <div>
                        <Button className="w-full bg-[#ECB22D] hover:bg-[#d4a029] text-[#010124] font-semibold" asChild>
                          <a
                            href="https://apps.apple.com/us/app/client-portal-by-hubflo/id6740039450"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View on App Store
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Google Play Store */}
                  <Card className="flex flex-col h-full min-h-[400px] text-center border-[#ECB22D] border hover:shadow-lg transition-shadow">
                    <CardContent className="flex flex-col flex-1 justify-between p-6">
                      <div>
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Smartphone className="h-8 w-8 text-gray-500" />
                        </div>
                        <div className="text-xl text-gray-600 font-bold mb-1">Google Play Store</div>
                        <div className="text-gray-500 mb-2">Android app coming soon</div>
                        <div className="text-sm text-gray-600 mb-6">
                          The Android version of your branded Hubflo app is currently in development and will be available soon.
                        </div>
                      </div>
                      <div>
                        <Button className="w-full bg-gray-300 text-gray-500 cursor-not-allowed" disabled>
                          <Clock className="mr-2 h-4 w-4" />
                          Coming Soon
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {customAppLabel === "White Label" && (
                (() => {
                  const status = client.white_label_status || "not_started"
                  const checklist = client.white_label_checklist || {}
                  const progress = getWhiteLabelProgress(checklist)
                  if (status === "not_started") {
                    return (
                      <Card className="border-[#ECB22D] border-2">
                        <CardHeader className="bg-[#010124] text-white text-center">
                          <div className="w-16 h-16 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Settings className="h-8 w-8 text-[#010124]" />
                          </div>
                          <CardTitle className="text-2xl">Custom White Label App Development</CardTitle>
                          <CardDescription className="text-gray-300">Your personalized mobile application</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                          <div className="space-y-6">
                            <div className="text-center">
                              <h3 className="text-xl font-semibold text-[#010124] mb-3">Development Timeline</h3>
                              <div className="inline-flex items-center bg-[#ECB22D] bg-opacity-20 rounded-full px-6 py-3">
                                <Clock className="h-5 w-5 text-[#ECB22D] mr-2" />
                                <span className="font-semibold text-[#010124]">4-6 Weeks</span>
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-6">
                              <h4 className="font-semibold text-[#010124] mb-3">What to Expect:</h4>
                              <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start">
                                  <span className="text-[#ECB22D] mr-2">•</span>
                                  Custom branding with your logo, colors, and company identity
                                </li>
                                <li className="flex items-start">
                                  <span className="text-[#ECB22D] mr-2">•</span>
                                  Personalized app name and description
                                </li>
                                <li className="flex items-start">
                                  <span className="text-[#ECB22D] mr-2">•</span>
                                  Dedicated app store listings under your brand
                                </li>
                                <li className="flex items-start">
                                  <span className="text-[#ECB22D] mr-2">•</span>
                                  Full integration with your Hubflo workspace
                                </li>
                              </ul>
                            </div>
                            <div className="text-center bg-[#010124] rounded-lg p-6 text-white">
                              <h4 className="font-semibold mb-2">Next Steps</h4>
                              <p className="text-gray-300 mb-4">
                                Your Implementation Manager will reach out to you within 1-2 business days to discuss your app
                                requirements, branding guidelines, and development timeline.
                              </p>
                              <p className="text-sm text-[#ECB22D]">
                                Questions? Contact your Implementation Manager or reach out to our support team.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }
                  if (status === "in_progress" || status === "waiting_for_approval") {
                    return (
                      <Card className="border-[#ECB22D] border-2">
                        <CardHeader className="bg-[#010124] text-white text-center">
                          <div className="w-16 h-16 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Settings className="h-8 w-8 text-[#010124]" />
                          </div>
                          <CardTitle className="text-2xl">Custom White Label App Development</CardTitle>
                          <CardDescription className="text-gray-300">Your personalized mobile application</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                          <div className="space-y-6">
                            <div className="text-center mb-6">
                              <h3 className="text-xl font-semibold text-[#010124] mb-3">Progress</h3>
                              <div className="w-full bg-gray-200 rounded-full h-6">
                                <div
                                  className="bg-[#ECB22D] h-6 rounded-full flex items-center justify-center text-[#010124] font-bold text-sm transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                >
                                  {progress}%
                                </div>
                              </div>
                              <div className="text-gray-500 mt-2 text-sm">
                                Last updated: {new Date(client.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}, {new Date(client.updated_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </div>
                              {status === "waiting_for_approval" && (
                                <div className="text-[#ECB22D] mt-4 font-medium">
                                  We're currently waiting for approval from Apple and Google to add your application to their respective stores. This process typically takes 1-2 weeks.
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }
                  if (status === "complete") {
                    return (
                      <Card className="border-[#ECB22D] border-2">
                        <CardHeader className="bg-[#010124] text-white text-center">
                          <div className="w-16 h-16 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Settings className="h-8 w-8 text-[#010124]" />
                          </div>
                          <CardTitle className="text-2xl">Your White Label App is Ready!</CardTitle>
                          <CardDescription className="text-gray-300">Your app is now live on the app stores.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                          <div className="space-y-6 text-center">
                            <div className="mb-4">
                              <h3 className="text-xl font-semibold text-[#010124] mb-3">Download Links</h3>
                              <div className="flex flex-row flex-wrap justify-center items-center gap-4 mb-2">
                                {client.white_label_android_url ? (
                                  <a href={client.white_label_android_url} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src="/google-play-badge.png"
                                      alt="Get it on Google Play"
                                      className="h-12 md:h-14 w-auto hover:opacity-90 transition"
                                    />
                                  </a>
                                ) : (
                                  <div className="text-gray-500 font-semibold">Google Play coming soon!</div>
                                )}
                                {client.white_label_ios_url ? (
                                  <a href={client.white_label_ios_url} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src="/app-store-badge.png"
                                      alt="Download on the App Store"
                                      className="h-12 md:h-14 w-auto hover:opacity-90 transition"
                                    />
                                  </a>
                                ) : (
                                  <div className="text-gray-500 font-semibold">Apple App Store coming soon!</div>
                                )}
                              </div>
                            </div>
                            <div className="text-gray-500 mt-2 text-sm">
                              Marked complete: {new Date(client.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}, {new Date(client.updated_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                            <div className="text-[#010124] font-semibold mt-6">
                              Share these links with your clients so they can download your app directly from the app stores.
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }
                  return null
                })()
              )}
            </div>
          </div>
        </section>
      )}

      {/* Hubflo Internal Apps Section - Always show for all packages */}
      <section id="apps" className="py-16 px-4 bg-gray-50 scroll-mt-32">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#010124] mb-4">
                Hubflo Apps for <span className="text-[#ECB22D]">Internal Users</span>
                </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Stay connected and productive with Hubflo apps designed for your team to manage clients and projects
                efficiently.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {/* Mobile App */}
              <Card className="flex flex-col h-full min-h-[400px] border-[#ECB22D] border hover:shadow-lg transition-shadow text-center">
                <CardContent className="flex flex-col flex-1 justify-between p-6">
                  <div>
                    <div className="w-16 h-16 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="h-8 w-8 text-[#010124]" />
                    </div>
                    <div className="text-xl text-[#010124] font-bold mb-1">Hubflo Mobile App</div>
                    <div className="text-gray-600 mb-2">Stay connected with your clients, tasks, and files—anytime, anywhere.</div>
                    <div className="text-sm text-gray-600 mb-6">
                      <div className="mb-2">With the mobile app, you can:</div>
                      <ul className="text-left ml-4">
                        <li className="mb-1">• View and manage client workspaces</li>
                        <li className="mb-1">• Create contacts and tasks on the go</li>
                        <li className="mb-1">• Record expenses with receipt photos</li>
                        <li className="mb-1">• Track invoice statuses</li>
                        <li className="mb-1">• Take meeting notes or upload files quickly</li>
                      </ul>
                      <div className="text-center bg-white rounded-lg p-4 border mt-4">
                        <p className="text-sm text-gray-600 mb-3">
                          Scan this QR code to download the app directly to your phone:
                        </p>
                        <div className="flex justify-center">
                          <Image
                            src="/hubflo-mobile-qr.png"
                            alt="QR Code to download Hubflo Mobile App"
                            width={120}
                            height={120}
                            className="border rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div></div> {/* No button for mobile app */}
                </CardContent>
              </Card>
              {/* Desktop App */}
              <Card className="flex flex-col h-full min-h-[400px] border-[#ECB22D] border hover:shadow-lg transition-shadow text-center">
                <CardContent className="flex flex-col flex-1 justify-between p-6">
                  <div>
                    <div className="w-16 h-16 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Monitor className="h-8 w-8 text-[#010124]" />
                    </div>
                    <div className="text-xl text-[#010124] font-bold mb-1">Hubflo Desktop App</div>
                    <div className="text-gray-600 mb-2">Too many tabs open? Can't find Hubflo when you need it?</div>
                    <div className="text-sm text-gray-600 mb-6">
                      <div className="mb-2">Download the Hubflo Desktop App to:</div>
                      <ul className="text-left ml-4">
                        <li className="mb-1">• Keep Hubflo in its own dedicated window</li>
                        <li className="mb-1">• Use all the same features as the web app—without browser clutter</li>
                        <li className="mb-1">• Stay organized while managing multiple projects and clients</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <Button className="w-full bg-[#010124] hover:bg-[#020135] text-white" asChild>
                      <a href="https://dl.todesktop.com/230531188e234vd" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Download Desktop App
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* Chrome Extension */}
              <Card className="flex flex-col h-full min-h-[400px] border-[#ECB22D] border hover:shadow-lg transition-shadow text-center">
                <CardContent className="flex flex-col flex-1 justify-between p-6">
                  <div>
                    <div className="w-16 h-16 bg-[#ECB22D] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Chrome className="h-8 w-8 text-[#010124]" />
                    </div>
                    <div className="text-xl text-[#010124] font-bold mb-1">Hubflo Chrome Extension</div>
                    <div className="text-gray-600 mb-2">Create contacts and capture information from anywhere on the web.</div>
                    <div className="text-sm text-gray-600 mb-6">
                      <div className="mb-2">With the Chrome extension, you can:</div>
                      <ul className="text-left ml-4">
                        <li className="mb-1">• Create contacts from LinkedIn, Gmail, or Outlook</li>
                        <li className="mb-1">• Quickly add contacts with a right-click on any email address</li>
                        <li className="mb-1">• Instantly pull people into your Hubflo workspace from across the web</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <Button className="w-full bg-[#010124] hover:bg-[#020135] text-white" asChild>
                      <a
                        href="https://chrome.google.com/webstore/detail/hubflo-clipper/miionnbpcoinccnhekjjjloiknalhhfh/related?hl=fr"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Add to Chrome
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Upselling Section - Show for all packages except Elite */}
      {showUpsellSection && (
        <UpgradePackageSection clientId={client.id} clientName={clientName} currentPackage={successPackage} />
      )}

      {/* Footer */}
      <footer className="bg-[#010124] text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image src="/hubflo-logo.png" alt="Hubflo" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold">Hubflo</span>
          </div>
          <p className="text-gray-400 text-sm">
            © Hubflo 2025. Built with <span className="text-[#ECB22D]">❤️</span> for {clientName}
          </p>
        </div>
      </footer>
    </div>
  )
}

// Upgrade Package Section Component
function UpgradePackageSection({
  clientId,
  clientName,
  currentPackage,
}: { clientId: string; clientName: string; currentPackage: string }) {
  // Define all packages
  const allPackages = [
    {
      name: "Light",
      emoji: "🟢",
      price: "Contact for pricing",
      description: "Essential onboarding support",
      features: ["1 Onboarding Call", "Video Tutorials", "Chat Support", "Standard Support", "Email Support"],
      level: 1,
    },
    {
      name: "Premium",
      emoji: "🔵",
      price: "Contact for pricing",
      description: "Perfect for growing businesses",
      features: [
        "2 Onboarding Calls",
        "Up to 2 Forms/SmartDocs",
        "Basic Zapier Integration",
        "Priority Support",
        "Email Support",
      ],
      level: 2,
    },
    {
      name: "Gold",
      emoji: "🟡",
      price: "Contact for pricing",
      description: "Advanced features for scaling teams",
      features: [
        "Up to 3 Onboarding Calls",
        "Up to 4 Forms/SmartDocs",
        "Advanced Zapier Workflows",
        "Priority Support",
        "Email Support",
      ],
      level: 3,
    },
    {
      name: "Elite",
      emoji: "🔴",
      price: "Contact for pricing",
      description: "Complete solution for enterprise",
      features: [
        "Unlimited Onboarding Calls",
        "Unlimited Forms/SmartDocs",
        "Custom API Integrations",
        "Full Data Migration",
        "Dedicated Account Manager",
        "Direct Slack Access",
      ],
      level: 4,
    },
  ]

  // Get current package level
  const currentPackageLevel =
    allPackages.find((pkg) => pkg.name.toLowerCase() === currentPackage.toLowerCase())?.level || 1

  // Filter packages to show only those above the current level
  const availableUpgrades = allPackages.filter((pkg) => pkg.level > currentPackageLevel)

  // Determine which package should be marked as popular
  const getPopularPackage = () => {
    if (currentPackageLevel === 1) return "Premium" // Light -> Premium popular
    if (currentPackageLevel === 2) return "Gold" // Premium -> Gold popular
    if (currentPackageLevel === 3) return "Elite" // Gold -> Elite popular
    return null
  }

  const popularPackage = getPopularPackage()

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-[#ECB22D] bg-opacity-20 rounded-full px-6 py-3 mb-6">
              <TrendingUp className="h-5 w-5 text-[#ECB22D] mr-2" />
              <span className="font-semibold text-[#010124]">Upgrade Available</span>
            </div>
            <h2 className="text-3xl font-bold text-[#010124] mb-4">
              Ready to <span className="text-[#ECB22D]">Level Up</span> Your Hubflo Experience?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unlock more features, get additional support, and accelerate your business growth with our advanced
              success packages.
            </p>
          </div>

          <div
            className={`grid gap-8 ${availableUpgrades.length === 1 ? "max-w-md mx-auto" : availableUpgrades.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-3"}`}
          >
            {availableUpgrades.map((pkg) => (
              <Card
                key={pkg.name}
                className={`relative border-2 hover:shadow-lg transition-all duration-300 ${
                  pkg.name === popularPackage ? "border-[#ECB22D] scale-105" : "border-gray-200 hover:border-[#ECB22D]"
                }`}
              >
                {pkg.name === popularPackage && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#ECB22D] text-[#010124] px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Recommended
                    </div>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-2">{pkg.emoji}</div>
                  <CardTitle className="text-2xl text-[#010124]">{pkg.name} Package</CardTitle>
                  <CardDescription className="text-gray-600">{pkg.description}</CardDescription>
                  <div className="text-xl font-bold text-[#010124] mt-2">{pkg.price}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-[#ECB22D] mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Card className="bg-gray-50 border-[#ECB22D] border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#010124] mb-2">Questions About Upgrading?</h3>
                <p className="text-gray-600 mb-4">
                  Our team is here to help you choose the perfect package for your business needs.
                </p>
                <Button
                  variant="outline"
                  className="border-[#ECB22D] text-[#010124] hover:bg-[#ECB22D] bg-transparent"
                  asChild
                >
                  <a
                    href="https://calendly.com/vanessa-hubflo/onboarding-upgrade"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Schedule a Consultation
                  </a>
                </Button>
              </CardContent>
            </Card>
            {/* Compliance Logos Row */}
            <div className="flex flex-col items-center mt-8">
              <a href="https://hubflo.eu.trust.site/" target="_blank" rel="noopener noreferrer" className="flex gap-8 items-center justify-center">
                <img src="https://static.eu.sprinto.com/_next/static/images/framework/soc2.png" alt="SOC2 Compliant" className="h-12 w-auto" />
                <img src="https://static.eu.sprinto.com/_next/static/images/framework/hipaa.png" alt="HIPAA Compliant" className="h-12 w-auto" />
                <img src="https://static.eu.sprinto.com/_next/static/images/framework/gdpr.png" alt="GDPR Compliant" className="h-12 w-auto" />
              </a>
              <span className="mt-2 text-xs text-gray-500">We are SOC2, HIPAA, and GDPR compliant. <a href="https://hubflo.eu.trust.site/" target="_blank" rel="noopener noreferrer" className="underline text-[#ECB22D]">Learn more</a></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function getCustomAppLabel(value: string | undefined) {
  switch (value) {
    case "gray_label":
      return "Gray Label"
    case "white_label":
      return "White Label"
    case "not_applicable":
    case "":
    case undefined:
      return "Not Applicable"
    default:
      return value
  }
}