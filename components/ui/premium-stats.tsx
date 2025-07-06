"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Clock, Star } from "lucide-react"

interface StatItem {
  icon: React.ReactNode
  value: string
  label: string
  description?: string
  trend?: string
}

interface PremiumStatsProps {
  stats: StatItem[]
  className?: string
}

export function PremiumStats({ stats, className = "" }: PremiumStatsProps) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative group"
        >
          <div className="bg-white rounded-2xl p-6 shadow-premium hover-lift border border-gray-100 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Icon */}
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors duration-300">
                <div className="text-brand-gold group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
              </div>
              {stat.trend && (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.trend}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-3xl font-bold text-brand-DEFAULT mb-1 group-hover:text-brand-gold transition-colors duration-300">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-1">
                {stat.label}
              </div>
              {stat.description && (
                <div className="text-xs text-gray-500">
                  {stat.description}
                </div>
              )}
            </div>
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Default stats for onboarding platform
export function OnboardingStats() {
  const stats = [
    {
      icon: <Users className="h-6 w-6" />,
      value: "500+",
      label: "Clients Onboarded",
      description: "Successfully launched",
      trend: "+12%"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      value: "1-2",
      label: "Weeks to Launch",
      description: "Average time",
      trend: "-25%"
    },
    {
      icon: <Star className="h-6 w-6" />,
      value: "98%",
      label: "Success Rate",
      description: "Client satisfaction",
      trend: "+3%"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      value: "24/7",
      label: "Support Available",
      description: "Always here to help"
    }
  ]

  return <PremiumStats stats={stats} />
} 