"use client"

import { ClientIntegrationsSection } from "./client-integrations-section"

interface ClientIntegrationsSectionWrapperProps {
  clientId: string
  clientName: string
  integrations?: any[]
  showDefault?: boolean
  successPackage?: string
  calendarIntegrationsCall?: string
}

export function ClientIntegrationsSectionWrapper(props: ClientIntegrationsSectionWrapperProps) {
  return <ClientIntegrationsSection {...props} calendarIntegrationsCall={props.calendarIntegrationsCall} />
} 