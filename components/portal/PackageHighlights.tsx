'use client'

import { Users, Zap, FileText, Settings } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/utils'

interface PackageHighlightsProps {
  successPackage: string
}

export function PackageHighlights({ successPackage }: PackageHighlightsProps) {
  const { ref, isVisible } = useReveal()

  const getPackageFeature = (type: 'calls' | 'integrations' | 'forms' | 'support') => {
    switch (type) {
      case 'calls':
        return successPackage === "elite" ? "Unlimited Calls" : 
               successPackage === "gold" ? "Up to 3 Calls" : 
               successPackage === "premium" ? "2 Calls" : "1 Call"
      case 'integrations':
        return successPackage === "elite" ? "Custom Integrations" : 
               successPackage === "gold" ? "Advanced Zapier" : 
               successPackage === "premium" ? "Basic Zapier" : "Video Tutorials"
      case 'forms':
        return successPackage === "elite" ? "Full Migration" : 
               successPackage === "gold" ? "Up to 4 Forms/SmartDocs" : 
               successPackage === "premium" ? "Up to 2 Forms/SmartDocs" : "Chat Support"
      case 'support':
        return successPackage === "elite" ? "Dedicated Manager" : 
               successPackage === "gold" ? "Priority Support" : 
               successPackage === "premium" ? "Priority Support" : "Standard Support"
      default:
        return ""
    }
  }

  const getPackageDescription = (type: 'calls' | 'integrations' | 'forms' | 'support') => {
    switch (type) {
      case 'calls':
        return "Personal guidance from our onboarding specialists"
      case 'integrations':
        return successPackage === "elite" ? "API and partner tool integrations" :
               successPackage === "gold" ? "Advanced workflows and integrations" :
               successPackage === "premium" ? "Basic automation setup" :
               "Self-guided learning resources"
      case 'forms':
        return successPackage === "elite" ? "Complete data migration assistance" :
               successPackage === "gold" ? "Advanced form and document setup" :
               successPackage === "premium" ? "Basic form and document setup" :
               "Real-time chat assistance"
      case 'support':
        return successPackage === "elite" ? "Direct Slack access to account manager" :
               successPackage === "gold" ? "Priority support during onboarding" :
               successPackage === "premium" ? "Priority support during onboarding" :
               "Standard support channels"
      default:
        return ""
    }
  }

  const features = [
    { icon: Users, type: 'calls' as const },
    { icon: Zap, type: 'integrations' as const },
    { icon: FileText, type: 'forms' as const },
    { icon: Settings, type: 'support' as const },
  ]

  return (
    <div 
      ref={ref}
      className={cn(
        "grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto items-stretch",
        isVisible && "animate-fade-in-up"
      )}
    >
      {features.map((feature, index) => (
        <div
          key={feature.type}
          className={cn(
            "text-center h-full min-h-[260px] bg-white rounded-2xl p-8 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300",
            isVisible && "animate-fade-in-up",
            isVisible && `animation-delay-${index * 100}`
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex flex-col items-center mb-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
              <feature.icon className="h-6 w-6 text-brand-gold" />
            </div>
            <div className="font-bold text-2xl mb-2" style={{ color: '#060520' }}>
              {getPackageFeature(feature.type)}
            </div>
          </div>
          <p className="text-sm" style={{ color: '#64748b' }}>
            {getPackageDescription(feature.type)}
          </p>
        </div>
      ))}
    </div>
  )
} 