"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface CardHoverProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  icon?: ReactNode
  badge?: ReactNode
  delay?: number
}

export function CardHover({ 
  children, 
  className, 
  title, 
  description, 
  icon, 
  badge, 
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
        "relative overflow-hidden border border-brand-gold/30 shadow-lg transition-all duration-300",
        "bg-[#10122b]/90 text-white",
        "hover:shadow-2xl hover:ring-2 hover:ring-brand-gold/40",
        "group-hover:bg-[#181a2f]",
        className
      )}>
        {(title || description || icon || badge) && (
          <CardHeader className="relative">
            {badge && (
              <div className="absolute top-4 right-4">
                {badge}
              </div>
            )}
            {icon && (
              <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-gold/20 transition-colors">
                {icon}
              </div>
            )}
            {title && (
              <CardTitle className="text-white text-xl font-semibold">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-white/80 text-base">
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent className="relative flex flex-col h-full">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
} 