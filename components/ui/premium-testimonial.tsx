"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import Image from "next/image"

interface Testimonial {
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar?: string
}

interface PremiumTestimonialProps {
  testimonial: Testimonial
  className?: string
}

export function PremiumTestimonial({ testimonial, className = "" }: PremiumTestimonialProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white rounded-3xl p-8 shadow-premium hover-lift border border-gray-100 relative overflow-hidden group ${className}`}
    >
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-gold/3 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200" />
      
      {/* Quote icon */}
      <div className="absolute top-6 right-6 text-brand-gold/20 group-hover:text-brand-gold/30 transition-colors duration-300">
        <Quote className="h-8 w-8" />
      </div>
      
      {/* Rating */}
      <div className="flex items-center mb-6">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-brand-gold fill-current" />
        ))}
        {[...Array(5 - testimonial.rating)].map((_, i) => (
          <Star key={i + testimonial.rating} className="h-5 w-5 text-gray-300" />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <p className="text-gray-700 leading-relaxed mb-6 text-lg italic">
          "{testimonial.content}"
        </p>
        
        {/* Author */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {testimonial.avatar ? (
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center">
                <span className="text-brand-gold font-semibold text-lg">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute -inset-1 bg-brand-gold/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          <div>
            <div className="font-semibold text-brand-DEFAULT group-hover:text-brand-gold transition-colors duration-300">
              {testimonial.name}
            </div>
            <div className="text-sm text-gray-600">
              {testimonial.role} at {testimonial.company}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
    </motion.div>
  )
}

// Testimonials grid component
interface TestimonialsGridProps {
  testimonials: Testimonial[]
  className?: string
}

export function TestimonialsGrid({ testimonials, className = "" }: TestimonialsGridProps) {
  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
      {testimonials.map((testimonial, index) => (
        <PremiumTestimonial
          key={index}
          testimonial={testimonial}
          className={`animate-fade-in-up`}
        />
      ))}
    </div>
  )
}

// Default testimonials for onboarding platform
export function OnboardingTestimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO",
      company: "TechFlow Solutions",
      content: "Hubflo's onboarding process was incredibly smooth. We went from zero to a fully functional client portal in just 10 days. The team's expertise and attention to detail made all the difference.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Operations Director",
      company: "Digital Dynamics",
      content: "The premium package exceeded our expectations. The custom integrations and dedicated support helped us streamline our entire client management process. Highly recommended!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Founder",
      company: "Creative Agency Pro",
      content: "What impressed me most was how quickly we could customize everything to match our brand. The video tutorials and knowledge base made it easy for our team to get up to speed.",
      rating: 5
    }
  ]

  return <TestimonialsGrid testimonials={testimonials} />
} 