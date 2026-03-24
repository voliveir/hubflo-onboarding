'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface PortalSectionProps {
  children: ReactNode
  className?: string
  id?: string
  gradient?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  delay?: number
  contentClassName?: string
  /**
   * When false, renders a plain section (no scroll-linked motion).
   * Use on long public pages (e.g. /labs) so trackpad scroll is not fighting whileInView animations.
   */
  enableEntranceAnimation?: boolean
}

export function PortalSection({ 
  children, 
  className, 
  id, 
  gradient = true,
  maxWidth = '7xl',
  delay = 0,
  contentClassName,
  enableEntranceAnimation = true,
}: PortalSectionProps) {
  const sectionClassName = cn(
    "py-16 px-4 relative overflow-hidden",
    gradient ? "bg-[#060520]" : "bg-transparent",
    className
  )

  const maxWidthClass = cn(
    "relative z-10 mx-auto",
    maxWidth === 'sm' && "max-w-sm",
    maxWidth === 'md' && "max-w-md", 
    maxWidth === 'lg' && "max-w-lg",
    maxWidth === 'xl' && "max-w-xl",
    maxWidth === '2xl' && "max-w-2xl",
    maxWidth === '3xl' && "max-w-3xl",
    maxWidth === '4xl' && "max-w-4xl",
    maxWidth === '5xl' && "max-w-5xl",
    maxWidth === '6xl' && "max-w-6xl",
    maxWidth === '7xl' && "max-w-7xl",
    contentClassName
  )

  const inner = (
    <>
      {gradient && (
        <>
          <div className="absolute top-20 right-20 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-brand-gold/3 rounded-full blur-2xl" />
        </>
      )}
      <div className={maxWidthClass}>{children}</div>
    </>
  )

  if (!enableEntranceAnimation) {
    return (
      <section id={id} className={sectionClassName}>
        {inner}
      </section>
    )
  }

  return (
    <motion.section 
      id={id}
      className={sectionClassName}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      {inner}
    </motion.section>
  )
} 