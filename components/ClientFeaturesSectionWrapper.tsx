"use client"

import { ClientFeaturesSection } from "./client-features-section"
import type { ClientFeature } from "@/lib/types"

interface ClientFeaturesSectionWrapperProps {
  features: ClientFeature[]
}

export function ClientFeaturesSectionWrapper({ features }: ClientFeaturesSectionWrapperProps) {
  return <ClientFeaturesSection features={features} />
} 