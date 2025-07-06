"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"
import { cn } from "@/lib/utils"
import type { ClientFeature } from "@/lib/types"

interface ClientFeaturesSectionProps {
  features: ClientFeature[]
}

export function ClientFeaturesSection({ features }: ClientFeaturesSectionProps) {
  const { ref, isVisible } = useReveal()

  if (features.length === 0) {
    return (
      <div ref={ref} className={cn("text-center py-8", isVisible && "animate-fade-in-up")}>
        <div className="mx-auto w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center mb-4 border border-brand-gold/20">
          <Star className="w-8 h-8 text-brand-gold" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Features Available</h3>
        <p className="text-white/80">No features have been proposed or approved for your account yet.</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "proposed":
        return (
          <Badge variant="secondary" className="bg-brand-gold/20 text-brand-gold border-brand-gold/40">
            <AlertCircle className="w-3 h-3 mr-1" />
            Proposed
          </Badge>
        )
      case "interested":
        return (
          <Badge variant="secondary" className="bg-brand-gold/20 text-brand-gold border-brand-gold/40">
            <Clock className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-brand-gold/20 text-brand-gold border-brand-gold/40">
            <Star className="w-3 h-3 mr-1" />
            Coming Soon
          </Badge>
        )
      case "implementing":
        return (
          <Badge variant="secondary" className="bg-brand-gold/20 text-brand-gold border-brand-gold/40">
            <Clock className="w-3 h-3 mr-1" />
            In Development
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-brand-gold/20 text-brand-gold border-brand-gold/40">
            <CheckCircle className="w-3 h-3 mr-1" />
            Available Now
          </Badge>
        )
      default:
        return <Badge variant="secondary" className="bg-brand-gold/20 text-brand-gold border-brand-gold/40">{status}</Badge>
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "proposed":
        return "This feature has been proposed for your account. We're evaluating its implementation."
      case "interested":
        return "You've expressed interest in this feature. Our team is reviewing the requirements."
      case "approved":
        return "This feature has been approved and will be available soon."
      case "implementing":
        return "This feature is currently being developed and will be available soon."
      case "completed":
        return "This feature is now available and ready to use."
      default:
        return ""
    }
  }

  return (
    <div ref={ref} className={cn("space-y-6", isVisible && "animate-fade-in-up")}>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Available Features</h2>
        <p className="text-white/80">
          Explore features that have been proposed, approved, or are available for your account.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((clientFeature) => {
          const feature = clientFeature.feature
          if (!feature) return null

          return (
            <div key={clientFeature.id} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 p-6 h-full flex flex-col transition-all duration-300 hover:border-brand-gold/40 hover:shadow-lg">
              <div className="flex-shrink-0 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    {getStatusBadge(clientFeature.status)}
                  </div>
                  {clientFeature.is_featured && (
                    <div className="w-6 h-6 bg-brand-gold/20 rounded-lg flex items-center justify-center border border-brand-gold/40 flex-shrink-0 ml-2">
                      <Star className="w-4 h-4 text-brand-gold" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-white/80 mt-2">{getStatusDescription(clientFeature.status)}</p>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex-1">
                  <p className="text-white/90 mb-4">{feature.description}</p>

                  {clientFeature.custom_notes && (
                    <div className="bg-brand-gold/10 border border-brand-gold/40 rounded-2xl p-3 mb-4">
                      <p className="text-sm text-white/90">
                        <strong>Note:</strong> {clientFeature.custom_notes}
                      </p>
                    </div>
                  )}

                  {feature.category && (
                    <div className="mb-4">
                      <Badge variant="outline" className="text-xs text-white/80 border-white/20">
                        {feature.category}
                      </Badge>
                    </div>
                  )}
                </div>

                {feature.demo_url && clientFeature.status === "completed" && (
                  <div className="mt-auto pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
                      onClick={() => window.open(feature.demo_url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Access Demo
                    </Button>
                  </div>
                )}

                {feature.documentation_url && (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                      onClick={() => window.open(feature.documentation_url, "_blank")}
                    >
                      View Documentation
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
