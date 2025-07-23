'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PortalHeaderProps {
  children: ReactNode
  className?: string
}

export function PortalHeader({ children }: { children: React.ReactNode }) {
  return (
    <nav className="bg-white text-brand-DEFAULT shadow-sm border-b border-brand-gold/10 px-4 py-3 flex justify-center items-center gap-8 text-base font-semibold fixed top-24 left-0 right-0 w-full z-40" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {children}
    </nav>
  )
}

interface PortalNavLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function PortalNavLink({ href, children, className }: PortalNavLinkProps) {
  return (
    <a 
      href={href}
      className={cn(
        "text-brand-DEFAULT hover:text-brand-gold font-medium px-4 py-2 rounded-lg transition-all duration-200 relative group hover:scale-105 active:scale-95",
        className
      )}
    >
      {children}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
    </a>
  )
} 