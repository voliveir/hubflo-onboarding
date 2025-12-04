import { NextRequest, NextResponse } from "next/server"
import { getAllClients, getClientById } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('id')
    
    // If clientId is provided, return full client data
    if (clientId) {
      try {
        console.log(`[clients-list] Fetching client with ID: ${clientId}`)
        const client = await getClientById(clientId)
        
        if (!client) {
          console.log(`[clients-list] Client not found: ${clientId}`)
          return NextResponse.json({ error: "Client not found" }, { status: 404 })
        }
        
        console.log(`[clients-list] Client found: ${client.name} (${client.id})`)
        return NextResponse.json(client, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
          }
        })
      } catch (error: any) {
        console.error(`[clients-list] Error fetching client ${clientId}:`, error)
        return NextResponse.json(
          { error: error?.message || "Failed to fetch client" },
          { status: 500 }
        )
      }
    }
    
    // Otherwise, return list of clients with id, name, and revenue_amount
    const clients = await getAllClients()
    return NextResponse.json(
      clients
        .filter((c) => !c.is_demo)
        .map((c) => ({
          id: c.id,
          name: c.name,
          revenue_amount: c.revenue_amount,
        }))
    )
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

