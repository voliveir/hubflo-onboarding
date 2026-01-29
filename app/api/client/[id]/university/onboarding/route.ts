import { NextRequest, NextResponse } from "next/server"
import { getClientBySlug } from "@/lib/database"
import {
  getUniversityOnboardingQuestions,
  getClientOnboarding,
  upsertClientOnboarding,
  getUniversitySchools,
  getUniversityCourses,
} from "@/lib/database"
import type { UniversityOnboardingQuestion } from "@/lib/types"
import type { UniversitySchool } from "@/lib/types"

export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

/**
 * Check if the response for a question is considered "yes" (for conditional program rules).
 */
function responseIsYes(value: string | string[] | undefined): boolean {
  if (value == null) return false
  const v = Array.isArray(value) ? value[0] : value
  return String(v).toLowerCase() === "yes"
}

/**
 * Compute recommended school and course IDs (flat and by phase) from onboarding questions and client responses.
 * School phase comes from the program (school.phase) when available so admins can place programs in Phase 1, 2, or 3.
 * If schoolsWithConditions is provided, any school with recommend_when_yes_to_question_keys is added when the client
 * answered Yes to every one of those questions.
 */
function computeRecommendations(
  questions: UniversityOnboardingQuestion[],
  responses: Record<string, string | string[]>,
  schoolsWithConditions?: UniversitySchool[]
): {
  schools: { flat: string[]; byPhase: Record<string, string[]> }
  courses: { flat: string[]; byPhase: Record<string, string[]> }
  schoolIdsAddedByCondition: string[]
} {
  const schoolByPhase: Record<string, string[]> = { "1": [], "2": [], "3": [] }
  const courseByPhase: Record<string, string[]> = { "1": [], "2": [], "3": [] }
  const allSchoolIds = new Set<string>()
  const allCourseIds = new Set<string>()
  const schoolIdsAddedByCondition: string[] = []
  const schoolMap = new Map<string, UniversitySchool>()
  if (schoolsWithConditions) for (const s of schoolsWithConditions) schoolMap.set(s.id, s)

  const toPhaseKey = (phase: number) => String(phase >= 1 && phase <= 3 ? phase : 1)

  for (const q of questions) {
    const raw = responses[q.question_key]
    if (raw == null) continue
    const values = Array.isArray(raw) ? raw : [raw]
    const questionPhaseKey = toPhaseKey(q.phase >= 1 && q.phase <= 3 ? q.phase : 1)
    const coursePhaseSet = new Set<string>(courseByPhase[questionPhaseKey])

    for (const opt of q.options || []) {
      if (!values.includes(opt.value)) continue
      if (Array.isArray(opt.recommended_school_ids)) {
        for (const id of opt.recommended_school_ids) {
          allSchoolIds.add(id)
          const school = schoolMap.get(id)
          const phaseKey = school ? toPhaseKey(school.phase ?? 1) : questionPhaseKey
          schoolByPhase[phaseKey] = [...new Set([...schoolByPhase[phaseKey], id])]
        }
      }
      if (Array.isArray(opt.recommended_course_ids)) {
        for (const id of opt.recommended_course_ids) {
          allCourseIds.add(id)
          coursePhaseSet.add(id)
        }
      }
    }
    courseByPhase[questionPhaseKey] = Array.from(coursePhaseSet)
  }

  // Conditional program rules: recommend this program when client said Yes to all specified questions
  if (schoolsWithConditions && schoolsWithConditions.length > 0) {
    for (const school of schoolsWithConditions) {
      const keys = school.recommend_when_yes_to_question_keys
      if (!keys || keys.length === 0) continue
      const allYes = keys.every((key) => responseIsYes(responses[key]))
      if (allYes) {
        allSchoolIds.add(school.id)
        schoolIdsAddedByCondition.push(school.id)
        const phaseKey = toPhaseKey(school.phase ?? 1)
        schoolByPhase[phaseKey] = [...new Set([...schoolByPhase[phaseKey], school.id])]
      }
    }
  }

  return {
    schools: { flat: Array.from(allSchoolIds), byPhase: schoolByPhase },
    courses: { flat: Array.from(allCourseIds), byPhase: courseByPhase },
    schoolIdsAddedByCondition,
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

    const [questions, schools, allCourses] = await Promise.all([
      getUniversityOnboardingQuestions(),
      getUniversitySchools(),
      getUniversityCourses(),
    ])
    const { schools: schoolRecs, courses: courseRecs, schoolIdsAddedByCondition } = computeRecommendations(
      questions,
      responses,
      schools
    )

    // When any program is recommended, remove its courses from the course list so only programs show (no redundant courses)
    const recommendedSchoolIds = new Set(schoolRecs.flat)
    const courseIdsToRemove = new Set(
      allCourses.filter((c) => recommendedSchoolIds.has(c.school_id)).map((c) => c.id)
    )
    const filteredCourseFlat = courseRecs.flat.filter((id) => !courseIdsToRemove.has(id))
    const filteredCourseByPhase: Record<string, string[]> = {
      "1": courseRecs.byPhase["1"].filter((id) => !courseIdsToRemove.has(id)),
      "2": courseRecs.byPhase["2"].filter((id) => !courseIdsToRemove.has(id)),
      "3": courseRecs.byPhase["3"].filter((id) => !courseIdsToRemove.has(id)),
    }

    const onboarding = await upsertClientOnboarding(
      client.id,
      responses,
      schoolRecs.flat,
      schoolRecs.byPhase,
      filteredCourseFlat,
      filteredCourseByPhase
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
