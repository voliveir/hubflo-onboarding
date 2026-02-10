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
  Zap,
  GraduationCap,
} from "lucide-react"
import { OnboardingAccessGuideWrapper } from "@/components/OnboardingAccessGuideWrapper"
import { ClientIntegrationsSectionWrapper } from "@/components/ClientIntegrationsSectionWrapper"
import { ClientFeaturesSectionWrapper } from "@/components/ClientFeaturesSectionWrapper"
import { getClientBySlug, getClientIntegrations, getClientFeaturesForPortal, getUniversitySchools } from "@/lib/database"
import Image from "next/image"
import type { ClientIntegration, ClientFeature } from "@/lib/types"
import { IndustryWorkflowsWrapper } from "@/components/IndustryWorkflowsWrapper"
import { ClientWorkflowBuilderWrapper } from "@/components/ClientWorkflowBuilderWrapper"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import * as React from "react"
import CollapsibleVideos, { CollapsibleLinks } from "@/components/CollapsibleVideos"
import OnboardingProgressClient from './OnboardingProgressClient'
import { ClientChecklist } from "@/components/client-checklist"
import { FeedbackBoardClientViewWrapper } from '@/components/FeedbackBoardClientViewWrapper'
import { PortalSection } from "@/components/ui/PortalSection"
import { PortalHeader, PortalNavLink } from "@/components/ui/PortalHeader"
import { PackageHighlights } from "@/components/portal/PackageHighlights"
import { ActionCards } from "@/components/portal/ActionCards"
import { WhiteLabelProgress } from "@/components/WhiteLabelProgress"
import { getImplementationManagerById } from '@/lib/implementationManagers'
import { clsx } from "clsx"
import { PinnedNoteDisplay } from "@/components/pinned-note-display"

interface ClientPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ClientPage({ params }: ClientPageProps) {
  // Await the params Promise first (Next.js 15 requirement)
  const resolvedParams = await params
  const slug = resolvedParams.slug
  console.log('Looking up client with slug:', slug)
  
  const client = await getClientBySlug(slug)

  if (!client) {
    console.error('Client not found for slug:', slug)
    notFound()
  }

  console.log('Client found:', { id: client.id, name: client.name, status: client.status, slug: client.slug })

  // Only show active or pending clients to the public
  if (!["active", "pending"].includes(client.status)) {
    console.error('Client found but status is not active/pending:', { slug, status: client.status })
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

  // Fetch University schools for programs carousel
  let universitySchools: Awaited<ReturnType<typeof getUniversitySchools>> = []
  try {
    universitySchools = await getUniversitySchools()
  } catch (error) {
    console.error("Error fetching University schools:", error)
  }
  const activeSchools = universitySchools.filter((s) => s.is_active)

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
  let mgr: Partial<import('@/lib/types').ImplementationManager> = {}
  try {
    const managerData = await getImplementationManagerById(managerId)
    mgr = (managerData || {}) as Partial<import('@/lib/types').ImplementationManager>
  } catch (error) {
    console.error("Error fetching implementation manager:", error)
    // Continue with empty manager object
  }

  // Compute effective calendar links
  const calendar_contact_success = client.calendar_contact_success || mgr?.calendar_contact_success || '';
  const calendar_schedule_call = client.calendar_schedule_call || mgr?.calendar_schedule_call || '';
  const calendar_integrations_call = client.calendar_integrations_call || mgr?.calendar_integrations_call || '';
  const calendar_upgrade_consultation = client.calendar_upgrade_consultation || mgr?.calendar_upgrade_consultation || '';

  const hasFeatures = features.length > 0;

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#060520' }}>
      {/* Header */}
      <header className="bg-[#010124] border-b border-brand-gold fixed top-0 left-0 right-0 w-full z-50">
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
      <div className="mt-24" />
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
      <PortalSection id="welcome" gradient={true} className="text-white scroll-mt-32 mt-40 bg-transparent relative overflow-hidden !py-24 min-h-[60vh]">
        {/* Background Elements */}
        <div className="absolute inset-0 gradient-portal opacity-30" />
        <div className="relative z-10 text-center flex flex-col justify-center min-h-[50vh]">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg" style={{textShadow: '0 2px 8px rgba(236, 178, 45, 0.33)'}}>
            Welcome, <span className="text-brand-gold">{clientName}</span>!
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto" style={{textShadow: '0 2px 8px #000'}}>{welcomeMessage}</p>
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

      {/* Pinned Note Display */}
      <PortalSection gradient={false} className="relative overflow-hidden bg-white">
        <div className="max-w-4xl mx-auto">
          <PinnedNoteDisplay client={client} />
        </div>
      </PortalSection>

      {/* Personalized Video */}
      {videoUrl && (
        <PortalSection gradient={false} className="relative overflow-hidden bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-white p-6 text-center border-b border-gray-200">
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#060520' }}>Your Personal Welcome Video</h3>
                <p className="leading-relaxed" style={{ color: '#64748b' }}>A customized walkthrough specifically for {clientName}</p>
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
      <PortalSection gradient={false} className="relative overflow-hidden bg-white">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
            <Star className="h-4 w-4 text-brand-gold" />
            <span className="text-brand-gold font-medium text-sm">Your Package</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#060520' }}>
            Your <span className="text-brand-gold">{getPackageEmoji(successPackage)} {packageDisplayName}</span> Package Includes
          </h2>
          <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
            {"Here's everything included in your success package to ensure a smooth onboarding experience."}
          </p>
        </div>
        <PackageHighlights successPackage={successPackage} />
      </PortalSection>

      {/* Implementation Progress Section - RESTORED */}
      <PortalSection id="progress" gradient={false} className="relative overflow-hidden bg-white scroll-mt-32">
        <div className="max-w-6xl mx-auto">
          <ClientImplementationProgressWrapper client={client} />
        </div>
      </PortalSection>

      {/* Next Steps Section */}
      <PortalSection id="next-steps" gradient={false} className="relative overflow-hidden bg-white mt-0">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
            <Clock className="h-4 w-4 text-brand-gold" />
            <span className="text-brand-gold font-medium text-sm">Get Started</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#060520' }}>
            Next Steps
          </h2>
          <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
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

      {/* Hubflo Labs – same layout as Integrations with programs carousel */}
      <PortalSection gradient={false} className="relative overflow-hidden bg-white">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
            <GraduationCap className="h-4 w-4 text-brand-gold" />
            <span className="text-brand-gold font-medium text-sm">Your learning path</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <h2 className="text-3xl md:text-5xl font-bold" style={{ color: "#060520" }}>
              Hubflo Labs
            </h2>
            <span className="inline-flex items-center rounded-full bg-amber-100 border border-amber-300 px-4 py-1.5 text-sm font-medium text-amber-800">
              Coming Soon — Preview Available
            </span>
          </div>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-2" style={{ color: "#64748b" }}>
            Learn everything you need to know about Hubflo through our comprehensive educational platform. Access courses, tutorials, quizzes, and earn certificates as you progress.
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            We&apos;re still building this out. Feel free to explore — your feedback helps us improve.
          </p>
        </div>

        {/* Programs / badges carousel (like integration logos on homepage) */}
        {activeSchools.length > 0 && (
          <div className="mt-12 mb-8 relative max-w-7xl mx-auto">
            <div className="relative overflow-hidden py-4">
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
              <div className="group flex gap-8 overflow-hidden p-2 flex-row">
                <div className="flex shrink-0 justify-around gap-8 animate-marquee flex-row">
                  {activeSchools.map((school) => (
                    <a
                      key={school.id}
                      href={`/client/${slug}/university`}
                      className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-28 h-28 md:w-36 md:h-36 hover:shadow-md hover:border-brand-gold/40 transition-all"
                    >
                      {school.image_url ? (
                        <img
                          src={school.image_url}
                          alt={school.name}
                          className="w-12 h-12 md:w-16 md:h-16 object-contain flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-brand-gold flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium mt-2 text-center line-clamp-2" style={{ color: "#060520" }}>
                        {school.name}
                      </span>
                    </a>
                  ))}
                </div>
                <div className="flex shrink-0 justify-around gap-8 animate-marquee flex-row">
                  {activeSchools.map((school) => (
                    <a
                      key={`dup-${school.id}`}
                      href={`/client/${slug}/university`}
                      className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-28 h-28 md:w-36 md:h-36 hover:shadow-md hover:border-brand-gold/40 transition-all"
                    >
                      {school.image_url ? (
                        <img
                          src={school.image_url}
                          alt={school.name}
                          className="w-12 h-12 md:w-16 md:h-16 object-contain flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-brand-gold flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium mt-2 text-center line-clamp-2" style={{ color: "#060520" }}>
                        {school.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto text-center mt-8">
          <a
            href={`/client/${slug}/university`}
            className="inline-flex items-center gap-2 bg-[#010124] hover:bg-[#060520] text-white font-semibold rounded-xl px-8 py-4 text-base transition-colors"
          >
            <GraduationCap className="h-5 w-5" />
            Open Hubflo Labs
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </PortalSection>

      {/* Onboarding Checklist */}
      <PortalSection gradient={false} className="relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto">
          <ClientChecklist clientId={client.id} clientName={clientName} clientSlug={slug} client={client} />
        </div>
      </PortalSection>

      {/* Dynamic Integrations Section - Pass showDefault=true to ensure default integrations show */}
      {(client.show_zapier_integrations || integrations.length > 0) && (
        <PortalSection id="integrations" gradient={false} className="relative overflow-hidden bg-white scroll-mt-32">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <Zap className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Powerful Integrations</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8" style={{ color: '#060520' }}>
              Hubflo Automations & Integrations
            </h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
              Connect Hubflo with your favorite tools and automate your workflows seamlessly using our Hubflo's native
              integrations, Zapier, Make.com, or our API.
            </p>
          </div>
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
        </PortalSection>
      )}

      {/* Feedback Board Section */}
      {(client.feedback_board_enabled ?? false) && (
        <PortalSection id="feedback" gradient={false} className="relative overflow-hidden bg-white mt-16 scroll-mt-32">
          <div className="max-w-6xl mx-auto">
            <FeedbackBoardClientViewWrapper clientId={client.id} />
          </div>
        </PortalSection>
      )}

      {/* Custom Features Section */}
      {features.length > 0 && (
        <PortalSection gradient={false} className="relative overflow-hidden bg-white mt-16">
          <div className="max-w-6xl mx-auto">
            <ClientFeaturesSectionWrapper features={features} />
          </div>
        </PortalSection>
      )}

      {/* Custom App Section - Only show for Gray Label or White Label */}
      {showCustomAppSection && (
        <PortalSection gradient={false} className="relative overflow-hidden bg-white mt-0">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <Smartphone className="h-4 w-4 text-brand-gold" />
                <span className="text-brand-gold font-medium text-sm">Mobile App</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#060520' }}>
                Your <span className="text-brand-gold">{customAppLabel}</span> Mobile App
              </h2>
              <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
                {customAppLabel === "Gray Label"
                  ? "Access your branded Hubflo mobile app and share it with your clients for seamless project management on the go."
                  : "Your custom white label mobile app is being prepared specifically for your brand and business needs."}
              </p>
            </div>

            {customAppLabel === "Gray Label" && (
              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                {/* Apple App Store */}
                <div className="flex flex-col h-full min-h-[400px] text-center bg-white rounded-2xl p-8 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                      <Smartphone className="h-6 w-6 text-brand-gold" />
                    </div>
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#060520' }}>iOS App Store</h3>
                  </div>
                  <div className="mb-2 text-base" style={{ color: '#64748b' }}>Download for iPhone and iPad</div>
                  <div className="text-sm mb-6 leading-relaxed" style={{ color: '#64748b' }}>
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
                <div className="flex flex-col h-full min-h-[400px] text-center bg-white rounded-2xl p-8 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                      <Smartphone className="h-6 w-6 text-brand-gold" />
                    </div>
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#060520' }}>Google Play Store</h3>
                  </div>
                  <div className="mb-2 text-base" style={{ color: '#64748b' }}>Download for Android</div>
                  <div className="text-sm mb-6 leading-relaxed" style={{ color: '#64748b' }}>
                    Your Gray Label Hubflo app is available on the Google Play Store. Please share this link with your clients to give them mobile access to their projects.
                  </div>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.hubflo.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT font-semibold mt-auto rounded-2xl px-6 py-3 text-center block transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Download on Google Play
                  </a>
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
                clientId={client.id}
                approvalStatus={client.white_label_client_approval_status}
                appName={client.white_label_app_name}
                appDescription={client.white_label_app_description}
                appAssets={client.white_label_app_assets}
              />
            )}
          </div>
        </PortalSection>
      )}

      {/* Hubflo Internal Apps Section - Always show for all packages */}
      <PortalSection id="apps" gradient={false} className="relative overflow-hidden bg-white mt-0 scroll-mt-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <Smartphone className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Internal Tools</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#060520' }}>
              Hubflo Apps for <span className="text-brand-gold">Internal Users</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
              Stay connected and productive with Hubflo apps designed for your team to manage clients and projects efficiently.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Mobile App */}
            <div className="flex flex-col h-full min-h-[400px] text-center bg-white rounded-2xl p-8 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                  <Smartphone className="h-6 w-6 text-brand-gold" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#060520' }}>Hubflo Mobile App</h3>
              </div>
              <div className="mb-2 text-base" style={{ color: '#64748b' }}>Stay connected with your clients, tasks, and files—anytime, anywhere.</div>
              <div className="text-sm mb-6 leading-relaxed" style={{ color: '#64748b' }}>
                <div className="mb-2 font-semibold" style={{ color: '#060520' }}>With the mobile app, you can:</div>
                <ul className="text-left ml-4" style={{ color: '#64748b' }}>
                  <li className="mb-1">• View and manage client workspaces</li>
                  <li className="mb-1">• Create contacts and tasks on the go</li>
                  <li className="mb-1">• Record expenses with receipt photos</li>
                  <li className="mb-1">• Track invoice statuses</li>
                  <li className="mb-1">• Take meeting notes or upload files quickly</li>
                </ul>
                <div className="text-center bg-gray-50 rounded-2xl p-4 border border-gray-200 mt-4">
                  <p className="text-sm mb-3" style={{ color: '#64748b' }}>
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
            <div className="flex flex-col h-full min-h-[400px] text-center bg-white rounded-2xl p-8 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                  <Monitor className="h-6 w-6 text-brand-gold" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#060520' }}>Hubflo Desktop App</h3>
              </div>
              <div className="mb-2 text-base" style={{ color: '#64748b' }}>Too many tabs open? Can't find Hubflo when you need it?</div>
              <div className="text-sm mb-6 leading-relaxed" style={{ color: '#64748b' }}>
                <div className="mb-2 font-semibold" style={{ color: '#060520' }}>Download the Hubflo Desktop App to:</div>
                <ul className="text-left ml-4" style={{ color: '#64748b' }}>
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
            <div className="flex flex-col h-full min-h-[400px] text-center bg-white rounded-2xl p-8 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                  <Chrome className="h-6 w-6 text-brand-gold" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#060520' }}>Hubflo Chrome Extension</h3>
              </div>
              <div className="mb-4 text-left text-sm leading-relaxed" style={{ color: '#64748b' }}>
                <p className="mb-3 font-semibold" style={{ color: '#060520' }}>Access your Hubflo data from anywhere with a convenient sidebar</p>
                <p className="mb-3">Hubflo gives you instant access to your account from anywhere in your browser.</p>
                <p className="mb-3">Click the icon to open a sidebar where you can browse workspaces, view contacts, manage tasks, upload files, assign forms and SmartDocs, all without leaving the page you're on.</p>
                <p className="mb-3">Create tasks from any selected text with a right-click. Your Hubflo data is always one click away.</p>
                <p>For Gmail and Outlook, we've built dedicated widgets that take it further.</p>
              </div>
              
              {/* YouTube Video Embed */}
              <div className="mb-6 w-full">
                <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
                  <iframe
                    src="https://www.youtube.com/embed/Wav2_SjYGfY"
                    title="Hubflo Chrome Extension Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
              
              <a
                href="https://chromewebstore.google.com/detail/Hubflo/miionnbpcoinccnhekjjjloiknalhhfh"
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
        <PortalSection gradient={true} className="relative overflow-hidden mt-16">
          <UpgradePackageSection 
            clientId={client.id}
            clientName={clientName}
            currentPackage={successPackage}
            calendarUpgradeConsultation={calendar_upgrade_consultation}
          />
        </PortalSection>
      )}

      {/* Compliance Logos Row - always visible */}
      <PortalSection gradient={true} className="flex flex-col items-center mt-8 mb-8 py-8 relative overflow-hidden">
        <a href="https://hubflo.eu.trust.site/" target="_blank" rel="noopener noreferrer" className="flex gap-8 items-center justify-center">
          <img src="https://static.eu.sprinto.com/_next/static/images/framework/soc2.png" alt="SOC2 Compliant" className="h-12 w-auto" />
          <img src="https://static.eu.sprinto.com/_next/static/images/framework/hipaa.png" alt="HIPAA Compliant" className="h-12 w-auto" />
          <img src="https://static.eu.sprinto.com/_next/static/images/framework/gdpr.png" alt="GDPR Compliant" className="h-12 w-auto" />
        </a>
        <span className="mt-2 text-xs text-white/80">Hubflo is SOC2, HIPAA, and GDPR compliant. <a href="https://hubflo.eu.trust.site/" target="_blank" rel="noopener noreferrer" className="underline text-brand-gold hover:text-brand-gold-hover">Learn more</a></span>
      </PortalSection>

      {/* Footer */}
      <footer className="bg-[#010124] bg-opacity-90 text-white py-12 px-4 rounded-t-3xl border-none shadow-none">
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

  // Don't render if no upgrades available
  if (availableUpgrades.length === 0) {
    return null
  }

  // Determine which package should be marked as popular
  const getPopularPackage = () => {
    if (currentPackageLevel === 1) return "Premium" // Light -> Premium popular
    if (currentPackageLevel === 2) return "Gold" // Premium -> Gold popular
    if (currentPackageLevel === 3) return "Elite" // Gold -> Elite popular
    return null
  }

  const popularPackage = getPopularPackage()

  return (
    <div className="px-2 sm:px-4 pt-10 pb-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-brand-gold/20 border border-brand-gold/40 rounded-full px-6 py-2 mb-6">
            <Star className="h-4 w-4 text-brand-gold" />
            <span className="text-brand-gold font-medium text-sm">Upgrade Options</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-white">Ready to Level-Up Your Hubflo Experience?</h2>
          <p className="text-lg text-center mb-8 leading-relaxed text-white/80">Unlock deeper automations and hands-on guidance by moving up to the next Success Package.</p>
        </div>
        <div className={`flex flex-col gap-8 md:flex-row md:gap-12 justify-center items-stretch`}>
          {availableUpgrades.map((pkg) => (
            <Card
              key={pkg.name}
              className={
                `flex flex-col rounded-2xl border border-brand-gold/30 bg-[#10122b]/90 text-white shadow-lg px-8 py-8 items-center justify-between min-w-[260px] max-w-xs mx-auto transition-all duration-300 hover:shadow-xl hover:border-brand-gold/60` +
                (pkg.name === popularPackage ? ' ring-2 ring-brand-gold/60' : '')
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
                      <CheckCircle className="h-5 w-5 text-brand-gold mr-3 mt-0.5 flex-shrink-0" />
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
            className="bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT font-semibold rounded-2xl px-8 py-4 text-lg shadow-lg"
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
    </div>
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