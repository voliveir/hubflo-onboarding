'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PortalHeaderProps {
  children: ReactNode
  className?: string
}

export function PortalHeader({ children, className }: PortalHeaderProps) {
  return (
    <nav 
      className={cn(
        "sticky top-[64px] z-40 bg-white/90 backdrop-blur-md border-b border-brand-gold/20 transition-all duration-300",
        className
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {children}
        </div>
      </div>
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