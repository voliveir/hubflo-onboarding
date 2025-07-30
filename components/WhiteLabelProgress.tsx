"use client"

import { Settings, Clock, Copy, Loader, CheckCircle, Circle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface WhiteLabelProgressProps {
  status: "not_started" | "in_progress" | "waiting_for_approval" | "complete"
  checklist: Record<string, boolean>
  androidUrl?: string
  iosUrl?: string
  updatedAt: string
}

// Client-facing step descriptions
const CLIENT_STEPS = [
  {
    key: "create_assets",
    title: "Brand Assets Preparation",
    description: "Creating your custom logo, colors, and branding materials",
    clientDescription: "We're preparing your brand assets including custom logos, color schemes, and visual identity elements for your app.",
    estimatedTime: "1-2 days"
  },
  {
    key: "create_natively_app",
    title: "App Development Setup",
    description: "Setting up your app in our development platform",
    clientDescription: "We're configuring your app in our development environment with your custom branding and features.",
    estimatedTime: "3-5 days"
  },
  {
    key: "create_test_user",
    title: "Testing Environment",
    description: "Creating test accounts and validation setup",
    clientDescription: "We're setting up testing environments and creating test accounts to ensure your app works perfectly.",
    estimatedTime: "1-2 days"
  },
  {
    key: "test_login",
    title: "Quality Assurance",
    description: "Testing login functionality and core features",
    clientDescription: "We're thoroughly testing your app's login system and core features to ensure everything works smoothly.",
    estimatedTime: "2-3 days"
  },
  {
    key: "download_and_create_ios_app",
    title: "App Store Preparation",
    description: "Preparing your app for app store submission",
    clientDescription: "We're preparing your app for submission to the Apple App Store and Google Play Store with all required materials.",
    estimatedTime: "3-5 days"
  },
  {
    key: "submit",
    title: "App Store Submission",
    description: "Submitting your app to the app stores",
    clientDescription: "We're submitting your app to the app stores for review and approval. This process typically takes 2-3 weeks.",
    estimatedTime: "2-3 weeks"
  }
]

const STATE_VARIANTS = {
  not_started: {
    title: "Custom White Label App Development",
    subtitle: "Your personalized mobile application",
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-3">Development Timeline</h3>
          <div className="inline-flex items-center bg-brand-gold/20 rounded-full px-6 py-3 border border-brand-gold/40">
            <Clock className="h-5 w-5 text-brand-gold mr-2" />
            <span className="font-semibold text-white">4-6 Weeks</span>
          </div>
        </div>
        <div className="bg-[#181a2f] text-white rounded-lg p-6 border border-brand-gold/30">
          <h4 className="font-semibold text-white mb-3">What to Expect:</h4>
          <ul className="space-y-2 text-white/80">
            <li className="flex items-start">
              <span className="text-brand-gold mr-2">•</span>
              Custom branding with your logo, colors, and company identity
            </li>
            <li className="flex items-start">
              <span className="text-brand-gold mr-2">•</span>
              Personalized app name and description
            </li>
            <li className="flex items-start">
              <span className="text-brand-gold mr-2">•</span>
              Dedicated app store listings under your brand
            </li>
            <li className="flex items-start">
              <span className="text-brand-gold mr-2">•</span>
              Full integration with your Hubflo workspace
            </li>
          </ul>
        </div>
        <div className="text-center bg-[#10122b]/80 text-white rounded-lg p-6 border border-brand-gold/30">
          <h4 className="font-semibold mb-2 text-white">Next Steps</h4>
          <p className="text-white/80 mb-4">
            Your Implementation Manager will reach out to you within 1-2 business days to discuss your app
            requirements, branding guidelines, and development timeline.
          </p>
          <p className="text-sm text-brand-gold">
            Questions? Contact your Implementation Manager or reach out to our support team.
          </p>
        </div>
      </div>
    )
  },
  in_progress: {
    title: "Custom White Label App Development",
    subtitle: "Your personalized mobile application",
    content: null // Will be rendered with progress
  },
  waiting_for_approval: {
    title: "Custom White Label App Development", 
    subtitle: "Your personalized mobile application",
    content: null // Will be rendered with progress
  },
  complete: {
    title: "Your White Label App is Ready!",
    subtitle: "Your app is now live on the app stores.",
    content: null // Will be rendered with download links
  }
}

function StatusPill({ variant }: { variant: string }) {
  const variants = {
    not_started: "bg-gray-500/20 text-gray-300 border-gray-500/40",
    in_progress: "bg-brand-gold/20 text-brand-gold border-brand-gold/40",
    waiting_for_approval: "bg-orange-500/20 text-orange-300 border-orange-500/40", 
    complete: "bg-green-500/20 text-green-300 border-green-500/40"
  }

  const labels = {
    not_started: "Not Started",
    in_progress: "In Progress", 
    waiting_for_approval: "Waiting",
    complete: "Complete"
  }

  return (
    <div className={cn(
      "rounded-full px-3 py-1 text-xs border",
      variants[variant as keyof typeof variants]
    )}>
      {labels[variant as keyof typeof labels]}
    </div>
  )
}

function getWhiteLabelProgress(checklist: Record<string, boolean>) {
  if (!checklist) return 0
  const steps = [
    "create_assets",
    "create_natively_app", 
    "create_test_user",
    "test_login",
    "download_and_create_ios_app",
    "submit",
  ]
  const total = steps.length
  const completed = steps.filter((k) => checklist[k]).length
  return Math.round((completed / total) * 100)
}

function StepIndicator({ step, isCompleted, isCurrent, isWaiting }: { 
  step: typeof CLIENT_STEPS[0], 
  isCompleted: boolean, 
  isCurrent: boolean,
  isWaiting: boolean 
}) {
  return (
    <div className={cn(
      "flex items-start gap-4 p-4 rounded-lg border transition-all duration-300",
      isCompleted 
        ? "bg-green-500/10 border-green-500/30" 
        : isCurrent 
        ? "bg-brand-gold/10 border-brand-gold/30" 
        : isWaiting
        ? "bg-orange-500/10 border-orange-500/30"
        : "bg-gray-500/10 border-gray-500/30"
    )}>
      <div className="flex-shrink-0 mt-1">
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : isCurrent ? (
          <div className="h-5 w-5 rounded-full border-2 border-brand-gold animate-pulse" />
        ) : isWaiting ? (
          <AlertCircle className="h-5 w-5 text-orange-500" />
        ) : (
          <Circle className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className={cn(
            "font-semibold",
            isCompleted ? "text-green-400" : isCurrent ? "text-brand-gold" : isWaiting ? "text-orange-400" : "text-gray-400"
          )}>
            {step.title}
          </h4>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            isCompleted ? "bg-green-500/20 text-green-300" : isCurrent ? "bg-brand-gold/20 text-brand-gold" : isWaiting ? "bg-orange-500/20 text-orange-300" : "bg-gray-500/20 text-gray-300"
          )}>
            {step.estimatedTime}
          </span>
        </div>
        <p className={cn(
          "text-sm",
          isCompleted ? "text-green-300/80" : isCurrent ? "text-brand-gold/80" : isWaiting ? "text-orange-300/80" : "text-gray-400/80"
        )}>
          {step.clientDescription}
        </p>
        {isCurrent && (
          <div className="mt-3 flex items-center gap-2 text-brand-gold text-xs">
            <Loader className="h-3 w-3 animate-spin" />
            <span>Currently in progress</span>
          </div>
        )}
        {isWaiting && (
          <div className="mt-3 flex items-center gap-2 text-orange-400 text-xs">
            <Clock className="h-3 w-3" />
            <span>Waiting for approval</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function WhiteLabelProgress({ status, checklist, androidUrl, iosUrl, updatedAt }: WhiteLabelProgressProps) {
  const progress = getWhiteLabelProgress(checklist)
  const variant = STATE_VARIANTS[status]

  // Determine current step
  const getCurrentStep = () => {
    if (status === "not_started") return -1
    if (status === "complete") return CLIENT_STEPS.length
    
    const completedSteps = CLIENT_STEPS.filter(step => checklist[step.key])
    return completedSteps.length
  }

  const currentStepIndex = getCurrentStep()

  return (
    <div className="rounded-2xl border border-brand-gold/40 bg-[#10122b]/90 text-white shadow-[inset_0_1px_6px_rgba(0,0,0,.25)] overflow-hidden transition-all duration-500 hover:border-brand-gold/60 hover:shadow-lg">
      {/* Header */}
      <div className="bg-[#181a2f] px-8 py-6 flex justify-between items-center border-b border-brand-gold/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{variant.title}</h2>
            <p className="text-white/80 text-sm">{variant.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status === "in_progress" && (
            <div className="w-8 h-8 rounded-full border-2 border-brand-gold/30 animate-pulse" />
          )}
          <StatusPill variant={status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-8 bg-transparent">
        {status === "not_started" && variant.content}

        {(status === "in_progress" || status === "waiting_for_approval") && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Development Progress</h3>
              <div className="h-3 rounded-full bg-brand-foreground/10 overflow-hidden mb-2">
                <div
                  className="h-full bg-brand-gold transition-all duration-800 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm text-brand-foreground/60 text-center">
                {progress}% Complete • Step {currentStepIndex + 1} of {CLIENT_STEPS.length}
              </div>
            </div>

            <div className="space-y-4">
              {CLIENT_STEPS.map((step, index) => {
                const isCompleted = checklist[step.key] || false
                const isCurrent = index === currentStepIndex && !isCompleted
                const isWaiting = status === "waiting_for_approval" && index === CLIENT_STEPS.length - 1 && !isCompleted
                
                return (
                  <StepIndicator
                    key={step.key}
                    step={step}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isWaiting={isWaiting}
                  />
                )
              })}
            </div>

            <div className="text-white/60 text-sm text-center mt-8">
              Last updated: {new Date(updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}, {new Date(updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>

            {status === "waiting_for_approval" && (
              <div className="text-center bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="text-orange-400 font-medium flex items-center justify-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  App Store Review in Progress
                </div>
                <p className="text-orange-300/80 text-sm">
                  Your app is currently being reviewed by the app stores. This process typically takes 2-3 weeks.
                </p>
              </div>
            )}
          </div>
        )}

        {status === "complete" && (
          <div className="space-y-6 text-center">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-4">Download Links</h3>
              <div className="flex flex-row flex-wrap justify-center items-center gap-6">
                {androidUrl ? (
                  <a href={androidUrl} target="_blank" rel="noopener noreferrer">
                    <Image
                      src="/google-play-badge.png"
                      alt="Get it on Google Play"
                      width={140}
                      height={56}
                      className="h-12 md:h-14 w-auto hover:opacity-90 transition"
                    />
                  </a>
                ) : (
                  <div className="text-white/60 font-semibold">Google Play coming soon!</div>
                )}
                {iosUrl ? (
                  <a href={iosUrl} target="_blank" rel="noopener noreferrer">
                    <Image
                      src="/app-store-badge.png"
                      alt="Download on the App Store"
                      width={140}
                      height={56}
                      className="h-12 md:h-14 w-auto hover:opacity-90 transition"
                    />
                  </a>
                ) : (
                  <div className="text-white/60 font-semibold">Apple App Store coming soon!</div>
                )}
              </div>
            </div>

            <div className="text-white/60 text-sm">
              Marked complete: {new Date(updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}, {new Date(updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>

            <div className="text-white font-semibold mt-6">
              Share these links with your clients so they can download your app directly from the app stores.
            </div>

            {(androidUrl || iosUrl) && (
              <div className="flex justify-center gap-2">
                {androidUrl && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigator.clipboard.writeText(androidUrl)}
                    className="text-brand-gold hover:text-brand-gold/80"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                {iosUrl && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigator.clipboard.writeText(iosUrl)}
                    className="text-brand-gold hover:text-brand-gold/80"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 