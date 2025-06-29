import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star, Clock, CheckCircle, AlertCircle } from "lucide-react"
import type { ClientFeature } from "@/lib/types"

interface ClientFeaturesSectionProps {
  features: ClientFeature[]
}

export function ClientFeaturesSection({ features }: ClientFeaturesSectionProps) {
  if (features.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Features Available</h3>
        <p className="text-gray-500">No features have been proposed or approved for your account yet.</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "proposed":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Proposed
          </Badge>
        )
      case "interested":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            <Star className="w-3 h-3 mr-1" />
            Coming Soon
          </Badge>
        )
      case "implementing":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="w-3 h-3 mr-1" />
            In Development
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Available Now
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Features</h2>
        <p className="text-gray-600">
          Explore features that have been proposed, approved, or are available for your account.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((clientFeature) => {
          const feature = clientFeature.feature
          if (!feature) return null

          return (
            <Card key={clientFeature.id} className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                    {getStatusBadge(clientFeature.status)}
                  </div>
                  {clientFeature.is_featured && (
                    <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0 ml-2" />
                  )}
                </div>
                <CardDescription className="text-sm">{getStatusDescription(clientFeature.status)}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1">
                  <p className="text-gray-600 mb-4">{feature.description}</p>

                  {clientFeature.custom_notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> {clientFeature.custom_notes}
                      </p>
                    </div>
                  )}

                  {feature.category && (
                    <div className="mb-4">
                      <Badge variant="outline" className="text-xs">
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
                      className="w-full bg-transparent"
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
                      className="w-full text-xs"
                      onClick={() => window.open(feature.documentation_url, "_blank")}
                    >
                      View Documentation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
