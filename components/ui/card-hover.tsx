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
        "relative overflow-hidden border border-gray-200 shadow-sm transition-all duration-300",
        "bg-white h-full flex flex-col",
        "hover:shadow-lg hover:border-gray-300",
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
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: 'rgba(236, 178, 45, 0.1)' }}>
                {icon}
              </div>
            )}
            {title && (
              <CardTitle className="text-xl font-semibold" style={{ color: '#060520' }}>
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-base" style={{ color: '#64748b' }}>
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