export const dynamic = "force-dynamic"

import { getUniversitySchools, getUniversityCourses } from "@/lib/database"
import { UniversityClient } from "@/app/client/[slug]/university/UniversityClient"
import Image from "next/image"
import Link from "next/link"

export default async function PublicLabsPage() {
  const [schools, allCourses] = await Promise.all([
    getUniversitySchools(),
    getUniversityCourses(),
  ])

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#060520" }}>
      <header className="bg-[#010124] border-b border-brand-gold fixed top-0 left-0 right-0 w-full z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center space-x-4 min-w-0">
              <Image
                src="/hubflo-logo.png"
                alt="Hubflo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain flex-shrink-0"
              />
              <span className="text-xl font-bold text-white truncate">Hubflo Labs</span>
            </Link>
            <Link
              href="/"
              className="text-brand-gold hover:text-brand-gold-hover text-sm font-medium flex-shrink-0"
            >
              ← Hubflo home
            </Link>
          </div>
        </div>
      </header>

      <div className="mt-16">
        <UniversityClient
          progressStorage="local"
          schools={schools}
          courses={allCourses}
          clientProgress={[]}
          certificates={[]}
          onboarding={null}
          onboardingQuestions={[]}
        />
      </div>
    </div>
  )
}
