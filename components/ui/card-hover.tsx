"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface CardHoverProps {
  children: ReactNode
  className?: string
  title?: string
  /** Rendered between title and description (e.g. price or “Included”). */
  price?: ReactNode
  description?: string
  icon?: ReactNode
  badge?: ReactNode
  /** Places the badge centered at the top of the card (e.g. pricing tiers). */
  centerBadge?: boolean
  delay?: number
}

export function CardHover({ 
  children, 
  className, 
  title, 
  price,
  description, 
  icon, 
  badge, 
  centerBadge = false,
  delay = 0 
}: CardHoverProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Card className={cn(
        "relative overflow-hidden border border-gray-200 shadow-sm transition-all duration-300",
        "bg-white h-full flex flex-col",
        "hover:shadow-lg hover:border-gray-300",
        className
      )}>
        {(title || description || icon || badge || price) && (
          <CardHeader className={cn("relative", badge && centerBadge && "pt-14")}>
            {badge && (
              <div
                className={cn(
                  "absolute top-4 z-10",
                  centerBadge ? "left-1/2 -translate-x-1/2" : "right-4"
                )}
              >
                {badge}
              </div>
            )}
            {icon && (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                {icon}
              </div>
            )}
            {title && (
              <CardTitle className="text-xl font-semibold" style={{ color: '#060520' }}>
                {title}
              </CardTitle>
            )}
            {price && <div className="mt-2">{price}</div>}
            {description && (
              <CardDescription className="text-base mt-2" style={{ color: '#64748b' }}>
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent className="relative flex flex-col flex-grow">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
} 