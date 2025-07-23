"use client"

import { useState, useEffect } from "react"
import { motion, useScroll } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const navItems = [
  { href: "#welcome", label: "Welcome" },
  { href: "#packages", label: "Packages" },
  { href: "#launch-process", label: "Launch Process" },
  { href: "#integrations", label: "Integrations" },
  { href: "#support", label: "Support" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 40)
    })
    return unsubscribe
  }, [scrollY])

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-brand-DEFAULT/95 backdrop-blur-md shadow-lg"
          : "bg-white shadow"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Image 
              src="/hubflo-logo.png" 
              alt="Hubflo Logo" 
              width={32} 
              height={32} 
              className="object-contain transition-transform group-hover:scale-110" 
            />
            <span className={`text-xl font-bold ${isScrolled ? "text-white" : "text-brand-DEFAULT"}`}>
              Hubflo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors duration-200 px-2 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 focus-visible:ring-offset-2 ${isScrolled ? "text-white hover:text-brand-gold" : "text-brand-DEFAULT hover:text-brand-gold"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a href="https://app.hubflo.com" target="_blank" rel="noopener noreferrer">
              <Button className={`font-semibold px-6 py-2 rounded-xl transition-all duration-200
                ${isScrolled
                  ? "bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT"
                  : "bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT border border-brand-gold/40 shadow-glow"}
              `}>
                Get Started
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`md:hidden ${isScrolled ? "text-brand-foreground" : "text-brand-DEFAULT"}`}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-brand-DEFAULT/95 backdrop-blur-md border-brand-navy-lighter">
              <div className="flex flex-col space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Image 
                      src="/hubflo-logo.png" 
                      alt="Hubflo Logo" 
                      width={24} 
                      height={24} 
                      className="object-contain" 
                    />
                    <span className="text-lg font-bold text-brand-foreground">
                      Hubflo
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-brand-foreground"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-brand-foreground/80 hover:text-brand-gold font-medium transition-colors duration-200 py-2"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                
                <a href="https://app.hubflo.com" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT font-semibold w-full py-3 rounded-xl">
                    Get Started
                  </Button>
                </a>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.header>
  )
} 