'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Zap, FileText, Settings, Play, ExternalLink, CheckCircle, Star, ArrowRight, Clock, Shield, Award, TrendingUp, Sparkles, Trophy, Crown, HelpCircle, MessageSquare } from "lucide-react"
import Image from "next/image"
import { Header } from "@/components/ui/header"
import { Hero } from "@/components/ui/hero"
import { Section } from "@/components/ui/section"
import { CardHover } from "@/components/ui/card-hover"
import { PrimaryButton, SecondaryButton } from "@/components/ui/button-variants"
import { HorizontalTimeline } from "@/components/ui/horizontal-timeline"
import { Timeline } from "@/components/ui/timeline"

export default function HomePage() {
  console.log("HomePage rendered")
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#060520' }}>
      {/* Optional: Add a starfield canvas here if you want the effect site-wide */}
      <Header />
      
      <main className="pt-16">
        <Hero />

        {/* Welcome Video Section */}
        <Section id="welcome" className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 gradient-portal opacity-30" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-brand-gold/3 rounded-full blur-2xl" />
          
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <Star className="h-4 w-4 text-brand-gold" />
                <span className="text-brand-gold font-medium text-sm">Premium Onboarding Experience</span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8" style={{textShadow: '0 2px 8px rgba(236, 178, 45, 0.33)'}}>
                Welcome to <span className="text-brand-gold">Hubflo Onboarding</span>!
              </h2>
              <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed" style={{textShadow: '0 2px 8px #000'}}>
                Your personalized onboarding experience starts here. You've made a great choice! Now let's get your team up and running smoothly with Hubflo.
              </p>
            </div>

            {/* What You'll Learn - Horizontal */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
                <Award className="h-8 w-8 text-brand-gold mr-3" />
                What You'll Learn
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-brand-gold/30 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-brand-gold rounded-full flex items-center justify-center mb-4">
                      <span className="text-brand-DEFAULT font-bold text-xl">1</span>
                    </div>
                    <h4 className="text-white font-semibold text-lg mb-3">Your Onboarding Roadmap</h4>
                    <p className="text-white/80 leading-relaxed text-sm">
                      A clear breakdown of each phase in your Hubflo implementation journey.
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-brand-gold/30 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-brand-gold rounded-full flex items-center justify-center mb-4">
                      <span className="text-brand-DEFAULT font-bold text-xl">2</span>
                    </div>
                    <h4 className="text-white font-semibold text-lg mb-3">Key Integrations & Automation</h4>
                    <p className="text-white/80 leading-relaxed text-sm">
                      An overview of how we can connect Hubflo with your existing systems.
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-brand-gold/30 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-brand-gold rounded-full flex items-center justify-center mb-4">
                      <span className="text-brand-DEFAULT font-bold text-xl">3</span>
                    </div>
                    <h4 className="text-white font-semibold text-lg mb-3">How We'll Work Together</h4>
                    <p className="text-white/80 leading-relaxed text-sm">
                      Expectations for collaboration, communication, and successful launch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Container - Full Width */}
            <div className="mb-16">
              <div className="relative group max-w-4xl mx-auto">
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-gold/20 to-brand-gold/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl">
                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                    <iframe
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                      src="https://www.tella.tv/video/cmcggnhan001k0cl7cygc03yl/embed?b=0&title=0&a=0&loop=0&t=0&muted=0&wt=0"
                      allowFullScreen
                      allowTransparency
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps - Horizontal */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
                <Clock className="h-8 w-8 text-brand-gold mr-3" />
                Next Steps
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-brand-gold/15 to-brand-gold/5 rounded-2xl p-6 border border-brand-gold/30 hover:border-brand-gold/50 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-brand-gold text-brand-DEFAULT rounded-full flex items-center justify-center font-bold text-xl shadow-lg mb-4">
                      1
                    </div>
                    <p className="text-white font-medium leading-relaxed">Watch this welcome video</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-brand-gold/15 to-brand-gold/5 rounded-2xl p-6 border border-brand-gold/30 hover:border-brand-gold/50 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-brand-gold text-brand-DEFAULT rounded-full flex items-center justify-center font-bold text-xl shadow-lg mb-4">
                      2
                    </div>
                    <p className="text-white font-medium leading-relaxed">
                      Schedule your first call - check your welcome email for the calendar link!
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-brand-gold/15 to-brand-gold/5 rounded-2xl p-6 border border-brand-gold/30 hover:border-brand-gold/50 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-brand-gold text-brand-DEFAULT rounded-full flex items-center justify-center font-bold text-xl shadow-lg mb-4">
                      3
                    </div>
                    <p className="text-white font-medium leading-relaxed">
                      Get your onboarding portal link and get started!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Packages Section */}
        <Section id="packages" className="relative overflow-hidden bg-white">
          
          <div className="relative z-10 text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <Shield className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Choose Your Path</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-8" style={{ color: '#060520' }}>
              Hubflo Onboarding Packages
            </h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
              Choose the perfect onboarding experience tailored to your business needs and goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
            {/* Light Package */}
            <CardHover
              title="Light Package"
              description="Perfect for small teams getting started"
              icon={<Sparkles className="h-8 w-8 text-brand-gold" />}
              delay={0.1}
              badge={<Badge className="bg-gray-100 text-gray-700 border-0">Starter</Badge>}
            >
              <div className="flex flex-col flex-grow">
                <ul className="space-y-3 text-sm flex-grow" style={{ color: '#060520' }}>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>1 Zoom Call</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Video Tutorials</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Chat Support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Standard Support</span>
                  </li>
                </ul>
              </div>
            </CardHover>

            {/* Premium Package */}
            <CardHover
              title="Premium Package"
              description="Most popular for growing businesses"
              icon={<Star className="h-8 w-8 text-brand-gold" />}
              delay={0.2}
              badge={<Badge className="bg-brand-gold text-brand-DEFAULT border-0 font-semibold">Most Popular</Badge>}
            >
              <div className="flex flex-col flex-grow">
                <ul className="space-y-3 text-sm flex-grow" style={{ color: '#060520' }}>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>2 Zoom Calls</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Basic Zapier Setup</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Up to 2 Forms/SmartDocs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Priority Support</span>
                  </li>
                </ul>
              </div>
            </CardHover>

            {/* Gold Package */}
            <CardHover
              title="Gold Package"
              description="Advanced features for scaling teams"
              icon={<Trophy className="h-8 w-8 text-brand-gold" />}
              delay={0.3}
              badge={<Badge className="bg-amber-50 text-amber-700 border-0">Advanced</Badge>}
            >
              <div className="flex flex-col flex-grow">
                <ul className="space-y-3 text-sm flex-grow" style={{ color: '#060520' }}>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Up to 3 Zoom Calls</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Advanced Zapier Setup</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Up to 4 Forms/SmartDocs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Priority Support</span>
                  </li>
                </ul>
              </div>
            </CardHover>

            {/* Elite Package */}
            <CardHover
              title="Elite Package"
              description="Complete white-glove service"
              icon={<Crown className="h-8 w-8 text-brand-gold" />}
              delay={0.4}
              badge={<Badge className="bg-purple-50 text-purple-700 border-0">Elite</Badge>}
            >
              <div className="flex flex-col flex-grow">
                <ul className="space-y-3 text-sm flex-grow" style={{ color: '#060520' }}>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Unlimited Onboarding Calls</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Full Migration Assistance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Custom Integrations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Dedicated Manager</span>
                  </li>
                </ul>
              </div>
            </CardHover>
          </div>
        </Section>

        {/* Launch Process Section */}
        <Section id="launch-process" className="relative overflow-hidden bg-white">
          
          <div className="relative z-10 text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <Clock className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Launch Timeline</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-8" style={{ color: '#060520' }}>
              Client Portal Launch Process
            </h2>
            <p className="text-xl max-w-4xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
              Most of our clients are able to launch a first minimum viable version of their portal to a few customers
              within <span className="font-semibold text-brand-gold">2 to 4 weeks</span> (4 to 8 weeks if you require a lot of customization).
            </p>
          </div>

          <Timeline
            items={[
              {
                step: 1,
                title: "Initial product discovery",
                description: "You or someone from your team spends some time playing around with Hubflo (often during your trial)."
              },
              {
                step: 2,
                title: "Setup of your minimum viable portal",
                description: "We start with a limited scope, usually 2-3 apps only (file sharing, forms, contracts or messaging) + the basics (branding, custom domain, etc.)."
              },
              {
                step: 3,
                title: "Beta test on 2-3 clients for a few weeks",
                description: "We launch a first version to gather feedback from your clients."
              },
              {
                step: 4,
                title: "Adjust & expand",
                description: "We fine-tune your portal based on your clients' & team's feedback. We set up a few automations/integrations. You invite the rest of your client base."
              }
            ]}
          />
        </Section>

        {/* Prepare for Kickoff Call Section */}
        <Section id="kickoff-prep" className="relative overflow-hidden bg-white">
          
          <div className="relative z-10 text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <MessageSquare className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Get Prepared</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-8" style={{ color: '#060520' }}>
              Prepare for Your Kickoff Call
            </h2>
            <p className="text-xl max-w-4xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
              To make our kickoff call as productive as possible, please come prepared to discuss the following topics. 
              This will help us understand your needs and create the best implementation plan for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10">
            <CardHover
              title="Current Systems"
              description="What software and tools are you currently using?"
              icon={<Settings className="h-8 w-8 text-brand-gold" />}
              delay={0.1}
            >
              <div className="flex flex-col flex-grow">
                <p className="text-sm leading-relaxed flex-grow" style={{ color: '#64748b' }}>
                  We'll discuss your existing tech stack to ensure Hubflo integrates seamlessly with your current workflow.
                </p>
              </div>
            </CardHover>

            <CardHover
              title="Pain Points"
              description="What are the biggest challenges in your current workflow?"
              icon={<HelpCircle className="h-8 w-8 text-brand-gold" />}
              delay={0.2}
            >
              <div className="flex flex-col flex-grow">
                <p className="text-sm leading-relaxed flex-grow" style={{ color: '#64748b' }}>
                  Understanding your challenges helps us prioritize features and create solutions that address your specific needs.
                </p>
              </div>
            </CardHover>

            <CardHover
              title="Key Metrics"
              description="What metrics are most important for measuring success?"
              icon={<TrendingUp className="h-8 w-8 text-brand-gold" />}
              delay={0.3}
            >
              <div className="flex flex-col flex-grow">
                <p className="text-sm leading-relaxed flex-grow" style={{ color: '#64748b' }}>
                  We'll align Hubflo's features with your success metrics to ensure we're tracking what matters most to you.
                </p>
              </div>
            </CardHover>

            <CardHover
              title="Integration Needs"
              description="Which systems must Hubflo integrate with?"
              icon={<Zap className="h-8 w-8 text-brand-gold" />}
              delay={0.4}
            >
              <div className="flex flex-col flex-grow">
                <p className="text-sm leading-relaxed flex-grow" style={{ color: '#64748b' }}>
                  Tell us about the tools you can't live without, and we'll explore integration options to keep everything connected.
                </p>
              </div>
            </CardHover>

            <CardHover
              title="Current Process"
              description="Walk me through your current onboarding process."
              icon={<Users className="h-8 w-8 text-brand-gold" />}
              delay={0.5}
              badge={<Badge className="bg-brand-gold text-brand-DEFAULT border-0 font-semibold">Most Important</Badge>}
            >
              <div className="flex flex-col flex-grow">
                <p className="text-sm leading-relaxed flex-grow" style={{ color: '#64748b' }}>
                  This is the most important topic. Understanding your current process helps us design a Hubflo implementation that fits naturally into your workflow.
                </p>
              </div>
            </CardHover>

            <CardHover
              title="Timeline"
              description="When are you looking to launch?"
              icon={<Clock className="h-8 w-8 text-brand-gold" />}
              delay={0.6}
            >
              <div className="flex flex-col flex-grow">
                <p className="text-sm leading-relaxed flex-grow" style={{ color: '#64748b' }}>
                  Your timeline helps us plan the implementation phases and set realistic expectations for your portal launch.
                </p>
              </div>
            </CardHover>
          </div>
        </Section>

        {/* Integrations Section */}
        <Section id="integrations" className="relative overflow-hidden bg-white">
          
          <div className="relative z-10 text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <Zap className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">Powerful Integrations</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-8" style={{ color: '#060520' }}>
              Hubflo Automations & Integrations
            </h2>
            <div className="max-w-3xl mx-auto" style={{ color: '#64748b' }}>
              <p className="text-xl mb-4 leading-relaxed">
                Connect Hubflo with your favorite tools and automate your workflows seamlessly using our Hubflo's native
                integrations, Zapier, Make.com, or our API.
              </p>
              <p className="text-sm rounded-lg p-4 border border-gray-200" style={{ backgroundColor: '#FAFBFC' }}>
                <strong>Note:</strong> Zapier and Make.com require their own paid subscriptions, which are separate from your Hubflo
                plan.
              </p>
            </div>
          </div>

          {/* Integration Logo Carousel */}
          <div className="mt-12 mb-8 relative max-w-7xl mx-auto">
            <div className="relative overflow-hidden py-4">
              {/* Gradient fade overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              
              {/* Carousel */}
              <div className="group flex gap-8 overflow-hidden p-2 flex-row">
                {/* First set of logos */}
                <div className="flex shrink-0 justify-around gap-8 animate-marquee flex-row">
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://cdn.simpleicons.org/hubspot/FF7A59" alt="HubSpot" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/26fbsyQOv4I8LghfIzH75vHfLOo.png" alt="Gmail" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/eesedkKX1fDFxX4Glo1D1UBFC0.svg" alt="Outlook" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/r3P3IKFa5KYARRSFz5eUZNfffNs.svg" alt="Slack" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/vOq9ykaaOzawZ1iXL8MnwfSFE.svg" alt="QuickBooks" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/U5BZMOc7zFDPUX8sRocJ0X8e4fA.png" alt="Zapier" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/CXSX9Y3T9aWJCGCUFINpbqfn8o.svg" alt="DocuSign" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/lwC8A4acEtviLVJB1j9c77G2lCs.svg" alt="Stripe" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/Vk7HDHDwEh7TcGpcf9yGmrOgFY.svg" alt="Asana" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/QUaIcskVRfwVtu3kI47MKTuaMP4.avif" alt="Salesforce" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/vpitWqPFGcjcoYfSTQmTVwDy40.svg" alt="Xero" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/JSmj3Dup2WKtAJiDS4BCdIViBg.svg" alt="Make" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                </div>
                {/* Duplicate set for seamless loop */}
                <div className="flex shrink-0 justify-around gap-8 animate-marquee flex-row">
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://cdn.simpleicons.org/hubspot/FF7A59" alt="HubSpot" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/26fbsyQOv4I8LghfIzH75vHfLOo.png" alt="Gmail" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/eesedkKX1fDFxX4Glo1D1UBFC0.svg" alt="Outlook" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/r3P3IKFa5KYARRSFz5eUZNfffNs.svg" alt="Slack" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/vOq9ykaaOzawZ1iXL8MnwfSFE.svg" alt="QuickBooks" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/U5BZMOc7zFDPUX8sRocJ0X8e4fA.png" alt="Zapier" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/CXSX9Y3T9aWJCGCUFINpbqfn8o.svg" alt="DocuSign" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/lwC8A4acEtviLVJB1j9c77G2lCs.svg" alt="Stripe" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/Vk7HDHDwEh7TcGpcf9yGmrOgFY.svg" alt="Asana" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/QUaIcskVRfwVtu3kI47MKTuaMP4.avif" alt="Salesforce" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/vpitWqPFGcjcoYfSTQmTVwDy40.svg" alt="Xero" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-24 h-24 md:w-32 md:h-32 hover:shadow-md transition-shadow">
                    <img src="https://fxolswmpmpxfmhczdtku.supabase.co/storage/v1/object/public/Integrations/JSmj3Dup2WKtAJiDS4BCdIViBg.svg" alt="Make" className="w-12 h-12 md:w-16 md:h-16 object-contain" loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16 relative z-10">
            <PrimaryButton asChild className="group">
              <a href="https://www.hubflo.com/integrations" target="_blank" rel="noopener noreferrer">
                <Zap className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Browse All Integrations
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </PrimaryButton>
          </div>
        </Section>

        {/* Support & Tutorials Section */}
        <Section id="support" className="relative overflow-hidden bg-white">
          
          <div className="relative z-10 text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
              <Shield className="h-4 w-4 text-brand-gold" />
              <span className="text-brand-gold font-medium text-sm">24/7 Support</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-8" style={{ color: '#060520' }}>
              Support & Tutorials
            </h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
              Get the help you need to make the most of your Hubflo onboarding experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto relative z-10">
            <CardHover
              title="Hubflo Knowledge Base"
              description="Comprehensive guides and documentation"
              icon={<FileText className="h-8 w-8 text-brand-gold" />}
              delay={0.1}
            >
              <div className="flex flex-col flex-grow">
                <p className="mb-8 leading-relaxed flex-grow" style={{ color: '#64748b' }}>
                  Access our complete knowledge base with step-by-step guides, troubleshooting tips, and best practices
                  for getting the most out of Hubflo.
                </p>
                <PrimaryButton className="w-full group mt-auto" asChild>
                  <a href="https://support.hubflo.com/en/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    Visit Knowledge Base
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </PrimaryButton>
              </div>
            </CardHover>

            <CardHover
              title="Video Tutorials"
              description="Learn with our comprehensive video library"
              icon={<Play className="h-8 w-8 text-brand-gold" />}
              delay={0.2}
            >
              <div className="flex flex-col flex-grow">
                <p className="mb-8 leading-relaxed flex-grow" style={{ color: '#64748b' }}>
                  Watch our detailed video tutorials covering everything from basic setup to advanced features and
                  integrations.
                </p>
                <PrimaryButton className="w-full group mt-auto" asChild>
                  <a
                    href="https://www.tella.tv/playlist/cm5zq45t5001s0ak0746244z7/public"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    Watch Tutorials
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </PrimaryButton>
              </div>
            </CardHover>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-16 w-full">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Image src="/hubflo-logo.png" alt="Hubflo Logo" width={40} height={40} className="object-contain" />
            </div>
            <span style={{color: '#060520', fontWeight: 700, fontSize: '2rem', lineHeight: 1, display: 'inline-block', marginLeft: 8, marginTop: 4, marginBottom: 4}}>
              Hubflo
            </span>
          </div>
          <p style={{color: '#64748b', fontSize: '1.125rem', marginBottom: 32, fontWeight: 500}}>
            Streamlining onboarding experiences with premium support and cutting-edge technology.
          </p>
          <div style={{color: '#64748b', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: 24}}>
            <span>© Hubflo 2025</span>
            <span>•</span>
            <span><a href="https://www.hubflo.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors" style={{color: '#64748b'}}>Privacy Policy</a></span>
            <span>•</span>
            <span><a href="https://www.hubflo.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors" style={{color: '#64748b'}}>Terms of Service</a></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
