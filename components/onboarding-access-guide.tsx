"use client"

import { Button } from "@/components/ui/button"
import { Mail, LogIn, Layout, ArrowRight, CheckCircle, Info } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface OnboardingAccessGuideProps {
  clientName: string
}

export function OnboardingAccessGuide({ clientName }: OnboardingAccessGuideProps) {
  const { ref, isVisible } = useReveal()
  
  const steps = [
    {
      id: 1,
      title: "Check Your Email",
      subtitle: "Look for your onboarding invitation",
      description:
        `You'll receive an email invitation from Hubflo with an "Activate my account" button. This invitation gives you access to your sample client portal, located at hubflo-onboarding.hubflo.com — a guided example of what your own clients will experience. We use this portal to walk you through essential onboarding tasks and give you a hands-on feel for the Hubflo client experience.`,
      note: "Note: This is not your admin portal. Your actual Hubflo admin login is at app.hubflo.com — you'll use that to manage your account and real client workspaces.",
      icon: <Mail className="h-6 w-6 text-brand-gold" />,
      screenshot: "/email-invitation-screenshot.png",
      tips: [
        "Check your spam/junk folder if you don't see the invitation.",
        "The email will come from hello@hubflo.com.",
        "Click 'Activate my account' to access your onboarding tasks."
      ],
      ctaText: "Need help?",
      ctaActionLabel: "Contact Success",
      ctaActionUrl: "https://calendly.com/vanessa-hubflo/30min",
    },
    {
      id: 2,
      title: "Log In to Your Onboarding Client Portal",
      subtitle: "Access your sample client experience",
      description:
        `After clicking the activation link from your invitation email, you'll be taken to the onboarding example client portal at hubflo-onboarding.hubflo.com. Use your email and create a password — this login will let you access your assigned onboarding tasks and preview how clients will experience their portal.`,
      note: "This portal is only used for onboarding and training purposes. To access your actual Hubflo admin account, go to app.hubflo.com.",
      icon: <LogIn className="h-6 w-6 text-brand-gold" />,
      screenshot: "/login-screen-screenshot.png",
      tips: [
        "Use the same email address you received the invitation on.",
        "You'll create your password during activation and use it for future logins.",
        "If needed, use 'Forgot your password?' to reset access."
      ],
      ctaText: "Ready to log in?",
      ctaActionLabel: "Access Portal",
      ctaActionUrl: "https://hubflo-onboarding.hubflo.com",
    },
    {
      id: 3,
      title: "Complete Your Tasks",
      subtitle: "Work through your personalized onboarding checklist",
      description:
        `Once logged into your onboarding client portal, you'll find a curated set of tasks, resources, and helpful tools designed to guide your Hubflo setup. These tasks not only show you how Hubflo portals work from a client's perspective — they also help us gather key info and tailor the platform to your needs.`,
      note: "This portal is both a training ground and a setup checklist — everything you complete here helps move your implementation forward.",
      icon: <Layout className="h-6 w-6 text-brand-gold" />,
      screenshot: "/portal-overview-screenshot.png",
      tips: [
        "Tasks are grouped by priority and section to keep you focused",
        "Each task includes resources, videos, or tutorials to walk you through it",
        "Your progress is automatically saved as you go"
      ],
      ctaText: "Need help?",
      ctaActionLabel: "Contact Success",
      ctaActionUrl: "https://calendly.com/vanessa-hubflo/30min",
    },
  ]

  return (
    <section ref={ref} className={cn("py-16 px-4", isVisible && "animate-fade-in-up")}>
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            How to Access Your <span className="text-brand-gold">Onboarding Portal</span>
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Follow these simple steps to access your personalized Hubflo client portal and begin your onboarding
            journey.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 p-8">
            <div className="flex items-center justify-center space-x-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center mb-2 shadow-lg">
                      <span className="text-brand-DEFAULT font-bold text-xl">{step.id}</span>
                    </div>
                    <span className="text-sm font-medium text-white text-center">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && <ArrowRight className="h-6 w-6 text-brand-gold mx-4" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Steps */}
        <div className="max-w-[120rem] mx-auto w-full pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 flex flex-col h-full min-h-[420px] max-w-[480px] mx-auto transition-all duration-300 hover:border-brand-gold/40 hover:shadow-lg"
              >
                {/* Top Bar */}
                <div className="bg-gradient-to-r from-brand-DEFAULT to-brand-DEFAULT/90 text-white flex items-center px-6 py-4 rounded-t-3xl" style={{minHeight: 80}}>
                  <div className="flex items-center space-x-4 w-full">
                    <div className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center text-brand-DEFAULT font-bold text-2xl shadow-lg">
                      {step.id}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="text-xl text-white font-bold mb-0">{step.title}</h3>
                      </div>
                      <p className="text-white/80 text-sm mb-0">{step.subtitle}</p>
                    </div>
                  </div>
                </div>
                {/* Card Content */}
                <div className="flex flex-col flex-1 justify-between p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-b-3xl">
                  <div>
                    <p className="text-white/90 text-lg mb-6 leading-relaxed">{step.description}</p>
                    {step.note && (
                      <div className="mt-6 mb-4 p-4 bg-white/10 border-l-4 border-brand-gold shadow-sm flex items-start gap-3 rounded-2xl">
                        <span className="text-brand-gold text-xl font-bold" style={{lineHeight: 1}}>❗</span>
                        <span>
                          <span className="font-semibold text-white">Note:</span>{" "}
                          <span className="text-white/80">{step.note.replace(/^.*Note:\s?/, '')}</span>
                        </span>
                      </div>
                    )}
                    {/* Tips Section */}
                    <div className="bg-brand-gold/10 rounded-2xl p-6 mb-6 border border-brand-gold/20">
                      <div className="flex items-center mb-3">
                        <Info className="h-5 w-5 text-brand-gold mr-2" />
                        <h4 className="font-semibold text-white">Helpful Tips</h4>
                      </div>
                      <ul className="space-y-2">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-brand-gold mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-white/90">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* CTA Button */}
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mt-4">
                    <span className="text-sm font-medium text-white">{step.ctaText}</span>
                    <Button size="sm" className="bg-brand-gold hover:bg-brand-gold/90 text-brand-DEFAULT transition-all duration-200 hover:scale-105" asChild>
                      <a href={step.ctaActionUrl} target="_blank" rel="noopener noreferrer">
                        {step.ctaActionLabel}
                      </a>
                    </Button>
                  </div>
                </div>
                {/* Screenshot Side - always at the bottom */}
                <div className="bg-white/5 p-8 flex items-center justify-center rounded-b-3xl border-t border-white/20">
                  <div className="w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border-2 border-brand-gold/40">
                      <div className="bg-brand-gold px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="aspect-[4/3] relative">
                        <Image
                          src={step.screenshot || "/placeholder.svg"}
                          alt={`Screenshot of ${step.title}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <p className="text-center text-sm text-white/60 mt-3">
                      {step.id === 1 && "Example invitation email"}
                      {step.id === 2 && "Hubflo client portal login screen"}
                      {step.id === 3 && "Your personalized onboarding portal"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
