import { NextRequest, NextResponse } from "next/server"
import { getUniversityCourse } from "@/lib/database"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      )
    }

    const course = await getUniversityCourse(id)

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: course })
  } catch (error: any) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
