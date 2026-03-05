"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Loader2 } from "lucide-react"

export function MedianOnboardingStat() {
  const [value, setValue] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/analytics-summary?date_range=90")
      .then((res) => res.json())
      .then((data) => {
        const median = data?.implementationHealth?.medianOnboardingDuration
        setValue(median != null ? Number(median) : null)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mt-16"
      >
        <div className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl border border-gray-200 bg-gray-50/50">
          <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          <span style={{ color: "#64748b" }}>Loading live stats...</span>
        </div>
      </motion.div>
    )
  }

  if (error || value === null) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex justify-center mt-16"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="inline-flex items-center gap-6 px-8 py-6 rounded-2xl border transition-all duration-300 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, rgba(236, 178, 45, 0.08) 0%, rgba(236, 178, 45, 0.02) 100%)",
            borderColor: "rgba(236, 178, 45, 0.25)",
            boxShadow: "0 4px 24px rgba(6, 5, 32, 0.06)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-xl"
              style={{ backgroundColor: "rgba(236, 178, 45, 0.15)" }}
            >
              <TrendingUp className="h-7 w-7 text-brand-gold" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl lg:text-4xl font-bold" style={{ color: "#060520" }}>
                {Number.isInteger(value) ? value : value.toFixed(1)}
              </span>
              <span className="text-sm font-medium" style={{ color: "#64748b" }}>
                median business days to launch MVP
              </span>
            </div>
            <div className="hidden sm:block h-10 w-px" style={{ backgroundColor: "rgba(236, 178, 45, 0.3)" }} />
            <div className="hidden sm:flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: "rgba(236, 178, 45, 0.15)", color: "#B8860B" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
              <span className="text-xs" style={{ color: "#64748b" }}>
                Last 90 days
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs text-center max-w-xl space-y-2" style={{ color: "#94a3b8" }}>
          <p>From when payment is first received for Hubflo to when your first client is invited using your <strong className="font-semibold" style={{ color: "#64748b" }}>minimal viable portal</strong> (a first version with limited scope—typically 2–3 apps such as file sharing, forms, contracts, or messaging, plus basics like branding and custom domain). Graduation in Hubflo is when you invite your first client.</p>
          <p>This does not include advanced integrations and/or automations. Timeline depends on: how quickly your first kickoff or onboarding call is scheduled, how long it takes to send documentation for your workflow (SOPs, etc.), and how quickly you can schedule and complete assigned tasks.</p>
        </div>
      </div>
    </motion.div>
  )
}
