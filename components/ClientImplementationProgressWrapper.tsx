"use client"

import { ClientImplementationProgress } from "./client-implementation-progress"
import type { Client } from "@/lib/types"

interface ClientImplementationProgressWrapperProps {
  client: Client
}

export function ClientImplementationProgressWrapper({ client }: ClientImplementationProgressWrapperProps) {
  return <ClientImplementationProgress client={client} />
} 