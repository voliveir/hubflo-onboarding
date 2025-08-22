"use client"

import { useState, useEffect } from "react"
import { ImplementationMilestonesRoad } from "./implementation-milestones-road"
import { getClientMilestones } from "@/lib/database"
import type { Client } from "@/lib/types"

interface ImplementationMilestonesRoadWrapperProps {
  client: Client
}

export function ImplementationMilestonesRoadWrapper({ client }: ImplementationMilestonesRoadWrapperProps) {
  const [milestones, setMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMilestones = async () => {
      try {
        const milestonesData = await getClientMilestones(client.id)
        setMilestones(milestonesData || [])
      } catch (error) {
        console.error("Error loading milestones:", error)
        setMilestones([])
      } finally {
        setLoading(false)
      }
    }

    loadMilestones()
  }, [client.id])

  // Don't render anything if loading or no milestones
  if (loading || milestones.length === 0) {
    return null
  }

  return <ImplementationMilestonesRoad client={client} />
}
