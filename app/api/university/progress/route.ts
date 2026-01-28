import { NextRequest, NextResponse } from "next/server"
import { updateClientUniversityProgress, getClientUniversityProgress } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get("clientId")
    const courseId = searchParams.get("courseId")
    const lectureId = searchParams.get("lectureId")

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID is required" },
        { status: 400 }
      )
    }

    const progress = await getClientUniversityProgress(clientId, courseId || undefined)
    return NextResponse.json({ success: true, data: progress })
  } catch (error: any) {
    console.error("Error fetching progress:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, lectureId, courseId, progress } = await req.json()

    if (!clientId || !lectureId || !courseId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await updateClientUniversityProgress(
      clientId,
      lectureId,
      courseId,
      progress
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Error updating progress:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
