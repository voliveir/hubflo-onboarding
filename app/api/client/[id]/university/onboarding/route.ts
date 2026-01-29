import { NextRequest, NextResponse } from "next/server"
import { getClientBySlug } from "@/lib/database"
import {
  getUniversityOnboardingQuestions,
  getClientOnboarding,
  upsertClientOnboarding,
} from "@/lib/database"
import type { UniversityOnboardingQuestion } from "@/lib/types"

export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

/**
 * Compute recommended school and course IDs (flat and by phase) from onboarding questions and client responses.
 * Each question has a phase (1, 2, or 3); when the user's answer recommends schools/courses, those go into that phase.
 */
function computeRecommendations(
  questions: UniversityOnboardingQuestion[],
  responses: Record<string, string | string[]>
): {
  schools: { flat: string[]; byPhase: Record<string, string[]> }
  courses: { flat: string[]; byPhase: Record<string, string[]> }
} {
  const schoolByPhase: Record<string, string[]> = { "1": [], "2": [], "3": [] }
  const courseByPhase: Record<string, string[]> = { "1": [], "2": [], "3": [] }
  const allSchoolIds = new Set<string>()
  const allCourseIds = new Set<string>()

  for (const q of questions) {
    const raw = responses[q.question_key]
    if (raw == null) continue
    const values = Array.isArray(raw) ? raw : [raw]
    const phaseKey = String(q.phase >= 1 && q.phase <= 3 ? q.phase : 1)
    const schoolPhaseSet = new Set<string>(schoolByPhase[phaseKey])
    const coursePhaseSet = new Set<string>(courseByPhase[phaseKey])

    for (const opt of q.options || []) {
      if (!values.includes(opt.value)) continue
      if (Array.isArray(opt.recommended_school_ids)) {
        for (const id of opt.recommended_school_ids) {
          allSchoolIds.add(id)
          schoolPhaseSet.add(id)
        }
      }
      if (Array.isArray(opt.recommended_course_ids)) {
        for (const id of opt.recommended_course_ids) {
          allCourseIds.add(id)
          coursePhaseSet.add(id)
        }
      }
    }
    schoolByPhase[phaseKey] = Array.from(schoolPhaseSet)
    courseByPhase[phaseKey] = Array.from(coursePhaseSet)
  }

  return {
    schools: { flat: Array.from(allSchoolIds), byPhase: schoolByPhase },
    courses: { flat: Array.from(allCourseIds), byPhase: courseByPhase },
  }
}

/**
 * GET - Return onboarding status for this client. Segment can be client slug or id.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params
    const client = await getClientBySlug(id)
    if (!client || !["active", "pending"].includes(client.status)) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    const onboarding = await getClientOnboarding(client.id)
    return NextResponse.json({
      completed: !!onboarding?.completed_at,
      onboarding: onboarding
        ? {
            completed_at: onboarding.completed_at,
            recommended_school_ids: onboarding.recommended_school_ids,
            recommended_school_ids_by_phase: onboarding.recommended_school_ids_by_phase,
            recommended_course_ids: onboarding.recommended_course_ids ?? [],
            recommended_course_ids_by_phase: onboarding.recommended_course_ids_by_phase ?? undefined,
          }
        : null,
    })
  } catch (error) {
    console.error("Error in GET /api/client/[id]/university/onboarding:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST - Submit onboarding form. Body: { responses: Record<string, string | string[]> }
 * Segment can be client slug (from portal URL); we look up by slug.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params
    const client = await getClientBySlug(id)
    if (!client || !["active", "pending"].includes(client.status)) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const body = await request.json()
    const responses = body?.responses ?? {}
    if (typeof responses !== "object") {
      return NextResponse.json(
        { error: "Invalid body: responses must be an object" },
        { status: 400 }
      )
    }

    const questions = await getUniversityOnboardingQuestions()
    const { schools: schoolRecs, courses: courseRecs } = computeRecommendations(questions, responses)

    const onboarding = await upsertClientOnboarding(
      client.id,
      responses,
      schoolRecs.flat,
      schoolRecs.byPhase,
      courseRecs.flat,
      courseRecs.byPhase
    )

    return NextResponse.json({
      completed: true,
      recommended_school_ids: onboarding.recommended_school_ids,
      recommended_school_ids_by_phase: onboarding.recommended_school_ids_by_phase,
      recommended_course_ids: onboarding.recommended_course_ids,
      recommended_course_ids_by_phase: onboarding.recommended_course_ids_by_phase,
    })
  } catch (error) {
    console.error("Error in POST /api/client/[id]/university/onboarding:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
