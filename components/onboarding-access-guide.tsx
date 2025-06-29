"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, LogIn, Layout, ArrowRight, CheckCircle, Info } from "lucide-react"
import Image from "next/image"

interface OnboardingAccessGuideProps {
  clientName: string
}

export function OnboardingAccessGuide({ clientName }: OnboardingAccessGuideProps) {
  const steps = [
    {
      id: 1,
      title: "Check Your Email",
      subtitle: "Look for your onboarding invitation",
      description:
        `You'll receive an email invitation from Hubflo with an "Activate my account" button. This invitation gives you access to your sample client portal, located at hubflo-onboarding.hubflo.com — a guided example of what your own clients will experience. We use this portal to walk you through essential onboarding tasks and give you a hands-on feel for the Hubflo client experience.`,
      note: "❗ Note: This is not your admin portal. Your actual Hubflo admin login is at app.hubflo.com — you'll use that to manage your account and real client workspaces.",
      icon: <Mail className="h-6 w-6 text-[#010124]" />,
      screenshot: "/email-invitation-screenshot.png",
      tips: [
        "Check your spam/junk folder if you don't see the invitation.",
        "The email will come from hello@hubflo.com.",
        "Click 'Activate my account' to access your onboarding tasks."
      ],
      ctaText: "Need help?",
      ctaAction: <a href="https://calendly.com/vanessa-hubflo/30min" target="_blank" rel="noopener noreferrer">Contact Success</a>,
    },
    {
      id: 2,
      title: "Log In to Your Onboarding Client Portal",
      subtitle: "Access your sample client experience",
      description:
        `After clicking the activation link from your invitation email, you'll be taken to the onboarding example client portal at hubflo-onboarding.hubflo.com. Use your email and create a password — this login will let you access your assigned onboarding tasks and preview how clients will experience their portal.`,
      note: "🔒 This portal is only used for onboarding and training purposes. To access your actual Hubflo admin account, go to app.hubflo.com.",
      icon: <LogIn className="h-6 w-6 text-[#010124]" />,
      screenshot: "/login-screen-screenshot.png",
      tips: [
        "Use the same email address you received the invitation on.",
        "You'll create your password during activation and use it for future logins.",
        "If needed, use 'Forgot your password?' to reset access."
      ],
      ctaText: "Ready to log in?",
      ctaAction: <a href="https://hubflo-onboarding.hubflo.com" target="_blank" rel="noopener noreferrer">Access Portal</a>,
    },
    {
      id: 3,
      title: "Complete Your Tasks",
      subtitle: "Work through your personalized onboarding checklist",
      description:
        `Once logged into your onboarding client portal, you'll find a curated set of tasks, resources, and helpful tools designed to guide your Hubflo setup. These tasks not only show you how Hubflo portals work from a client's perspective — they also help us gather key info and tailor the platform to your needs.`,
      note: "📝 This portal is both a training ground and a setup checklist — everything you complete here helps move your implementation forward.",
      icon: <Layout className="h-6 w-6 text-[#010124]" />,
      screenshot: "/portal-overview-screenshot.png",
      tips: [
        "Tasks are grouped by priority and section to keep you focused",
        "Each task includes resources, videos, or tutorials to walk you through it",
        "Your progress is automatically saved as you go"
      ],
      ctaText: "Need support as you work through tasks?",
      ctaAction: <a href="https://calendly.com/vanessa-hubflo/30min" target="_blank" rel="noopener noreferrer">Schedule Success Call</a>,
    },
  ]

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#010124] mb-4">
            How to Access Your <span className="text-[#ECB22D]">Onboarding Portal</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Follow these simple steps to access your personalized Hubflo client portal and begin your onboarding
            journey.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-[#ECB22D] bg-yellow-50">
            <CardContent className="py-6">
              <div className="flex items-center justify-center space-x-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center mb-2">
                        <span className="text-[#010124] font-bold">{step.id}</span>
                      </div>
                      <span className="text-sm font-medium text-[#010124] text-center">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && <ArrowRight className="h-6 w-6 text-[#ECB22D] mx-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Steps */}
        <div className="max-w-6xl mx-auto space-y-12">
          {steps.map((step, index) => (
            <Card key={step.id} className="border-2 border-[#ECB22D] overflow-hidden">
              <CardHeader className="bg-[#010124] text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#ECB22D] rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="secondary" className="bg-[#ECB22D] text-[#010124]">
                        Step {step.id}
                      </Badge>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </div>
                    <p className="text-gray-300">{step.subtitle}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className={`grid ${index % 2 === 0 ? "lg:grid-cols-2" : "lg:grid-cols-2"} gap-0`}>
                  {/* Content Side */}
                  <div className={`p-8 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">{step.description}</p>
                    {step.note && (
                      <div className="mt-6 mb-4 p-4 bg-white border-l-4 border-[#ECB22D] shadow-sm flex items-start gap-3 rounded">
                        <span className="text-[#ECB22D] text-xl font-bold" style={{lineHeight: 1}}>❗</span>
                        <span>
                          <span className="font-semibold text-[#010124]">Note:</span>{" "}
                          <span className="text-[#444]">{step.note.replace(/^.*Note:\s?/, '')}</span>
                        </span>
                      </div>
                    )}

                    {/* Tips Section */}
                    <div className="bg-yellow-50 rounded-lg p-6 mb-6 border border-[#ECB22D]">
                      <div className="flex items-center mb-3">
                        <Info className="h-5 w-5 text-[#ECB22D] mr-2" />
                        <h4 className="font-semibold text-[#010124]">Helpful Tips</h4>
                      </div>
                      <ul className="space-y-2">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-[#ECB22D] mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Call to Action */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border">
                      <span className="text-sm font-medium text-[#010124]">{step.ctaText}</span>
                      <Button size="sm" className="bg-[#010124] hover:bg-[#020135] text-white" asChild>
                        {step.id === 1 ? (
                          <a href="https://calendly.com/vanessa-hubflo/30min" target="_blank" rel="noopener noreferrer">
                            {step.ctaAction}
                          </a>
                        ) : step.id === 2 ? (
                          <a href="https://hubflo-onboarding.hubflo.com" target="_blank" rel="noopener noreferrer">
                            {step.ctaAction}
                          </a>
                        ) : (
                          <a
                            href="https://calendly.com/vanessa-hubflo/onboarding-kickoff-with-hubflo-clone"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {step.ctaAction}
                          </a>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Screenshot Side */}
                  <div
                    className={`bg-gray-100 p-8 flex items-center justify-center ${index % 2 === 1 ? "lg:order-1" : ""}`}
                  >
                    <div className="w-full max-w-md">
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-[#ECB22D]">
                        <div className="bg-[#ECB22D] px-4 py-2">
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
                      <p className="text-center text-sm text-gray-600 mt-3">
                        {step.id === 1 && "Example invitation email"}
                        {step.id === 2 && "Hubflo client portal login screen"}
                        {step.id === 3 && "Your personalized onboarding portal"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Final Call to Action */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="bg-gradient-to-r from-[#010124] to-[#020135] text-white border-[#ECB22D] border-2">
            <CardContent className="py-12 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started, {clientName}?</h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Your personalized onboarding experience is waiting for you. Access your admin portal now and begin your
                journey with Hubflo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#ECB22D] hover:bg-[#d4a029] text-[#010124] font-semibold px-8" asChild>
                  <a href="https://app.hubflo.com" target="_blank" rel="noopener noreferrer">
                    Access Your Admin Portal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#ECB22D] text-[#ECB22D] hover:bg-[#ECB22D] hover:text-[#010124] px-8 bg-transparent"
                  asChild
                >
                  <a href="https://calendly.com/vanessa-hubflo/30min" target="_blank" rel="noopener noreferrer">
                    Need Help? Contact Success
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
