"use client"

import { Settings, Clock, Copy, Loader } from "lucide-react"
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
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
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
        <div className="text-center bg-gradient-to-r from-[#010124] to-brand-gold/10 rounded-lg p-6 border border-brand-gold/20">
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

export function WhiteLabelProgress({ status, checklist, androidUrl, iosUrl, updatedAt }: WhiteLabelProgressProps) {
  const progress = getWhiteLabelProgress(checklist)
  const variant = STATE_VARIANTS[status]

  return (
    <div className="rounded-2xl border border-brand-gold/40 bg-surface-dark/70 backdrop-blur shadow-[inset_0_1px_6px_rgba(0,0,0,.25)] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-DEFAULT via-transparent to-brand-gold/20 px-8 py-6 flex justify-between items-center">
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
      <div className="p-8">
        {status === "not_started" && variant.content}

        {(status === "in_progress" || status === "waiting_for_approval") && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Progress</h3>
              <div className="h-3 rounded-full bg-brand-foreground/10 overflow-hidden">
                <div
                  className="h-full bg-brand-gold transition-all duration-800 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs mt-2 text-brand-foreground/60 text-center">
                {progress}% Complete
              </div>
            </div>

            <div className="text-white/60 text-sm text-center">
              Last updated: {new Date(updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}, {new Date(updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>

            {status === "waiting_for_approval" && (
              <div className="text-brand-gold mt-4 font-medium flex items-center justify-center gap-2">
                <Loader className="animate-spin mr-2 text-brand-gold" size={16} />
                Waiting for store approval · 1–2 weeks
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