"use client"

import { Settings, Clock, Copy, Loader, CheckCircle, Circle, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

interface WhiteLabelProgressProps {
  status: "not_started" | "in_progress" | "client_approval" | "waiting_for_approval" | "complete"
  checklist: Record<string, { completed: boolean, completed_at?: string }>
  androidUrl?: string
  iosUrl?: string
  updatedAt: string
  clientId: string // NEW: needed for API call
  approvalStatus?: "pending" | "approved" | "changes_requested"
  appName?: string | null
  appDescription?: string | null
  appAssets?: string[] | null
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
  // NEW: Client Approval step
  {
    key: "client_approval",
    title: "Client Approval of App Details",
    description: "Client reviews and approves app assets, name, and description before submission.",
    clientDescription: "Please review your app's assets, name, and description. Approve or request changes before we submit to the app stores.",
    estimatedTime: "1-2 days"
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
  client_approval: {
    title: "Review & Approve Your App Details",
    subtitle: "Your action is required before we submit your app!",
    content: null // Will be rendered with review/approval UI
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

function getWhiteLabelProgress(checklist: Record<string, { completed: boolean, completed_at?: string }>) {
  if (!checklist) return 0
  const steps = [
    "create_assets",
    "create_natively_app", 
    "create_test_user",
    "test_login",
    "download_and_create_ios_app",
    "client_approval", // NEW: client approval step
    "submit",
  ]
  const total = steps.length
  const completed = steps.filter((k) => checklist[k]?.completed).length
  return Math.round((completed / total) * 100)
}

function StepIndicator({ step, isCompleted, isCurrent, isWaiting, completedAt }: { 
  step: typeof CLIENT_STEPS[0], 
  isCompleted: boolean, 
  isCurrent: boolean,
  isWaiting: boolean,
  completedAt?: string
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
         {isCompleted && completedAt && (
           <div className="mt-3 flex items-center gap-2 text-green-400 text-xs">
             <CheckCircle className="h-3 w-3" />
             <span>Completed: {new Date(completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
           </div>
         )}
       </div>
     </div>
   )
}

export function WhiteLabelProgress({ status, checklist, androidUrl, iosUrl, updatedAt, clientId, approvalStatus, appName, appDescription, appAssets }: WhiteLabelProgressProps) {
  const [decision, setDecision] = useState<"approved" | "changes_requested" | null>(
    approvalStatus === "pending" ? null : (approvalStatus as "approved" | "changes_requested" | null)
  )
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const progress = getWhiteLabelProgress(checklist)
  const variant = STATE_VARIANTS[status]

  // Determine current step
  const getCurrentStep = () => {
    if (status === "not_started") return -1
    if (status === "complete") return CLIENT_STEPS.length
    
    const completedSteps = CLIENT_STEPS.filter(step => checklist[step.key]?.completed)
    return completedSteps.length
  }

  const currentStepIndex = getCurrentStep()

  // Special client approval UI
  if (status === "client_approval") {
    const handleDecision = async (choice: "approved" | "changes_requested") => {
      setLoading(true)
      try {
        await fetch("/api/update-client", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId,
            updates: {
              white_label_client_approval_status: choice,
              white_label_client_approval_at: new Date().toISOString(),
            },
          }),
        })
        setDecision(choice)
      } finally {
        setLoading(false)
      }
    }
    return (
      <div className="rounded-2xl border border-brand-gold/40 bg-[#10122b]/90 text-white shadow-[inset_0_1px_6px_rgba(0,0,0,.25)] overflow-hidden transition-all duration-500 hover:border-brand-gold/60 hover:shadow-lg">
        <div className="bg-[#181a2f] px-8 py-6 flex justify-between items-center border-b border-brand-gold/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Review & Approve Your App Details</h2>
              <p className="text-white/80 text-sm">Please review your app's assets, name, and description. Approve or request changes before we submit to the app stores.</p>
            </div>
          </div>
          <StatusPill variant={status} />
        </div>
        <div className="p-8 bg-transparent">
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-brand-gold">App Details</h3>
            <ul className="space-y-2 text-white/90">
              <li><span className="font-semibold">App Name:</span> {appName || "[App Name Here]"}</li>
              <li><span className="font-semibold">Description:</span> {appDescription || "[App Description Here]"}</li>
              <li>
                <span className="font-semibold">Assets:</span>
                {appAssets && appAssets.length > 0 ? (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {appAssets.map((url, i) => (
                      <img 
                        key={i} 
                        src={url} 
                        alt={`Asset ${i + 1}`} 
                        className="h-16 rounded shadow border border-white/10 bg-[#181a2f] cursor-pointer hover:border-brand-gold/50 hover:scale-105 transition-all duration-200" 
                        onClick={() => {
                          console.log('Image clicked:', url);
                          setSelectedImage(url);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  " [Logos, Screenshots, etc. Here]"
                )}
              </li>
            </ul>

            {/* Full Screen Image Preview */}
            {selectedImage && (
              <div 
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedImage(null)}
              >
                <div className="relative max-w-4xl max-h-full">
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    ×
                  </button>
                  <img
                    src={selectedImage}
                    alt="App Asset Preview"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Approval buttons and confirmation logic remain unchanged */}
          {decision ? (
            <div className="mt-6 text-center text-green-400 font-semibold">
              Thank you! Your decision ({decision === "approved" ? "Approved" : "Changes Requested"}) has been recorded.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Button
                variant="default"
                size="lg"
                className="bg-gradient-to-br from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-xl shadow-gold-glow shadow-md shadow-black/30"
                disabled={loading}
                onClick={() => handleDecision("approved")}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="bg-gradient-to-br from-[#F2994A] to-[#F2C94C] text-[#010124] font-bold rounded-xl shadow-gold-glow shadow-md shadow-black/30"
                disabled={loading}
                onClick={() => handleDecision("changes_requested")}
              >
                Request Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Test Modal using Portal */}
      {selectedImage && typeof window !== 'undefined' && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: '50px',
            left: '50px',
            width: '300px',
            height: '200px',
            backgroundColor: 'red',
            zIndex: 999999,
            border: '5px solid yellow',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => setSelectedImage(null)}
        >
          TEST MODAL - CLICK TO CLOSE
        </div>,
        document.body
      )}
      
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
                 const stepData = checklist[step.key]
                 const isCompleted = stepData?.completed || false
                 const isCurrent = index === currentStepIndex && !isCompleted
                 const isWaiting = status === "waiting_for_approval" && index === CLIENT_STEPS.length - 1 && !isCompleted
                 const completedAt = stepData?.completed_at
                 
                 return (
                   <StepIndicator
                     key={step.key}
                     step={step}
                     isCompleted={isCompleted}
                     isCurrent={isCurrent}
                     isWaiting={isWaiting}
                     completedAt={completedAt}
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

    {/* Image Modal */}
    {selectedImage && (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'red',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => setSelectedImage(null)}
      >
        <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '-50px',
              right: '0',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '20px',
              zIndex: 100000
            }}
          >
            ×
          </button>
          <div style={{ color: 'white', textAlign: 'center', marginBottom: '20px', fontSize: '18px' }}>
            DEBUG: Modal is visible! Image URL: {selectedImage}
          </div>
          <img 
            src={selectedImage || ""} 
            alt="Full size asset" 
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => console.error('Modal image failed to load:', e)}
            onLoad={() => console.log('Modal image loaded successfully')}
          />
        </div>
      </div>
    )}
    </div>
  )
} 