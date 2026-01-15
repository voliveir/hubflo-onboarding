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
  { href: "#kickoff-prep", label: "Kickoff Prep" },
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
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm transition-all duration-300"
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
            <span className="text-xl font-bold text-gray-900">
              Hubflo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 focus-visible:ring-offset-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a href="https://app.hubflo.com" target="_blank" rel="noopener noreferrer">
              <Button className="font-semibold px-5 py-2 rounded-lg text-white transition-all duration-200 hover:opacity-90" style={{ backgroundColor: '#1e293b' }}>
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
                className="md:hidden text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white border-gray-200">
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
                    <span className="text-lg font-bold text-gray-900">
                      Hubflo
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-600"
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
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 py-2"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                
                <a href="https://app.hubflo.com" target="_blank" rel="noopener noreferrer">
                  <Button className="text-white font-semibold w-full py-3 rounded-lg hover:opacity-90" style={{ backgroundColor: '#1e293b' }}>
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