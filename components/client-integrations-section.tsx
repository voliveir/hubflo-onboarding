"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, ExternalLink, Globe, Settings, Star } from "lucide-react"
import { getClientIntegrations } from "@/lib/database"

interface Integration {
  id: string
  title: string
  description: string
  category: string
  integration_type: "zapier" | "native" | "api"
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
}

export function ClientIntegrationsSection({
  clientId,
  clientName,
  integrations: providedIntegrations,
  showDefault = false,
  successPackage = "premium",
}: ClientIntegrationsSectionProps) {
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
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // If no integrations are selected, show a message
  if (integrations.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Integrations for {clientName}</h2>
            <div className="max-w-2xl mx-auto">
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="p-8 text-center">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Integrations Selected</h3>
                  <p className="text-gray-600 mb-4">
                    Your Implementation Manager will customize and select the most relevant integrations for your
                    workflow during your onboarding process.
                  </p>
                  <Button className="bg-[#010124] hover:bg-[#020135]" asChild>
                    <a
                      href="https://calendly.com/vanessa-hubflo/onboarding-kickoff-with-hubflo-clone"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Schedule Integration Planning Call
                    </a>
                  </Button>
                </CardContent>
              </Card>
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
        return <Zap className="h-5 w-5 text-orange-500" />
      case "native":
        return <Globe className="h-5 w-5 text-blue-500" />
      case "api":
        return <Settings className="h-5 w-5 text-green-500" />
      default:
        return <ExternalLink className="h-5 w-5 text-gray-500" />
    }
  }

  const getIntegrationBadge = (type: string) => {
    switch (type) {
      case "zapier":
        return (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-800 text-xs font-semibold border border-orange-200"
          >
            <Zap className="h-3 w-3 mr-1" />
            ZAPIER
          </Badge>
        )
      case "native":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200">
            <Globe className="h-3 w-3 mr-1" />
            NATIVE
          </Badge>
        )
      case "api":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 text-xs font-semibold border border-green-200"
          >
            <Settings className="h-3 w-3 mr-1" />
            API
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs font-semibold border border-gray-200">
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
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Recommended Integrations for {clientName}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your onboarding discussion, we've curated these integrations to help streamline your workflow and
            automate your processes.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Priority Integrations */}
          {featuredIntegrations.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Star className="text-yellow-500 mr-2 h-5 w-5" />
                Priority Integrations
              </h3>
              <div className="grid gap-6">
                {featuredIntegrations.map((integration) => (
                  <Card key={integration.id} className="border-2 border-yellow-200 bg-yellow-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getIntegrationIcon(integration.integration_type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-900 break-words mb-2">
                              {integration.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Priority {integration.sort_order || 1}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">{getIntegrationBadge(integration.integration_type)}</div>
                      </div>
                      <p className="text-gray-600 mb-4">{integration.description}</p>
                      <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white" asChild>
                        <a href={integration.external_url || "#"} target="_blank" rel="noopener noreferrer">
                          {getButtonText(integration.integration_type)}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Additional Integrations */}
          {additionalIntegrations.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Additional Integrations</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {additionalIntegrations.map((integration) => (
                  <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getIntegrationIcon(integration.integration_type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-900 break-words mb-2">
                              {integration.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              Priority {integration.sort_order || 1}
                            </Badge>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">{getIntegrationBadge(integration.integration_type)}</div>
                      </div>
                      <p className="text-gray-600 mb-4">{integration.description}</p>
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <a href={integration.external_url || "#"} target="_blank" rel="noopener noreferrer">
                          {getButtonText(integration.integration_type)}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Help Section */}
          {successPackage.toLowerCase() === "light" ? (
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Need More Help?</h3>
                <p className="text-gray-600 mb-6">
                  If you need hands-on help setting up integrations, you'll need to upgrade your success package to <strong>Premium</strong>, <strong>Gold</strong>, or <strong>Elite</strong>.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  <strong>Contact support</strong> to discuss upgrading and unlocking advanced onboarding support.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help Setting These Up?</h3>
                <p className="text-gray-600 mb-6">
                  Our implementation team can help configure these integrations during your onboarding calls.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  <strong>Note:</strong> Advanced integration setup is included with Premium, Gold, and Elite packages.
                </p>
                <Button className="bg-[#010124] hover:bg-[#020135] text-white" asChild>
                  <a
                    href="https://calendly.com/vanessa-hubflo/onboarding-kickoff-with-hubflo-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Schedule Integration Call
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
