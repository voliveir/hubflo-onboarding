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
 * Compute recommended school IDs (flat) and by phase from onboarding questions and client responses.
 * Each question has a phase (1, 2, or 3); when the user's answer recommends schools, those go into that phase.
 */
function computeRecommendations(
  questions: UniversityOnboardingQuestion[],
  responses: Record<string, string | string[]>
): { flat: string[]; byPhase: Record<string, string[]> } {
  const byPhase: Record<string, string[]> = { "1": [], "2": [], "3": [] }
  const allIds = new Set<string>()

  for (const q of questions) {
    const raw = responses[q.question_key]
    if (raw == null) continue
    const values = Array.isArray(raw) ? raw : [raw]
    const phaseKey = String(q.phase >= 1 && q.phase <= 3 ? q.phase : 1)
    const phaseSet = new Set<string>(byPhase[phaseKey])

    for (const opt of q.options || []) {
      if (values.includes(opt.value) && Array.isArray(opt.recommended_school_ids)) {
        for (const id of opt.recommended_school_ids) {
          allIds.add(id)
          phaseSet.add(id)
        }
      }
    }
    byPhase[phaseKey] = Array.from(phaseSet)
  }

  return { flat: Array.from(allIds), byPhase }
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
    const { flat: recommendedSchoolIds, byPhase: recommendedByPhase } = computeRecommendations(
      questions,
      responses
    )

    const onboarding = await upsertClientOnboarding(
      client.id,
      responses,
      recommendedSchoolIds,
      recommendedByPhase
    )

    return NextResponse.json({
      completed: true,
      recommended_school_ids: onboarding.recommended_school_ids,
      recommended_school_ids_by_phase: onboarding.recommended_school_ids_by_phase,
    })
  } catch (error) {
    console.error("Error in POST /api/client/[id]/university/onboarding:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
