"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  delay?: number
  contentClassName?: string
}

export function Section({ children, className, id, delay = 0, contentClassName }: SectionProps) {
  return (
    <motion.section
      id={id}
      className={cn("w-full py-24 bg-transparent border-none shadow-none", className)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      <div className={cn("max-w-7xl mx-auto px-6 md:px-12 bg-transparent border-none shadow-none", contentClassName)}>
        {children}
      </div>
    </motion.section>
  )
} 