"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, ExternalLink, Globe, Settings, Star } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"
import { cn } from "@/lib/utils"
import { getClientIntegrations } from "@/lib/database"

interface Integration {
  id: string
  title: string
  description: string
  category: string
  integration_type: "zapier" | "native" | "api" | "makecom"
  external_url?: string
  is_featured?: boolean
  sort_order?: number
}

interface ClientIntegrationsSectionProps {
  clientId: string
  clientName: string
  integrations?: Integration[]
  showDefault?: boolean
  successPackage?: string
  calendarIntegrationsCall?: string
}

export function ClientIntegrationsSection({
  clientId,
  clientName,
  integrations: providedIntegrations,
  showDefault = false,
  successPackage = "premium",
  calendarIntegrationsCall,
}: ClientIntegrationsSectionProps) {
  const { ref, isVisible } = useReveal()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("ClientIntegrationsSection useEffect triggered", {
      clientId,
      showDefault,
      providedIntegrations: providedIntegrations?.length || 0,
    })

    // If integrations are provided, use them
    if (providedIntegrations && providedIntegrations.length > 0) {
      console.log("Using provided integrations:", providedIntegrations.length)
      setIntegrations(providedIntegrations)
      setLoading(false)
      return
    }

    // Fetch client-specific integrations
    const fetchClientIntegrations = async () => {
      if (!clientId || clientId === "undefined") {
        console.log("No valid client ID, showing empty state")
        setIntegrations([])
        setLoading(false)
        return
      }

      try {
        const clientIntegrations = await getClientIntegrations(clientId)
        console.log("Fetched client integrations:", clientIntegrations.length)

        // Transform client integrations to the expected format
        const transformedIntegrations = clientIntegrations
          .filter((ci) => ci.is_enabled)
          .sort((a, b) => {
            // Sort by featured first, then by sort_order (priority)
            if (a.is_featured && !b.is_featured) return -1
            if (!a.is_featured && b.is_featured) return 1
            return (a.sort_order || 1) - (b.sort_order || 1)
          })
          .map((ci) => ({
            id: ci.id,
            title: ci.title,
            description: ci.description || "",
            category: ci.category,
            integration_type: ci.integration_type,
            external_url: ci.external_url,
            is_featured: ci.is_featured,
            sort_order: ci.sort_order,
          }))

        setIntegrations(transformedIntegrations)
      } catch (error) {
        console.error("Error fetching client integrations:", error)
        setIntegrations([])
      } finally {
        setLoading(false)
      }
    }

    fetchClientIntegrations()
  }, [clientId, providedIntegrations, showDefault])

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-white/20 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // If no integrations are selected, show a message
  if (integrations.length === 0) {
    return (
      <section ref={ref} className={cn("py-16 px-4", isVisible && "animate-fade-in-up")}>
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Integrations for {clientName}</h2>
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 p-8 text-center">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/20 mx-auto mb-4">
                  <Settings className="h-8 w-8 text-brand-gold" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Integrations Selected</h3>
                <p className="text-white/80 mb-6">
                  Your Implementation Manager will customize and select the most relevant integrations for your
                  workflow during your onboarding process.
                </p>
                <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-DEFAULT transition-all duration-200 hover:scale-105" asChild>
                  <a
                    href="https://app.hubflo.com/forms/da0484e6-3211-466a-b2cd-483fcad141d8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Submit a Integration Request
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const featuredIntegrations = integrations.filter((integration) => integration.is_featured)
  const additionalIntegrations = integrations.filter((integration) => !integration.is_featured)

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "zapier":
        return <Zap className="h-5 w-5 text-brand-gold" />
      case "native":
        return <Globe className="h-5 w-5 text-brand-gold" />
      case "api":
        return <Settings className="h-5 w-5 text-brand-gold" />
      default:
        return <ExternalLink className="h-5 w-5 text-brand-gold" />
    }
  }

  const getIntegrationBadge = (type: string) => {
    switch (type) {
      case "zapier":
        return (
          <Badge
            variant="secondary"
            className="bg-brand-gold/20 text-brand-gold text-xs font-semibold border border-brand-gold/40"
          >
            <Zap className="h-3 w-3 mr-1" />
            ZAPIER
          </Badge>
        )
      case "native":
        return (
          <Badge variant="secondary" className="bg-brand-gold/20 text-brand-gold text-xs font-semibold border border-brand-gold/40">
            <Globe className="h-3 w-3 mr-1" />
            NATIVE
          </Badge>
        )
      case "api":
        return (
          <Badge
            variant="secondary"
            className="bg-brand-gold/20 text-brand-gold text-xs font-semibold border border-brand-gold/40"
          >
            <Settings className="h-3 w-3 mr-1" />
            API
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-brand-gold/20 text-brand-gold text-xs font-semibold border border-brand-gold/40">
            <ExternalLink className="h-3 w-3 mr-1" />
            INTEGRATION
          </Badge>
        )
    }
  }

  const getButtonText = (type: string) => {
    switch (type) {
      case "native":
        return "Configure Feature"
      case "api":
        return "Setup API Connection"
      default:
        return "Set Up Automation"
    }
  }

  return (
    <section ref={ref} className={cn("py-16 px-4", isVisible && "animate-fade-in-up")}>
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Recommended Integrations for {clientName}</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Based on your onboarding discussion, we've curated these integrations to help streamline your workflow and
            automate your processes.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Priority Integrations */}
          {featuredIntegrations.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <div className="w-6 h-6 bg-brand-gold/20 rounded-lg flex items-center justify-center border border-brand-gold/40 mr-2">
                  <Star className="text-brand-gold h-4 w-4" />
                </div>
                Priority Integrations
              </h3>
              <div className="grid gap-6">
                {featuredIntegrations.map((integration) => (
                  <div key={integration.id} className="bg-[#10122b]/90 text-white rounded-3xl border border-brand-gold/40 p-6 transition-all duration-300 hover:border-brand-gold/60 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center border border-brand-gold/40">
                          {getIntegrationIcon(integration.integration_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-white break-words mb-2">
                            {integration.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-brand-gold/20 text-brand-gold text-xs border border-brand-gold/40">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                            <Badge variant="outline" className="text-xs text-white/80 border-white/20">
                              Priority {integration.sort_order || 1}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">{getIntegrationBadge(integration.integration_type)}</div>
                    </div>
                    <p className="text-white/80 mb-4">{integration.description}</p>
                    <Button className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-DEFAULT transition-all duration-200 hover:scale-105" asChild>
                      <a href={integration.external_url || "#"} target="_blank" rel="noopener noreferrer">
                        {getButtonText(integration.integration_type)}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Integrations */}
          {additionalIntegrations.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Additional Integrations</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {additionalIntegrations.map((integration) => (
                  <div key={integration.id} className="bg-[#10122b]/90 text-white rounded-3xl border border-brand-gold/30 p-6 transition-all duration-300 hover:border-brand-gold/60 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center border border-brand-gold/40">
                          {getIntegrationIcon(integration.integration_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-white break-words mb-2">
                            {integration.title}
                          </h4>
                          <Badge variant="outline" className="text-xs text-white/80 border-white/20">
                            Priority {integration.sort_order || 1}
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">{getIntegrationBadge(integration.integration_type)}</div>
                    </div>
                    <p className="text-white/80 mb-4">{integration.description}</p>
                    <Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 transition-all duration-200 hover:scale-105" asChild>
                      <a href={integration.external_url || "#"} target="_blank" rel="noopener noreferrer">
                        {getButtonText(integration.integration_type)}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Section */}
          {successPackage.toLowerCase() === "light" ? (
            <div className="bg-[#10122b]/90 text-white rounded-3xl border border-brand-gold/40 p-8 text-center transition-all duration-300 hover:border-brand-gold/60 hover:shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Need More Help?</h3>
              <p className="text-white/80 mb-6">
                If you need hands-on help setting up integrations, you'll need to upgrade your success package to <strong>Premium</strong>, <strong>Gold</strong>, or <strong>Elite</strong>.
              </p>
              <p className="text-sm text-white/60 mb-6">
                <strong>Contact support</strong> to discuss upgrading and unlocking advanced onboarding support.
              </p>
            </div>
          ) : (
            <div className="bg-[#10122b]/90 text-white rounded-3xl border border-brand-gold/40 p-8 text-center transition-all duration-300 hover:border-brand-gold/60 hover:shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Need Help Setting These Up?</h3>
              <p className="text-white/80 mb-6">
                Our implementation team can help configure these integrations during your onboarding calls.
              </p>
              <p className="text-sm text-white/60 mb-6">
                <strong>Note:</strong> Advanced integration setup is included with Premium, Gold, and Elite packages.
              </p>
              <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-DEFAULT transition-all duration-200 hover:scale-105" asChild>
                <a
                  href="https://app.hubflo.com/forms/da0484e6-3211-466a-b2cd-483fcad141d8"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Submit a Integration Request
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
