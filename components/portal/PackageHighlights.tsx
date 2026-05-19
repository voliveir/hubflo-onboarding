'use client'

import { CheckCircle } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/utils'
import { getPackageDefinition } from '@/lib/success-packages'

interface PackageHighlightsProps {
  successPackage: string
}

export function PackageHighlights({ successPackage }: PackageHighlightsProps) {
  const { ref, isVisible } = useReveal()
  const pkg = getPackageDefinition(successPackage)

  const checkClass =
    pkg.checkmarkStyle === 'gold'
      ? 'text-brand-gold'
      : pkg.checkmarkStyle === 'dark'
        ? 'text-gray-700'
        : 'text-gray-400'

  return (
    <div ref={ref} className={cn('max-w-2xl mx-auto', isVisible && 'animate-fade-in-up')}>
      <ul className="space-y-3 text-left text-sm" style={{ color: '#060520' }}>
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckCircle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', checkClass)} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {pkg.priceLabel && (
        <p className="text-center text-sm mt-6" style={{ color: '#64748b' }}>
          {pkg.priceLabel}
        </p>
      )}
    </div>
  )
}
