"use client"

import { motion } from "framer-motion"
import { ChevronDown, Play, Star, Zap, Users } from "lucide-react"
import { PrimaryButton, SecondaryButton } from "./button-variants"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-brand-DEFAULT">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main floating shapes */}
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 bg-brand-gold/8 rounded-full blur-2xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 bg-brand-gold/6 rounded-full blur-xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 35, 0],
            rotate: [0, -180, -360],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-28 h-28 bg-brand-gold/4 rounded-full blur-lg"
          animate={{
            x: [0, 15, 0],
            y: [0, -25, 0],
            rotate: [0, 90, 180],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
        />
        
        {/* Additional smaller shapes */}
        <motion.div
          className="absolute top-1/3 right-1/3 w-16 h-16 bg-brand-gold/5 rounded-full blur-md"
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
            rotate: [0, 45, 90],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-brand-gold/3 rounded-full blur-sm"
          animate={{
            x: [0, -8, 0],
            y: [0, 8, 0],
            rotate: [0, -45, -90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* Enhanced Radial Gradient Overlay */}
      <div className="absolute inset-0 gradient-radial" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-DEFAULT/50 to-brand-DEFAULT" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="space-y-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-3"
          >
            <Star className="h-4 w-4 text-brand-gold" />
            <span className="text-brand-gold font-medium text-sm">Premium Onboarding Platform</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight"
            style={{
              lineHeight: 1.1,
            }}
          >
            <span
              style={{
                background: 'linear-gradient(90deg, #EAB308 0%, #070720 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 800,
              }}
            >
              Hubflo
            </span>
            <br />
            <span
              style={{
                color: '#070720',
                WebkitTextFillColor: 'unset',
                fontWeight: 800,
              }}
            >
              Onboarding
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-brand-DEFAULT drop-shadow"
            style={{ textShadow: '0 2px 8px rgba(7,7,32,0.12), 0 1px 0 #fff' }}
          >
            Streamlined client onboarding with personalized experiences for every success package.
            <br />
            <span className="text-brand-gold font-semibold" style={{ textShadow: '0 2px 8px #EAB30855' }}>Launch in 2-4 weeks*<sup>t</sup></span>
            <br />
            <span className="text-xs text-black mt-1 block">*Timeline may vary depending on Implementation Manager capacity, use case complexity, and other factors</span>
            <span className="text-xs text-black mt-1 block"><sup>t</sup> For complex implementations, timeline may extend to 4–8 weeks or longer.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="#welcome" passHref legacyBehavior>
              <PrimaryButton asChild className="group text-lg px-10 py-4 shadow-glow hover:shadow-glow-lg">
                <span className="flex items-center">
                  <Play className="mr-3 h-6 w-6 transition-transform group-hover:scale-110" />
                  Start Your Onboarding
                </span>
              </PrimaryButton>
            </Link>
            <Link href="#packages" passHref legacyBehavior>
              <SecondaryButton asChild className="text-lg px-10 py-4">
                <span>Explore Packages</span>
              </SecondaryButton>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-brand-foreground/40 text-sm font-medium">Scroll to explore</span>
          <ChevronDown className="h-6 w-6 text-brand-foreground/60" />
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-DEFAULT to-transparent" />
    </section>
  )
} 