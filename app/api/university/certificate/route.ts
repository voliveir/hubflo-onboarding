import { NextRequest, NextResponse } from "next/server"
import { createClientCertificate, getClientCertificates } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID is required" },
        { status: 400 }
      )
    }

    const certificates = await getClientCertificates(clientId)
    return NextResponse.json({ success: true, data: certificates })
  } catch (error: any) {
    console.error("Error fetching certificates:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, courseId, certificateUrl } = await req.json()

    if (!clientId || !courseId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const certificate = await createClientCertificate(clientId, courseId, certificateUrl)
    return NextResponse.json({ success: true, data: certificate })
  } catch (error: any) {
    console.error("Error creating certificate:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
