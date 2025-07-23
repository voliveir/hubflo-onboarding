"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface TimelineItemProps {
  step: number
  title: string
  description: string
  delay?: number
}

interface TimelineProps {
  items: TimelineItemProps[]
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Vertical line */}
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-gold via-brand-gold/70 to-transparent shadow-lg" />
      
      <div className="space-y-12">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: item.delay || index * 0.2 }}
            className="relative flex items-start"
          >
            {/* Step circle */}
            <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-brand-gold rounded-full flex items-center justify-center shadow-lg">
              <span className="text-brand-DEFAULT font-bold text-lg">{item.step}</span>
            </div>
            
            {/* Content */}
            <div className="ml-8 flex-1">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-brand-gold/30 dark:bg-brand-navy-light/80 dark:border-brand-navy-lighter">
                <h3 className="text-xl font-semibold text-brand-DEFAULT dark:text-brand-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 