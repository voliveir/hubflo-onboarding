import { NextRequest, NextResponse } from "next/server"
import { getClientById } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    console.log(`[API] Fetching client with ID: ${id}`)
    const client = await getClientById(id)
    
    if (!client) {
      console.log(`[API] Client not found: ${id}`)
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    console.log(`[API] Client found: ${client.name}`)
    return NextResponse.json(client, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    })
  } catch (error: any) {
    console.error("[API] Error fetching client:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
}

