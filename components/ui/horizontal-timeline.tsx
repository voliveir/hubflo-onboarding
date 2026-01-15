"use client"

import React from "react"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

interface TimelineStep {
  number: string
  title: string
  description: string
}

interface HorizontalTimelineProps {
  steps: TimelineStep[]
}

export function HorizontalTimeline({ steps }: HorizontalTimelineProps) {
  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-8 left-0 right-0 h-0.5 hidden md:block" style={{ background: 'linear-gradient(to right, #ecb22d, rgba(236, 178, 45, 0.5), transparent)' }} />
      
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="relative text-center group"
          >
            {/* Step number */}
            <div className="relative z-10 w-16 h-16 bg-brand-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-brand-DEFAULT font-bold text-lg">{step.number}</span>
            </div>
            
            {/* Content */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white">
                {step.title}
              </h4>
              <p className="text-base font-medium text-white/90">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 