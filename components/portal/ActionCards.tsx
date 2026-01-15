'use client'

import { Mail, Layout, Calendar, ExternalLink, Rocket } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/utils'

interface ActionCardsProps {
  successPackage: string
  implementationManager?: 'vanessa' | 'vishal'
  calendarScheduleCall?: string
  calendarContactSuccess?: string
  calendarIntegrationsCall?: string
  calendarUpgradeConsultation?: string
  hideUpsells?: boolean
  onlyUpsells?: boolean
}

export function ActionCards({ successPackage, implementationManager = 'vanessa', calendarScheduleCall, calendarContactSuccess, calendarIntegrationsCall, calendarUpgradeConsultation, hideUpsells = false, onlyUpsells = false }: ActionCardsProps) {
  const { ref, isVisible } = useReveal()

  const actions = [
    {
      title: "Access your Hubflo Admin Workspace",
      icon: Mail,
      description: "Log into your Hubflo Admin Workspace and start exploring!",
      href: "https://app.hubflo.com",
      buttonText: "Access Workspace"
    },
    {
      title: "Complete Onboarding Checklist",
      icon: Layout,
      description: "Work through the essential setup tasks to get your Hubflo workspace ready for your business needs!",
      href: "#next-steps",
      buttonText: "Start Setup"
    },
    ...(successPackage.toLowerCase() === "light" ? [{
      title: "Go-Live!",
      icon: Rocket,
      description: "Beta test on 2-3 clients for a few weeks and iterate as you get client feedback!"
    }] : []),
    ...(successPackage.toLowerCase() !== "light" ? [{
      title: "Schedule Your Next Onboarding Call",
      icon: Calendar,
      description: "Book your next onboarding call once you've completed your tasks and are ready to proceed to automations and integrations (as well as any questions lingering from your initial play around in Hubflo!)",
      href: calendarIntegrationsCall || "https://calendly.com/vanessa-hubflo/integration-call",
      buttonText: "Schedule Call"
    }] : []),
  ]

  return (
    <div 
      ref={ref}
      className={cn(
        "grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto",
        isVisible && "animate-fade-in-up"
      )}
    >
      {actions.map((action, index) => (
        <div
          key={action.title}
          className={cn(
            "flex flex-col h-full min-h-[400px] text-center bg-white rounded-2xl p-8 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300",
            isVisible && "animate-fade-in-up"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
              <action.icon className="h-6 w-6 text-brand-gold" />
            </div>
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#060520' }}>{action.title}</h3>
          </div>
          
          <p className="mb-6 flex-grow text-center text-base" style={{ color: '#64748b' }}>
            {action.description}
          </p>
          
          {action.href && action.buttonText && (
            action.href.startsWith('#') ? (
              <button
                type="button"
                onClick={() => {
                  const el = document.querySelector(action.href);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full mt-auto bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT font-semibold rounded-2xl px-6 py-3 text-center block transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                {action.buttonText}
                <ExternalLink className="h-4 w-4" />
              </button>
            ) : (
              <a
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-auto bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT font-semibold rounded-2xl px-6 py-3 text-center block transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                {action.buttonText}
                <ExternalLink className="h-4 w-4" />
              </a>
            )
          )}
        </div>
      ))}
    </div>
  )
} 