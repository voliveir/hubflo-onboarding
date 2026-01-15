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
      <div className="absolute left-8 top-0 bottom-0 w-1 shadow-lg" style={{ background: 'linear-gradient(to bottom, #ecb22d, rgba(236, 178, 45, 0.7), transparent)' }} />
      
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
            <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#ecb22d' }}>
              <span className="font-bold text-lg" style={{ color: '#060520' }}>{item.step}</span>
            </div>
            
            {/* Content */}
            <div className="ml-8 flex-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#060520' }}>
                  {item.title}
                </h3>
                <p className="leading-relaxed" style={{ color: '#64748b' }}>
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