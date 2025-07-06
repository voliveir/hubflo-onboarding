'use client'

import { Mail, Layout, Calendar, ExternalLink } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/utils'

interface ActionCardsProps {
  successPackage: string
  implementationManager?: 'vanessa' | 'vishal'
  calendarScheduleCall?: string
  calendarUpgradeConsultation?: string
  hideUpsells?: boolean
  onlyUpsells?: boolean
}

export function ActionCards({ successPackage, implementationManager = 'vanessa', calendarScheduleCall, calendarUpgradeConsultation, hideUpsells = false, onlyUpsells = false }: ActionCardsProps) {
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
      href: "https://hubflo-onboarding.hubflo.com/",
      buttonText: "Start Setup"
    },
    ...(successPackage.toLowerCase() !== "light" ? [{
      title: "Schedule Your Next Onboarding Call",
      icon: Calendar,
      description: "Book your next onboarding call once you've completed your tasks and are ready to proceed to automations and integrations (as well as any questions lingering from your initial play around in Hubflo!)",
      href: calendarScheduleCall || "https://calendly.com/vanessa-hubflo/onboarding-kickoff-with-hubflo-clone",
      buttonText: "Schedule Call"
    }] : [])
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
            "flex flex-col h-full min-h-[400px] text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:border-brand-gold/40 hover:shadow-lg",
            isVisible && "animate-fade-in-up"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-brand-gold/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-gold/20">
              <action.icon className="h-6 w-6 text-brand-gold" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{action.title}</h3>
          </div>
          
          <p className="text-white/80 mb-6 flex-grow text-center">
            {action.description}
          </p>
          
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-auto bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT font-semibold rounded-2xl px-6 py-3 text-center block transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            {action.buttonText}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      ))}
    </div>
  )
} 