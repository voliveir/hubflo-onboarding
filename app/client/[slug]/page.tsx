export const dynamic = "force-dynamic"

// Removed 'use client' to make this a Server Component

import { ClientImplementationProgressWrapper } from "@/components/ClientImplementationProgressWrapper"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
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
  Kanban,
  Rocket,
  MessageCircle,
} from "lucide-react"
import { OnboardingAccessGuideWrapper } from "@/components/OnboardingAccessGuideWrapper"
import { ClientIntegrationsSectionWrapper } from "@/components/ClientIntegrationsSectionWrapper"
import { ClientFeaturesSectionWrapper } from "@/components/ClientFeaturesSectionWrapper"
import { getClientBySlug, getClientIntegrations, getClientFeaturesForPortal } from "@/lib/database"
import Image from "next/image"
import type { ClientIntegration, ClientFeature } from "@/lib/types"
import { IndustryWorkflowsWrapper } from "@/components/IndustryWorkflowsWrapper"
import { ClientWorkflowBuilderWrapper } from "@/components/ClientWorkflowBuilderWrapper"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import * as React from "react"
import CollapsibleVideos, { CollapsibleLinks } from "@/components/CollapsibleVideos"
import OnboardingProgressClient from './OnboardingProgressClient'

import { FeedbackBoardClientViewWrapper } from '@/components/FeedbackBoardClientViewWrapper'
import { PortalSection } from "@/components/ui/PortalSection"
import { PortalHeader, PortalNavLink } from "@/components/ui/PortalHeader"
import { PackageHighlights } from "@/components/portal/PackageHighlights"
import { ActionCards } from "@/components/portal/ActionCards"
import { WhiteLabelProgress } from "@/components/WhiteLabelProgress"
import { getImplementationManagerById } from '@/lib/implementationManagers'
import { clsx } from "clsx"

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
  const projectsEnabled = client?.projects_enabled ?? false
  const customAppLabel = getCustomAppLabel(client?.custom_app)
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

  // Fetch implementation manager from DB
  const managerId = client.implementation_manager || 'vanessa'
  const mgr = (await getImplementationManagerById(managerId)) as Partial<import('@/lib/types').ImplementationManager> || {}

  // Compute effective calendar links
  const calendar_contact_success = client.calendar_contact_success || mgr?.calendar_contact_success || '';
  const calendar_schedule_call = client.calendar_schedule_call || mgr?.calendar_schedule_call || '';
  const calendar_integrations_call = client.calendar_integrations_call || mgr?.calendar_integrations_call || '';
  const calendar_upgrade_consultation = client.calendar_upgrade_consultation || mgr?.calendar_upgrade_consultation || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070720] to-[#0d0d25]">
      {/* Header */}
      <header className="bg-[#010124] border-b border-brand-gold sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/hubflo-logo.png" alt="Hubflo" width={32} height={32} className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-white">Hubflo</span>
              <span className="text-brand-gold">×</span>
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
          {mgr.name && (
            <p className="text-sm text-brand-foreground/70">Implementation Manager: {mgr.name}</p>
          )}
        </div>
      </header>

      {/* Quick Navigation Bar */}
      <PortalHeader>
        <PortalNavLink href="#welcome">Welcome</PortalNavLink>
        <PortalNavLink href="#progress">Progress</PortalNavLink>
        <PortalNavLink href="#workflows">Workflows</PortalNavLink>
        <PortalNavLink href="#next-steps">Next Steps</PortalNavLink>
        <PortalNavLink href="#integrations">Integrations</PortalNavLink>
        <PortalNavLink href="#feedback">Features/Bugs/Requests</PortalNavLink>
        <PortalNavLink href="#apps">Apps</PortalNavLink>
      </PortalHeader>

      {/* Personalized Hero Section */}
      <PortalSection id="welcome" gradient={false} className="bg-gradient-to-b from-[#010124] via-[#070720] to-[#0d0d25] text-white scroll-mt-32 mt-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Welcome, <span className="text-brand-gold">{clientName}</span>!
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto" style={{textShadow: '0 2px 8px rgba(7,7,32,0.3)'}}>{welcomeMessage}</p>
          <Button
            size="lg"
            className="bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT text-lg px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            asChild
          >
            <a href={calendar_schedule_call} target="_blank" rel="noopener noreferrer">
              Schedule Call <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </PortalSection>

      {/* Personalized Video */}
      {videoUrl && (
        <PortalSection gradient={false} className="bg-white/10 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden">
              <div className="bg-[#010124] text-white p-6 text-center">
                <h3 className="text-2xl font-bold mb-2">Your Personal Welcome Video</h3>
                <p className="text-white/80">A customized walkthrough specifically for {clientName}</p>
              </div>
              <div className="p-6">
                <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-brand-gold mx-auto mb-4" />
                    <p className="text-[#010124] font-semibold">Personal Welcome Video</p>
                    <p className="text-sm text-gray-600">Customized for {clientName}</p>
                    <p className="text-xs text-gray-400 mt-2">{videoUrl}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PortalSection>
      )}

      {/* Package-Specific Features */}
      <PortalSection gradient={false} className="bg-white/10 backdrop-blur-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your <span className="text-brand-gold">{getPackageEmoji(successPackage)} {packageDisplayName}</span> Package Includes
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            {"Here's everything included in your success package to ensure a smooth onboarding experience."}
          </p>
        </div>
        <PackageHighlights successPackage={successPackage} />
      </PortalSection>

      {/* Implementation Progress Section - RESTORED */}
      <PortalSection id="progress" gradient={false} className="bg-white/10 backdrop-blur-sm scroll-mt-32">
        <div className="max-w-6xl mx-auto">
          <ClientImplementationProgressWrapper client={client} />
        </div>
      </PortalSection>

      {/* Onboarding Access Guide - NEW SECTION */}
      <OnboardingAccessGuideWrapper 
        clientName={clientName}
        calendarContactSuccess={calendar_contact_success}
      />

      {/* Visual Workflows Section - move here before Next Steps */}
      <section id="workflows" className="scroll-mt-32">
        <IndustryWorkflowsWrapper />
      </section>

      {/* Blueprint Your Process Section */}
      {(client.workflow_builder_enabled || (client.show_figma_workflow && client.figma_workflow_url)) && (
        <PortalSection gradient={true} className="bg-gradient-to-br from-[#070720] to-[#0d0d25]">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Blueprint Your Process
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Turn your onboarding process into a clear, visual journey.
            </p>
          </div>
          {/* Figma Embed and Workflow Builder */}
          {client.show_figma_workflow && client.figma_workflow_url && (
            <div className="max-w-7xl mx-auto mb-8">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-brand-gold/40 overflow-visible">
                <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-[#010124] to-brand-gold/20 rounded-t-2xl">
                  <h2 className="text-2xl font-bold text-white">Visual Workflow (Figma)</h2>
                </div>
                <div className="px-8 pt-6 pb-8 flex justify-center">
                  <div className="w-full" style={{ height: 500, maxWidth: 1200, margin: '0 auto', background: 'rgba(255,255,255,0.05)', borderRadius: 12, pointerEvents: 'auto' }}>
                    <iframe
                      src={
                        client.figma_workflow_url.startsWith("https://embed.figma.com/")
                          ? client.figma_workflow_url
                          : `https://embed.figma.com/embed?embed_host=share&url=${encodeURIComponent(client.figma_workflow_url)}`
                      }
                      style={{ width: "100%", height: "100%", border: 0, borderRadius: 12, background: 'transparent' }}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {client.workflow_builder_enabled && (
            <div className="max-w-7xl mx-auto">
              <ClientWorkflowBuilderWrapper enabled={client.workflow_builder_enabled} clientId={client.id} />
            </div>
          )}
        </PortalSection>
      )}

      {/* Next Steps Section */}
      <PortalSection id="next-steps" gradient={false} className="bg-white/10 backdrop-blur-sm mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Next Steps
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Get started with your onboarding journey using the steps below.
          </p>
        </div>
        <ActionCards 
          successPackage={successPackage}
          implementationManager={managerId === 'vanessa' || managerId === 'vishal' ? managerId : undefined}
          calendarScheduleCall={calendar_schedule_call}
          calendarContactSuccess={calendar_contact_success}
          calendarIntegrationsCall={calendar_integrations_call}
          calendarUpgradeConsultation={calendar_upgrade_consultation}
        />
      </PortalSection>

      {/* Onboarding Progress Bar Section (restored) */}
      <OnboardingProgressClient clientId={client.id} projectsEnabled={projectsEnabled} />

      {/* Helpful Resources & Tutorials Section */}
      <PortalSection gradient={false} className="bg-white/10 backdrop-blur-sm mt-16">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">Helpful Resources & Tutorials</h3>
          <div className="rounded-3xl border border-brand-gold/40 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
            <Accordion type="multiple" className="">
              {/* Basics & Foundations */}
              <AccordionItem value="basics">
                <AccordionTrigger className="text-lg font-bold flex items-center gap-2 px-6 py-4 hover:bg-brand-gold/10 transition rounded-t-3xl text-white">
                  <Settings className="h-5 w-5 text-brand-gold" />
                  <span>Setup Basics & Foundations</span>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6 pt-2">
                  <div className="flex items-center gap-2 mb-2"><span className="bg-brand-gold text-brand-DEFAULT text-xs font-semibold px-2 py-1 rounded">Subtasks</span></div>
                  <ul className="list-disc list-inside mb-4 text-white/80 ml-4">
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
                  <AccordionTrigger className="text-lg font-bold flex items-center gap-2 px-6 py-4 hover:bg-brand-gold/10 transition text-white">
                    <Kanban className="h-5 w-5 text-brand-gold" />
                    <span>Setup Your Project Board</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-6 pt-2">
                    <div className="flex items-center gap-2 mb-2"><span className="bg-brand-gold text-brand-DEFAULT text-xs font-semibold px-2 py-1 rounded">Subtasks</span></div>
                    <ul className="list-disc list-inside mb-4 text-white/80 ml-4">
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
                <AccordionTrigger className="text-lg font-bold flex items-center gap-2 px-6 py-4 hover:bg-brand-gold/10 transition rounded-b-3xl text-white">
                  <FileText className="h-5 w-5 text-brand-gold" />
                  <span>Setup Workspace Template(s)</span>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6 pt-2">
                  <div className="flex items-center gap-2 mb-2"><span className="bg-brand-gold text-brand-DEFAULT text-xs font-semibold px-2 py-1 rounded">Subtasks</span></div>
                  <ul className="list-disc list-inside mb-4 text-white/80 ml-4">
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
      </PortalSection>

      {/* Dynamic Integrations Section - Pass showDefault=true to ensure default integrations show */}
      <PortalSection id="integrations" gradient={false} className="bg-white/10 backdrop-blur-sm scroll-mt-32">
        {(client.show_zapier_integrations || integrations.length > 0) && (
          <ClientIntegrationsSectionWrapper
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
            calendarIntegrationsCall={calendar_integrations_call}
          />
        )}
      </PortalSection>

      {/* Feedback Board Section */}
      <PortalSection id="feedback" gradient={false} className="bg-white/10 backdrop-blur-sm mt-16 scroll-mt-32">
        {(client.feedback_board_enabled ?? true) && (
          <div className="max-w-6xl mx-auto">
            <FeedbackBoardClientViewWrapper clientId={client.id} />
          </div>
        )}
      </PortalSection>

      {/* Custom Features Section */}
      <PortalSection gradient={false} className="bg-white/10 backdrop-blur-sm mt-16">
        <div className="max-w-6xl mx-auto">
          <ClientFeaturesSectionWrapper features={features} />
        </div>
      </PortalSection>

      {/* Custom App Section - Only show for Gray Label or White Label */}
      {showCustomAppSection && (
        <PortalSection gradient={false} className="bg-white/10 backdrop-blur-sm mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Your <span className="text-brand-gold">{customAppLabel}</span> Mobile App
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                {customAppLabel === "Gray Label"
                  ? "Access your branded Hubflo mobile app and share it with your clients for seamless project management on the go."
                  : "Your custom white label mobile app is being prepared specifically for your brand and business needs."}
              </p>
            </div>

            {customAppLabel === "Gray Label" && (
              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                {/* Apple App Store */}
                <div className="flex flex-col h-full min-h-[400px] text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:border-brand-gold/40 hover:shadow-lg">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 bg-brand-gold/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-gold/20">
                      <Smartphone className="h-6 w-6 text-brand-gold" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">iOS App Store</h3>
                  </div>
                  <div className="text-white/80 mb-2">Download for iPhone and iPad</div>
                  <div className="text-sm text-white/80 mb-6">
                    Your Gray Label Hubflo app is available on the Apple App Store. Please share this link with your clients to give them mobile access to their projects.
                  </div>
                  <a
                    href="https://apps.apple.com/us/app/client-portal-by-hubflo/id6740039450"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT font-semibold mt-auto rounded-2xl px-6 py-3 text-center block transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on App Store
                  </a>
                </div>
                {/* Google Play Store */}
                <div className="flex flex-col h-full min-h-[400px] text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:border-brand-gold/40 hover:shadow-lg">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 bg-gray-400/10 rounded-2xl flex items-center justify-center mb-4 border border-gray-400/20">
                      <Smartphone className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Google Play Store</h3>
                  </div>
                  <div className="text-gray-400 mb-2">Android app coming soon</div>
                  <div className="text-sm text-white/80 mb-6">
                    The Android version of your branded Hubflo app is currently in development and will be available soon.
                  </div>
                  <Button className="w-full bg-gray-300 text-gray-500 cursor-not-allowed mt-auto" disabled>
                    <Clock className="mr-2 h-4 w-4" />
                    Coming Soon
                  </Button>
                </div>
              </div>
            )}

            {customAppLabel === "White Label" && (
              <WhiteLabelProgress
                status={client.white_label_status || "not_started"}
                checklist={client.white_label_checklist || {}}
                androidUrl={client.white_label_android_url ?? undefined}
                iosUrl={client.white_label_ios_url ?? undefined}
                updatedAt={client.updated_at}
              />
            )}
          </div>
        </PortalSection>
      )}

      {/* Hubflo Internal Apps Section - Always show for all packages */}
      <PortalSection id="apps" gradient={false} className="bg-white/10 backdrop-blur-sm mt-16 scroll-mt-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Hubflo Apps for <span className="text-brand-gold">Internal Users</span>
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Stay connected and productive with Hubflo apps designed for your team to manage clients and projects efficiently.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Mobile App */}
            <div className="flex flex-col h-full min-h-[400px] text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:border-brand-gold/40 hover:shadow-lg">
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 bg-brand-gold/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-gold/20">
                  <Smartphone className="h-6 w-6 text-brand-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Hubflo Mobile App</h3>
              </div>
              <div className="text-white/80 mb-2">Stay connected with your clients, tasks, and files—anytime, anywhere.</div>
              <div className="text-sm text-white/80 mb-6">
                <div className="mb-2">With the mobile app, you can:</div>
                <ul className="text-left ml-4">
                  <li className="mb-1">• View and manage client workspaces</li>
                  <li className="mb-1">• Create contacts and tasks on the go</li>
                  <li className="mb-1">• Record expenses with receipt photos</li>
                  <li className="mb-1">• Track invoice statuses</li>
                  <li className="mb-1">• Take meeting notes or upload files quickly</li>
                </ul>
                <div className="text-center bg-white/10 rounded-2xl p-4 border border-white/20 mt-4">
                  <p className="text-sm text-white/80 mb-3">
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
            {/* Desktop App */}
            <div className="flex flex-col h-full min-h-[400px] text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:border-brand-gold/40 hover:shadow-lg">
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 bg-brand-gold/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-gold/20">
                  <Monitor className="h-6 w-6 text-brand-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Hubflo Desktop App</h3>
              </div>
              <div className="text-white/80 mb-2">Too many tabs open? Can't find Hubflo when you need it?</div>
              <div className="text-sm text-white/80 mb-6">
                <div className="mb-2">Download the Hubflo Desktop App to:</div>
                <ul className="text-left ml-4">
                  <li className="mb-1">• Keep Hubflo in its own dedicated window</li>
                  <li className="mb-1">• Use all the same features as the web app—without browser clutter</li>
                  <li className="mb-1">• Stay organized while managing multiple projects and clients</li>
                </ul>
              </div>
              <a
                href="https://dl.todesktop.com/230531188e234vd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-auto bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT font-semibold rounded-2xl px-6 py-3 text-center block transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Download Desktop App
              </a>
            </div>
            {/* Chrome Extension */}
            <div className="flex flex-col h-full min-h-[400px] text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:border-brand-gold/40 hover:shadow-lg">
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 bg-brand-gold/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-gold/20">
                  <Chrome className="h-6 w-6 text-brand-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Hubflo Chrome Extension</h3>
              </div>
              <div className="text-white/80 mb-2">Create contacts and capture information from anywhere on the web.</div>
              <div className="text-sm text-white/80 mb-6">
                <div className="mb-2">With the Chrome extension, you can:</div>
                <ul className="text-left ml-4">
                  <li className="mb-1">• Create contacts from LinkedIn, Gmail, or Outlook</li>
                  <li className="mb-1">• Quickly add contacts with a right-click on any email address</li>
                  <li className="mb-1">• Instantly pull people into your Hubflo workspace from across the web</li>
                </ul>
              </div>
              <a
                href="https://chrome.google.com/webstore/detail/hubflo-clipper/miionnbpcoinccnhekjjjloiknalhhfh/related?hl=fr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-auto bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT font-semibold rounded-2xl px-6 py-3 text-center block transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Add to Chrome
              </a>
            </div>
          </div>
        </div>
      </PortalSection>

      {/* Upsell Section - only render upsell cards here, based on current package */}
      {["light", "premium", "gold"].includes(successPackage.toLowerCase()) && (
        <UpgradePackageSection 
          clientId={client.id}
          clientName={clientName}
          currentPackage={successPackage}
          calendarUpgradeConsultation={calendar_upgrade_consultation}
        />
      )}

      {/* Compliance Logos Row - always visible */}
      <PortalSection gradient={false} className="flex flex-col items-center mt-8 mb-8 bg-white/10 backdrop-blur-sm py-8">
        <a href="https://hubflo.eu.trust.site/" target="_blank" rel="noopener noreferrer" className="flex gap-8 items-center justify-center">
          <img src="https://static.eu.sprinto.com/_next/static/images/framework/soc2.png" alt="SOC2 Compliant" className="h-12 w-auto" />
          <img src="https://static.eu.sprinto.com/_next/static/images/framework/hipaa.png" alt="HIPAA Compliant" className="h-12 w-auto" />
          <img src="https://static.eu.sprinto.com/_next/static/images/framework/gdpr.png" alt="GDPR Compliant" className="h-12 w-auto" />
        </a>
        <span className="mt-2 text-xs text-white/60">We are SOC2, HIPAA, and GDPR compliant. <a href="https://hubflo.eu.trust.site/" target="_blank" rel="noopener noreferrer" className="underline text-brand-gold">Learn more</a></span>
      </PortalSection>

      {/* Footer */}
      <footer className="bg-[#010124] bg-opacity-90 text-white py-12 px-4 rounded-t-3xl">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image src="/hubflo-logo.png" alt="Hubflo" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold">Hubflo</span>
          </div>
          <p className="text-gray-400 text-sm">
            © Hubflo 2025. Built with <span className="text-brand-gold">❤️</span> for {clientName}
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
  calendarUpgradeConsultation,
}: { clientId: string; clientName: string; currentPackage: string; calendarUpgradeConsultation: string }) {
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
    <section className="px-2 sm:px-4 pt-10 pb-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-2">Ready to Level-Up Your Hubflo Experience?</h2>
        <p className="text-lg text-center text-white/80 mb-8">Unlock deeper automations and hands-on guidance by moving up to the next Success Package.</p>
        <div className={`flex flex-col gap-8 md:flex-row md:gap-12 justify-center items-stretch`}>
          {availableUpgrades.map((pkg) => (
            <Card
              key={pkg.name}
              className={
                `flex flex-col rounded-2xl border border-[#F2C94C] shadow-inner backdrop-blur bg-slate-900/70 text-white px-8 py-8 items-center justify-between min-w-[260px] max-w-xs mx-auto` +
                (pkg.name === popularPackage ? ' ring-2 ring-[#F2C94C]' : '')
              }
            >
              {pkg.name === popularPackage && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#F2C94C] text-[#010124] px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Recommended
                  </div>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-2">{pkg.emoji}</div>
                <CardTitle className="text-2xl text-white">{pkg.name} Package</CardTitle>
                <CardDescription className="text-white/80">{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#F2C94C] mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-white/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Button
            className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] hover:from-[#F2994A] hover:to-[#F2C94C] text-slate-900 font-semibold rounded-2xl px-8 py-4 text-lg shadow-lg"
            asChild
          >
            <a
              href={calendarUpgradeConsultation}
              target="_blank"
              rel="noopener noreferrer"
            >
              Schedule a Consultation
            </a>
          </Button>
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