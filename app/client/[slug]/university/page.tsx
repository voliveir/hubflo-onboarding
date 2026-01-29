export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import {
  getClientBySlug,
  getUniversitySchools,
  getUniversityCourses,
  getClientUniversityProgress,
  getClientCertificates,
  getClientOnboarding,
  getUniversityOnboardingQuestions,
} from "@/lib/database"
import { UniversityClient } from "./UniversityClient"
import Image from "next/image"

interface UniversityPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function UniversityPage({ params }: UniversityPageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  
  const client = await getClientBySlug(slug)

  if (!client) {
    notFound()
  }

  // Only show active or pending clients
  if (!["active", "pending"].includes(client.status)) {
    notFound()
  }

  // Fetch University data and onboarding (for first-time form and recommended programs)
  const [schools, allCourses, clientProgress, certificates, onboarding, onboardingQuestions] =
    await Promise.all([
      getUniversitySchools(),
      getUniversityCourses(),
      getClientUniversityProgress(client.id),
      getClientCertificates(client.id),
      getClientOnboarding(client.id),
      getUniversityOnboardingQuestions(),
    ])

  // Create a progress map for quick lookup
  const progressMap = new Map(
    clientProgress.map(p => [p.lecture_id || p.course_id, p])
  )

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
              {client.logo_url ? (
                <Image
                  src={client.logo_url || "/placeholder.svg"}
                  alt={`${client.name} logo`}
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              ) : (
                <span className="text-lg font-semibold text-white">{client.name}</span>
              )}
            </div>
            <a
              href={`/client/${slug}`}
              className="text-brand-gold hover:text-brand-gold-hover text-sm font-medium"
            >
              ← Back to Portal
            </a>
          </div>
        </div>
      </header>

      {/* Main Content – tighter top spacing so "Back to Course" sits closer to header */}
      <div className="mt-16">
        <UniversityClient
          clientId={client.id}
          clientSlug={slug}
          clientName={client.name}
          schools={schools}
          courses={allCourses}
          clientProgress={clientProgress}
          certificates={certificates}
          onboarding={onboarding}
          onboardingQuestions={onboardingQuestions}
        />
      </div>
    </div>
  )
}
