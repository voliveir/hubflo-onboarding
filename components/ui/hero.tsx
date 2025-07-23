"use client"

import { motion } from "framer-motion"
import { ChevronDown, Play, Star, Zap, Users } from "lucide-react"
import { PrimaryButton, SecondaryButton } from "./button-variants"
import Link from "next/link"
import { useEffect, useRef } from "react"

export function Hero() {
  // Starfield effect
  const starfieldRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = starfieldRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = window.innerWidth;
    const h = 600;
    canvas.width = w;
    canvas.height = h;
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.5 + 0.3,
      d: Math.random() * 0.5 + 0.5,
    }));
    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255,255,255,${s.o + 0.2 * Math.sin(frame * s.d)})`;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      frame += 0.01;
      requestAnimationFrame(draw);
    }
    draw();
    // Clean up
    return () => { ctx.clearRect(0, 0, w, h); };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 text-center flex flex-col items-center justify-center" style={{ minHeight: 500 }}>
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-3 shadow-md mb-8">
          <Star className="h-4 w-4 text-brand-gold" />
          <span className="text-brand-gold font-medium text-sm">Premium Onboarding Platform</span>
        </div>
        {/* Main Title */}
        <h1
          className="text-white text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 drop-shadow-xl"
          style={{
            lineHeight: 1.1,
            textShadow: '0 4px 24px #000, 0 2px 8px #EAB30855',
          }}
        >
          <span className="text-brand-gold">Hubflo</span> Onboarding
        </h1>
        {/* Subtitle */}
        <p className="text-white/90 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-8 font-sans" style={{ textShadow: '0 2px 8px #000' }}>
          Streamlined client onboarding with personalized experiences for every success package.<br />
          <span className="text-brand-gold font-bold">Launch<sup>t</sup> in 2-4 weeks*</span>
        </p>
        <div className="text-xs text-white/60 mt-0 mb-8 max-w-3xl mx-auto text-center">
          *Timeline may vary based on Implementation Manager capacity and use case complexity. Complex projects may take 4–8+ weeks<br />
          <span><sup>t</sup> "Launch” means your portal is live with all essentials for onboarding and real user access. Enhancements, automations, and integrations can be added after launch.</span>
        </div>
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="#welcome" passHref legacyBehavior>
            <button className="text-white bg-transparent border border-white/80 hover:border-brand-gold hover:text-brand-gold font-semibold text-lg px-10 py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/40">
              <span className="flex items-center justify-center gap-2">
                <Play className="h-6 w-6" /> Start Your Onboarding
              </span>
            </button>
          </Link>
          <Link href="#packages" passHref legacyBehavior>
            <button className="text-white bg-transparent border border-white/80 hover:border-brand-gold hover:text-brand-gold font-semibold text-lg px-10 py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/40">
              Explore Packages
            </button>
          </Link>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-brand-foreground/40 text-sm font-medium">Scroll to explore</span>
          <ChevronDown className="h-6 w-6 text-brand-foreground/60" />
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-DEFAULT to-transparent z-10" />
    </section>
  )
} 